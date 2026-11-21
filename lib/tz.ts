import { siteConfig } from '@/lib/site-config';

/**
 * Wall-clock helpers in the venue's zone (Europe/London). Pure; DST-aware. Built on Intl only
 * (no moment-timezone: its zone data was a ~700 KB chunk on every booking page).
 */

const TZ = siteConfig.timezone;
const formatters = new Map<string, Intl.DateTimeFormat>();

function partsFormatter(tz: string): Intl.DateTimeFormat {
	let f = formatters.get(tz);
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
		formatters.set(tz, f);
	}
	return f;
}

const WEEKDAYS: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };

export interface LocalParts {
	/** `YYYY-MM-DD` */
	date: string;
	/** `HH:mm` (24 h) */
	time: string;
	/** ISO weekday, 1 = Monday. */
	weekday: number;
}

/** A UTC instant as local date, time and ISO weekday. */
export function localParts(utc: number | string | Date, tz: string = TZ): LocalParts {
	const ms = typeof utc === 'number' ? utc : new Date(utc).getTime();
	const p: Record<string, string> = {};
	for (const part of partsFormatter(tz).formatToParts(ms)) p[part.type] = part.value;
	return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}`, weekday: WEEKDAYS[p.weekday ?? ''] ?? 0 };
}

const DAY = 86_400_000;

/** `YYYY-MM-DD` (+ optional `HH:mm`) read as if it were UTC. */
function wallMs(date: string, time = '00:00'): number {
	const [y = 0, m = 1, d = 1] = date.split('-').map(Number);
	const [h = 0, mi = 0] = time.split(':').map(Number);
	return Date.UTC(y, m - 1, d, h, mi);
}

/** The zone's offset from UTC (ms) at a UTC instant. */
function offsetAt(utc: number, tz: string): number {
	const p = localParts(utc, tz);
	return wallMs(p.date, p.time) - Math.floor(utc / 60_000) * 60_000;
}

/**
 * Local date + `HH:mm` → UTC epoch ms. A wall time that happens twice (the autumn hour) resolves
 * to the first; one that never happens (the spring gap) rolls forward by the gap.
 */
export function localToUtc(date: string, time: string, tz: string = TZ): number {
	const wall = wallMs(date, time);
	const before = wall - offsetAt(wall - DAY, tz);
	const after = wall - offsetAt(wall + DAY, tz);
	const fits = [before, after].filter((c) => {
		const p = localParts(c, tz);
		return p.date === date && p.time === time;
	});
	return fits.length ? Math.min(...fits) : before;
}

/** UTC epoch ms of local midnight on `date`. */
export function localMidnight(date: string, tz: string = TZ): number {
	return localToUtc(date, '00:00', tz);
}

/** The calendar date `n` days after `date`. */
export function addDays(date: string, n: number): string {
	return new Date(wallMs(date) + n * DAY).toISOString().slice(0, 10);
}

/** `days` consecutive local dates from `fromDate`. */
export function localDates(fromDate: string, days: number): string[] {
	return Array.from({ length: Math.max(0, days) }, (_, i) => addDays(fromDate, i));
}

/** Today's local date. */
export function today(now: number = Date.now(), tz: string = TZ): string {
	return localParts(now, tz).date;
}
