import type { Catalogue } from '@/lib/rooms';
import { FALLBACK_PALETTE, roomPresentation, venuePresentation, type Mood, type RoomPalette, type WorldMedia } from '@/lib/site-config';

/** One door in the corridor (home hero, header doors menu, /rooms, footer). Serialisable. */
export interface DoorRoom {
	slug: string;
	title: string;
	short: string;
	genre: string;
	year: string;
	tagline: string;
	/** Door number in the corridor (1-based). */
	number: number;
	palette: RoomPalette;
	venueSlug: string | null;
	venueShort: string;
	difficulty: number;
	fear: number;
	minAge: number;
	epic: boolean;
	family: boolean;
	moods: Mood[];
	/** Store key art (3:4), `imageUrls[0]`, or null. */
	keyArt: string | null;
	media: WorldMedia;
	fromPrice: number;
	players: string;
	gameMinutes: number;
}

export function doorRooms(c: Catalogue): DoorRoom[] {
	return c.rooms.map((r, i) => {
		const p = roomPresentation(r.slug);
		const sizes = r.options.map((o) => o.size);
		return {
			slug: r.slug,
			title: r.title,
			short: p?.short ?? r.title,
			genre: p?.genre ?? 'Escape room',
			year: p?.year ?? '',
			tagline: p?.tagline ?? '',
			number: i + 1,
			palette: p?.palette ?? FALLBACK_PALETTE,
			venueSlug: r.venue?.slug ?? null,
			venueShort: venuePresentation(r.venue?.slug)?.short ?? r.venue?.title ?? '',
			difficulty: p?.difficulty ?? 3,
			fear: p?.fear ?? 1,
			minAge: p?.minAge ?? 12,
			epic: Boolean(p?.epic),
			family: Boolean(p?.family),
			moods: p?.moods ?? [],
			keyArt: r.images[0] ?? null,
			media: p?.media ?? {},
			fromPrice: r.options[0]?.price ?? 0,
			players: sizes.length ? `${Math.min(...sizes)}–${Math.max(...sizes)}` : '',
			gameMinutes: p?.gameMinutes ?? 60,
		};
	});
}

/** Re-order doors for a mood filter: matching doors first (past/future/family), or a sort (hardest/scariest). */
export function doorsForMood<T extends Pick<DoorRoom, 'moods' | 'difficulty' | 'fear' | 'number'>>(doors: readonly T[], mood: Mood | 'all'): { door: T; match: boolean }[] {
	if (mood === 'all') return doors.map((door) => ({ door, match: true }));
	if (mood === 'hardest' || mood === 'scariest') {
		const key = mood === 'hardest' ? 'difficulty' : 'fear';
		return [...doors].sort((a, b) => b[key] - a[key] || a.number - b.number).map((door, i) => ({ door, match: i < 3 }));
	}
	const hit = doors.filter((d) => d.moods.includes(mood));
	const miss = doors.filter((d) => !d.moods.includes(mood));
	return [...hit.map((door) => ({ door, match: true })), ...miss.map((door) => ({ door, match: false }))];
}
