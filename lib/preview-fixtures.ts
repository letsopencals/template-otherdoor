import type { CartResponse } from '@opencals/storefront-sdk';
import type { AppointmentShape } from '@/lib/expedition';
import { localToUtc, addDays, today } from '@/lib/tz';

/** Fixtures for /preview/*: realistic bookings relative to today, shaped like API records. */
const loc = {
	vaults: { slug: 'gilded-compass-vaults', title: 'The Vaults, Cowgate' },
	leith: { slug: 'gilded-compass-leith', title: 'The Bond, Leith' },
};

function appt(id: string, slug: string, title: string, variant: string, dayOffset: number, time: string, minutes: number, location: { slug: string; title: string }, addOns: string[] = [], status = 'scheduled', seats = 1): AppointmentShape & { status: string; product: AppointmentShape['product'] & { cancelGap: number; rescheduleGap: number } } {
	const date = addDays(today(), dayOffset);
	const start = localToUtc(date, time);
	return { id, from: new Date(start).toISOString(), to: new Date(start + minutes * 60_000).toISOString(), numberOfAttendees: seats, status, product: { slug, title, variantTitle: variant, cancelGap: 86400, rescheduleGap: 86400 }, location, addOns: addOns.map((t) => ({ addOn: { title: t } })) };
}

export function previewAppointments() {
	return [
		appt('fx-1', 'jaguar-temple-4p', 'The Jaguar Temple', '4 players', 6, '19:30', 90, loc.vaults, ['The Victory Bottle', 'Expedition portrait']),
		appt('fx-2', 'lockpicking-101', 'Lockpicking 101', '', 12, '19:00', 60, loc.leith, [], 'scheduled', 2),
		appt('fx-3', 'gaslight-no-9-3p', 'The Gaslight Affair at No. 9', '3 players', -12, '19:30', 90, loc.vaults),
		appt('fx-4', 'hotel-lumiere-4p', 'The Hôtel Lumière Job', '4 players', -26, '18:00', 90, loc.leith, ['Birthday ceremony']),
		appt('fx-5', 'leviathan-dive-2p', 'The Leviathan Dive', '2 players', -40, '21:00', 90, loc.leith, [], 'canceled'),
	];
}

export function previewCart(): CartResponse {
	const items = previewAppointments().slice(0, 2);
	const prices = [108, 56];
	const addOnPrices: Record<string, number> = { 'The Victory Bottle': 45, 'Expedition portrait': 15 };
	const lines = items.map((a, i) => {
		const orig = prices[i]!;
		const addOnItems = (a.addOns ?? []).map((x, k) => ({ id: `ao-${i}-${k}`, originalSubtotal: addOnPrices[x.addOn?.title ?? ''] ?? 0, discountedSubtotal: addOnPrices[x.addOn?.title ?? ''] ?? 0, addOn: { title: x.addOn?.title ?? '' } }));
		return { id: `line-${i}`, appointmentId: a.id, originalSubtotal: orig, discountedSubtotal: orig, totalDiscount: 0, appointment: { ...a, status: 'pending' }, addOnItems };
	});
	const total = 108 + 45 + 15 + 56;
	return {
		id: 'cart-preview',
		items: lines,
		subtotal: total - 10.8,
		total: total - 10.8,
		totalTax: 0,
		appliedDiscountCode: 'GILDED',
		appliedDiscounts: [{ id: 'd', title: 'Society code', totalAmount: 10.8, code: 'GILDED' }],
		expiresAt: new Date(Date.now() + 12 * 60_000).toISOString(),
	} as unknown as CartResponse;
}
