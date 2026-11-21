import type { CartResponse } from '@opencals/storefront-sdk';
import type { AppointmentShape } from '@/lib/visit';
import { localToUtc, addDays, today } from '@/lib/tz';

/** Fixtures for /preview/*: realistic bookings relative to today, shaped like API records. */
const loc = {
	vaults: { slug: 'otherdoor-vaults', title: 'Otherdoor Vaults' },
	leith: { slug: 'otherdoor-leith', title: 'Otherdoor Leith' },
};

function appt(id: string, slug: string, title: string, variant: string, dayOffset: number, time: string, minutes: number, location: { slug: string; title: string }, addOns: string[] = [], status = 'scheduled', seats = 1): AppointmentShape & { status: string; product: AppointmentShape['product'] & { cancelGap: number; rescheduleGap: number } } {
	const date = addDays(today(), dayOffset);
	const start = localToUtc(date, time);
	return { id, from: new Date(start).toISOString(), to: new Date(start + minutes * 60_000).toISOString(), numberOfAttendees: seats, status, product: { slug, title, variantTitle: variant, cancelGap: 86400, rescheduleGap: 86400 }, location, addOns: addOns.map((t) => ({ addOn: { title: t } })) };
}

export function previewAppointments() {
	return [
		appt('fx-1', 'kepler-station-6p', 'Kepler Station', '6 players', 6, '18:00', 120, loc.leith, ['Victory bottle', 'Team portrait']),
		appt('fx-2', 'lockpicking-101', 'Lockpicking 101', '', 12, '19:00', 60, loc.leith, [], 'scheduled', 2),
		appt('fx-3', 'gaslight-no-9-3p', 'The Gaslight Affair at No. 9', '3 players', -12, '19:30', 90, loc.vaults),
		appt('fx-4', 'hotel-lumiere-4p', 'The Hôtel Lumière Job', '4 players', -26, '18:00', 90, loc.leith, ['Birthday ceremony']),
		appt('fx-5', 'protocol-zero-4p', 'Protocol Zero', '4 players', -40, '21:00', 90, loc.vaults, [], 'completed'),
	];
}

export function previewCart(): CartResponse {
	const items = previewAppointments().slice(0, 2);
	const prices = [216, 56];
	const addOnPrices: Record<string, number> = { 'Victory bottle': 45, 'Team portrait': 15 };
	const lines = items.map((a, i) => {
		const orig = prices[i]!;
		const addOnItems = (a.addOns ?? []).map((x, k) => ({ id: `ao-${i}-${k}`, originalSubtotal: addOnPrices[x.addOn?.title ?? ''] ?? 0, discountedSubtotal: addOnPrices[x.addOn?.title ?? ''] ?? 0, addOn: { title: x.addOn?.title ?? '' } }));
		return { id: `line-${i}`, appointmentId: a.id, originalSubtotal: orig, discountedSubtotal: orig, totalDiscount: 0, appointment: { ...a, status: 'pending' }, addOnItems };
	});
	const total = 216 + 45 + 15 + 56;
	return {
		id: 'cart-preview',
		items: lines,
		subtotal: total - 21.6,
		total: total - 21.6,
		totalTax: 0,
		appliedDiscountCode: 'OTHERDOOR',
		appliedDiscounts: [{ id: 'd', title: 'Door code', totalAmount: 21.6, code: 'OTHERDOOR' }],
		expiresAt: new Date(Date.now() + 12 * 60_000).toISOString(),
	} as unknown as CartResponse;
}
