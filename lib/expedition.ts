import { parseTeamSlug } from '@/lib/rooms';
import { FALLBACK_PALETTE, roomPresentation, siteConfig, venuePresentation, type RoomPalette } from '@/lib/site-config';

/**
 * One booked session, as a satchel tag, the letter, the invitation and the
 * logbook show it. Pure: built from any appointment-shaped record (cart line,
 * order line, self-service appointment).
 */
export interface Expedition {
	id: string;
	kind: 'room' | 'workshop';
	/** Room slug (rooms) or product slug (workshops). */
	key: string;
	title: string;
	/** Players (rooms). */
	team: number | null;
	/** Seats (workshops). */
	seats: number;
	start: number;
	end: number;
	/** Call time: `callTimeMinutes` before the start. */
	call: number;
	venueSlug: string | null;
	venueName: string | null;
	venueAddress: string | null;
	palette: RoomPalette;
	addOns: string[];
	wear: string | null;
}

export interface AppointmentShape {
	id: string;
	from: string;
	to: string;
	numberOfAttendees?: number | null;
	customAttributes?: Record<string, string> | null;
	product?: { slug?: string | null; title?: string | null; variantTitle?: string | null } | null;
	location?: { slug?: string | null; title?: string | null; displayAddress?: string | null; address?: string | null } | null;
	addOns?: ReadonlyArray<{ addOn?: { title?: string | null } | null }> | null;
}

export function expeditionOf(a: AppointmentShape, extraAddOns: readonly string[] = []): Expedition {
	const slug = a.product?.slug ?? '';
	const parsed = parseTeamSlug(slug);
	const people = Number(a.customAttributes?.[siteConfig.customAttributeKeys.people]);
	const fromTitle = Number(/(\d+)\s*players?/i.exec(a.product?.variantTitle ?? '')?.[1]);
	const team = parsed?.size ?? (Number.isFinite(people) && people > 0 ? people : Number.isFinite(fromTitle) && fromTitle > 0 ? fromTitle : null);
	const kind: Expedition['kind'] = parsed || roomPresentation(slug) ? 'room' : 'workshop';
	const key = parsed?.room ?? slug;
	const p = roomPresentation(key);
	const v = venuePresentation(a.location?.slug);
	const start = Date.parse(a.from);
	const titles = [...(a.addOns ?? []).map((x) => x.addOn?.title ?? ''), ...extraAddOns].filter(Boolean);
	return {
		id: a.id,
		kind,
		key,
		title: a.product?.title || p?.title || 'Expedition',
		team: kind === 'room' ? team : null,
		seats: a.numberOfAttendees ?? 1,
		start,
		end: Date.parse(a.to),
		call: start - siteConfig.callTimeMinutes * 60_000,
		venueSlug: a.location?.slug ?? null,
		venueName: v?.name ?? a.location?.title ?? null,
		venueAddress: v ? `${v.address}, ${v.postcode}` : (a.location?.displayAddress || a.location?.address || null),
		palette: p?.palette ?? FALLBACK_PALETTE,
		addOns: [...new Set(titles)],
		wear: p?.wear ?? null,
	};
}

/** "6 players" / "2 seats". */
export function partyLabel(e: Pick<Expedition, 'kind' | 'team' | 'seats'>): string {
	if (e.kind === 'room') return e.team ? `${e.team} players` : 'Your team';
	return `${e.seats} ${e.seats === 1 ? 'seat' : 'seats'}`;
}

/** Google Maps link for a venue. */
export function mapHref(venueSlug: string | null, fallbackAddress?: string | null): string | null {
	const v = venuePresentation(venueSlug);
	if (v) return `https://www.google.com/maps/search/?api=1&query=${v.lat},${v.lng}`;
	return fallbackAddress ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallbackAddress)}` : null;
}
