import type {
	LocationDetailResponse,
	ProductCollectionResponse,
	ProductListItemResponse,
	ProductListVariant,
	StaffMemberListItemResponse,
} from '@opencals/storefront-sdk';
import {
	classMeta,
	coachMeta,
	serviceMeta,
	siteConfig,
	siteMeta,
	type ClassMeta,
	type PersonMeta,
	toneFor,
	type Tone,
	type ServiceMeta,
	type SiteMeta,
	type SetKey,
} from '@/lib/site-config';
import { getProductGallery } from '@/lib/format';

/**
 * The gym's catalog, derived from storefront API data. Pure functions (no
 * fetching), so RSCs, client components and tests can all use them. Every type
 * is plain JSON (no Maps), so it survives `unstable_cache` and RSC props.
 *
 * - The **category** comes from the product's site copy when it has some
 *   (open floor sits in both the strength and recovery collections), else from
 *   the first of its collections in `siteConfig.categories`. It sets the tone.
 * - The **kind**: `event` for events; `class` for a weekly group class (a
 *   `siteConfig.classes` key, or a timetable category with more than one
 *   place and one coach per variant); otherwise `service` (PT, padwork,
 *   recovery, lab), booked in the slot rack.
 * - A **class** is a product group; each variant is one weekly **series**
 *   (class × site × coach). Its site and coach come from the variant's own
 *   `locations` / `staffMembers`, never from the title. The class key is the
 *   longest `siteConfig.classes` key that prefixes the variant slugs
 *   (`barbell-club-collingwood-jo` → `barbell-club`).
 * - A **service** is a product group whose variants are options (a 45 or 60
 *   min padwork, infrared suite 1 or 2, open floor at each site). Its key is the
 *   longest `siteConfig.services` key that prefixes the group or variant slug.
 */

export type OfferingKind = 'class' | 'service' | 'event';

export interface SiteRef {
	id: string;
	slug: string;
	/** Short key for URLs: `collingwood`, `cremorne`, `remote`. */
	key: string;
	name: string;
	nickname: string;
	online: boolean;
}

export interface CoachRef {
	id: string;
	slug: string;
	name: string;
	firstName: string;
	image: string | null;
}

export interface Series {
	/** Variant id: the product id to book and to read availability for. */
	id: string;
	slug: string;
	productId: string;
	offeringKey: string;
	kind: OfferingKind;
	category: string;
	tone: Tone;
	title: string;
	variantTitle: string;
	/** First location (classes have exactly one). */
	site: SiteRef | null;
	sites: SiteRef[];
	/** First coach (classes have exactly one). */
	coach: CoachRef | null;
	coaches: CoachRef[];
	/** The set (room) the class runs on, from site copy. */
	set: SetKey | null;
	/** Places = `maxAttendees`. */
	capacity: number;
	/** Major units (AUD) per base duration. */
	price: number;
	/** Seconds (the base unit for custom-duration products). */
	duration: number;
	allowCustomDuration: boolean;
	/** Seconds, or null when fixed length. -1 means unlimited. */
	maxDuration: number | null;
	images: string[];
	color: string | null;
	advanceThreshold: number;
	cancelGap: number;
}

export interface Offering {
	key: string;
	productId: string;
	kind: OfferingKind;
	category: string;
	tone: Tone;
	title: string;
	description: string;
	/** Seconds (from the first series). */
	duration: number;
	fromPrice: number;
	images: string[];
	collections: string[];
	series: Series[];
	siteIds: string[];
	coachIds: string[];
	classMeta: ClassMeta | null;
	serviceMeta: ServiceMeta | null;
	eventMeta: { tagline: string; whatToBring: string[] } | null;
}

export interface Site extends SiteRef {
	address: string;
	link: string | null;
	latitude: number | null;
	longitude: number | null;
	meta: SiteMeta | null;
	offeringKeys: string[];
	coachIds: string[];
}

export interface Coach extends CoachRef {
	lastName: string;
	siteIds: string[];
	/** Offering keys (classes and services) the coach is on. */
	offeringKeys: string[];
	categories: string[];
	meta: PersonMeta | null;
}

export interface Catalog {
	classes: Offering[];
	services: Offering[];
	events: Offering[];
	sites: Site[];
	coaches: Coach[];
}

/* ------------------------------------------------------------------ Helpers */

export function slugify(s: string): string {
	return s
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

const byLength = (keys: string[]) => [...keys].sort((a, b) => b.length - a.length);
const CLASS_KEYS = byLength(Object.keys(siteConfig.classes));
const SERVICE_KEYS = byLength(Object.keys(siteConfig.services));
const EVENT_KEYS = byLength(Object.keys(siteConfig.events));

function prefixKey(keys: string[], slug: string | null | undefined): string | null {
	if (!slug) return null;
	for (const key of keys) if (slug === key || slug.startsWith(`${key}-`)) return key;
	return null;
}

/** Extra prefixes declared on services (`pt-` → `personal-training`). */
const SERVICE_PREFIXES: Array<[string, string]> = Object.entries(siteConfig.services as Record<string, ServiceMeta>).flatMap(([key, meta]) =>
	(meta.prefixes ?? []).map((p) => [p, key] as [string, string]),
);

/** The class key for a variant slug (`barbell-club-collingwood-jo` → `barbell-club`), or null. */
export function classKeyForSlug(slug: string | null | undefined): string | null {
	return prefixKey(CLASS_KEYS, slug);
}

/** The service key for a group or variant slug (`fight-padwork-60` → `fight-padwork`), or null. */
export function serviceKeyForSlug(slug: string | null | undefined): string | null {
	const direct = prefixKey(SERVICE_KEYS, slug);
	if (direct || !slug) return direct;
	return SERVICE_PREFIXES.find(([p]) => slug.startsWith(p))?.[1] ?? null;
}

/** Class, service or event key for a product slug, whichever matches. */
export function offeringKeyForSlug(slug: string | null | undefined): string | null {
	return classKeyForSlug(slug) ?? serviceKeyForSlug(slug) ?? prefixKey(EVENT_KEYS, slug);
}

const DISCIPLINES = Object.keys(siteConfig.categories);

/** The category of a set of collection slugs (first match in display order), or null. */
export function categoryOf(collections: string[]): string | null {
	return DISCIPLINES.find((d) => collections.includes(d)) ?? null;
}

const COLOR_TO_DISCIPLINE: Record<string, string> = {
	red: 'strength',
	rose: 'strength',
	blue: 'fight',
	indigo: 'fight',
	yellow: 'conditioning',
	amber: 'conditioning',
	green: 'mobility',
	emerald: 'mobility',
	slate: 'coaching',
	zinc: 'lab',
};

function toSiteRef(loc: { id: string; slug: string; title?: string | null; type?: string | null }): SiteRef {
	const meta = siteMeta(loc.slug);
	const online = loc.type === siteConfig.locationTypes.online;
	return {
		id: loc.id,
		slug: loc.slug,
		key: meta?.key ?? (online ? 'remote' : loc.slug.replace(/^afterglow-/, '')),
		name: meta?.name ?? loc.title ?? loc.slug,
		nickname: meta?.nickname ?? loc.title ?? loc.slug,
		online,
	};
}

function toCoachRef(s: {
	id: string;
	slug: string;
	firstName: string;
	lastName?: string | null;
	image?: { url?: string | null } | null;
}): CoachRef {
	return {
		id: s.id,
		slug: s.slug,
		name: [s.firstName, s.lastName].filter(Boolean).join(' '),
		firstName: s.firstName,
		image: s.image?.url ?? null,
	};
}

function collectionsByGroup(collections: ProductCollectionResponse[]): Record<string, string[]> {
	const out: Record<string, string[]> = {};
	for (const c of collections) {
		for (const p of c.products ?? []) {
			for (const key of new Set([p.productId, p.id].filter(Boolean) as string[])) (out[key] ??= []).push(c.slug);
		}
	}
	return out;
}

/** The group's own variants; a group without variants is its own single option. */
function variantsOf(group: ProductListItemResponse): ProductListVariant[] {
	if (group.variants?.length) return group.variants;
	return [
		{
			...(group as unknown as ProductListVariant),
			staffMembers: [],
			locations: [],
			images: group.image ? [group.image] : [],
		},
	];
}

/* ------------------------------------------------------------------ Builders */

export interface CatalogInput {
	products: ProductListItemResponse[];
	collections: ProductCollectionResponse[];
	staff: StaffMemberListItemResponse[];
	locations: LocationDetailResponse[];
}

function kindOf(category: string, maxAttendees: number, classKey: string | null, staffed: boolean): OfferingKind {
	if (category === 'events') return 'event';
	if (classKey) return 'class';
	if ((siteConfig.timetableCategories as string[]).includes(category) && maxAttendees > 1 && staffed) return 'class';
	return 'service';
}

/** One product group → an offering with its series. */
export function toOffering(group: ProductListItemResponse, groupCollections: string[] = []): Offering {
	const variants = variantsOf(group);
	const firstSlug = variants[0]?.slug ?? group.slug;
	const slugKey = offeringKeyForSlug(firstSlug) ?? offeringKeyForSlug(group.slug);
	// Site copy wins when it knows the product (open floor sits in two collections); otherwise the collection decides.
	const category =
		(slugKey ? (classMeta(slugKey)?.category ?? serviceMeta(slugKey)?.category ?? (slugKey in siteConfig.events ? 'events' : null)) : null) ??
		categoryOf(groupCollections) ??
		(group.color && COLOR_TO_DISCIPLINE[group.color]) ??
		'coaching';
	const staffed = variants.every((v) => (v.staffMembers?.length ?? 0) === 1);
	const kind = kindOf(category, group.maxAttendees ?? variants[0]?.maxAttendees ?? 1, classKeyForSlug(firstSlug), staffed);
	const key =
		kind === 'class'
			? (classKeyForSlug(firstSlug) ?? slugify(group.title))
			: kind === 'service'
				? (serviceKeyForSlug(firstSlug) ?? serviceKeyForSlug(group.slug) ?? group.slug)
				: (prefixKey(EVENT_KEYS, group.slug) ?? prefixKey(EVENT_KEYS, firstSlug) ?? group.slug);
	const tone = toneFor(category);

	const set = (key && (classMeta(key)?.set ?? serviceMeta(key)?.set)) || null;
	const series: Series[] = variants.map((v) => {
		const sites = (v.locations ?? []).map(toSiteRef);
		const coaches = (v.staffMembers ?? []).map(toCoachRef).sort((a, b) => a.name.localeCompare(b.name));
		return {
			id: v.id,
			slug: v.slug,
			productId: group.productId || group.id,
			offeringKey: key,
			kind,
			category,
			tone,
			title: v.title || group.title,
			variantTitle: v.variantTitle ?? '',
			site: sites[0] ?? null,
			sites,
			coach: coaches[0] ?? null,
			coaches,
			set,
			capacity: v.maxAttendees ?? group.maxAttendees ?? 1,
			price: v.price ?? group.price ?? 0,
			duration: v.duration ?? group.duration ?? 0,
			allowCustomDuration: Boolean(v.allowCustomDuration ?? group.allowCustomDuration),
			maxDuration: v.maxDuration ?? group.maxDuration ?? null,
			images: getProductGallery({ imageId: v.imageId, image: v.image, images: v.images }),
			color: v.color ?? group.color ?? null,
			advanceThreshold: group.advanceScheduleThreshold ?? 0,
			cancelGap: group.cancelGap ?? 0,
		};
	});

	const prices = series.map((s) => s.price);
	const ev = kind === 'event' ? (siteConfig.events[key] ?? null) : null;
	return {
		key,
		productId: group.productId || group.id,
		kind,
		category,
		tone,
		title: group.title,
		description: group.description ?? '',
		duration: series[0]?.duration ?? group.duration ?? 0,
		fromPrice: prices.length ? Math.min(...prices) : group.price,
		images: [...new Set(series.flatMap((s) => s.images))],
		collections: groupCollections,
		series,
		siteIds: [...new Set(series.flatMap((s) => s.sites.map((x) => x.id)))],
		coachIds: [...new Set(series.flatMap((s) => s.coaches.map((c) => c.id)))],
		classMeta: kind === 'class' ? classMeta(key) : null,
		serviceMeta: kind === 'service' ? serviceMeta(key) : null,
		eventMeta: ev ? { tagline: ev.tagline, whatToBring: ev.whatToBring } : null,
	};
}

function orderIn(keys: string[]) {
	return (a: Offering, b: Offering) => {
		const da = DISCIPLINES.indexOf(a.category);
		const db = DISCIPLINES.indexOf(b.category);
		if (da !== db) return da - db;
		const ia = keys.indexOf(a.key);
		const ib = keys.indexOf(b.key);
		return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.title.localeCompare(b.title);
	};
}

/** The whole catalog from the four list endpoints. */
export function buildCatalog({ products, collections, staff, locations }: CatalogInput): Catalog {
	const groupCollections = collectionsByGroup(collections);
	const all = products.map((p) => toOffering(p, groupCollections[p.productId || p.id] ?? groupCollections[p.id] ?? []));
	const allSeriesList = all.flatMap((o) => o.series);

	// Staff ↔ variant from the staff side too: union both directions so a short nested list never hides a coach.
	for (const s of allSeriesList) {
		for (const member of staff) {
			if (s.coaches.some((c) => c.id === member.id)) continue;
			if ((member.products ?? []).some((p) => p.id === s.id)) s.coaches.push(toCoachRef(member));
		}
		s.coaches.sort((a, b) => a.name.localeCompare(b.name));
		s.coach ??= s.coaches[0] ?? null;
	}
	for (const o of all) o.coachIds = [...new Set(o.series.flatMap((s) => s.coaches.map((c) => c.id)))];

	const classes = all.filter((o) => o.kind === 'class').sort(orderIn(Object.keys(siteConfig.classes)));
	const services = all.filter((o) => o.kind === 'service').sort(orderIn(Object.keys(siteConfig.services)));
	const events = all.filter((o) => o.kind === 'event').sort((a, b) => a.title.localeCompare(b.title));

	const siteOrder = Object.keys(siteConfig.sites);
	const sites: Site[] = locations
		.filter((l) => l.type !== siteConfig.locationTypes.delivery)
		.map((l) => {
			const ref = toSiteRef(l);
			const here = allSeriesList.filter((s) => s.sites.some((x) => x.id === l.id));
			return {
				...ref,
				address:
					l.displayAddress ||
					[l.addressLine1, l.addressLine2, [l.city, l.postalCode].filter(Boolean).join(' ')].filter(Boolean).join(', ') ||
					'',
				link: l.link ?? null,
				latitude: l.latitude ?? null,
				longitude: l.longitude ?? null,
				meta: siteMeta(l.slug),
				offeringKeys: [...new Set(here.map((s) => s.offeringKey))],
				coachIds: [...new Set(here.flatMap((s) => s.coaches.map((c) => c.id)))],
			};
		})
		.sort((a, b) => {
			const ia = siteOrder.indexOf(a.slug);
			const ib = siteOrder.indexOf(b.slug);
			return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.name.localeCompare(b.name);
		});

	const roleOrder = { coach: 0, photographer: 1, videographer: 1, makeup: 2 } as const;
	const tierOrder = { head: 0, senior: 1, coach: 2 } as const;
	const coaches: Coach[] = staff
		.map((s) => {
			const mine = allSeriesList.filter((x) => x.coaches.some((c) => c.id === s.id));
			const meta = coachMeta(s.slug);
			return {
				...toCoachRef(s),
				lastName: s.lastName ?? '',
				siteIds: [...new Set([...(s.locations ?? []).map((l) => l.id), ...mine.flatMap((x) => x.sites.map((y) => y.id))])],
				offeringKeys: [...new Set(mine.map((x) => x.offeringKey))],
				categories: [...new Set([...(meta?.categories ?? []), ...mine.filter((x) => x.kind === 'class').map((x) => x.category)])],
				meta,
			};
		})
		.sort((a, b) => {
			const ra = a.meta ? roleOrder[a.meta.role] : 3;
			const rb = b.meta ? roleOrder[b.meta.role] : 3;
			const ta = a.meta?.tier ? tierOrder[a.meta.tier] : 3;
			const tb = b.meta?.tier ? tierOrder[b.meta.tier] : 3;
			return ra - rb || ta - tb || a.name.localeCompare(b.name);
		});

	return { classes, services, events, sites, coaches };
}

/* ------------------------------------------------------------------ Queries */

export function allSeries(catalog: Catalog): Series[] {
	return [...catalog.classes, ...catalog.services, ...catalog.events].flatMap((o) => o.series);
}

export function allOfferings(catalog: Catalog): Offering[] {
	return [...catalog.classes, ...catalog.services, ...catalog.events];
}

export function findOffering(catalog: Catalog, key: string): Offering | null {
	return allOfferings(catalog).find((o) => o.key === key) ?? null;
}

export function findSeries(catalog: Catalog, idOrSlug: string): Series | null {
	return allSeries(catalog).find((s) => s.id === idOrSlug || s.slug === idOrSlug) ?? null;
}

export function findSite(catalog: Catalog, keyOrSlug: string): Site | null {
	return catalog.sites.find((s) => s.key === keyOrSlug || s.slug === keyOrSlug) ?? null;
}

export function findCoach(catalog: Catalog, slug: string): Coach | null {
	const bare = slug.replace(/^staff-/, '');
	return catalog.coaches.find((c) => c.slug === slug || c.slug.replace(/^staff-/, '') === bare) ?? null;
}

export function physicalSites(catalog: Catalog): Site[] {
	return catalog.sites.filter((s) => !s.online);
}

/** Services in one category (coaching, recovery, lab). */
export function servicesIn(catalog: Catalog, category: string): Offering[] {
	return catalog.services.filter((o) => o.category === category);
}

/** Offerings whose bookable things a coach can run (for the coach profile). */
export function offeringsForCoach(catalog: Catalog, coachId: string): Offering[] {
	return allOfferings(catalog).filter((o) => o.coachIds.includes(coachId));
}
