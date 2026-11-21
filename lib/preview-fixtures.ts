import type { BookingView } from '@/lib/booking-view';
import { localDates, localParts, localToUtc } from '@/lib/timetable';
import { classMeta, serviceMeta, setMeta, shotMeta, siteConfig, toneFor, type ShotMeta } from '@/lib/site-config';

/**
 * Fixture bookings for /preview/[screen] (design review and screenshots of
 * post-booking states without a real order). Relative to "now", Miami time.
 */
type Fx = Partial<BookingView> & { title: string; category: string; key: string; shotTitles?: string[]; site?: 'south-beach' | 'wynwood' };

/** Photos for fixture sessions that don't happen on a set (1:1 coaching, the intro tour). */
const FALLBACK_IMAGE: Record<string, string> = {
	'physique-coaching': '/images/classes/pt-senior.jpg',
	'first-glow-tour': '/images/classes/first-glow-tour.jpg',
};

function view(id: string, dayOffset: number, time: string, minutes: number, o: Fx): BookingView {
	const today = localParts(Date.now()).date;
	const date = dayOffset >= 0 ? localDates(today, dayOffset + 1).at(-1)! : shift(today, dayOffset);
	const start = localToUtc(date, time);
	const siteSlug = o.site === 'wynwood' ? 'afterglow-wynwood' : 'afterglow-south-beach';
	const site = siteConfig.sites[siteSlug];
	const set = setMeta(classMeta(o.key)?.set ?? serviceMeta(o.key)?.set);
	const { shotTitles, key, site: _site, ...rest } = o;
	void _site;
	return {
		id,
		start,
		end: start + minutes * 60_000,
		status: dayOffset < 0 ? 'completed' : 'scheduled',
		awaiting: null,
		booked: true,
		siteSlug,
		siteName: site.nickname,
		setName: set?.name ?? null,
		image: set?.image ?? FALLBACK_IMAGE[o.key] ?? null,
		whatToBring: classMeta(key)?.whatToBring ?? serviceMeta(key)?.whatToBring ?? [],
		wardrobe: classMeta(key)?.wardrobe ?? serviceMeta(key)?.wardrobe ?? null,
		transit: site.transit,
		parking: site.parking,
		shots: (shotTitles ?? []).map(shotMeta).filter((x): x is ShotMeta => Boolean(x)),
		extras: [],
		offeringKey: key,
		variant: null,
		kindLabel: classMeta(key) ? 'Class' : 'Session',
		people: 1,
		coach: null,
		coachFirstName: null,
		coachImage: null,
		coachSlug: null,
		isOnline: false,
		joinUrl: null,
		locationTitle: site.name,
		address: siteSlug === 'afterglow-wynwood' ? '2520 NW 2nd Ave, Miami, FL 33127' : '1235 Collins Ave, Miami Beach, FL 33139',
		minutes,
		bookAgainHref: classMeta(key) ? `/schedule?class=${key}` : '/shoots',
		tone: toneFor(o.category),
		...rest,
	};
}

function shift(date: string, days: number): string {
	const d = new Date(`${date}T00:00:00Z`);
	d.setUTCDate(d.getUTCDate() + days);
	return d.toISOString().slice(0, 10);
}

export function callSheetFixture(): BookingView[] {
	return [
		view('p1', 1, '18:45', 50, { title: 'Glute Lab', category: 'sculpt', key: 'glute-lab', coach: 'Valentina Cruz', coachFirstName: 'Valentina', shotTitles: ['Photo Set', 'Slow-mo Reel'], extras: ['Matcha Protein'] }),
		view('p2', 2, '18:00', 45, { title: 'Rhythm Ride', category: 'ride', key: 'rhythm-ride', coach: 'Marcus Bell', coachFirstName: 'Marcus', site: 'wynwood', shotTitles: ['Class Clips'] }),
		view('p3', 4, '17:00', 45, { title: 'Golden Hour Shoot', category: 'content', key: 'golden-hour-shoot', coach: 'Ava Lin', coachFirstName: 'Ava' }),
	];
}

export function rollFixture(): BookingView[] {
	const past: Array<[number, string, string, string, string, string[], 'south-beach' | 'wynwood']> = [
		[-2, '18:30', 'Strobe HIIT', 'sweat', 'strobe-hiit', ['Class Clips'], 'wynwood'],
		[-5, '17:30', 'Pilates Burn', 'flow', 'pilates-burn', [], 'south-beach'],
		[-7, '06:30', 'Glute Lab', 'sculpt', 'glute-lab', ['Raw Camera Roll'], 'south-beach'],
		[-10, '17:00', 'Golden Hour Shoot', 'content', 'golden-hour-shoot', [], 'south-beach'],
		[-13, '07:00', 'Physique Coaching 1:1', 'coaching', 'physique-coaching', ['Photo Set'], 'south-beach'],
		[-15, '19:45', 'Shadowbox Glow', 'box', 'shadowbox-glow', ['Slow-mo Reel'], 'wynwood'],
		[-17, '17:30', 'Sunset Rooftop Yoga', 'flow', 'sunset-yoga', [], 'south-beach'],
		[-21, '18:00', 'Rhythm Ride', 'ride', 'rhythm-ride', ['Class Clips'], 'wynwood'],
		[-24, '18:45', 'Glute Lab', 'sculpt', 'glute-lab', ['Photo Set'], 'south-beach'],
		[-26, '17:30', 'First Glow Tour', 'intro', 'first-glow-tour', [], 'south-beach'],
	];
	return [
		view('u1', 2, '18:45', 50, { title: 'Glute Lab', category: 'sculpt', key: 'glute-lab', coachFirstName: 'Valentina', coach: 'Valentina Cruz', shotTitles: ['Photo Set', 'Slow-mo Reel'] }),
		view('u2', 4, '11:00', 60, { title: 'Reel in an Hour', category: 'content', key: 'reel-in-an-hour', coachFirstName: 'Theo', coach: 'Theo Marsh', site: 'wynwood' }),
		...past.map(([d, t, title, category, key, shotTitles, site], i) => view(`l${i}`, d, t, 50, { title, category, key, shotTitles, site, coachFirstName: ['Kiara', 'Isabella', 'Valentina', 'Ava', 'Valentina', 'Dante', 'Sofía', 'Marcus', 'Valentina', 'Camila'][i] })),
	];
}
