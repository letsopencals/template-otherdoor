import { describe, expect, it } from 'vitest';
import { addDays, localDates, localMidnight, localParts, localToUtc, today } from './tz';

const iso = (ms: number) => new Date(ms).toISOString();

describe('tz (Europe/London wall clock)', () => {
	it('converts local times to UTC across GMT and BST', () => {
		expect(iso(localToUtc('2026-01-15', '18:00'))).toBe('2026-01-15T18:00:00.000Z');
		expect(iso(localToUtc('2026-07-15', '18:00'))).toBe('2026-07-15T17:00:00.000Z');
		expect(iso(localToUtc('2026-03-29', '00:30'))).toBe('2026-03-29T00:30:00.000Z');
		expect(iso(localToUtc('2026-03-29', '03:00'))).toBe('2026-03-29T02:00:00.000Z');
		expect(iso(localToUtc('2026-10-25', '12:00'))).toBe('2026-10-25T12:00:00.000Z');
	});

	it('handles the DST gap and the repeated hour like moment-timezone did', () => {
		// 01:30 does not exist on 29 March: it rolls forward to 02:30 BST.
		expect(iso(localToUtc('2026-03-29', '01:30'))).toBe('2026-03-29T01:30:00.000Z');
		// 01:30 happens twice on 25 October: the first (BST) one wins.
		expect(iso(localToUtc('2026-10-25', '01:30'))).toBe('2026-10-25T00:30:00.000Z');
	});

	it('finds local midnight', () => {
		expect(iso(localMidnight('2026-07-01'))).toBe('2026-06-30T23:00:00.000Z');
		expect(iso(localMidnight('2026-12-01'))).toBe('2026-12-01T00:00:00.000Z');
		expect(iso(localMidnight('2026-03-29'))).toBe('2026-03-29T00:00:00.000Z');
		expect(iso(localMidnight('2026-10-25'))).toBe('2026-10-24T23:00:00.000Z');
	});

	it('steps dates by calendar day', () => {
		expect(localDates('2026-12-30', 4)).toEqual(['2026-12-30', '2026-12-31', '2027-01-01', '2027-01-02']);
		expect(localDates('2026-03-28', 3)).toEqual(['2026-03-28', '2026-03-29', '2026-03-30']);
		expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
		expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
	});

	it('reads local parts and today', () => {
		expect(localParts(Date.parse('2026-07-15T23:30:00Z'))).toEqual({ date: '2026-07-16', time: '00:30', weekday: 4 });
		expect(today(Date.parse('2026-11-21T23:59:00Z'))).toBe('2026-11-21');
	});
});
