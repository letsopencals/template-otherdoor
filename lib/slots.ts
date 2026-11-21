import { localParts, localToUtc } from '@/lib/timetable';

/**
 * The service booker: bookable start times derived on the client from one set of
 * free windows (merged availability across the whole horizon). A day change
 * never refetches. Starts sit on a local-time grid (every `stepMin` from
 * midnight), so 07:00, 07:30… rather than 07:13.
 */

export interface FreeRange {
	start: number;
	end: number;
	attendees: number;
	maxAttendees: number;
	staffMemberIds: string[];
}

export interface SlotStart {
	start: number;
	end: number;
	/** Coach for this start (the first free one when "any coach"). */
	staffMemberId: string | null;
	/** Places left for capacity products (1 for one-to-one). */
	left: number;
	localDate: string;
	localTime: string;
}

export interface StartOptions {
	durationMin: number;
	stepMin: number;
	now: number;
	/** Seconds before the start after which booking closes. */
	advanceSeconds?: number;
	/** Places needed (capacity products). */
	places?: number;
}

export function startsFrom(ranges: readonly FreeRange[], { durationMin, stepMin, now, advanceSeconds = 0, places = 1 }: StartOptions): SlotStart[] {
	const len = durationMin * 60_000;
	const earliest = now + advanceSeconds * 1000;
	const byStart = new Map<number, SlotStart>();
	for (const r of ranges) {
		if (r.maxAttendees - r.attendees < places) continue;
		// First grid point at or after the range start, in local time.
		const p = localParts(r.start);
		const [h, m] = p.time.split(':').map(Number);
		const mins = (h ?? 0) * 60 + (m ?? 0);
		const aligned = Math.ceil(mins / stepMin) * stepMin;
		// A window that opens "now" carries seconds (19:09:05): snap to the whole minute, or its starts sit off
		// the grid and duplicate other coaches' 7:00 PM as 7:00:05 PM.
		let t = r.start - (r.start % 60_000) + (aligned - mins) * 60_000;
		if (t < r.start) t += stepMin * 60_000;
		for (; t + len <= r.end; t += stepMin * 60_000) {
			if (t < earliest || t <= now) continue;
			if (byStart.has(t)) continue;
			const lp = localParts(t);
			byStart.set(t, { start: t, end: t + len, staffMemberId: r.staffMemberIds[0] ?? null, left: Math.max(0, r.maxAttendees - r.attendees), localDate: lp.date, localTime: lp.time });
		}
	}
	return [...byStart.values()].sort((a, b) => a.start - b.start);
}

/** Starts grouped by local date. */
export function startsByDay(starts: readonly SlotStart[]): Record<string, SlotStart[]> {
	const out: Record<string, SlotStart[]> = {};
	for (const s of starts) (out[s.localDate] ??= []).push(s);
	return out;
}

/** Lengths (minutes) a custom-duration product can take: the configured ones that are whole multiples of the base and within the max. */
export function lengthsFor(baseMin: number, maxMin: number | null, wanted: readonly number[] | undefined): number[] {
	const cap = maxMin && maxMin > 0 ? maxMin : Infinity;
	const list = (wanted?.length ? wanted : [baseMin, baseMin * 2, baseMin * 3]).filter((l) => l >= baseMin && l % baseMin === 0 && l <= cap);
	return list.length ? [...new Set(list)].sort((a, b) => a - b) : [baseMin];
}

/** Price for a length: whole base units × the unit price (how the API charges custom durations). */
export function priceFor(unitPrice: number, baseMin: number, lengthMin: number): number {
	return Math.ceil(lengthMin / baseMin) * unitPrice;
}

/** UTC instant for a local date + "HH:mm" (re-exported for the booker UI). */
export { localToUtc };
