import type { Catalogue } from '@/lib/rooms';
import { FALLBACK_PALETTE, roomPresentation, siteConfig, venuePresentation, type RoomPalette } from '@/lib/site-config';

/** One book spine on the shelf (header menu, home, /rooms). Serialisable. */
export interface ShelfRoom {
	slug: string;
	title: string;
	short: string;
	genre: string;
	year: string;
	volume: number;
	palette: RoomPalette;
	venueShort: string;
	difficulty: number;
	fear: number;
	epic: boolean;
	family: boolean;
	/** The cryptex letter gilt at the spine's foot. */
	letter: string;
	cover: string | null;
	fromPrice: number;
	players: string;
}

export function shelfRooms(c: Catalogue): ShelfRoom[] {
	const word = siteConfig.cryptex.word;
	return c.rooms.map((r, i) => {
		const p = roomPresentation(r.slug);
		const sizes = r.options.map((o) => o.size);
		return {
			slug: r.slug,
			title: r.title,
			short: p?.short ?? r.title,
			genre: p?.genre ?? 'Adventure',
			year: p?.year ?? '',
			volume: p?.volume ?? i + 1,
			palette: p?.palette ?? FALLBACK_PALETTE,
			venueShort: venuePresentation(r.venue?.slug)?.short ?? r.venue?.title ?? '',
			difficulty: p?.difficulty ?? 3,
			fear: p?.fear ?? 1,
			epic: Boolean(p?.epic),
			family: Boolean(p?.family),
			letter: word[i] ?? '',
			cover: r.images[0] ?? null,
			fromPrice: r.options[0]?.price ?? 0,
			players: sizes.length ? `${Math.min(...sizes)}–${Math.max(...sizes)}` : '',
		};
	});
}
