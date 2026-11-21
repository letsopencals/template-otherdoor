import { describe, expect, it } from 'vitest';
import { lengthsFor, priceFor, startsByDay, startsFrom } from '@/lib/slots';
import { localToUtc } from '@/lib/timetable';

const at = (d: string, t: string) => localToUtc(d, t);
const range = (d: string, from: string, to: string, extra: Partial<{ attendees: number; maxAttendees: number; staffMemberIds: string[] }> = {}) => ({
	start: at(d, from),
	end: at(d, to),
	attendees: 0,
	maxAttendees: 1,
	staffMemberIds: ['staff-a'],
	...extra,
});

describe('booker starts', () => {
	const now = at('2026-11-02', '05:00');

	it('puts starts on the local half-hour grid inside each free window', () => {
		const starts = startsFrom([range('2026-11-02', '07:10', '09:00')], { durationMin: 60, stepMin: 30, now });
		expect(starts.map((s) => s.localTime)).toEqual(['07:30', '08:00']);
		expect(starts[0]!.staffMemberId).toBe('staff-a');
	});

	it('keeps a window that opens mid-minute on the grid, so coaches share one start', () => {
		const late = { ...range('2026-11-02', '07:09', '09:00'), start: at('2026-11-02', '07:09') + 5_000 };
		const starts = startsFrom([late, range('2026-11-02', '07:30', '09:00', { staffMemberIds: ['staff-b'] })], { durationMin: 60, stepMin: 30, now });
		expect(starts.map((s) => s.localTime)).toEqual(['07:30', '08:00']);
		expect(starts.every((s) => s.start % 60_000 === 0)).toBe(true);
	});

	it('needs the whole length to fit', () => {
		expect(startsFrom([range('2026-11-02', '07:00', '08:00')], { durationMin: 90, stepMin: 30, now })).toEqual([]);
	});

	it('skips starts inside the advance threshold and full capacity windows', () => {
		const starts = startsFrom([range('2026-11-02', '05:00', '07:00'), range('2026-11-02', '08:00', '09:00', { attendees: 6, maxAttendees: 6 })], { durationMin: 60, stepMin: 60, now, advanceSeconds: 3600 });
		expect(starts.map((s) => s.localTime)).toEqual(['06:00']);
	});

	it('dedupes overlapping coach windows and groups by day', () => {
		const starts = startsFrom([range('2026-11-02', '07:00', '08:00'), range('2026-11-02', '07:00', '08:00', { staffMemberIds: ['staff-b'] }), range('2026-11-03', '07:00', '08:00')], { durationMin: 30, stepMin: 30, now });
		expect(Object.entries(startsByDay(starts)).map(([d, s]) => [d, s.length])).toEqual([
			['2026-11-02', 2],
			['2026-11-03', 2],
		]);
	});
});

describe('lengths and prices', () => {
	it('offers whole multiples of the base up to the max', () => {
		expect(lengthsFor(30, 90, [30, 60, 90])).toEqual([30, 60, 90]);
		expect(lengthsFor(40, 80, [40, 60, 80])).toEqual([40, 80]);
		expect(lengthsFor(60, null, undefined)).toEqual([60, 120, 180]);
	});

	it('charges per base unit', () => {
		expect(priceFor(55, 30, 90)).toBe(165);
		expect(priceFor(40, 40, 80)).toBe(80);
	});
});
