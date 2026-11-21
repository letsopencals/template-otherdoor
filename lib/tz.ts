import moment from 'moment-timezone';
import { siteConfig } from '@/lib/site-config';

/** Wall-clock helpers in the venue's zone (Europe/London). Pure; DST-aware. */

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

/** Local date + `HH:mm` → UTC epoch ms. */
export function localToUtc(date: string, time: string, tz: string = TZ): number {
	return moment.tz(`${date} ${time}`, 'YYYY-MM-DD HH:mm', tz).valueOf();
}

/** UTC epoch ms of local midnight on `date`. */
export function localMidnight(date: string, tz: string = TZ): number {
	return moment.tz(date, 'YYYY-MM-DD', tz).startOf('day').valueOf();
}

/** `days` consecutive local dates from `fromDate`. */
export function localDates(fromDate: string, days: number): string[] {
	const out: string[] = [];
	const d = moment.utc(fromDate, 'YYYY-MM-DD');
	for (let i = 0; i < days; i++) out.push(d.clone().add(i, 'day').format('YYYY-MM-DD'));
	return out;
}

/** The local date `n` days after `date`. */
export function addDays(date: string, n: number): string {
	return moment.utc(date, 'YYYY-MM-DD').add(n, 'day').format('YYYY-MM-DD');
}

/** Today's local date. */
export function today(now: number = Date.now(), tz: string = TZ): string {
	return localParts(now, tz).date;
}
