/**
 * Sunrise, sunset and golden hour for a date and place: the NOAA solar
 * calculator, simplified. Pure and dependency-free, so the schedule can mark
 * classes that run in golden hour on the server and in the browser alike.
 * Accurate to a minute or two between the polar circles, which is all a
 * "golden hour" badge needs.
 */

const RAD = Math.PI / 180;

export interface SunTimes {
	/** Epoch ms (UTC). */
	sunrise: number;
	sunset: number;
}

export interface GoldenHour {
	/** Morning: sunrise to sunrise + `length`. */
	morning: { from: number; to: number };
	/** Evening: sunset − `length` to sunset. */
	evening: { from: number; to: number };
}

/** Julian day for 00:00 UTC on a calendar date (`YYYY-MM-DD`). */
function julianDay(date: string): number {
	const [y = 1970, m = 1, d = 1] = date.split('-').map(Number);
	return Date.UTC(y, m - 1, d) / 86_400_000 + 2440587.5;
}

/** Minutes after 00:00 UTC of the solar event (rise or set) on that date. */
function eventUtcMinutes(jd: number, lat: number, lng: number, rising: boolean): number | null {
	// Iterate twice: the second pass uses the event time itself for the solar position.
	let minutes = rising ? 720 - 4 * lng - 360 : 720 - 4 * lng + 360;
	for (let i = 0; i < 2; i++) {
		const t = (jd + minutes / 1440 - 2451545) / 36525;
		const l0 = (280.46646 + t * (36000.76983 + 0.0003032 * t)) % 360;
		const m = 357.52911 + t * (35999.05029 - 0.0001537 * t);
		const e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
		const c =
			Math.sin(m * RAD) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
			Math.sin(2 * m * RAD) * (0.019993 - 0.000101 * t) +
			Math.sin(3 * m * RAD) * 0.000289;
		const omega = 125.04 - 1934.136 * t;
		const lambda = l0 + c - 0.00569 - 0.00478 * Math.sin(omega * RAD);
		const eps0 = 23 + (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60;
		const eps = eps0 + 0.00256 * Math.cos(omega * RAD);
		const decl = Math.asin(Math.sin(eps * RAD) * Math.sin(lambda * RAD)) / RAD;
		const y = Math.tan((eps / 2) * RAD) ** 2;
		const eqTime =
			4 *
			(y * Math.sin(2 * l0 * RAD) -
				2 * e * Math.sin(m * RAD) +
				4 * e * y * Math.sin(m * RAD) * Math.cos(2 * l0 * RAD) -
				0.5 * y * y * Math.sin(4 * l0 * RAD) -
				1.25 * e * e * Math.sin(2 * m * RAD)) /
			RAD;
		const cosH = Math.cos(90.833 * RAD) / (Math.cos(lat * RAD) * Math.cos(decl * RAD)) - Math.tan(lat * RAD) * Math.tan(decl * RAD);
		if (cosH > 1 || cosH < -1) return null; // polar day or night
		const ha = Math.acos(cosH) / RAD;
		minutes = 720 - 4 * (lng + (rising ? ha : -ha)) - eqTime;
	}
	return minutes;
}

/** Sunrise and sunset (UTC epoch ms) for a local calendar date at a place. Null near the poles. */
export function sunTimes(date: string, lat: number, lng: number): SunTimes | null {
	const jd = julianDay(date);
	const rise = eventUtcMinutes(jd, lat, lng, true);
	const set = eventUtcMinutes(jd, lat, lng, false);
	if (rise === null || set === null) return null;
	const midnight = (jd - 2440587.5) * 86_400_000;
	return { sunrise: Math.round(midnight + rise * 60_000), sunset: Math.round(midnight + set * 60_000) };
}

/** Golden hour windows (UTC epoch ms) for a date: the hour after sunrise and the hour before sunset. */
export function goldenHour(date: string, lat: number, lng: number, lengthMin = 60): GoldenHour | null {
	const s = sunTimes(date, lat, lng);
	if (!s) return null;
	const len = lengthMin * 60_000;
	return { morning: { from: s.sunrise, to: s.sunrise + len }, evening: { from: s.sunset - len, to: s.sunset } };
}

/** Which golden hour (if any) a session from `start` to `end` (epoch ms) overlaps. */
export function goldenOverlap(start: number, end: number, gh: GoldenHour | null): 'morning' | 'evening' | null {
	if (!gh) return null;
	const overlaps = (w: { from: number; to: number }) => start < w.to && end > w.from;
	if (overlaps(gh.evening)) return 'evening';
	if (overlaps(gh.morning)) return 'morning';
	return null;
}
