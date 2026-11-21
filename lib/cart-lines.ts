import type { CartItem, CartResponse } from '@opencals/storefront-sdk';

/**
 * The cart maths. The API's `subtotal` (cart and order) is already net
 * of discounts and has no gross field, so the gross is rebuilt from each line's
 * and add-on's `originalSubtotal`, in whole pence, skipping cancelled bookings.
 */
export interface GrossLine {
	originalSubtotal: number;
	appointment?: { status?: string | null } | null;
	/** Cart lines carry `addOnItems`, order lines `addOnLineItems`. */
	addOnItems?: ReadonlyArray<{ originalSubtotal: number }> | null;
	addOnLineItems?: ReadonlyArray<{ originalSubtotal: number }> | null;
}

export function grossSubtotal(lines: readonly GrossLine[] | null | undefined): number {
	const pence = (lines ?? []).reduce((sum, line) => {
		if (line.appointment?.status === 'canceled') return sum;
		const addOns = (line.addOnItems ?? line.addOnLineItems ?? []).reduce((a, ao) => a + Math.round(ao.originalSubtotal * 100), 0);
		return sum + Math.round(line.originalSubtotal * 100) + addOns;
	}, 0);
	return pence / 100;
}

/** A tag's price: the booking plus its add-ons, after offers. */
export function linePrice(item: Pick<CartItem, 'discountedSubtotal' | 'addOnItems'>): number {
	const addOns = (item.addOnItems ?? []).reduce((a, ao) => a + Math.round(ao.discountedSubtotal * 100), 0);
	return (Math.round(item.discountedSubtotal * 100) + addOns) / 100;
}

/** Offers worth showing (zero-amount applied discounts hidden). */
export function visibleDiscounts(cart: Pick<CartResponse, 'appliedDiscounts'> | null | undefined) {
	return (cart?.appliedDiscounts ?? []).filter((d) => Math.abs(d.totalAmount) >= 0.005);
}

/** Bookings in the cart. */
export function cartCount(cart: Pick<CartResponse, 'items'> | null | undefined): number {
	return cart?.items?.length ?? 0;
}
