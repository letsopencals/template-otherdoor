import { siteConfig } from '@/lib/site-config';

/**
 * Date and time labels, always in the gym's zone (Miami), so the server render
 * and the browser agree. 12 h clock, US order.
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

/** "6:15 PM" */
export function timeLabel(v: string | number | Date): string {
	return fmt('time', { hour: 'numeric', minute: '2-digit', hour12: true }).format(toDate(v));
}

/** "6:15" + "PM", for big type where the meridiem is set smaller. */
export function timeParts(v: string | number | Date): { clock: string; meridiem: string } {
	const parts = fmt('time', { hour: 'numeric', minute: '2-digit', hour12: true }).formatToParts(toDate(v));
	const clock = parts
		.filter((p) => p.type === 'hour' || p.type === 'minute' || p.type === 'literal')
		.map((p) => p.value)
		.join('')
		.trim();
	return { clock, meridiem: parts.find((p) => p.type === 'dayPeriod')?.value ?? '' };
}

/** "6:15 PM" from a local `HH:mm`. */
export function localTimeLabel(hhmm: string): string {
	const [h = 0, m = 0] = hhmm.split(':').map(Number);
	const meridiem = h >= 12 ? 'PM' : 'AM';
	const hour = h % 12 === 0 ? 12 : h % 12;
	return `${hour}:${String(m).padStart(2, '0')} ${meridiem}`;
}

/** "00:45:00" timecode from minutes. */
export function timecode(min: number): string {
	const h = Math.floor(min / 60);
	const m = min % 60;
	return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
}

/** "Mon, Nov 2" from an instant. */
export function dayLabel(v: string | number | Date): string {
	return fmt('day', { weekday: 'short', day: 'numeric', month: 'short' }).format(toDate(v));
}

/** "Monday, November 2" from an instant. */
export function longDayLabel(v: string | number | Date): string {
	return fmt('long', { weekday: 'long', day: 'numeric', month: 'long' }).format(toDate(v));
}

/** Labels for a local `YYYY-MM-DD` (16:00 UTC is the same calendar day in Miami). */
export function localDateParts(date: string): { weekday: string; day: string; month: string; long: string } {
	const d = new Date(`${date}T16:00:00Z`);
	return {
		weekday: fmt('wd', { weekday: 'short' }).format(d),
		day: fmt('dd', { day: 'numeric' }).format(d),
		month: fmt('mm', { month: 'short' }).format(d),
		long: longDayLabel(d),
	};
}

/** "2h 05m" / "45 min" from minutes. */
export function minutesLabel(min: number): string {
	if (min < 60) return `${min} min`;
	const h = Math.floor(min / 60);
	const m = min % 60;
	return m ? `${h}h ${String(m).padStart(2, '0')}m` : `${h}h`;
}
