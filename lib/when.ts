import { siteConfig } from '@/lib/site-config';

/**
 * Date and time labels, always in Edinburgh time (Europe/London), so the server
 * render and the browser agree. 24 h clock, British order: "19:30", "Sat 28 Nov".
 */

const TZ = siteConfig.timezone;
const L = siteConfig.intlLocale;
const cache = new Map<string, Intl.DateTimeFormat>();

function fmt(key: string, opts: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
	let f = cache.get(key);
	if (!f) {
		f = new Intl.DateTimeFormat(L, { timeZone: TZ, ...opts });
		cache.set(key, f);
	}
	return f;
}

const toDate = (v: string | number | Date) => (v instanceof Date ? v : new Date(v));

/** "19:30" */
export function timeLabel(v: string | number | Date): string {
	return fmt('time', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(toDate(v));
}

/** "Sat 28 Nov" from an instant. */
export function dayLabel(v: string | number | Date): string {
	return fmt('day', { weekday: 'short', day: 'numeric', month: 'short' }).format(toDate(v)).replace(',', '');
}

/** "Saturday 28 November" from an instant. */
export function longDayLabel(v: string | number | Date): string {
	return fmt('long', { weekday: 'long', day: 'numeric', month: 'long' }).format(toDate(v)).replace(',', '');
}

/** "28 November 2026" from an instant. */
export function fullDateLabel(v: string | number | Date): string {
	return fmt('full', { day: 'numeric', month: 'long', year: 'numeric' }).format(toDate(v));
}

/** Labels for a local `YYYY-MM-DD` (noon UTC is the same calendar day in Edinburgh). */
export function localDateParts(date: string): { weekday: string; day: string; month: string; long: string } {
	const d = new Date(`${date}T12:00:00Z`);
	return {
		weekday: fmt('wd', { weekday: 'short' }).format(d),
		day: fmt('dd', { day: 'numeric' }).format(d),
		month: fmt('mm', { month: 'short' }).format(d),
		long: longDayLabel(d),
	};
}

/** "1h 30m" / "45 min" from minutes. */
export function minutesLabel(min: number): string {
	if (min < 60) return `${min} min`;
	const h = Math.floor(min / 60);
	const m = min % 60;
	return m ? `${h}h ${String(m).padStart(2, '0')}m` : `${h}h`;
}

/** Roman numeral for volume numbers (1–39). */
export function roman(n: number): string {
	const map: Array<[number, string]> = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
	let out = '';
	let rest = Math.max(0, Math.floor(n));
	for (const [v, s] of map) while (rest >= v) { out += s; rest -= v; }
	return out;
}
