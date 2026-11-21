import { describe, expect, it } from 'vitest';
import {
	buildTimetable,
	filterOccurrences,
	goldenFor,
	groupByDay,
	inferFull,
	isOffPeak,
	localDates,
	localParts,
	localToUtc,
	nextWithSpace,
	seatStatus,
	slotsToOccurrences,
	timeOfDay,
	weekStart,
} from '@/lib/timetable';
import { series, slot } from '@/lib/test-fixtures';

const DAY = 86_400_000;
/** Miami local date + time → UTC ISO. */
const at = (date: string, time: string) => new Date(localToUtc(date, time)).toISOString();

describe('Miami time helpers', () => {
	it('reads local parts in summer (EDT, UTC−4) and winter (EST, UTC−5)', () => {
		expect(localParts('2026-07-06T10:00:00Z')).toEqual({ date: '2026-07-06', time: '06:00', weekday: 1 });
		expect(localParts('2026-11-02T11:00:00Z')).toEqual({ date: '2026-11-02', time: '06:00', weekday: 1 });
		// a 9 PM Ride After Dark is the next day in UTC
		expect(localParts('2026-10-31T01:00:00Z')).toEqual({ date: '2026-10-30', time: '21:00', weekday: 5 });
	});

	it('converts local time to UTC across both DST switches', () => {
		// fall back, Sun 1 Nov 2026
		expect(at('2026-10-31', '18:00')).toBe('2026-10-31T22:00:00.000Z');
		expect(at('2026-11-01', '18:00')).toBe('2026-11-01T23:00:00.000Z');
		// spring forward, Sun 14 Mar 2027
		expect(at('2027-03-13', '09:00')).toBe('2027-03-13T14:00:00.000Z');
		expect(at('2027-03-14', '09:00')).toBe('2027-03-14T13:00:00.000Z');
	});

	it('lists dates and weeks', () => {
		expect(localDates('2026-10-30', 4)).toEqual(['2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02']);
		expect(weekStart('2026-11-01')).toBe('2026-10-26');
		expect(weekStart('2026-11-02')).toBe('2026-11-02');
	});

	it('flags Early-light starts Mon–Fri 6:00–8:00 inclusive', () => {
		expect(isOffPeak({ weekday: 1, time: '06:30' })).toBe(true);
		expect(isOffPeak({ weekday: 5, time: '08:00' })).toBe(true);
		expect(isOffPeak({ weekday: 5, time: '08:01' })).toBe(false);
		expect(isOffPeak({ weekday: 3, time: '05:59' })).toBe(false);
		expect(isOffPeak({ weekday: 6, time: '07:00' })).toBe(false);
	});

	it('buckets time of day', () => {
		expect(timeOfDay('06:00')).toBe('morning');
		expect(timeOfDay('12:15')).toBe('midday');
		expect(timeOfDay('18:00')).toBe('evening');
	});
});

describe('slotsToOccurrences', () => {
	const lab = series({ id: 'glute-lab-south-beach-valentina', offeringKey: 'glute-lab' });
	const now = Date.parse(at('2026-11-01', '12:00'));
	const until = now + 30 * DAY;

	it('computes spots left and status from attendees', () => {
		const occ = slotsToOccurrences(lab, [slot(at('2026-11-02', '06:30'), 50, 4, 14), slot(at('2026-11-03', '18:45'), 50, 12, 14)], { now, until });
		expect(occ.map((o) => [o.localTime, o.seatsLeft, o.status])).toEqual([
			['06:30', 10, 'open'],
			['18:45', 2, 'low'],
		]);
		expect(occ[0]!.minutes).toBe(60);
		expect(occ[0]!.category).toBe('sculpt');
		expect(occ[0]!.tone).toBe('sculpt');
		expect(occ[0]!.set).toBe('mirror-hall');
	});

	it('drops past and out-of-horizon slots', () => {
		const occ = slotsToOccurrences(lab, [slot(at('2026-11-01', '06:00'), 60), slot(at('2026-12-20', '06:00'), 60), slot(at('2026-11-04', '06:00'), 60)], { now, until });
		expect(occ).toHaveLength(1);
	});

	it('splits a range that merged two back-to-back classes', () => {
		const occ = slotsToOccurrences(lab, [slot(at('2026-11-02', '06:00'), 120, 3)], { now, until });
		expect(occ.map((o) => o.localTime)).toEqual(['06:00', '07:00']);
	});

	it('flags Early-light classes', () => {
		const [o] = slotsToOccurrences(lab, [slot(at('2026-11-03', '06:30'), 60)], { now, until });
		expect(o!.offPeak).toBe(true);
	});

	it('maps spot status', () => {
		expect(seatStatus(0)).toBe('full');
		expect(seatStatus(3)).toBe('low');
		expect(seatStatus(4)).toBe('open');
	});
});

describe('golden hour', () => {
	it('badges an outdoor class that runs into sunset, not an indoor one', () => {
		// Miami sunset on 2 Nov 2026 is about 5:43 PM EST
		const start = Date.parse(at('2026-11-02', '17:00'));
		expect(goldenFor('rooftop', '2026-11-02', start, start + 60 * 60_000)).toBe('evening');
		expect(goldenFor('mirror-hall', '2026-11-02', start, start + 60 * 60_000)).toBeNull();
	});

	it('badges a sunrise run', () => {
		const start = Date.parse(at('2026-11-04', '06:45'));
		expect(goldenFor('beach', '2026-11-04', start, start + 45 * 60_000)).toBe('morning');
	});

	it('leaves midday alone', () => {
		const start = Date.parse(at('2026-11-04', '12:00'));
		expect(goldenFor('rooftop', '2026-11-04', start, start + 60 * 60_000)).toBeNull();
	});
});

describe('Full inference', () => {
	const now = Date.parse(at('2026-11-01', '12:00')); // Sunday
	const lab = series({ id: 'glute-lab-south-beach-valentina', offeringKey: 'glute-lab' });

	it('infers a missing weekly slot as Full', () => {
		const slots = { [lab.id]: [slot(at('2026-11-03', '18:45'), 60), slot(at('2026-11-17', '18:45'), 60)] };
		const tt = buildTimetable([lab], slots, { now, horizonDays: 21 });
		expect(tt.map((o) => [o.localDate, o.localTime, o.status, o.inferred])).toEqual([
			['2026-11-03', '18:45', 'open', false],
			['2026-11-10', '18:45', 'full', true],
			['2026-11-17', '18:45', 'open', false],
		]);
		expect(tt[1]!.seatsLeft).toBe(0);
		expect(tt[1]!.attendees).toBe(tt[1]!.capacity);
	});

	it('keeps one pattern across the March spring-forward (no phantom twins)', () => {
		const early = Date.parse(at('2027-03-01', '12:00'));
		const slots = { [lab.id]: [slot(at('2027-03-08', '06:30'), 60), slot(at('2027-03-22', '06:30'), 60), slot(at('2027-03-29', '06:30'), 60)] };
		const tt = buildTimetable([lab], slots, { now: early, horizonDays: 30 });
		expect(tt).toHaveLength(4);
		expect(tt.every((o) => o.localTime === '06:30' && o.weekday === 1)).toBe(true);
		expect(tt.filter((o) => o.inferred).map((o) => o.localDate)).toEqual(['2027-03-15']);
	});

	it('never infers past the last start the API returned', () => {
		const other = series({ id: 'abs-club-south-beach-luca', offeringKey: 'abs-club' });
		const slots = {
			[lab.id]: [slot(at('2026-11-02', '06:30'), 60), slot(at('2026-11-09', '06:30'), 60)],
			[other.id]: [slot(at('2026-11-11', '12:15'), 30)],
		};
		const tt = buildTimetable([lab, other], slots, { now, horizonDays: 21 });
		expect(tt.some((o) => o.inferred && o.seriesId === lab.id)).toBe(false);
	});

	it('does not infer slots inside the advance-booking threshold', () => {
		const near = Date.parse(at('2026-11-02', '05:30'));
		const s = series({ id: 'glute-x', offeringKey: 'glute-lab', advanceThreshold: 3600 });
		const observed = slotsToOccurrences(s, [slot(at('2026-11-09', '06:00'), 60), slot(at('2026-11-16', '06:00'), 60)], { now: near, until: near + 21 * DAY });
		expect(inferFull(s, observed, { now: near, cutoff: Date.parse(at('2026-11-16', '06:00')) })).toEqual([]);
	});

	it('never infers events or services', () => {
		const event = series({ id: 'event-sunset-sessions', offeringKey: 'event-sunset-sessions', kind: 'event' });
		const svc = series({ id: 'cold-plunge', offeringKey: 'cold-plunge', kind: 'service', capacity: 2 });
		const slots = {
			[event.id]: [slot(at('2026-11-07', '18:30'), 120)],
			[svc.id]: [slot(at('2026-11-02', '07:00'), 20), slot(at('2026-11-16', '07:00'), 20)],
		};
		expect(buildTimetable([event, svc], slots, { now, horizonDays: 21 }).some((o) => o.inferred)).toBe(false);
	});
});

describe('queries', () => {
	const now = Date.parse(at('2026-11-01', '12:00'));
	const labSB = series({ id: 'glute-lab-south-beach-valentina', offeringKey: 'glute-lab' });
	const wyn = { id: 'loc-wynwood', slug: 'afterglow-wynwood', key: 'wynwood', name: 'Afterglow Wynwood', nickname: 'Wynwood', online: false };
	const kiara = { id: 'staff-kiara-johnson', slug: 'kiara-johnson', name: 'Kiara Johnson', firstName: 'Kiara', image: null };
	const labW = series({ id: 'glute-lab-wynwood-kiara', offeringKey: 'glute-lab', site: wyn, sites: [wyn], coach: kiara, coaches: [kiara] });
	const box = series({ id: 'shadowbox-glow-wynwood-dante', offeringKey: 'shadowbox-glow', category: 'box', tone: 'box', capacity: 16, duration: 45 * 60, site: wyn, sites: [wyn], set: 'ring' });
	const tt = buildTimetable(
		[labSB, labW, box],
		{
			[labSB.id]: [slot(at('2026-11-02', '18:00'), 60), slot(at('2026-11-16', '18:00'), 60)],
			[labW.id]: [slot(at('2026-11-10', '07:00'), 60, 10, 10), slot(at('2026-11-11', '07:00'), 60, 9, 10)],
			[box.id]: [slot(at('2026-11-04', '19:45'), 45, 1, 16)],
		},
		{ now, horizonDays: 21 },
	);

	it('finds the next of the same class with a free spot, any site', () => {
		const full = tt.find((o) => o.inferred && o.seriesId === labSB.id)!;
		expect(full.localDate).toBe('2026-11-09');
		const next = nextWithSpace(full, tt)!;
		expect(next.seriesId).toBe(labW.id);
		expect(next.localDate).toBe('2026-11-11');
		expect(next.seatsLeft).toBe(1);
	});

	it('filters by site, category, coach, intensity and time of day', () => {
		expect(filterOccurrences(tt, { site: 'wynwood' }).every((o) => o.siteKey === 'wynwood')).toBe(true);
		expect(filterOccurrences(tt, { category: 'box' }).every((o) => o.classKey === 'shadowbox-glow')).toBe(true);
		expect(filterOccurrences(tt, { coach: 'kiara-johnson' }, (s) => (s === 'kiara-johnson' ? 'staff-kiara-johnson' : null)).every((o) => o.coachId === 'staff-kiara-johnson')).toBe(true);
		expect(filterOccurrences(tt, { maxIntensity: 3 })).toHaveLength(0);
		expect(filterOccurrences(tt, { time: 'evening' }).every((o) => o.localTime >= '16:00')).toBe(true);
		expect(filterOccurrences(tt, {})).toHaveLength(tt.length);
	});

	it('groups by local day, keeping empty days', () => {
		expect(groupByDay([], ['2026-11-02'])).toEqual([{ date: '2026-11-02', occurrences: [] }]);
		const days = groupByDay(tt, localDates('2026-11-02', 3));
		expect(days.map((d) => [d.date, d.occurrences.length])).toEqual([
			['2026-11-02', 1],
			// Wynwood Glute Lab's Tue/Wed 7 AM pattern is missing this week, so both read Full
			['2026-11-03', 1],
			['2026-11-04', 2],
		]);
	});
});
