'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import type { OrderDetailResponse } from '@opencals/storefront-sdk';
import { fetcher } from '@/lib/fetcher';
import { orderExpeditions, teamNameOf } from '@/lib/invitation';
import { readHandoff, type CheckoutHandoff } from '@/lib/booking-state';
import { ROOM_ORDER, roomPresentation } from '@/lib/site-config';
import { SealedInvitation } from './sealed-invitation';

/**
 * Thank-you: checkout signs the customer in (when the API returns `auth`), so the
 * order loads with their session and the invitation is sealed with their details.
 * Without a session the booking is safe and a sign-in code brings the letter here.
 */
export function ThankYouView({ orderId }: { orderId: string | null }) {
	const { status, data: session } = useSession();
	const key = orderId && status === 'authenticated' ? `/api/account/orders/${encodeURIComponent(orderId)}` : null;
	const { data: order, isLoading, error } = useSWR<OrderDetailResponse>(key, fetcher, { revalidateOnFocus: false, errorRetryCount: 2 });
	const expeditions = useMemo(() => orderExpeditions(order), [order]);
	const [handoff, setHandoff] = useState<CheckoutHandoff | null>(null);
	useEffect(() => setHandoff(orderId ? readHandoff(orderId) : null), [orderId]);

	const played = new Set(expeditions.map((e) => e.key));
	const nextSlug = ROOM_ORDER.find((slug) => !played.has(slug));
	const nextRoom = nextSlug ? { title: roomPresentation(nextSlug)!.title, href: `/rooms/${nextSlug}` } : null;

	return (
		<section className="wrap min-h-[80vh] pb-24 pt-[calc(var(--header-h)+40px)]">
			<p className="folio mx-auto max-w-xl">{handoff?.awaiting === 'awaiting_payment' ? 'Received · awaiting payment' : 'Your passage is granted'}</p>
			<h1 className="font-display mt-5 text-center text-[clamp(2.4rem,5vw,3.8rem)] leading-tight">A letter has arrived for you.</h1>
			<div className="mt-12">
				{status === 'loading' || isLoading ? (
					<p className="text-center font-display text-2xl">The courier is on the stairs…</p>
				) : status !== 'authenticated' ? (
					<div className="paper mx-auto max-w-xl p-8 text-center">
						<p className="text-lg">You’re booked, and the confirmation email is on its way. To open your invitation here and move or cancel later, sign in with the email you booked with: we send a 6-digit code, no password.</p>
						<Link href={`/login?callbackUrl=${encodeURIComponent(orderId ? `/thank-you?orderId=${orderId}` : '/account')}`} className="plate plate-gold mt-6">
							Email me a code
						</Link>
					</div>
				) : expeditions.length ? (
					<SealedInvitation expeditions={expeditions} team={teamNameOf(order)} guest={session?.customer?.firstName ?? null} orderName={order?.name ?? null} nextRoom={nextRoom} />
				) : (
					<div className="paper mx-auto max-w-xl p-8 text-center">
						<p className="text-lg">{error || !orderId ? 'You’re booked. The invitation didn’t load, but your email has every detail.' : 'Nothing to show for this order.'}</p>
						<Link href="/account" className="plate mt-6">
							Open your logbook
						</Link>
					</div>
				)}
			</div>
		</section>
	);
}
