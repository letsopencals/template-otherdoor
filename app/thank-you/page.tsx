import type { Metadata } from 'next';
import { ThankYouView } from '@/components/thank-you/thank-you-view';

export const metadata: Metadata = { title: 'You’re booked', robots: { index: false, follow: false } };

type Search = Promise<{ orderId?: string | string[] }>;

export default async function ThankYouPage({ searchParams }: { searchParams: Search }) {
	const raw = (await searchParams).orderId;
	const orderId = (Array.isArray(raw) ? raw[0] : raw)?.trim() || null;
	return <ThankYouView orderId={orderId} />;
}
