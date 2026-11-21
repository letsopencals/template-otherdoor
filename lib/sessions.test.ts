import { describe, expect, it } from 'vitest';
import { byDate, roomSessions, toRanges, workshopSessions, onGrid } from '@/lib/sessions';

const slot = (fromDate: string, fromTime: string, toDate: string, toTime: string, attendees = 0, maxAttendees = 1) => ({ productId: 'p', fromDate, fromTime, toDate, toTime, attendees, maxAttendees });
const times = (s: { time: string }[]) => s.map((x) => x.time);
const LONG_AGO = Date.parse('2020-01-01T00:00:00Z');

describe('toRanges', () => {
	it('rounds bounds up to the minute', () => {
		const [r] = toRanges([slot('2026-11-23', '12:09:05', '2026-11-23', '21:59:59')]);
		expect(new Date(r!.start).toISOString()).toBe('2026-11-23T12:10:00.000Z');
		expect(new Date(r!.end).toISOString()).toBe('2026-11-23T22:00:00.000Z');
	});
});

describe('roomSessions (winter, GMT)', () => {
	it('offers 90-min starts on the midnight grid inside the window', () => {
		// Mon 23 Nov 2026, open 12:00–22:00 local (= UTC in winter).
		const s = roomSessions(toRanges([slot('2026-11-23', '12:00:00', '2026-11-23', '22:00:00')]), { durationMin: 90, now: LONG_AGO });
		expect(times(s)).toEqual(['12:00', '13:30', '15:00', '16:30', '18:00', '19:30']);
	});

	it('skips starts that would run past the window', () => {
		const s = roomSessions(toRanges([slot('2026-11-23', '12:00:00', '2026-11-23', '14:59:00')]), { durationMin: 90, now: LONG_AGO });
		expect(times(s)).toEqual(['12:00']);
	});

	it('weekend opening 10:30 and the 120-min Epic at 10:00', () => {
		const sat = toRanges([slot('2026-11-28', '10:00:00', '2026-11-28', '23:30:00')]);
		expect(times(roomSessions(sat, { durationMin: 90, now: LONG_AGO }))).toEqual(['10:30', '12:00', '13:30', '15:00', '16:30', '18:00', '19:30', '21:00']);
		expect(times(roomSessions(sat, { durationMin: 120, now: LONG_AGO }))).toEqual(['10:00', '12:00', '14:00', '16:00', '18:00', '20:00']);
	});

	it('a window opened by a booking mid-grid snaps forward to the next grid point', () => {
		// Booked 12:00–13:30 leaves 13:30 free; a window opening at 13:40 (odd) waits for 15:00.
		const s = roomSessions(toRanges([slot('2026-11-23', '13:40:00', '2026-11-23', '18:00:00')]), { durationMin: 90, now: LONG_AGO });
		expect(times(s)).toEqual(['15:00', '16:30']);
	});

	it('drops past sessions and full windows', () => {
		const now = Date.parse('2026-11-23T14:00:00Z');
		const s = roomSessions(toRanges([slot('2026-11-23', '12:00:00', '2026-11-23', '18:00:00'), slot('2026-11-24', '12:00:00', '2026-11-24', '18:00:00', 1, 1)]), { durationMin: 90, now });
		expect(times(s)).toEqual(['15:00', '16:30']);
	});

	it('dedupes overlapping windows and groups by date', () => {
		const s = roomSessions(toRanges([slot('2026-11-23', '12:00:00', '2026-11-23', '15:00:00'), slot('2026-11-23', '12:00:00', '2026-11-23', '15:00:00'), slot('2026-11-24', '12:00:00', '2026-11-24', '13:30:00')]), { durationMin: 90, now: LONG_AGO });
		expect(Object.keys(byDate(s))).toEqual(['2026-11-23', '2026-11-24']);
		expect(byDate(s)['2026-11-23']).toHaveLength(2);
	});
});

describe('roomSessions across DST', () => {
	it('summer (BST): local 12:00 is 11:00 UTC', () => {
		const s = roomSessions(toRanges([slot('2026-07-06', '11:00:00', '2026-07-06', '21:00:00')]), { durationMin: 90, now: LONG_AGO });
		expect(times(s)[0]).toBe('12:00');
		expect(new Date(s[0]!.start).toISOString()).toBe('2026-07-06T11:00:00.000Z');
	});

	it('spring-forward Sunday (29 Mar 2026) keeps the wall-clock grid', () => {
		// Open 10:30–23:30 BST = 09:30–22:30 UTC.
		const s = roomSessions(toRanges([slot('2026-03-29', '09:30:00', '2026-03-29', '22:30:00')]), { durationMin: 90, now: LONG_AGO });
		expect(times(s)).toEqual(['10:30', '12:00', '13:30', '15:00', '16:30', '18:00', '19:30', '21:00']);
	});

	it('fall-back Sunday (25 Oct 2026) keeps the wall-clock grid', () => {
		// Open 10:00–23:30 GMT (clocks went back at 02:00 BST).
		const s = roomSessions(toRanges([slot('2026-10-25', '10:00:00', '2026-10-25', '23:30:00')]), { durationMin: 120, now: LONG_AGO });
		expect(times(s)).toEqual(['10:00', '12:00', '14:00', '16:00', '18:00', '20:00']);
	});
});

describe('workshopSessions', () => {
	it('starts at the scheduled time, off the room grid, with seats left', () => {
		// Ciphers & Secret Inks, Wed 18:30, 75 min, 10 seats, 3 taken.
		const s = workshopSessions(toRanges([slot('2026-11-25', '18:30:00', '2026-11-25', '19:45:00', 3, 10)]), { durationMin: 75, now: LONG_AGO });
		expect(s).toHaveLength(1);
		expect(s[0]).toMatchObject({ time: '18:30', left: 7, capacity: 10 });
	});

	it('hides sessions without enough seats for the party', () => {
		const s = workshopSessions(toRanges([slot('2026-11-26', '19:00:00', '2026-11-26', '20:00:00', 7, 8)]), { durationMin: 60, now: LONG_AGO, seats: 2 });
		expect(s).toEqual([]);
	});
});

describe('onGrid (reschedule)', () => {
	it('keeps only per-date slots that sit on the grid', () => {
		const s = onGrid([slot('2026-11-23', '12:00:00', '2026-11-23', '13:30:00'), slot('2026-11-23', '12:30:00', '2026-11-23', '14:00:00'), slot('2026-11-23', '13:30:00', '2026-11-23', '15:00:00')], 90, LONG_AGO);
		expect(times(s)).toEqual(['12:00', '13:30']);
	});
});
