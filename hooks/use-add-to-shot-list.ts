'use client';

import { useCallback, useState } from 'react';
import { useCart } from '@/contexts/cart-context';
import { useShotListUi } from '@/contexts/shot-list-ui-context';
import { siteConfig } from '@/lib/site-config';
import type { AppointmentDateRangeSlot, CreateAppointmentAddOn } from '@opencals/storefront-sdk';

export interface BookSlot extends Pick<AppointmentDateRangeSlot, 'productId' | 'staffMemberId' | 'locationId'> {
	/** UTC instants. */
	start: string | number;
	end: string | number;
}

export interface BookRequest {
	slot: BookSlot;
	numberOfAttendees?: number;
	addOns?: Array<Required<CreateAppointmentAddOn>>;
	/** Partner sessions: 2 people on one booking. */
	people?: number;
}

const utc = (v: string | number) => {
	const iso = new Date(v).toISOString();
	return { date: iso.slice(0, 10), time: iso.slice(11, 19) };
};

/** Turns an API error into one plain sentence. */
function message(status: number, body: { error?: string; message?: string } | null): string {
	const raw = body?.error || body?.message || '';
	if (status === 409 || /not available|maximum attendees|seats/i.test(raw)) return 'Someone just took that spot. Pick another time.';
	if (status === 429) return 'Too many requests at once. Give it a second and try again.';
	return raw || 'That didn’t load. Try again.';
}

/** POST one or more sessions to the cart (in order), flash, then open the Shot List. */
export function useAddToShotList() {
	const { cartId, setCart } = useCart();
	const { setOpen, flash } = useShotListUi();
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const add = useCallback(
		async (requests: BookRequest[], { openList = true }: { openList?: boolean } = {}): Promise<boolean> => {
			setPending(true);
			setError(null);
			let id = cartId;
			try {
				for (const r of requests) {
					const from = utc(r.slot.start);
					const to = utc(r.slot.end);
					const res = await fetch('/api/book', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json', ...(id ? { 'X-Cart-Id': id } : {}) },
						body: JSON.stringify({
							slot: { productId: r.slot.productId, fromDate: from.date, fromTime: from.time, toDate: to.date, toTime: to.time, staffMemberId: r.slot.staffMemberId ?? null, locationId: r.slot.locationId ?? null },
							numberOfAttendees: r.numberOfAttendees ?? 1,
							addOns: r.addOns ?? [],
							...(r.people && r.people > 1 ? { people: r.people } : {}),
						}),
					});
					const body = await res.json().catch(() => null);
					if (!res.ok) {
						setError(message(res.status, body));
						return false;
					}
					if (body?.cart) {
						setCart(body.cart);
						id = body.cart.id;
					}
				}
				flash();
				if (openList) setOpen(true);
				return true;
			} catch {
				setError('No connection. Check your signal and try again.');
				return false;
			} finally {
				setPending(false);
			}
		},
		[cartId, setCart, setOpen, flash],
	);

	return { add, pending, error, setError };
}

export const PEOPLE_KEY = siteConfig.customAttributeKeys.people;
