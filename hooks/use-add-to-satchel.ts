'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/cart-context';
import { useSatchelUi } from '@/contexts/satchel-ui-context';
import type { CreateAppointmentAddOn } from '@opencals/storefront-sdk';

export interface BookRequest {
	productId: string;
	locationId?: string | null;
	staffMemberId?: string | null;
	/** UTC epoch ms. */
	start: number;
	end: number;
	/** Rooms: always 1 (the variant is the team). Workshops: the seats. */
	numberOfAttendees?: number;
	/** Rooms: the team size, stored on the booking as `customAttributes.people`. */
	people?: number;
	addOns?: CreateAppointmentAddOn[];
}

const utc = (ms: number) => {
	const iso = new Date(ms).toISOString();
	return { date: iso.slice(0, 10), time: iso.slice(11, 19) };
};

/** One plain sentence for an API error. */
function message(status: number, body: { error?: string; message?: string } | null): string {
	const raw = body?.error || body?.message || '';
	if (status === 409 || /not available|maximum attendees|seats|already booked/i.test(raw)) return 'Another team just took that session. Pick another time.';
	if (status === 429) return 'Too many requests at once. Give it a second and try again.';
	return raw || 'That didn’t go through. Try again.';
}

/** POST one booking to the cart, flash the satchel and open it. */
export function useAddToSatchel() {
	const router = useRouter();
	const { cartId, setCart } = useCart();
	const { setOpen, flash } = useSatchelUi();
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const add = useCallback(
		async (r: BookRequest, { open = true }: { open?: boolean } = {}): Promise<boolean> => {
			setPending(true);
			setError(null);
			try {
				const from = utc(r.start);
				const to = utc(r.end);
				const res = await fetch('/api/book', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', ...(cartId ? { 'X-Cart-Id': cartId } : {}) },
					body: JSON.stringify({
						slot: { productId: r.productId, fromDate: from.date, fromTime: from.time, toDate: to.date, toTime: to.time, staffMemberId: r.staffMemberId ?? null, locationId: r.locationId ?? null },
						numberOfAttendees: r.numberOfAttendees ?? 1,
						addOns: r.addOns ?? [],
						...(r.people ? { people: r.people } : {}),
					}),
				});
				const body = await res.json().catch(() => null);
				if (!res.ok) {
					setError(message(res.status, body));
					return false;
				}
				if (body?.cart) setCart(body.cart);
				flash();
				if (open) setOpen(true);
				// Sessions changed: refresh server-rendered availability.
				router.refresh();
				return true;
			} catch {
				setError('No connection. Check your signal and try again.');
				return false;
			} finally {
				setPending(false);
			}
		},
		[cartId, setCart, setOpen, flash, router],
	);

	return { add, pending, error, setError };
}
