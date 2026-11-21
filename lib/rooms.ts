import type {
	LocationDetailResponse,
	ProductCollectionResponse,
	ProductListItemResponse,
	ProductListVariant,
	StaffMemberListItemResponse,
} from '@opencals/storefront-sdk';
import { getProductGallery } from '@/lib/format';
import { ROOM_ORDER, roomPresentation, siteConfig } from '@/lib/site-config';

/**
 * The catalogue, parsed from the store by convention (see README → "Catalogue convention"):
 *
 * - A **room** is a product group whose variants are team sizes: slug `<room>-<n>p`,
 *   `variantTitle` "<n> players", price = the group price for that size,
 *   `maxAttendees: 1`, no staff. All variants share one product pool, so any team
 *   size blocks the room. Availability is read for one variant per room (the
 *   smallest team); the booking goes to the variant for the chosen team size.
 * - A **workshop** is a product in the `workshops` collection: staff-led, priced
 *   per head, `maxAttendees` = seats.
 *
 * Pure. Nothing here hardcodes a room slug: unknown rooms still render, with a
 * neutral palette.
 */

export interface TeamOption {
	productId: string;
	slug: string;
	/** Players. */
	size: number;
	/** Group price for this team size. */
	price: number;
	/** Rounded price per head. */
	perHead: number;
}

export interface VenueRef {
	id: string;
	slug: string;
	title: string;
	address: string | null;
	lat: number | null;
	lng: number | null;
}

export interface Room {
	slug: string;
	title: string;
	description: string;
	/** Whole visit (briefing + game + debrief), minutes. */
	durationMin: number;
	venue: VenueRef | null;
	options: TeamOption[];
	/** The variant whose availability stands for the room (smallest team). */
	availabilityProductId: string;
	poolId: string | null;
	/** Store images, default first. Empty when the store has none. */
	images: string[];
	cancelGap: number;
	rescheduleGap: number;
}

export interface Workshop {
	slug: string;
	productId: string;
	title: string;
	description: string;
	durationMin: number;
	/** Per person. */
	price: number;
	seats: number;
	venue: VenueRef | null;
	staffIds: string[];
	images: string[];
}

export interface StaffRef {
	id: string;
	slug: string;
	name: string;
	image: string | null;
}

export interface Catalogue {
	rooms: Room[];
	workshops: Workshop[];
	venues: VenueRef[];
	staff: StaffRef[];
	/** Any room variant id → room slug (appointments reference the variant). */
	variantToRoom: Record<string, string>;
}

export const EMPTY_CATALOGUE: Catalogue = { rooms: [], workshops: [], venues: [], staff: [], variantToRoom: {} };

const TEAM_SLUG = /^(.*)-(\d+)p$/;
const TEAM_TITLE = /(\d+)\s*players?/i;

/** `jaguar-temple-4p` → `{ room: 'jaguar-temple', size: 4 }`. */
export function parseTeamSlug(slug: string): { room: string; size: number } | null {
	const m = TEAM_SLUG.exec(slug);
	return m ? { room: m[1] as string, size: Number(m[2]) } : null;
}

type V = Pick<
	ProductListVariant,
	'id' | 'productId' | 'slug' | 'title' | 'variantTitle' | 'description' | 'price' | 'duration' | 'maxAttendees' | 'productPoolId' | 'imageId' | 'image' | 'images' | 'locations' | 'staffMembers' | 'collections' | 'productPool' | 'cancelGap' | 'rescheduleGap'
>;

/** A group's variants; a group without any is its own single variant. */
function variantsOf(p: ProductListItemResponse): V[] {
	if (p.variants?.length) return p.variants;
	return [{ ...p, images: p.image ? [p.image] : [], locations: [], staffMembers: [], collections: [], productPool: null } as V];
}

function venueOf(loc: { id: string; slug: string; title: string | null; address?: string | null; displayAddress?: string | null; latitude?: number | null; longitude?: number | null } | undefined): VenueRef | null {
	if (!loc) return null;
	return { id: loc.id, slug: loc.slug, title: loc.title ?? loc.slug, address: loc.displayAddress || loc.address || null, lat: loc.latitude ?? null, lng: loc.longitude ?? null };
}

function teamSize(v: V): number | null {
	const fromSlug = parseTeamSlug(v.slug)?.size;
	if (fromSlug) return fromSlug;
	const fromTitle = TEAM_TITLE.exec(v.variantTitle ?? '')?.[1];
	return fromTitle ? Number(fromTitle) : null;
}

/** Collection slugs per product id (variants and groups). */
function collectionIndex(collections: readonly ProductCollectionResponse[]): Map<string, Set<string>> {
	const idx = new Map<string, Set<string>>();
	for (const c of collections) {
		for (const p of c.products ?? []) {
			for (const id of [p.id, p.productId]) {
				if (!id) continue;
				if (!idx.has(id)) idx.set(id, new Set());
				idx.get(id)!.add(c.slug);
			}
		}
	}
	return idx;
}

function inCollection(v: V, slug: string, idx: Map<string, Set<string>>): boolean {
	return Boolean(v.collections?.some((c) => c.slug === slug) || idx.get(v.id)?.has(slug));
}

const SLUG_LIKE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-/i;

/** The room key: the `<room>` of `<room>-<n>p`, else a slug-like group key (`productId`), else the pool name. */
function roomKey(v: V & { productId?: string }): string | null {
	const group = v.productId && v.productId !== v.id && SLUG_LIKE.test(v.productId) && !UUID.test(v.productId) ? v.productId : null;
	return parseTeamSlug(v.slug)?.room ?? group ?? v.productPool?.name ?? null;
}

export function buildCatalogue(input: {
	products: readonly ProductListItemResponse[];
	collections?: readonly ProductCollectionResponse[];
	locations?: readonly LocationDetailResponse[];
	staff?: readonly StaffMemberListItemResponse[];
}): Catalogue {
	const idx = collectionIndex(input.collections ?? []);
	const roomsColl = siteConfig.collections.rooms;
	const workshopsColl = siteConfig.collections.workshops;
	const locById = new Map((input.locations ?? []).map((l) => [l.id, l]));

	// Rooms: gather variants by room key (across groups, in case a store splits them).
	const roomVariants = new Map<string, V[]>();
	const workshops: Workshop[] = [];
	for (const p of input.products) {
		for (const v of variantsOf(p)) {
			const isWorkshop = inCollection(v, workshopsColl, idx);
			const size = teamSize(v);
			const isRoom = !isWorkshop && (inCollection(v, roomsColl, idx) || parseTeamSlug(v.slug) !== null) && size !== null;
			if (isRoom) {
				const key = roomKey(v) ?? p.slug;
				if (!roomVariants.has(key)) roomVariants.set(key, []);
				roomVariants.get(key)!.push(v);
			} else if (isWorkshop) {
				const loc = v.locations?.[0];
				workshops.push({
					slug: v.slug,
					productId: v.id,
					title: v.title,
					description: v.description ?? '',
					durationMin: Math.round((v.duration ?? 0) / 60),
					price: v.price,
					seats: v.maxAttendees ?? 1,
					venue: venueOf(loc ? (locById.get(loc.id) ?? loc) : undefined),
					staffIds: (v.staffMembers ?? []).map((s) => s.id),
					images: getProductGallery(v),
				});
			}
		}
	}

	const variantToRoom: Record<string, string> = {};
	const rooms: Room[] = [];
	for (const [slug, list] of roomVariants) {
		const options = list
			.map((v) => ({ v, size: teamSize(v) as number }))
			.sort((a, b) => a.size - b.size)
			.filter((o, i, arr) => i === 0 || arr[i - 1]!.size !== o.size);
		const first = options[0]!.v;
		for (const v of list) variantToRoom[v.id] = slug;
		const loc = list.flatMap((v) => v.locations ?? [])[0];
		const withImages = list.find((v) => getProductGallery(v).length > 0);
		rooms.push({
			slug,
			title: first.title || roomPresentation(slug)?.title || slug,
			description: list.find((v) => v.description)?.description ?? '',
			durationMin: Math.round((first.duration ?? 0) / 60),
			venue: venueOf(loc ? (locById.get(loc.id) ?? loc) : undefined),
			options: options.map(({ v, size }) => ({ productId: v.id, slug: v.slug, size, price: v.price, perHead: Math.round(v.price / size) })),
			availabilityProductId: first.id,
			poolId: first.productPoolId ?? null,
			images: withImages ? getProductGallery(withImages) : [],
			cancelGap: first.cancelGap ?? 0,
			rescheduleGap: first.rescheduleGap ?? 0,
		});
	}
	// Shelf order: known rooms by volume, then the store's others by title.
	rooms.sort((a, b) => {
		const ia = ROOM_ORDER.indexOf(a.slug);
		const ib = ROOM_ORDER.indexOf(b.slug);
		if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
		return a.title.localeCompare(b.title);
	});

	const venues = (input.locations ?? []).filter((l) => l.type === 'physical').map((l) => venueOf(l)!);
	const staff = (input.staff ?? []).map((s) => ({ id: s.id, slug: s.slug, name: `${s.firstName} ${s.lastName}`.trim(), image: s.image?.url ?? null }));

	return { rooms, workshops: workshops.sort((a, b) => a.title.localeCompare(b.title)), venues, staff, variantToRoom };
}

export function findRoom(c: Catalogue, slug: string): Room | null {
	return c.rooms.find((r) => r.slug === slug) ?? null;
}

/** The option for a team size (or the smallest when not given / unknown). */
export function optionFor(room: Room, size: number | null | undefined): TeamOption | null {
	return room.options.find((o) => o.size === size) ?? room.options[0] ?? null;
}
