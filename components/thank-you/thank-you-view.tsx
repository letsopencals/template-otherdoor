'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import type { OrderDetailResponse } from '@opencals/storefront-sdk';
import { fetcher } from '@/lib/fetcher';
import { orderVisits, teamNameOf } from '@/lib/order-visits';
import { readHandoff, type CheckoutHandoff } from '@/lib/booking-state';
import { ROOM_ORDER, roomPresentation } from '@/lib/site-config';
import { DoorUnlocks } from './door-unlocks';

/**
 * Thank-you: checkout signs the customer in (when the API returns `auth`), so the
 * order loads with their session and the door unlocks with their details.
 * Without a session the booking is safe and a sign-in code brings them back here.
 */
export function ThankYouView({ orderId }: { orderId: string | null }) {
	const { status, data: session } = useSession();
	const key = orderId && status === 'authenticated' ? `/api/account/orders/${encodeURIComponent(orderId)}` : null;
	const { data: order, isLoading, error } = useSWR<OrderDetailResponse>(key, fetcher, { revalidateOnFocus: false, errorRetryCount: 2 });
	const visits = useMemo(() => orderVisits(order), [order]);
	const [handoff, setHandoff] = useState<CheckoutHandoff | null>(null);
	useEffect(() => setHandoff(orderId ? readHandoff(orderId) : null), [orderId]);

	const played = new Set(visits.map((e) => e.key));
	const nextSlug = ROOM_ORDER.find((slug) => !played.has(slug));
	const nextRoom = nextSlug ? { title: roomPresentation(nextSlug)!.title, href: `/rooms/${nextSlug}`, glow: roomPresentation(nextSlug)!.palette.glow } : null;

	return (
		<section className="pool wrap min-h-[80vh] pb-24 pt-[calc(var(--header-h)+48px)]">
			{handoff?.awaiting === "awaiting_payment" ? <p className="label mb-6">Received · awaiting payment</p> : null}
			<div>
				{status === 'loading' || isLoading ? (
					<p className="font-display py-20 text-center text-2xl text-ink-2">Finding your booking…</p>
				) : status !== 'authenticated' ? (
					<div className="glass mx-auto max-w-xl p-8 text-center">
						<p className="text-lg">You’re booked, and the confirmation email is on its way. To see it here and move or cancel later, sign in with the email you booked with: we send a 6-digit code, no password.</p>
						<Link href={`/login?callbackUrl=${encodeURIComponent(orderId ? `/thank-you?orderId=${orderId}` : '/account')}`} className="btn mt-6">
							Email me a code
						</Link>
					</div>
				) : visits.length ? (
					<DoorUnlocks visits={visits} team={teamNameOf(order)} guest={session?.customer?.firstName ?? null} orderName={order?.name ?? null} nextRoom={nextRoom} />
				) : (
					<div className="glass mx-auto max-w-xl p-8 text-center">
						<p className="text-lg">{error || !orderId ? 'You’re booked. The details didn’t load, but your email has every detail.' : 'Nothing to show for this order.'}</p>
						<Link href="/account" className="btn mt-6">
							Open your account
						</Link>
					</div>
				)}
			</div>
		</section>
	);
}
