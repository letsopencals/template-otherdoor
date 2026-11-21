import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import { PageHead } from '@/components/pages/page-head';

export const metadata: Metadata = { title: 'Groups and parties', description: 'Team days, birthdays, stag and hen parties and family days at The Gilded Compass escape rooms in Edinburgh.' };

const LINKS: Record<string, string> = { team: '/book', birthday: '/book', stag: '/rooms/hotel-lumiere', family: '/rooms/clockmakers-workshop' };

export default function GroupsPage() {
	return (
		<>
			<PageHead folio="Parties of explorers" title="Bring the whole expedition." lede="Rooms side by side for big groups, a ceremony for birthdays, the Victory Bottle on ice for celebrations. Book online like any team: one room per team, and we’ll set the rest." />
			<section className="wrap grid gap-6 py-16 md:grid-cols-2">
				{siteConfig.groups.map((g, i) => (
					<article key={g.key} className={`p-8 md:p-10 ${i % 3 === 0 ? 'band-green' : i % 3 === 1 ? 'band-oxblood' : 'paper paper-ruled'}`}>
						<p className="engraved opacity-80">No. {i + 1}</p>
						<h2 className="font-display mt-2 text-4xl">{g.title}</h2>
						<p className="mt-4 max-w-prose leading-relaxed">{g.body}</p>
						<p className="mt-6">
							<Link href={LINKS[g.key] ?? '/book'} className={`plate ${i % 3 === 2 ? '' : 'plate-gold'}`}>
								{g.cta}
							</Link>
						</p>
					</article>
				))}
			</section>
			<section className="wrap max-w-3xl pb-24 text-center">
				<h2 className="font-display text-3xl">Larger than two teams?</h2>
				<p className="mt-4 leading-relaxed">
					Book the rooms you want at the same start time on the expedition board (the Vaults hold up to 19 explorers across three rooms, the Bond up to 18). For private hire of a whole house, write to{' '}
					<a className="underline" href={`mailto:${siteConfig.contact.email}`}>
						{siteConfig.contact.email}
					</a>{' '}
					or call {siteConfig.contact.phone}.
				</p>
			</section>
		</>
	);
}
