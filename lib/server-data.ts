import '@/lib/opencals';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import {
	StoreService,
	ProductService,
	ProductCollectionService,
	StaffMemberService,
	LocationService,
	type StorePublicSettings,
	type ProductListItemResponse,
	type ProductCollectionResponse,
	type StaffMemberListItemResponse,
	type LocationDetailResponse,
	type AddOnListItemResponse,
} from '@opencals/storefront-sdk';
import { publicPayload } from '@/lib/public-payload';
import { buildCatalogue, type Catalogue } from '@/lib/rooms';
import { toRanges, type FreeRange } from '@/lib/sessions';

/**
 * Server-only data readers. Each is wrapped in React.cache() so repeated calls
 * within a single request are deduped. RSCs call these directly instead of
 * going through the template's own /api/* routes. Never import this module from
 * a 'use client' file — the /api/* routes remain the client/SWR data source.
 * Catalog reads pass through `publicPayload`, so staff contact fields never reach
 * RSC props.
 */

export const getStoreSettings = cache(async (): Promise<StorePublicSettings | null> => {
	try {
		const { data } = await StoreService.getStorePublicSettings();
		return data ?? null;
	} catch {
		return null;
	}
});

/**
 * The store's logo and banner (cover), as set under Storefront customisation in
 * the dashboard. Null when not set or the settings can't be loaded.
 */
export function storeImages(settings: StorePublicSettings | null): { logo: string | null; banner: string | null } {
	const s = settings?.storefrontSettings;
	return { logo: s?.logoImage?.url ?? null, banner: s?.bannerImage?.url ?? null };
}

/** Every product group with its variants. Empty on failure. */
export const getProducts = cache(async (locationId?: string): Promise<ProductListItemResponse[]> => {
	try {
		const { data } = await ProductService.list({ query: { take: 100, locationId } });
		return publicPayload(data?.data ?? []);
	} catch {
		return [];
	}
});

/**
 * The booking flow needs each variant's `staffMembers` (with their `locations`)
 * and `locations` — that richer shape lives on the list response, not the
 * leaner `getBySlug` detail. So we take the catalog and return the group that
 * owns the requested slug (the group's own slug or one of its variant slugs).
 * Mirrors `app/api/products/[slug]/route.ts`.
 */
export const getProduct = cache(async (slug: string): Promise<ProductListItemResponse | null> => {
	const items = await getProducts();
	return items.find((item) => item.slug === slug || item.variants?.some((v) => v.slug === slug)) ?? null;
});

/** Add-ons offered with one product (by slug): portrait, Victory Bottle, hamper… */
export const getAddOnsForProduct = cache(async (slug: string): Promise<AddOnListItemResponse[]> => {
	try {
		const { data } = await ProductService.listAddOnsBySlug({ path: { slug } });
		return publicPayload(Array.isArray(data) ? data : []);
	} catch {
		return [];
	}
});

/** All visible collections (with their product references). Empty on failure. */
export const getCollections = cache(async (): Promise<ProductCollectionResponse[]> => {
	try {
		const { data } = await ProductCollectionService.list({ query: { take: 50 } });
		return publicPayload(data?.data ?? []);
	} catch {
		return [];
	}
});

export const getStaff = cache(async (): Promise<StaffMemberListItemResponse[]> => {
	try {
		const { data } = await StaffMemberService.list({ query: { take: 50 } });
		return publicPayload(data?.data ?? []);
	} catch {
		return [];
	}
});

export const getLocations = cache(async (): Promise<LocationDetailResponse[]> => {
	try {
		const { data } = await LocationService.list({ query: { take: 50 } });
		return publicPayload(data?.data ?? []);
	} catch {
		return [];
	}
});

/* ---------------------------------------------------------------- Catalogue */

/** Rooms (team-size variants grouped), workshops, venues and game masters. Pure mapping, see lib/rooms.ts. */
export const getCatalogue = cache(async (): Promise<Catalogue> => {
	const [products, collections, staff, locations] = await Promise.all([getProducts(), getCollections(), getStaff(), getLocations()]);
	return buildCatalogue({ products, collections, staff, locations });
});

/* ---------------------------------------------------------------- Availability */

/** Parallel availability calls. The storefront API allows 20 requests per second per key + IP. */
const CONCURRENCY = 6;

async function mapLimit<T, R>(items: readonly T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
	const out: R[] = new Array(items.length);
	let next = 0;
	async function worker() {
		while (next < items.length) {
			const i = next++;
			out[i] = await fn(items[i] as T);
		}
	}
	await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
	return out;
}

/** Thrown inside the cached loaders so a partial fan-out is never stored. */
class PartialAvailabilityError extends Error {}

const RETRY_DELAYS_MS = [400, 1200];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Merged availability for one product across the whole horizon (no date), retried on failure (429s during a fan-out). */
async function fetchRanges(productId: string): Promise<FreeRange[] | null> {
	for (let attempt = 0; ; attempt++) {
		try {
			const { data } = await ProductService.getCurrentAvailabilitiesMerged({ path: { productId }, query: { timezone: 'UTC' }, throwOnError: true });
			return toRanges(Array.isArray(data) ? data : []);
		} catch (error) {
			const delay = RETRY_DELAYS_MS[attempt];
			if (delay === undefined) {
				console.warn(`[availability] failed for product ${productId}`, error);
				return null;
			}
			await sleep(delay);
		}
	}
}

/** Free windows per key. With `strict`, any failure throws so `unstable_cache` keeps its previous entry. */
async function loadRanges(entries: ReadonlyArray<readonly [key: string, productId: string]>, strict: boolean): Promise<Record<string, FreeRange[]>> {
	const results = await mapLimit(entries, CONCURRENCY, async ([key, id]) => [key, await fetchRanges(id)] as const);
	if (strict && results.some(([, r]) => r === null)) throw new PartialAvailabilityError();
	return Object.fromEntries(results.map(([key, r]) => [key, r ?? []]));
}

export type RangesByKey = Record<string, FreeRange[]>;

async function roomEntries(venueSlug: string | null): Promise<Array<readonly [string, string]>> {
	const { rooms } = await getCatalogue();
	return rooms.filter((r) => !venueSlug || r.venue?.slug === venueSlug).map((r) => [r.slug, r.availabilityProductId] as const);
}

/**
 * Free windows for every room (or one venue's rooms), keyed by room slug: one
 * merged-availability call per room (its smallest-team variant stands for the
 * pool), cached 60 s and tagged `availability`. Booking, cart removal,
 * cancelling and moving revalidate the tag.
 */
const cachedRoomRanges = unstable_cache(async (venueSlug: string | null) => loadRanges(await roomEntries(venueSlug), true), ['otherdoor-room-ranges-v1'], {
	revalidate: 60,
	tags: ['availability', 'rooms-availability'],
});

export const getRoomRanges = cache(async (venueSlug: string | null = null): Promise<RangesByKey> => {
	try {
		return await cachedRoomRanges(venueSlug);
	} catch (error) {
		if (!(error instanceof PartialAvailabilityError)) console.warn('[availability] rooms', error);
		try {
			return await loadRanges(await roomEntries(venueSlug), false);
		} catch {
			return {};
		}
	}
});

async function workshopEntries(): Promise<Array<readonly [string, string]>> {
	return (await getCatalogue()).workshops.map((w) => [w.slug, w.productId] as const);
}

const cachedWorkshopRanges = unstable_cache(async () => loadRanges(await workshopEntries(), true), ['otherdoor-workshop-ranges-v1'], {
	revalidate: 60,
	tags: ['availability', 'workshops-availability'],
});

/** Free windows (with seats) per workshop slug. Cached like the rooms. */
export const getWorkshopRanges = cache(async (): Promise<RangesByKey> => {
	try {
		return await cachedWorkshopRanges();
	} catch (error) {
		if (!(error instanceof PartialAvailabilityError)) console.warn('[availability] workshops', error);
		try {
			return await loadRanges(await workshopEntries(), false);
		} catch {
			return {};
		}
	}
});
