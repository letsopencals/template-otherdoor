import { getBookingMeta, type AppointmentLike } from '@/lib/booking-meta';
import { classMeta, isCrewShoot, serviceMeta, setMeta, shotMeta, siteConfig, type ShotMeta, type Tone } from '@/lib/site-config';

/**
 * The cart as a contact sheet: one frame per session, numbered in time order,
 * with the shot add-ons pulled out (they get the grease-pencil circle) from the
 * other extras. Pure. The total and each offer come from the cart; only the gross
 * before offers is rebuilt from the lines (`grossSubtotal`).
 */

export interface CartItemLike {
	id: string;
	discountedTotal?: number | null;
	discountedSubtotal?: number | null;
	totalDiscount?: number | null;
	originalSubtotal?: number | null;
	appointment?: (AppointmentLike & { id?: string; product?: AppointmentLike['product'] & { image?: { url?: string | null } | null } }) | null;
	addOnItems?: Array<{ id: string; quantity: number; discountedTotal?: number | null; discountedSubtotal?: number | null; totalDiscount?: number | null; originalSubtotal?: number | null; addOn?: { title?: string | null } | null }> | null;
	discounts?: Array<{ title?: string | null }> | null;
}

export interface Frame {
	key: string;
	/** 1-based frame number in time order. */
	n: number;
	title: string;
	variant: string | null;
	tone: Tone;
	/** The crew shoots this session end to end (a shoot, not a class), so it needs no shot add-on. */
	crewShoot: boolean;
	/** The set photo (or the category photo) from site copy. */
	image: string | null;
	from: string;
	minutes: number;
	coachFirstName: string | null;
	place: string | null;
	people: number;
	total: number;
	baseDiscount: number;
	offer: string | null;
	shots: Array<{ id: string; meta: ShotMeta; total: number; discount: number }>;
	extras: Array<{ id: string; title: string; quantity: number; total: number }>;
}

export function framesFor(items: readonly CartItemLike[] | null | undefined): Frame[] {
	return (items ?? [])
		.filter((it) => it.appointment)
		.slice()
		.sort((a, b) => (a.appointment!.from ?? '').localeCompare(b.appointment!.from ?? ''))
		.map((it, i) => {
			const appt = it.appointment!;
			const meta = getBookingMeta(appt);
			const shots: Frame['shots'] = [];
			const extras: Frame['extras'] = [];
			for (const a of it.addOnItems ?? []) {
				const title = a.addOn?.title ?? 'Extra';
				const shot = shotMeta(title);
				if (shot) shots.push({ id: a.id, meta: shot, total: a.discountedTotal ?? 0, discount: a.totalDiscount ?? 0 });
				else extras.push({ id: a.id, title, quantity: a.quantity, total: a.discountedTotal ?? 0 });
			}
			const key = meta.offeringKey;
			const set = key ? (classMeta(key)?.set ?? serviceMeta(key)?.set) : undefined;
			const image = setMeta(set)?.image ?? siteConfig.media.categories[meta.category] ?? null;
			return {
				key: it.id,
				n: i + 1,
				title: meta.title,
				variant: meta.variant,
				tone: meta.tone,
				crewShoot: isCrewShoot(meta.category, key),
				image,
				from: appt.from,
				minutes: meta.minutes,
				coachFirstName: meta.coachFirstName,
				place: meta.locationTitle?.replace(/^Afterglow\s+/, '') ?? null,
				people: meta.people,
				// The item's own subtotal covers the class or session only; the frame price adds its shots and extras,
				// after offers and before tax (tax has its own row in the totals).
				total: ((it.addOnItems ?? []).reduce((c, a) => c + Math.round((a.discountedSubtotal ?? 0) * 100), Math.round((it.discountedSubtotal ?? 0) * 100))) / 100,
				baseDiscount: it.totalDiscount ?? 0,
				offer: (it.totalDiscount ?? 0) > 0 ? (it.discounts?.[0]?.title ?? null) : null,
				shots,
				extras,
			};
		});
}

/** How many shot add-ons are circled across the list. */
export function shotCount(frames: readonly Frame[]): number {
	return frames.reduce((n, f) => n + f.shots.length, 0);
}

interface GrossLine {
	originalSubtotal: number;
	appointment?: { status?: string | null } | null;
	/** Cart lines carry `addOnItems`, order lines `addOnLineItems`. */
	addOnItems?: ReadonlyArray<{ originalSubtotal: number }> | null;
	addOnLineItems?: ReadonlyArray<{ originalSubtotal: number }> | null;
}

/**
 * Everything before offers, for a cart or an order. The API's `subtotal` is already net of discounts and has no
 * gross field, so this adds up each line's and add-on's `originalSubtotal` in whole cents, skipping cancelled
 * sessions as the order's own subtotal does.
 */
export function grossSubtotal(lines: readonly GrossLine[] | null | undefined): number {
	const cents = (lines ?? []).reduce((sum, line) => {
		if (line.appointment?.status === 'canceled') return sum;
		const addOns = (line.addOnItems ?? line.addOnLineItems ?? []).reduce((a, ao) => a + Math.round(ao.originalSubtotal * 100), 0);
		return sum + Math.round(line.originalSubtotal * 100) + addOns;
	}, 0);
	return cents / 100;
}
