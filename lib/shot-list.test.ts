import { describe, expect, it } from 'vitest';
import { framesFor, grossSubtotal } from '@/lib/shot-list';

const ride = {
	id: 'line-1',
	originalSubtotal: 34,
	discountedSubtotal: 20.4,
	discountedTotal: 22.44,
	totalDiscount: 13.6,
	appointment: { status: 'scheduled', from: '2026-11-16T23:00:00Z', to: '2026-11-16T23:45:00Z', product: { slug: 'rhythm-ride-wynwood-jaylen', title: 'Rhythm Ride' } },
	addOnItems: [
		{ id: 'a1', quantity: 1, originalSubtotal: 39, discountedSubtotal: 27.3, discountedTotal: 30.03, addOn: { title: 'Photo Set' } },
		{ id: 'a2', quantity: 1, originalSubtotal: 9, discountedSubtotal: 9, discountedTotal: 9.9, addOn: { title: 'Matcha Protein' } },
	],
};

describe('the shot list', () => {
	it('rebuilds the gross before offers (the cart subtotal is net)', () => {
		expect(grossSubtotal([ride])).toBe(82);
	});

	it('skips cancelled sessions and reads order add-on lines', () => {
		expect(grossSubtotal([{ originalSubtotal: 50, appointment: { status: 'canceled' } }, { originalSubtotal: 20, addOnLineItems: [{ originalSubtotal: 5 }] }])).toBe(25);
	});

	it('prices a frame as the session plus its shots and extras, before tax', () => {
		const [frame] = framesFor([ride as never]);
		expect(frame!.total).toBe(56.7);
		expect(frame!.shots.map((s) => s.meta.label)).toEqual(['Photo Set']);
	});
});
