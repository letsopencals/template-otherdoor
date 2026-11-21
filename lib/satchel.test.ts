import { describe, expect, it } from 'vitest';
import { grossSubtotal, linePrice, visibleDiscounts } from '@/lib/satchel';

describe('satchel maths', () => {
	it('rebuilds the gross from original subtotals, skipping cancelled lines', () => {
		expect(grossSubtotal([
			{ originalSubtotal: 108, addOnItems: [{ originalSubtotal: 45 }, { originalSubtotal: 15 }] },
			{ originalSubtotal: 70, appointment: { status: 'canceled' } },
			{ originalSubtotal: 56.1 },
		])).toBe(224.1);
	});
	it('prices a tag after offers', () => {
		expect(linePrice({ discountedSubtotal: 91.8, addOnItems: [{ discountedSubtotal: 45 }] as never })).toBe(136.8);
	});
	it('hides zero discounts', () => {
		expect(visibleDiscounts({ appliedDiscounts: [{ id: 'a', title: 'x', totalAmount: 0 }, { id: 'b', title: 'Matinee', totalAmount: 16.2 }] })).toHaveLength(1);
	});
});
