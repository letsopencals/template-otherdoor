import moment from 'moment-timezone';
import type { CurrentAvailabilitySlot } from '@opencals/storefront-sdk';
import type { Series, OfferingKind } from '@/lib/catalog';
import { classMeta, setMeta, siteConfig, type SetKey, type Tone } from '@/lib/site-config';
import { goldenHour, goldenOverlap } from '@/lib/sun';

/**
 * The timetable: dated class occurrences built from each series' merged
 * availability ranges. Pure functions, so they're unit-tested
 * (`lib/timetable.test.ts`) and shared by RSCs and client components.
 *
 * **Full inference.** The availability API drops a slot once it's full, so a
 * full class simply vanishes. Classes repeat weekly, so for every series we
 * collect its weekly pattern (Miami weekday + local start time) across the
 * horizon. A pattern slot that is missing in one week but seen in another is
 * returned as `status: 'full'` (`inferred: true`), as long as it's in the
 * future, past the product's advance-booking threshold, and no later than the
 * last start the API returned for any series (so the end of the booking window
 * never reads as Full). Workshops and privates are never inferred: a full
 * event just disappears.
 *
 * Keys are always local Miami time, never UTC: across a DST change a 06:00
 * class is 20:00Z one week and 19:00Z the next, and must stay one pattern.
 */

export type OccurrenceStatus = 'open' | 'low' | 'full';
export type TimeOfDay = 'morning' | 'midday' | 'evening';

export interface Occurrence {
	/** `${seriesId}@${start}`: stable React key. */
	key: string;
	seriesId: string;
	seriesSlug: string;
	/** Class key (`barbell-club`) or event key. */
	classKey: string;
	productId: string;
	kind: OfferingKind;
	category: string;
	title: string;
	/** Short display name for the Floor. */
	short: string;
	variantTitle: string;
	siteId: string | null;
	siteKey: string | null;
	coachId: string | null;
	/** UTC ISO strings. */
	start: string;
	end: string;
	/** Local (Miami) date `YYYY-MM-DD`, time `HH:mm`, ISO weekday 1 = Mon … 7 = Sun. */
	localDate: string;
	localTime: string;
	weekday: number;
	/** Minutes. */
	minutes: number;
	capacity: number;
	attendees: number;
	seatsLeft: number;
	status: OccurrenceStatus;
	/** True when the slot was missing from the API and inferred Full. */
	inferred: boolean;
	offPeak: boolean;
	price: number;
	tone: Tone;
	intensity: number;
	level: string;
	/** The set (room) from site copy, or null. */
	set: SetKey | null;
	/** Golden hour the class overlaps (outdoor sets only), from the real Miami sunrise and sunset. */
	golden: 'morning' | 'evening' | null;
}

export interface LocalParts {
	date: string;
	time: string;
	weekday: number;
}

const TZ = siteConfig.timezone;
const DAY_MS = 86_400_000;

/* ------------------------------------------------------------------ Time */

const partsFormatters = new Map<string, Intl.DateTimeFormat>();

function partsFormatter(tz: string): Intl.DateTimeFormat {
	let f = partsFormatters.get(tz);
	if (!f) {
		f = new Intl.DateTimeFormat('en-GB', {
			timeZone: tz,
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			weekday: 'short',
			hourCycle: 'h23',
		});
		partsFormatters.set(tz, f);
	}
	return f;
}

const WEEKDAYS: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };

/** A UTC instant as local date, time and ISO weekday in `tz` (default: the gym's zone). */
export function localParts(utc: number | string | Date, tz: string = TZ): LocalParts {
	const ms = typeof utc === 'number' ? utc : new Date(utc).getTime();
	const p: Record<string, string> = {};
	for (const part of partsFormatter(tz).formatToParts(ms)) p[part.type] = part.value;
	return {
		date: `${p.year}-${p.month}-${p.day}`,
		time: `${p.hour}:${p.minute}`,
		weekday: WEEKDAYS[p.weekday ?? ''] ?? 0,
	};
}

/** Local date + time in `tz` → UTC epoch ms (DST-aware). */
export function localToUtc(date: string, time: string, tz: string = TZ): number {
	return moment.tz(`${date} ${time}`, 'YYYY-MM-DD HH:mm', tz).valueOf();
}

/** Local dates from `fromDate` for `days` days (`YYYY-MM-DD`). */
export function localDates(fromDate: string, days: number): string[] {
	const out: string[] = [];
	const d = moment.utc(fromDate, 'YYYY-MM-DD');
	for (let i = 0; i < days; i++) out.push(d.clone().add(i, 'day').format('YYYY-MM-DD'));
	return out;
}

/** ISO weekday (1 = Mon) of a `YYYY-MM-DD` date. */
export function weekdayOf(date: string): number {
	return moment.utc(date, 'YYYY-MM-DD').isoWeekday();
}

/** Monday of the week containing `date` (`YYYY-MM-DD`). */
export function weekStart(date: string): string {
	return moment.utc(date, 'YYYY-MM-DD').isoWeekday(1).format('YYYY-MM-DD');
}

function minutesOf(time: string): number {
	const [h, m] = time.split(':').map(Number);
	return (h ?? 0) * 60 + (m ?? 0);
}

/** Class starts inside the Midday-shift window (local, inclusive): the automatic discount. */
export function isOffPeak(parts: Pick<LocalParts, 'time' | 'weekday'>): boolean {
	const { weekdays, from, to } = siteConfig.offPeak;
	const t = minutesOf(parts.time);
	return weekdays.includes(parts.weekday) && t >= minutesOf(from) && t <= minutesOf(to);
}

/** Before 11:00 morning, 11:00–15:59 midday, from 16:00 evening. */
export function timeOfDay(localTime: string): TimeOfDay {
	const t = minutesOf(localTime);
	if (t < 11 * 60) return 'morning';
	if (t < 16 * 60) return 'midday';
	return 'evening';
}

/* ------------------------------------------------------------------ Build */

export function seatStatus(seatsLeft: number): OccurrenceStatus {
	if (seatsLeft <= 0) return 'full';
	if (seatsLeft <= siteConfig.lowSeatsThreshold) return 'low';
	return 'open';
}

const goldenCache = new Map<string, ReturnType<typeof goldenHour>>();

/** The golden hour a session overlaps on an outdoor set, else null. */
export function goldenFor(set: SetKey | null, localDate: string, start: number, end: number): 'morning' | 'evening' | null {
	if (!setMeta(set)?.outdoor) return null;
	let gh = goldenCache.get(localDate);
	if (gh === undefined) {
		gh = goldenHour(localDate, siteConfig.geo.latitude, siteConfig.geo.longitude, siteConfig.goldenHourMinutes);
		goldenCache.set(localDate, gh);
	}
	return goldenOverlap(start, end, gh);
}

function makeOccurrence(series: Series, startMs: number, attendees: number, capacity: number, inferred: boolean): Occurrence {
	const parts = localParts(startMs);
	const seatsLeft = inferred ? 0 : Math.max(0, capacity - attendees);
	const meta = classMeta(series.offeringKey);
	const start = new Date(startMs).toISOString();
	return {
		key: `${series.id}@${start}`,
		seriesId: series.id,
		seriesSlug: series.slug,
		classKey: series.offeringKey,
		productId: series.productId,
		kind: series.kind,
		category: series.category,
		title: series.title,
		short: meta?.short ?? series.title,
		variantTitle: series.variantTitle,
		siteId: series.site?.id ?? null,
		siteKey: series.site?.key ?? null,
		coachId: series.coach?.id ?? null,
		start,
		end: new Date(startMs + series.duration * 1000).toISOString(),
		localDate: parts.date,
		localTime: parts.time,
		weekday: parts.weekday,
		minutes: Math.round(series.duration / 60),
		capacity,
		attendees: inferred ? capacity : attendees,
		seatsLeft,
		status: inferred ? 'full' : seatStatus(seatsLeft),
		inferred,
		offPeak: series.kind === 'class' && isOffPeak(parts),
		price: series.price,
		tone: series.tone,
		intensity: meta?.intensity ?? 3,
		level: meta?.level ?? (series.kind === 'event' ? 'Event' : 'All levels'),
		set: series.set,
		golden: goldenFor(series.set, parts.date, startMs, startMs + series.duration * 1000),
	};
}

function slotStart(slot: Pick<CurrentAvailabilitySlot, 'fromDate' | 'fromTime'>): number {
	return Date.parse(`${slot.fromDate}T${slot.fromTime.length === 5 ? `${slot.fromTime}:00` : slot.fromTime}Z`);
}

function slotEnd(slot: Pick<CurrentAvailabilitySlot, 'toDate' | 'toTime'>): number {
	return Date.parse(`${slot.toDate}T${slot.toTime.length === 5 ? `${slot.toTime}:00` : slot.toTime}Z`);
}

export interface WindowOptions {
	/** Epoch ms. Occurrences starting at or before this are dropped. */
	now: number;
	/** Epoch ms. Occurrences starting after this are dropped. */
	until: number;
}

/**
 * One series' merged ranges → occurrences. Each range is normally exactly one
 * class long. A range that is an exact multiple of the class length (adjacent
 * windows merged) is split; any other length yields one occurrence at its start.
 */
export function slotsToOccurrences(series: Series, slots: CurrentAvailabilitySlot[], { now, until }: WindowOptions): Occurrence[] {
	const step = series.duration * 1000;
	const byStart = new Map<number, Occurrence>();
	for (const slot of slots) {
		const start = slotStart(slot);
		const end = slotEnd(slot);
		if (!Number.isFinite(start) || !Number.isFinite(end)) continue;
		const len = end - start;
		const count = step > 0 && len > step && len % step === 0 ? len / step : 1;
		const capacity = slot.maxAttendees || series.capacity;
		for (let i = 0; i < count; i++) {
			const s = start + i * step;
			if (s <= now || s > until) continue;
			const occ = makeOccurrence(series, s, slot.attendees ?? 0, capacity, false);
			const prev = byStart.get(s);
			if (!prev || prev.seatsLeft < occ.seatsLeft) byStart.set(s, occ);
		}
	}
	return [...byStart.values()].sort((a, b) => a.start.localeCompare(b.start));
}

/** Series kinds whose missing weekly slots are inferred Full. */
export function isWeekly(kind: OfferingKind): boolean {
	return kind === 'class';
}

export interface InferOptions {
	now: number;
	/** Epoch ms: no inferred occurrence after this (the last start the API returned anywhere). */
	cutoff: number;
}

/**
 * The Full occurrences of one weekly series: pattern slots (weekday + local
 * time seen in some week of `observed`) that are missing on a date between
 * today and `cutoff`. Returns only the inferred occurrences.
 */
export function inferFull(series: Series, observed: Occurrence[], { now, cutoff }: InferOptions): Occurrence[] {
	if (!isWeekly(series.kind) || observed.length === 0 || cutoff <= now) return [];
	const patterns = new Map<number, Set<string>>();
	const seen = new Set<string>();
	for (const o of observed) {
		if (!patterns.has(o.weekday)) patterns.set(o.weekday, new Set());
		patterns.get(o.weekday)!.add(o.localTime);
		seen.add(`${o.localDate} ${o.localTime}`);
	}
	const earliest = now + Math.max(0, series.advanceThreshold) * 1000;
	const today = localParts(now).date;
	const lastDay = localParts(cutoff).date;
	const days = Math.round((Date.parse(`${lastDay}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / DAY_MS) + 1;
	const out: Occurrence[] = [];
	for (const date of localDates(today, days)) {
		const times = patterns.get(weekdayOf(date));
		if (!times) continue;
		for (const time of times) {
			if (seen.has(`${date} ${time}`)) continue;
			const start = localToUtc(date, time);
			if (start <= earliest || start > cutoff) continue;
			out.push(makeOccurrence(series, start, series.capacity, series.capacity, true));
		}
	}
	return out;
}

export interface TimetableOptions {
	now: number;
	/** How many days ahead to show (default: the booking window). */
	horizonDays?: number;
}

/**
 * Every occurrence (open, low and Full) of the given series, sorted by start.
 * `slotsBySeries` maps a series id to its merged availability ranges.
 */
export function buildTimetable(
	series: Series[],
	slotsBySeries: Record<string, CurrentAvailabilitySlot[]>,
	{ now, horizonDays = siteConfig.policies.bookingWindowDays }: TimetableOptions,
): Occurrence[] {
	const until = now + horizonDays * DAY_MS;
	const observedBySeries = series.map((s) => ({
		series: s,
		observed: slotsToOccurrences(s, slotsBySeries[s.id] ?? [], { now, until }),
	}));
	const lastSeen = Math.max(
		0,
		...observedBySeries.flatMap(({ observed }) => observed.map((o) => Date.parse(o.start))),
	);
	const cutoff = Math.min(until, lastSeen);
	const all = observedBySeries.flatMap(({ series: s, observed }) => [...observed, ...inferFull(s, observed, { now, cutoff })]);
	return all.sort((a, b) => a.start.localeCompare(b.start) || a.title.localeCompare(b.title));
}

/* ------------------------------------------------------------------ Queries */

/** The next occurrence of the same class (any site) with a free place, or null. */
export function nextWithSpace(occurrence: Pick<Occurrence, 'classKey' | 'start' | 'key'>, all: Occurrence[]): Occurrence | null {
	let best: Occurrence | null = null;
	for (const o of all) {
		if (o.classKey !== occurrence.classKey || o.key === occurrence.key) continue;
		if (o.status === 'full' || o.start <= occurrence.start) continue;
		if (!best || o.start < best.start) best = o;
	}
	return best;
}

export interface TimetableFilters {
	/** Site key (`collingwood`) or id. */
	site?: string | null;
	/** Category slug (`fight`). */
	category?: string | null;
	/** Class key (`bag-rounds`). */
	class?: string | null;
	/** Coach id or slug. */
	coach?: string | null;
	/** Maximum intensity (1–5). */
	maxIntensity?: number | null;
	time?: TimeOfDay | null;
}

/** Apply the timetable filters (all optional; empty values match everything). */
export function filterOccurrences(
	occurrences: Occurrence[],
	filters: TimetableFilters,
	resolveCoach?: (idOrSlug: string) => string | null,
): Occurrence[] {
	const coachId = filters.coach ? (resolveCoach?.(filters.coach) ?? filters.coach) : null;
	return occurrences.filter(
		(o) =>
			(!filters.site || o.siteKey === filters.site || o.siteId === filters.site) &&
			(!filters.category || o.category === filters.category) &&
			(!filters.class || o.classKey === filters.class) &&
			(!coachId || o.coachId === coachId) &&
			(!filters.maxIntensity || o.intensity <= filters.maxIntensity) &&
			(!filters.time || timeOfDay(o.localTime) === filters.time),
	);
}

/** Group occurrences by local date, in date order, including empty days in `dates`. */
export function groupByDay(occurrences: Occurrence[], dates?: string[]): Array<{ date: string; occurrences: Occurrence[] }> {
	const map = new Map<string, Occurrence[]>();
	for (const d of dates ?? []) map.set(d, []);
	for (const o of occurrences) {
		if (dates && !map.has(o.localDate)) continue;
		if (!map.has(o.localDate)) map.set(o.localDate, []);
		map.get(o.localDate)!.push(o);
	}
	return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, occs]) => ({ date, occurrences: occs }));
}

/** Upcoming occurrences of one series, class, category, site or coach. */
export function upcomingFor(
	occurrences: Occurrence[],
	by: { seriesId?: string; classKey?: string; category?: string; siteId?: string; coachId?: string; open?: boolean },
	limit = Infinity,
): Occurrence[] {
	return occurrences
		.filter(
			(o) =>
				(!by.seriesId || o.seriesId === by.seriesId) &&
				(!by.classKey || o.classKey === by.classKey) &&
				(!by.category || o.category === by.category) &&
				(!by.siteId || o.siteId === by.siteId) &&
				(!by.coachId || o.coachId === by.coachId) &&
				(!by.open || o.status !== 'full'),
		)
		.slice(0, limit);
}
