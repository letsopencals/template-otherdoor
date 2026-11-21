import type { Metadata } from 'next';
import Link from 'next/link';
import { ExpeditionDetail } from '@/components/logbook/expedition-detail';

export const metadata: Metadata = { title: 'Expedition', robots: { index: false, follow: false } };

type Params = Promise<{ appointmentId: string }>;
type Search = Promise<{ do?: string }>;

export default async function ExpeditionPage({ params, searchParams }: { params: Params; searchParams: Search }) {
	const { appointmentId } = await params;
	const action = (await searchParams).do;
	return (
		<section className="wrap pb-24 pt-[calc(var(--header-h)+32px)]">
			<Link href="/account" className="text-sm underline underline-offset-4">
				← The logbook
			</Link>
			<p className="folio folio-left mt-6">Logbook entry</p>
			<div className="mt-8">
				<ExpeditionDetail id={appointmentId} initialAction={action === 'move' || action === 'cancel' ? action : null} />
			</div>
		</section>
	);
}
