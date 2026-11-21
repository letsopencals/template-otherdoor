import { describe, expect, it } from 'vitest';
import { splitLog, openedDoors, type LogEntry } from '@/lib/history';

const e = (key: string, start: string, kind: 'room' | 'workshop' = 'room') => ({ id: key + start, kind, key, title: key, team: 4, seats: 1, start: Date.parse(start), end: Date.parse(start) + 5_400_000, call: 0, venueSlug: null, venueName: null, venueAddress: null, palette: {} as never, addOns: [], wear: null });
const NOW = Date.parse('2026-11-21T12:00:00Z');

describe("doors opened", () => {
	const log: LogEntry[] = [
		{ e: e('jaguar-temple', '2026-11-28T19:30:00Z'), status: 'scheduled' },
		{ e: e('gaslight-no-9', '2026-11-09T19:30:00Z'), status: 'completed' },
		{ e: e('gaslight-no-9', '2026-10-01T19:30:00Z'), status: 'completed' },
		{ e: e('hotel-lumiere', '2026-10-20T18:00:00Z'), status: 'canceled' },
		{ e: e('lockpicking-101', '2026-10-22T19:00:00Z', 'workshop'), status: 'completed' },
	];
	it('splits upcoming and past', () => {
		const { upcoming, past } = splitLog(log, NOW);
		expect(upcoming.map((x) => x.e.key)).toEqual(['jaguar-temple']);
		expect(past).toHaveLength(4);
	});
	it('openedDoors played rooms once, with the first date; no stamp for cancelled, upcoming or workshops', () => {
		const s = openedDoors(log, NOW);
		expect(Object.keys(s)).toEqual(['gaslight-no-9']);
		expect(new Date(s['gaslight-no-9']!).toISOString().slice(0, 10)).toBe('2026-10-01');
	});
});
