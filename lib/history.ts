import type { Visit } from '@/lib/visit';

/** The account maths: upcoming vs past, and the doors opened per room. Pure. */
export interface LogEntry {
	e: Visit;
	status: string;
}

export function splitLog<T extends LogEntry>(entries: readonly T[], now: number): { upcoming: T[]; past: T[] } {
	const upcoming = entries.filter((x) => x.e.end > now && (x.status === 'scheduled' || x.status === 'pending')).sort((a, b) => a.e.start - b.e.start);
	const past = entries.filter((x) => !upcoming.includes(x)).sort((a, b) => b.e.start - a.e.start);
	return { upcoming, past };
}

/** Room slug → the date of the first completed (not cancelled, already ended) visit there. */
export function openedDoors(entries: readonly LogEntry[], now: number): Record<string, number> {
	const out: Record<string, number> = {};
	for (const x of entries) {
		if (x.e.kind !== 'room' || x.status === 'canceled' || x.e.end > now) continue;
		const prev = out[x.e.key];
		if (prev === undefined || x.e.start < prev) out[x.e.key] = x.e.start;
	}
	return out;
}
