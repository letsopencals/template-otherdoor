import { describe, expect, it } from 'vitest';
import type { ProductCollectionResponse, ProductListItemResponse } from '@opencals/storefront-sdk';
import { buildCatalogue, optionFor, parseTeamSlug } from '@/lib/rooms';

const vaults = { id: 'loc-v', slug: 'gilded-compass-vaults', title: 'The Vaults, Cowgate', type: 'physical', address: '19 Cowgate', latitude: 55.9488, longitude: -3.188 };
const leith = { id: 'loc-l', slug: 'gilded-compass-leith', title: 'The Bond, Leith', type: 'physical', address: '54 The Shore', latitude: 55.9757, longitude: -3.1702 };

function v(o: { id: string; slug: string; title: string; variantTitle?: string; price: number; duration: number; maxAttendees?: number; loc: typeof vaults; pool?: string; staff?: string[]; images?: string[] }) {
	return {
		id: o.id,
		productId: 'grp',
		slug: o.slug,
		title: o.title,
		variantTitle: o.variantTitle ?? '',
		description: `${o.title} story`,
		price: o.price,
		duration: o.duration,
		maxAttendees: o.maxAttendees ?? 1,
		productPoolId: o.pool ? `pool-${o.pool}` : null,
		productPool: o.pool ? { id: `pool-${o.pool}`, name: o.pool } : null,
		imageId: o.images?.length ? 'img-0' : '',
		image: null,
		images: (o.images ?? []).map((url, i) => ({ id: `img-${i}`, url })),
		locations: [o.loc],
		staffMembers: (o.staff ?? []).map((id) => ({ id, slug: id, firstName: id, lastName: '' })),
		collections: [],
		cancelGap: 86400,
		rescheduleGap: 86400,
	};
}

function group(variants: ReturnType<typeof v>[]): ProductListItemResponse {
	return { ...variants[0], variants } as unknown as ProductListItemResponse;
}

const temple = [6, 2, 4, 3, 5].map((n) =>
	v({ id: `jt-${n}`, slug: `jaguar-temple-${n}p`, title: 'The Jaguar Temple', variantTitle: `${n} players`, price: { 2: 70, 3: 90, 4: 108, 5: 125, 6: 138 }[n]!, duration: 5400, loc: vaults, pool: 'jaguar-temple', images: n === 2 ? ['https://cdn/cover-jaguar-temple.jpg', 'https://cdn/jaguar-temple-1.jpg'] : [] }),
);
const tomb = [4, 8].map((n) => v({ id: `ct-${n}`, slug: `cartographers-tomb-${n}p`, title: 'The Cartographer’s Tomb', variantTitle: `${n} players`, price: n === 4 ? 160 : 256, duration: 7200, loc: vaults, pool: 'cartographers-tomb' }));
const lock = v({ id: 'wk-lock', slug: 'lockpicking-101', title: 'Lockpicking 101', price: 28, duration: 3600, maxAttendees: 8, loc: leith, staff: ['staff-thea'] });
const mystery = [2, 3].map((n) => v({ id: `mx-${n}`, slug: `mystery-${n}p`, title: 'Mystery Room', variantTitle: `${n} players`, price: 50 + n, duration: 3600, loc: leith, pool: 'mystery' }));

const collections = [
	{ slug: 'rooms', products: [...temple, ...tomb, ...mystery].map((x) => ({ id: x.id, productId: 'grp' })) },
	{ slug: 'workshops', products: [{ id: lock.id, productId: lock.id }] },
] as unknown as ProductCollectionResponse[];

describe('parseTeamSlug', () => {
	it('reads room and team size', () => {
		expect(parseTeamSlug('jaguar-temple-4p')).toEqual({ room: 'jaguar-temple', size: 4 });
		expect(parseTeamSlug('gaslight-no-9-5p')).toEqual({ room: 'gaslight-no-9', size: 5 });
		expect(parseTeamSlug('lockpicking-101')).toBeNull();
	});
});

describe('buildCatalogue', () => {
	const c = buildCatalogue({ products: [group(temple), group(tomb), group([lock]), group(mystery)], collections, locations: [vaults, leith] as never });

	it('groups team-size variants into rooms, smallest team first', () => {
		const jt = c.rooms.find((r) => r.slug === 'jaguar-temple')!;
		expect(jt.options.map((o) => o.size)).toEqual([2, 3, 4, 5, 6]);
		expect(jt.options.map((o) => o.price)).toEqual([70, 90, 108, 125, 138]);
		expect(jt.options[3]!.perHead).toBe(25);
		expect(jt.availabilityProductId).toBe('jt-2');
		expect(jt.durationMin).toBe(90);
		expect(jt.venue?.slug).toBe('gilded-compass-vaults');
		expect(jt.images[0]).toBe('https://cdn/cover-jaguar-temple.jpg');
	});

	it('orders known rooms by volume and appends unknown store rooms', () => {
		expect(c.rooms.map((r) => r.slug)).toEqual(['jaguar-temple', 'cartographers-tomb', 'mystery']);
	});

	it('maps every variant id to its room', () => {
		expect(c.variantToRoom['jt-5']).toBe('jaguar-temple');
		expect(c.variantToRoom['ct-8']).toBe('cartographers-tomb');
	});

	it('reads workshops with per-head price and seats', () => {
		expect(c.workshops).toHaveLength(1);
		expect(c.workshops[0]).toMatchObject({ slug: 'lockpicking-101', price: 28, seats: 8, durationMin: 60, staffIds: ['staff-thea'] });
	});

	it('books the variant for the chosen team size', () => {
		const tombRoom = c.rooms.find((r) => r.slug === 'cartographers-tomb')!;
		expect(optionFor(tombRoom, 8)?.productId).toBe('ct-8');
		expect(optionFor(tombRoom, null)?.productId).toBe('ct-4');
		expect(tombRoom.durationMin).toBe(120);
	});

	it('is empty without products', () => {
		expect(buildCatalogue({ products: [] }).rooms).toEqual([]);
	});
});
