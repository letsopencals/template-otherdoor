import type { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import { PageHead } from '@/components/pages/page-head';
import { SafeImg } from '@/components/ui/safe-img';

export const metadata: Metadata = { title: 'Groups and parties', description: 'Team days, birthdays, stag and hen parties and family days at Otherdoor escape rooms in Edinburgh.' };

const LINKS: Record<string, string> = { team: '/book', birthday: '/book', stag: '/rooms/hotel-lumiere', family: '/rooms/clockmakers-workshop' };

export default function GroupsPage() {
	return (
		<>
			<PageHead label="Groups" title="Bring everyone." lede="Rooms side by side for big groups, a ceremony for birthdays, a victory bottle on ice for celebrations. Book online like any team: one room per team, and we set the rest." />
			<section className="wrap py-16">
				<div className="overflow-hidden rounded-[22px_22px_6px_6px] shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
					<SafeImg src={siteConfig.media.lobby} alt="The Lobby at Otherdoor" className="block aspect-[21/9] w-full object-cover" fallback={<span className="block aspect-[21/9] bg-night-2" />} />
				</div>
				<div className="mt-14 grid gap-px overflow-hidden rounded-[16px] bg-line md:grid-cols-2">
					{siteConfig.groups.map((g, i) => (
						<article key={g.key} className="bg-night-1 p-8 md:p-10">
							<p className="mono text-[0.78rem] text-ink-3">{String(i + 1).padStart(2, '0')}</p>
							<h2 className="font-display mt-3 text-[2rem] tracking-tight">{g.title}</h2>
							<p className="mt-3 max-w-prose leading-relaxed text-ink-2">{g.body}</p>
							<p className="mt-6">
								<Link href={LINKS[g.key] ?? '/book'} className={i === 0 ? 'btn' : 'btn btn-glass'}>
									{g.cta}
								</Link>
							</p>
						</article>
					))}
				</div>
			</section>
			<section className="wrap max-w-3xl pb-24">
				<h2 className="font-display text-[2rem] tracking-tight">Larger than two teams?</h2>
				<p className="mt-4 leading-relaxed text-ink-2">
					Book the rooms you want at the same start time on the <Link href="/book" className="link">booking page</Link> (each venue holds up to 22 players across its three rooms). For private hire of a whole venue, write to{' '}
					<a className="link" href={`mailto:${siteConfig.contact.email}`}>
						{siteConfig.contact.email}
					</a>{' '}
					or call {siteConfig.contact.phone}.
				</p>
			</section>
		</>
	);
}
