import { describe, expect, it } from 'vitest';
import { goldenHour, goldenOverlap, sunTimes } from '@/lib/sun';

// Miami Beach (South Beach)
const LAT = 25.7826;
const LNG = -80.1341;

/** Minutes after local midnight in Miami for a UTC epoch. */
function miamiMinutes(ms: number): number {
	const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(ms));
	const h = Number(parts.find((p) => p.type === 'hour')!.value);
	const m = Number(parts.find((p) => p.type === 'minute')!.value);
	return h * 60 + m;
}

const at = (h: number, m: number) => h * 60 + m;

describe('sunTimes (Miami Beach, solstice times ±3 min)', () => {
	it.each([
		// date, sunrise, sunset (local clock time)
		['2026-06-21', at(6, 30), at(20, 15)],
		['2026-12-21', at(7, 3), at(17, 34)],
	])('%s', (date, rise, set) => {
		const s = sunTimes(date, LAT, LNG)!;
		expect(Math.abs(miamiMinutes(s.sunrise) - rise)).toBeLessThanOrEqual(3);
		expect(Math.abs(miamiMinutes(s.sunset) - set)).toBeLessThanOrEqual(3);
	});

	it.each(['2026-03-20', '2026-09-22'])('equinox %s: about 12 h 07 min of daylight', (date) => {
		const s = sunTimes(date, LAT, LNG)!;
		expect(Math.abs((s.sunset - s.sunrise) / 60_000 - 727)).toBeLessThanOrEqual(3);
	});

	it('returns null in polar night', () => {
		expect(sunTimes('2026-12-21', 80, 15)).toBeNull();
	});
});

describe('goldenHour / goldenOverlap', () => {
	const gh = goldenHour('2026-06-21', LAT, LNG)!;

	it('evening window ends at sunset and lasts an hour', () => {
		expect(gh.evening.to - gh.evening.from).toBe(3_600_000);
		expect(gh.evening.to).toBe(sunTimes('2026-06-21', LAT, LNG)!.sunset);
	});

	it('flags a class that overlaps the evening window', () => {
		const start = gh.evening.from - 30 * 60_000;
		expect(goldenOverlap(start, start + 60 * 60_000, gh)).toBe('evening');
	});

	it('flags the morning window and ignores midday', () => {
		expect(goldenOverlap(gh.morning.from + 10 * 60_000, gh.morning.from + 55 * 60_000, gh)).toBe('morning');
		const noon = gh.morning.to + 4 * 3_600_000;
		expect(goldenOverlap(noon, noon + 45 * 60_000, gh)).toBeNull();
	});
});
