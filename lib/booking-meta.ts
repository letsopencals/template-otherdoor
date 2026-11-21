import { offeringKeyForSlug, classKeyForSlug } from '@/lib/catalog';
import { classMeta, toneFor, serviceMeta, siteConfig, type Tone } from '@/lib/site-config';
import type { AppointmentDetailLocation } from '@opencals/storefront-sdk';

/**
 * Turns an appointment (list, detail or order-embedded) into the facts the
 * shot list, the call sheet and the roll show: the offering key, its category
 * and tone, the coach or crew member, whether it's online (and the live link),
 * the site address, the head count for a partner or duo session, and where
 * "Book again" goes.
 *
 * Online vs on-site comes from the booked location's `type`; the join link is
 * that location's `link` (Afterglow has no online location at launch).
 */

type AddressFields = Partial<
	Pick<AppointmentDetailLocation, 'addressLine1' | 'addressLine2' | 'city' | 'state' | 'postalCode' | 'country' | 'displayAddress'>
>;

/** Structural subset shared by the SDK's appointment list, detail and order shapes. */
export interface AppointmentLike {
	from: string;
	to: string;
	numberOfAttendees?: number | null;
	staffMember?: {
		firstName?: string | null;
		lastName?: string | null;
		slug?: string | null;
		image?: { url?: string | null } | null;
	} | null;
	customAttributes?: Record<string, string> | null;
	addOns?: Array<{ quantity?: number | null; addOn?: { title?: string | null } | null }> | null;
	product?: {
		title?: string | null;
		variantTitle?: string | null;
		slug?: string | null;
		color?: string | null;
		maxAttendees?: number | null;
		price?: number | null;
	} | null;
	location?: (AddressFields & {
		title?: string | null;
		type?: AppointmentDetailLocation['type'] | null;
		link?: string | null;
		address?: string | null;
	}) | null;
}

export interface BookingMeta {
	title: string;
	/** Offering key (`glute-lab`, `physique-coaching`, `event-sunset-sessions`), from the product slug. */
	offeringKey: string | null;
	/** Category slug from the template's own key lists (`sculpt`…), `coaching` when unknown. */
	category: string;
	tone: Tone;
	variant: string | null;
	/** "Class" | "Session". */
	kindLabel: string;
	/** People on the booking (a partner session is one booking for 2). */
	people: number;
	coach: string | null;
	coachFirstName: string | null;
	coachImage: string | null;
	coachSlug: string | null;
	isOnline: boolean;
	joinUrl: string | null;
	locationTitle: string | null;
	address: string | null;
	minutes: number;
	bookAgainHref: string;
}

function joinAddress(a: AddressFields | null | undefined): string | null {
	if (!a) return null;
	if (a.displayAddress) return a.displayAddress;
	const parts = [a.addressLine1, a.addressLine2, a.city, a.state, a.postalCode].filter(Boolean);
	return parts.length ? parts.join(', ') : null;
}

/** Category of a booked product from its slug alone (appointments don't carry collections). */
export function categoryForSlug(slug: string | null | undefined): string {
	const key = offeringKeyForSlug(slug);
	if (!key) return 'coaching';
	if (key in siteConfig.events) return 'events';
	return classMeta(key)?.category ?? serviceMeta(key)?.category ?? 'coaching';
}

/**
 * The variant title unless it only repeats who and where ("Collingwood · Jo" for a session with Jo at Mettle
 * Collingwood): classes, events and hires name their variants after the site and the coach.
 */
export function distinctVariant(variantTitle: string | null | undefined, ...names: Array<string | null | undefined>): string | null {
	if (!variantTitle) return null;
	const known = names.filter(Boolean).join(' ').toLowerCase();
	const parts = variantTitle.split('·').map((p) => p.trim().toLowerCase()).filter(Boolean);
	return parts.every((p) => known.includes(p)) ? null : variantTitle;
}

export function getBookingMeta(appt: AppointmentLike): BookingMeta {
	const staff = appt.staffMember;
	const coach = staff ? [staff.firstName, staff.lastName].filter(Boolean).join(' ') || null : null;
	const isOnline = appt.location?.type === siteConfig.locationTypes.online;
	const slug = appt.product?.slug ?? null;
	const category = categoryForSlug(slug);
	const key = offeringKeyForSlug(slug);
	const isClass = Boolean(classKeyForSlug(slug));
	return {
		title: appt.product?.title ?? 'Session',
		offeringKey: key,
		category,
		tone: toneFor(category),
		variant: distinctVariant(appt.product?.variantTitle, coach, appt.location?.title),
		kindLabel: isClass ? 'Class' : category === 'events' ? 'Event' : 'Session',
		people: appt.customAttributes?.[siteConfig.customAttributeKeys.people] === '2' ? 2 : Math.max(1, appt.numberOfAttendees ?? 1),
		coach,
		coachFirstName: staff?.firstName ?? null,
		coachImage: staff?.image?.url ?? null,
		coachSlug: staff?.slug ?? null,
		isOnline,
		joinUrl: isOnline ? appt.location?.link || null : null,
		locationTitle: appt.location?.title ?? null,
		address: isOnline ? null : (joinAddress(appt.location) ?? appt.location?.address ?? null),
		minutes: Math.max(0, Math.round((Date.parse(appt.to) - Date.parse(appt.from)) / 60_000)),
		bookAgainHref: bookAgain(key, category, isClass),
	};
}

function bookAgain(key: string | null, category: string, isClass: boolean): string {
	if (isClass && key) return `/schedule?class=${encodeURIComponent(key)}`;
	if (category === 'events' || category === 'bar') return '/bar';
	const page = category === 'content' || category === 'intro' ? '/shoots' : category === 'glow' ? '/glow' : '/coaching';
	return key ? `${page}?service=${encodeURIComponent(key)}#book` : page;
}

export type JoinState = 'early' | 'open' | 'ended';

/**
 * Whether the "Join" button is live: from `joinWindowMinutes` before the
 * start until the session ends.
 */
export function getJoinState(from: string, to: string, now: number = Date.now()): JoinState {
	const opensAt = Date.parse(from) - siteConfig.joinWindowMinutes * 60_000;
	if (now < opensAt) return 'early';
	if (now > Date.parse(to)) return 'ended';
	return 'open';
}
