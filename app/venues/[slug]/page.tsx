import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { notFound } from 'next/navigation';
import { getCatalogue } from '@/lib/server-data';
import { doorRooms } from '@/lib/doors';
import { siteConfig, venuePresentation } from '@/lib/site-config';
import { mapHref } from '@/lib/visit';
import { formatWholePrice } from '@/lib/format';
import { PageHead } from '@/components/pages/page-head';
import { SafeImg } from '@/components/ui/safe-img';
import { DoorArt } from '@/components/doors/door-art';
import { doorArt } from '@/components/doors/door-sources';

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
	return Object.keys(siteConfig.venues).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
	const v = venuePresentation((await params).slug);
	return v ? { title: v.name, description: v.blurb } : { title: 'Venue' };
}

export const revalidate = 60;

export default async function VenuePage({ params }: { params: Params }) {
	const { slug } = await params;
	const v = venuePresentation(slug);
	if (!v) notFound();
	const catalogue = await getCatalogue();
	const doors = doorRooms(catalogue).filter((d) => d.venueSlug === slug);
	const workshops = catalogue.workshops.filter((w) => w.venue?.slug === slug);
	const map = mapHref(slug);
	return (
		<>
			<PageHead label={`Venue · ${v.kicker}`} title={v.name} lede={v.blurb}>
				<p className="mono mt-6 text-[0.85rem] text-ink-3">
					{v.address}, {v.postcode}
				</p>
			</PageHead>
			<section className="wrap grid gap-12 py-16 lg:grid-cols-[1.25fr_1fr]">
				<div className="overflow-hidden rounded-[18px_18px_4px_4px] bg-night-2 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
					<SafeImg src={v.image} alt={v.name} className="block aspect-[8/5] w-full object-cover" fallback={<span className="block aspect-[8/5]" />} />
				</div>
				<div className="grid content-start gap-8">
					<div>
						<h2 className="font-display text-[1.7rem] tracking-tight">Getting there</h2>
						<ul className="mt-3 space-y-2.5 text-ink-2">
							{v.gettingThere.map((g) => (
								<li key={g} className="flex gap-3">
									<span aria-hidden className="mt-[0.7em] h-[2px] w-3 shrink-0 bg-[var(--door)]" />
									{g}
								</li>
							))}
						</ul>
					</div>
					<div>
						<h2 className="font-display text-[1.7rem] tracking-tight">Access</h2>
						<p className="mt-3 text-ink-2">{v.access}</p>
					</div>
					<div>
						<h2 className="font-display text-[1.7rem] tracking-tight">{v.lounge.name}</h2>
						<p className="mt-3 text-ink-2">{v.lounge.body}</p>
					</div>
					<p className="flex flex-wrap gap-3">
						<Link href={`/book?venue=${slug}`} className="btn">
							Sessions at {v.short}
						</Link>
						{map ? (
							<a href={map} className="btn btn-glass" target="_blank" rel="noreferrer">
								Open in Maps
							</a>
						) : null}
					</p>
				</div>
			</section>
			<section className="wrap pb-24">
				<p className="label">The doors here</p>
				<div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{doors.map((d) => (
						<Link key={d.slug} href={`/rooms/${d.slug}`} className="group block" style={{ '--slit': d.palette.glow } as CSSProperties}>
							<span className="block aspect-[3/4] overflow-hidden rounded-[14px_14px_3px_3px] bg-night-2">
								<DoorArt sources={doorArt(d)} alt="" glow={d.palette.glow} className="h-full w-full object-cover transition duration-1000 group-hover:scale-105" />
							</span>
							<span className="slit mx-4 block" aria-hidden />
							<span className="font-display mt-4 block text-[1.5rem] tracking-tight">{d.title}</span>
							<span className="mt-1 block text-sm text-ink-3">
								{d.genre} · {d.players} players · from {formatWholePrice(d.fromPrice)}
							</span>
						</Link>
					))}
				</div>
				{workshops.length ? (
					<p className="mt-12 text-ink-2">
						Also here: {workshops.map((w) => w.title).join(' and ')}.{' '}
						<Link href="/workshops" className="link">
							See workshops
						</Link>
					</p>
				) : null}
			</section>
		</>
	);
}
