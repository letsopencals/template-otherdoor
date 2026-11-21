import type { Metadata } from 'next';
import Link from 'next/link';
import { VisitDetail } from '@/components/account/visit-detail';

export const metadata: Metadata = { title: 'Booking', robots: { index: false, follow: false } };

type Params = Promise<{ appointmentId: string }>;
type Search = Promise<{ do?: string }>;

export default async function VisitPage({ params, searchParams }: { params: Params; searchParams: Search }) {
	const { appointmentId } = await params;
	const action = (await searchParams).do;
	return (
		<section className="wrap pb-24 pt-[calc(var(--header-h)+40px)]">
			<Link href="/account" className="link text-sm text-ink-2">
				← Your account
			</Link>
			<p className="label mt-8">Booking</p>
			<div className="mt-8">
				<VisitDetail id={appointmentId} initialAction={action === 'move' || action === 'cancel' ? action : null} />
			</div>
		</section>
	);
}
