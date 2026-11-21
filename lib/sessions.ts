import type { CurrentAvailabilitySlot } from '@opencals/storefront-sdk';
import { localParts, localToUtc, addDays } from '@/lib/tz';

/**
 * Session times, derived on the client from one set of free windows per room
 * (merged availability across the whole horizon), so a day change never
 * refetches.
 *
 * Rooms run on a fixed wall-clock grid: local midnight + k × visit length
 * (90-min rooms: 10:30, 12:00, 13:30…; the 120-min Epic: 10:00, 12:00…). A
 * session is offered when it fits entirely inside a free window. Workshops run
 * at their scheduled times, so their sessions start where each window starts.
 */

export interface FreeRange {
	/** UTC epoch ms, rounded up to the whole minute. */
	start: number;
	/** UTC epoch ms, rounded up to the whole minute. */
	end: number;
	attendees: number;
	maxAttendees: number;
	/** Staff free for this window (workshops; merged availability spans every host). */
	staffMemberIds?: string[];
}

export interface Session {
	start: number;
	end: number;
	/** Local `YYYY-MM-DD`. */
	date: string;
	/** Local `HH:mm`. */
	time: string;
	/** Places left (seats for workshops; 1 for a free room). */
	left: number;
	/** Capacity (workshops). */
	capacity: number;
	/** A host free for this session (workshops), when the API names one. */
	staffMemberId?: string | null;
}

const MINUTE = 60_000;

function instant(date: string, time: string): number {
	return Date.parse(`${date}T${time.length === 5 ? `${time}:00` : time}Z`);
}

/**
 * API windows → minute-rounded ranges. Windows can open "now" with seconds
 * (19:09:05) or touch at a one-second seam (23:59:59 → 00:00:00): both bounds
 * round up to the minute, so starts never sit off the grid.
 */
export function toRanges(slots: readonly CurrentAvailabilitySlot[] | null | undefined): FreeRange[] {
	return (slots ?? [])
		.map((r) => ({
			start: Math.ceil(instant(r.fromDate, r.fromTime) / MINUTE) * MINUTE,
			end: Math.ceil(instant(r.toDate, r.toTime) / MINUTE) * MINUTE,
			attendees: r.attendees ?? 0,
			maxAttendees: r.maxAttendees ?? 1,
			...(r.staffMemberIds?.length ? { staffMemberIds: [...r.staffMemberIds] } : {}),
		}))
		.filter((r) => Number.isFinite(r.start) && Number.isFinite(r.end) && r.end > r.start)
		.sort((a, b) => a.start - b.start);
}

const hhmm = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

/** Room sessions on the local grid (midnight + k × duration) that fit fully inside a free window and start after `now`. */
export function roomSessions(ranges: readonly FreeRange[], { durationMin, now }: { durationMin: number; now: number }): Session[] {
	if (!(durationMin > 0)) return [];
	const len = durationMin * MINUTE;
	const out = new Map<number, Session>();
	for (const r of ranges) {
		if (r.maxAttendees - r.attendees < 1 || r.end - r.start < len) continue;
		// Every local date the window touches (the day before too: a grid point can't precede its own midnight, but DST can shift it).
		const first = localParts(r.start).date;
		const last = localParts(r.end).date;
		for (let date = addDays(first, -1); date <= last; date = addDays(date, 1)) {
			for (let k = 0; k * durationMin < 24 * 60; k++) {
				const time = hhmm(k * durationMin);
				const t = localToUtc(date, time);
				// A wall-clock time inside the spring-forward gap doesn't exist: skip it rather than shift it.
				if (localParts(t).time !== time) continue;
				if (t < r.start || t + len > r.end || t <= now || out.has(t)) continue;
				out.set(t, { start: t, end: t + len, date, time, left: 1, capacity: 1 });
			}
		}
	}
	return [...out.values()].sort((a, b) => a.start - b.start);
}

/** Workshop sessions: back to back from each window's start, with the seats left. */
export function workshopSessions(ranges: readonly FreeRange[], { durationMin, now, seats = 1 }: { durationMin: number; now: number; seats?: number }): Session[] {
	if (!(durationMin > 0)) return [];
	const len = durationMin * MINUTE;
	const out = new Map<number, Session>();
	for (const r of ranges) {
		const left = Math.max(0, r.maxAttendees - r.attendees);
		if (left < seats) continue;
		for (let t = r.start; t + len <= r.end; t += len) {
			if (t <= now || out.has(t)) continue;
			const p = localParts(t);
			out.set(t, { start: t, end: t + len, date: p.date, time: p.time, left, capacity: r.maxAttendees, staffMemberId: r.staffMemberIds?.[0] ?? null });
		}
	}
	return [...out.values()].sort((a, b) => a.start - b.start);
}

/** Sessions grouped by local date. */
export function byDate(sessions: readonly Session[]): Record<string, Session[]> {
	const out: Record<string, Session[]> = {};
	for (const s of sessions) (out[s.date] ??= []).push(s);
	return out;
}

/** The first session at or after `now`. */
export function nextSession(sessions: readonly Session[], now: number = Date.now()): Session | null {
	return sessions.find((s) => s.start > now) ?? null;
}

/** Filters one day's exact slots (reschedule: per-date call with excludeAppointmentId) to the room grid. */
export function onGrid(slots: readonly CurrentAvailabilitySlot[], durationMin: number, now: number): Session[] {
	const len = durationMin * MINUTE;
	return roomSessions(
		toRanges(slots).map((r) => ({ ...r, end: Math.max(r.end, r.start + len) })),
		{ durationMin, now },
	);
}
