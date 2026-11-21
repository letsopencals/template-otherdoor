import type { Catalog, Offering } from '@/lib/catalog';
import type { SetKey, Tone } from '@/lib/site-config';

/** What the service booker needs per variant (plain JSON from the server). */
export interface BookerSeries {
	id: string;
	slug: string;
	label: string;
	price: number;
	durationMin: number;
	maxDurationMin: number | null;
	allowCustomDuration: boolean;
	capacity: number;
	advanceSeconds: number;
	siteIds: string[];
	coachIds: string[];
	image: string | null;
}

export interface BookerOffering {
	key: string;
	title: string;
	short: string;
	tagline: string;
	description: string;
	tone: Tone;
	category: string;
	includes: string[];
	whatToBring: string[];
	lengths: number[] | null;
	stepMin: number;
	people: number;
	party: boolean;
	whoLabel: string | null;
	set: SetKey | null;
	image: string | null;
	series: BookerSeries[];
}

export interface BookerPerson {
	id: string;
	slug: string;
	name: string;
	firstName: string;
	image: string | null;
	tier: string | null;
	role: string | null;
	handle: string | null;
	title: string | null;
	siteIds: string[];
}

export interface BookerSite {
	id: string;
	key: string;
	name: string;
	nickname: string;
	online: boolean;
}

/** Catalog → the plain props the service booker needs. Pure; used by RSC pages. */
export function toBookerOffering(o: Offering): BookerOffering {
	const meta = o.serviceMeta;
	const firstImage = o.images[0] ?? null;
	return {
		key: o.key,
		title: o.title,
		short: meta?.short ?? o.title,
		tagline: meta?.tagline ?? '',
		description: o.description,
		tone: o.tone,
		category: o.category,
		includes: meta?.includes ?? [],
		whatToBring: meta?.whatToBring ?? [],
		lengths: meta?.lengths ?? null,
		stepMin: meta?.startStep ?? (o.duration >= 3600 ? 30 : 15),
		people: meta?.people ?? 1,
		party: Boolean(meta?.party),
		whoLabel: meta?.whoLabel ?? null,
		set: meta?.set ?? null,
		image: firstImage,
		series: o.series.map((s) => ({
			id: s.id,
			slug: s.slug,
			label: s.variantTitle || s.title,
			price: s.price,
			durationMin: Math.round(s.duration / 60),
			maxDurationMin: s.maxDuration && s.maxDuration > 0 ? Math.round(s.maxDuration / 60) : null,
			allowCustomDuration: s.allowCustomDuration,
			capacity: s.capacity,
			advanceSeconds: s.advanceThreshold,
			siteIds: s.sites.map((x) => x.id),
			coachIds: s.coaches.map((c) => c.id),
			image: s.images[0] ?? null,
		})),
	};
}

export function bookerLookups(catalog: Catalog): { coaches: Record<string, BookerPerson>; sites: Record<string, BookerSite> } {
	return {
		coaches: Object.fromEntries(
			catalog.coaches.map((c) => [c.id, { id: c.id, slug: c.slug, name: c.name, firstName: c.firstName, image: c.image, tier: c.meta?.tier ?? null, role: c.meta?.role ?? null, handle: c.meta?.handle ?? null, title: c.meta?.title ?? null, siteIds: c.siteIds }]),
		),
		sites: Object.fromEntries(catalog.sites.map((s) => [s.id, { id: s.id, key: s.key, name: s.name, nickname: s.nickname, online: s.online }])),
	};
}
