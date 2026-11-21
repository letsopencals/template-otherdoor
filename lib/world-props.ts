import type { ReactNode } from 'react';
import type { Catalogue, Room, VenueRef } from '@/lib/rooms';
import { FALLBACK_PALETTE, gameMaster, roomPresentation, siteConfig, venuePresentation } from '@/lib/site-config';
import type { RoomWorldProps, WorldPresentation, WorldVenue } from '@/lib/worlds';
import { formatWholePrice } from '@/lib/format';

/** Pure builders from the parsed catalogue + site-config to the world contract. */

export function worldVenue(v: VenueRef | null): WorldVenue | null {
	if (!v) return null;
	const p = venuePresentation(v.slug);
	return {
		slug: v.slug,
		name: p?.name ?? v.title,
		short: p?.short ?? v.title,
		address: p?.address ?? v.address ?? '',
		postcode: p?.postcode ?? '',
		lat: v.lat ?? p?.lat ?? null,
		lng: v.lng ?? p?.lng ?? null,
		href: `/venues/${v.slug}`,
	};
}

export function worldPresentation(room: Pick<Room, 'slug' | 'options'>): WorldPresentation {
	const p = roomPresentation(room.slug);
	const sizes = room.options.map((o) => o.size);
	return {
		genre: p?.genre ?? 'Adventure',
		year: p?.year ?? '',
		tagline: p?.tagline ?? '',
		order: p?.order ?? 0,
		difficulty: p?.difficulty ?? 3,
		fear: p?.fear ?? 1,
		minAge: p?.minAge ?? 12,
		successRate: p?.successRate ?? 50,
		gameMinutes: p?.gameMinutes ?? 60,
		record: p?.record ?? '',
		minPlayers: sizes.length ? Math.min(...sizes) : (p?.players[0] ?? 2),
		maxPlayers: sizes.length ? Math.max(...sizes) : (p?.players[1] ?? 6),
		epic: Boolean(p?.epic),
		family: Boolean(p?.family),
		palette: p?.palette ?? FALLBACK_PALETTE,
		headerTone: p?.headerTone ?? 'light',
		beats: p?.beats ?? [],
		wear: p?.wear ?? 'Comfortable clothes and closed shoes.',
		media: p?.media ?? {},
	};
}

export function buildWorldProps(room: Room, catalogue: Catalogue, booking: ReactNode): RoomWorldProps {
	const p = roomPresentation(room.slug);
	const gmSlug = p?.gameMaster ?? null;
	const gm = gameMaster(gmSlug);
	const staff = catalogue.staff.find((s) => s.slug === gmSlug);
	// Next door: the configured one if the store sells it, else the next in the corridor.
	const idx = catalogue.rooms.findIndex((r) => r.slug === room.slug);
	const nextRoom = catalogue.rooms.find((r) => r.slug === p?.next && r.slug !== room.slug) ?? (catalogue.rooms.length > 1 ? catalogue.rooms[(idx + 1) % catalogue.rooms.length] : undefined);
	const from = room.options[0]?.price ?? 0;
	return {
		room: {
			slug: room.slug,
			title: room.title,
			description: room.description,
			visitMinutes: room.durationMin,
			options: room.options,
			fromPrice: from,
			fromPriceLabel: formatWholePrice(from),
			venue: worldVenue(room.venue),
		},
		presentation: worldPresentation(room),
		cover: room.images[0] ?? null,
		photos: room.images.slice(1),
		gameMaster: gm || staff ? { slug: gmSlug ?? staff!.slug, name: staff?.name || gm!.name, title: gm?.title ?? 'Game master', bio: gm?.bio ?? '', image: staff?.image ?? null } : null,
		next: nextRoom
			? {
					slug: nextRoom.slug,
					title: nextRoom.title,
					tagline: roomPresentation(nextRoom.slug)?.tagline ?? '',
					genre: roomPresentation(nextRoom.slug)?.genre ?? '',
					palette: roomPresentation(nextRoom.slug)?.palette ?? FALLBACK_PALETTE,
					cover: nextRoom.images[0] ?? null,
					href: `/rooms/${nextRoom.slug}`,
				}
			: null,
		records: siteConfig.hallOfFame[room.slug] ?? [],
		booking,
	};
}
