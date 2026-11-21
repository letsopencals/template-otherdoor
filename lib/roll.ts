import { isCrewShoot } from '@/lib/site-config';
import type { BookingView } from '@/lib/booking-view';

/**
 * Your roll: bookings split into upcoming / shot / cancelled, plus the honest
 * state of each past session's edits (the crew emails them; this site never
 * holds the media). Pure.
 */
export interface RollSplit {
	upcoming: BookingView[];
	shot: BookingView[];
	cancelled: BookingView[];
}

export function splitRoll(views: readonly BookingView[], now: number): RollSplit {
	const upcoming: BookingView[] = [];
	const shot: BookingView[] = [];
	const cancelled: BookingView[] = [];
	for (const v of views) {
		if (v.status === 'canceled') cancelled.push(v);
		// Pending bookings (awaiting payment or the studio's OK) stay up next; a pending row without an
		// order is only a cart hold and shows nowhere.
		else if (v.status === 'pending' && !v.booked) continue;
		else if (v.end > now && (v.status === 'scheduled' || v.status === 'pending')) upcoming.push(v);
		else if (v.start <= now && v.status !== 'pending') shot.push(v);
	}
	upcoming.sort((a, b) => a.start - b.start);
	shot.sort((a, b) => b.start - a.start);
	return { upcoming, shot, cancelled };
}

export type EditsState = { kind: 'none' } | { kind: 'editing'; dueAt: number } | { kind: 'sent' };

/** Where a past session's edits are: no shots booked, still in the edit (due by), or emailed. A shoot always delivers. */
export function editsState(v: Pick<BookingView, 'shots' | 'end'> & { category?: string; offeringKey?: string | null }, now: number): EditsState {
	const isShoot = isCrewShoot(v.category, v.offeringKey);
	if (!v.shots.length && !isShoot) return { kind: 'none' };
	const hours = Math.max(48, ...v.shots.map((s) => Number.parseInt(s.eta, 10) || 48));
	const dueAt = v.end + hours * 3_600_000;
	return now < dueAt ? { kind: 'editing', dueAt } : { kind: 'sent' };
}

/** Totals for the roll header: sessions shot, shots booked, sets visited. */
export function rollStats(shot: readonly BookingView[]): { sessions: number; shots: number; sets: number } {
	return {
		sessions: shot.length,
		shots: shot.reduce((n, v) => n + v.shots.length, 0),
		sets: new Set(shot.map((v) => v.setName).filter(Boolean)).size,
	};
}
