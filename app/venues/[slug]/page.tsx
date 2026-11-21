import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCatalogue } from '@/lib/server-data';
import { shelfRooms } from '@/lib/shelf';
import { siteConfig, venuePresentation } from '@/lib/site-config';
import { mapHref } from '@/lib/expedition';
import { formatWholePrice } from '@/lib/format';
import { PageHead } from '@/components/pages/page-head';
import { VenuePlate } from '@/components/venues/venue-plate';
import { BookCover } from '@/components/shelf/book-cover';
import { SafeImg } from '@/components/ui/safe-img';

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
	const shelf = shelfRooms(catalogue).filter((r) => catalogue.rooms.find((x) => x.slug === r.slug)?.venue?.slug === slug);
	const workshops = catalogue.workshops.filter((w) => w.venue?.slug === slug);
	const map = mapHref(slug);
	return (
		<>
			<PageHead folio={v.key === 'vaults' ? 'House I · below the Old Town' : 'House II · on the Shore'} title={v.name} lede={v.blurb}>
				<p className="typed mt-5">
					{v.address}, {v.postcode}
				</p>
			</PageHead>
			<section className="wrap grid gap-10 py-16 lg:grid-cols-[1.2fr_1fr]">
				<div className="paper p-4">
					<SafeImg src={v.image} alt={v.name} className="block aspect-[8/5] w-full object-cover" fallback={<VenuePlate kind={v.key} className="block w-full" />} />
				</div>
				<div>
					<h2 className="font-display text-3xl">Getting there</h2>
					<ul className="mt-4 space-y-3">
						{v.gettingThere.map((g) => (
							<li key={g} className="flex gap-3">
								<span aria-hidden className="mt-2 h-2 w-2 shrink-0 rotate-45 bg-oxblood" />
								{g}
							</li>
						))}
					</ul>
					<h2 className="font-display mt-8 text-3xl">Access</h2>
					<p className="mt-3">{v.access}</p>
					<h2 className="font-display mt-8 text-3xl">{v.lounge.name}</h2>
					<p className="mt-3">{v.lounge.body}</p>
					<p className="mt-8 flex flex-wrap gap-3">
						<Link href={`/book?venue=${slug}`} className="plate">
							Sessions at {v.short}
						</Link>
						{map ? (
							<a href={map} className="plate plate-ghost" target="_blank" rel="noreferrer">
								Open in Maps
							</a>
						) : null}
					</p>
				</div>
			</section>
			<section className="band-green py-20">
				<div className="wrap">
					<p className="folio">The rooms in this house</p>
					<div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
						{shelf.map((r) => (
							<Link key={r.slug} href={`/rooms/${r.slug}`} className="group block">
								<BookCover title={r.title} genre={r.genre} volume={r.volume} palette={r.palette} src={r.cover} className="transition-transform group-hover:-translate-y-1" />
								<p className="mt-3 text-[#e1d4b4]">
									{r.players} players · from {formatWholePrice(r.fromPrice)}
								</p>
							</Link>
						))}
					</div>
					{workshops.length ? (
						<p className="mt-12 text-center text-[#e1d4b4]">
							Also here: {workshops.map((w) => w.title).join(' and ')}.{' '}
							<Link href="/workshops" className="underline">
								See workshops
							</Link>
						</p>
					) : null}
				</div>
			</section>
		</>
	);
}
