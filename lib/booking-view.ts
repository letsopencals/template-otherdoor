import { getBookingMeta, type AppointmentLike, type BookingMeta } from '@/lib/booking-meta';
import { classMeta, serviceMeta, setMeta, shotMeta, siteConfig, siteMeta, type ShotMeta } from '@/lib/site-config';
import { awaitingOf, type Awaiting } from '@/lib/booking-state';
import type { AppointmentStatusType, StorefrontAppointmentPendingReason } from '@opencals/storefront-sdk';

/** One booked session as the call sheet, the roll and the detail page show it. */
export interface BookingView extends BookingMeta {
	id: string;
	start: number;
	end: number;
	status: AppointmentStatusType;
	/** Waiting for payment or for the studio's OK (a pending booking with a reason); null when confirmed. */
	awaiting: Awaiting | null;
	/** Placed through an order. A pending appointment without one is only a cart hold. */
	booked: boolean;
	siteSlug: string | null;
	siteName: string | null;
	setName: string | null;
	/** The set photo (or the category photo) from site copy. */
	image: string | null;
	whatToBring: string[];
	wardrobe: string | null;
	transit: string | null;
	parking: string | null;
	/** Shot add-ons booked on this session (what the crew delivers). */
	shots: ShotMeta[];
	/** Other add-ons (bar, towel, glam), by title. */
	extras: string[];
}

type Appt = AppointmentLike & {
	id: string;
	status?: AppointmentStatusType | null;
	pendingReason?: StorefrontAppointmentPendingReason | null;
	orderLineItem?: unknown;
	location?: (AppointmentLike['location'] & { slug?: string | null }) | null };

export function toBookingView(a: Appt): BookingView {
	const meta = getBookingMeta(a);
	const key = meta.offeringKey;
	const bring = (key && (classMeta(key)?.whatToBring ?? serviceMeta(key)?.whatToBring ?? siteConfig.events[key]?.whatToBring)) || [];
	const site = siteMeta(a.location?.slug ?? null);
	const setKey = key ? (classMeta(key)?.set ?? serviceMeta(key)?.set) : undefined;
	const titles = (a.addOns ?? []).map((x) => x.addOn?.title ?? '').filter(Boolean);
	return {
		...meta,
		id: a.id,
		start: Date.parse(a.from),
		end: Date.parse(a.to),
		status: a.status ?? 'scheduled',
		awaiting: awaitingOf(a),
		// List/detail rows carry `orderLineItem`; order-embedded ones are booked by definition.
		booked: a.orderLineItem === undefined ? true : a.orderLineItem !== null,
		siteSlug: a.location?.slug ?? null,
		siteName: site?.nickname ?? a.location?.title ?? null,
		setName: setMeta(setKey)?.name ?? null,
		image: setMeta(setKey)?.image ?? siteConfig.media.categories[meta.category] ?? null,
		whatToBring: bring,
		wardrobe: (key && (classMeta(key)?.wardrobe ?? serviceMeta(key)?.wardrobe)) || null,
		transit: site?.transit ?? null,
		parking: site?.parking || null,
		shots: titles.map(shotMeta).filter((x): x is ShotMeta => Boolean(x)),
		extras: titles.filter((t) => !shotMeta(t)),
	};
}
