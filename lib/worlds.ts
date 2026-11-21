import type { ReactNode } from 'react';
import type { TeamOption } from '@/lib/rooms';
import type { HeaderTone, RoomPalette, WorldMedia } from '@/lib/site-config';

/**
 * THE ROOM-WORLD CONTRACT (read components/worlds/README.md).
 *
 * Every room page `/rooms/[slug]` renders one world component from
 * `components/worlds/<slug>/index.tsx`, default export, receiving
 * `RoomWorldProps`. Everything except `booking` is plain serialisable data, so a
 * world may be a Server Component or start with 'use client'.
 *
 * The page owns: the shared header (transparent over the world's hero, tone
 * from `presentation.headerTone`), the footer, metadata and JSON-LD, and the
 * wiring of the booking panel. The world owns everything in between.
 */

/** The room as the store sells it (names, prices, description, images come from the API). */
export interface WorldRoom {
	slug: string;
	title: string;
	/** The store's story setup (~120 words). */
	description: string;
	/** Whole visit in minutes (briefing + game + debrief). */
	visitMinutes: number;
	/** Team sizes, smallest first, with the group price and the rounded price per head. */
	options: TeamOption[];
	/** "from £70" helper: the smallest team's price. */
	fromPrice: number;
	/** Formatted, e.g. "£70". */
	fromPriceLabel: string;
	venue: WorldVenue | null;
}

export interface WorldVenue {
	slug: string;
	name: string;
	short: string;
	address: string;
	postcode: string;
	lat: number | null;
	lng: number | null;
	href: string;
}

/** Presentation from lib/site-config.ts (keyed by room slug). */
export interface WorldPresentation {
	genre: string;
	year: string;
	tagline: string;
	/** Door number in the corridor (1-based). */
	order: number;
	/** 1–5 */
	difficulty: number;
	/** 0–5 */
	fear: number;
	minAge: number;
	successRate: number;
	gameMinutes: number;
	record: string;
	minPlayers: number;
	maxPlayers: number;
	epic: boolean;
	family: boolean;
	palette: RoomPalette;
	headerTone: HeaderTone;
	beats: Array<{ title: string; body: string }>;
	wear: string;
	/** Template media for this world (public/worlds/<slug>/), each optional. */
	media: WorldMedia;
}

export interface WorldGameMaster {
	slug: string;
	name: string;
	/** Modern title, e.g. "Head game master · Kepler Station". */
	title: string;
	bio: string;
	/** Store portrait; null until photos exist (draw initials/silhouette). */
	image: string | null;
}

export interface WorldNextRoom {
	slug: string;
	title: string;
	tagline: string;
	genre: string;
	palette: RoomPalette;
	/** Store cover art or null. */
	cover: string | null;
	href: string;
}

export interface WorldRecord {
	team: string;
	time: string;
	date: string;
}

export interface RoomWorldProps {
	room: WorldRoom;
	presentation: WorldPresentation;
	/** Store key art (3:4 cinematic poster, `imageUrls[0]`), or null. */
	cover: string | null;
	/** Store interior photos (3:2, `imageUrls[1..]`). May be empty: never render a broken image. */
	photos: string[];
	gameMaster: WorldGameMaster | null;
	next: WorldNextRoom | null;
	/** Hall of Fame sample for this room (site-config). */
	records: WorldRecord[];
	/**
	 * The shared BookingPanel, already wired for this room (date strip, sessions,
	 * team size, add-ons, total, "Add to your doors"). Place it once, in normal flow,
	 * inside an element with `id` of your choice; the panel itself carries
	 * `id="book"` (deep links `/rooms/<slug>?date=YYYY-MM-DD&time=HH:mm#book`).
	 * Skin it only through the `--bp-*` CSS variables on an ancestor.
	 */
	booking: ReactNode;
}

/** The `--bp-*` variables the BookingPanel reads (all optional; shell fallbacks apply). */
export const BOOKING_PANEL_VARS = [
	'--bp-bg',
	'--bp-ink',
	'--bp-muted',
	'--bp-line',
	'--bp-surface',
	'--bp-surface-ink',
	'--bp-accent',
	'--bp-accent-ink',
	'--bp-focus',
	'--bp-radius',
	'--bp-font-display',
	'--bp-font-ui',
	'--bp-shadow',
	'--bp-bar-bg',
	'--bp-bar-ink',
] as const;

export type BookingPanelVar = (typeof BOOKING_PANEL_VARS)[number];
