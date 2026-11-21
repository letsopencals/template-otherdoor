import type { Metadata } from 'next';
import Link from 'next/link';
import { getCatalogue } from '@/lib/server-data';
import { shelfRooms } from '@/lib/shelf';
import { roomPresentation } from '@/lib/site-config';
import { formatWholePrice } from '@/lib/format';
import { minutesLabel, roman } from '@/lib/when';
import { PageHead } from '@/components/pages/page-head';
import { ShelfSection } from '@/components/home/shelf-section';
import { BookCover } from '@/components/shelf/book-cover';
import { Meter } from '@/components/ui/meters';

export const metadata: Metadata = { title: 'The rooms', description: 'Six original adventure escape rooms in Edinburgh: jungle temple, Victorian study, desert tomb, brass submarine, Riviera heist and a clockwork workshop.' };
export const revalidate = 60;

export default async function RoomsPage() {
	const catalogue = await getCatalogue();
	const shelf = shelfRooms(catalogue);
	return (
		<>
			<PageHead folio="The society’s catalogue" title="Six volumes, two houses." lede="Every room is a private game for your team, with its own story, set and game master. Pick a spine, or read the catalogue below." />
			<section className="wrap py-16">
				<ShelfSection shelf={shelf} />
			</section>
			<section className="wrap grid gap-16 pb-24">
				{catalogue.rooms.map((r, i) => {
					const p = roomPresentation(r.slug);
					const s = shelf.find((x) => x.slug === r.slug)!;
					return (
						<article key={r.slug} className={`grid items-center gap-8 md:grid-cols-[minmax(0,320px)_1fr] ${i % 2 ? 'md:[&>*:first-child]:order-2 md:grid-cols-[1fr_minmax(0,320px)]' : ''}`}>
							<Link href={`/rooms/${r.slug}`} className="mx-auto block w-full max-w-[320px] transition-transform hover:-rotate-1">
								<BookCover title={r.title} genre={s.genre} volume={s.volume} palette={s.palette} src={r.images[0] ?? null} />
							</Link>
							<div>
								<p className="engraved text-sepia">
									Volume {roman(s.volume)} · {s.genre}
									{s.year ? `, ${s.year}` : ''} · {s.venueShort}
									{s.epic ? ' · Epic' : ''}
								</p>
								<h2 className="font-display mt-2 text-[clamp(2rem,4vw,3rem)] leading-tight">{r.title}</h2>
								<p className="mt-3 text-[1.1rem] italic text-[#3b2e1d]">{p?.tagline}</p>
								<dl className="mt-6 grid max-w-xl grid-cols-2 gap-x-8 gap-y-3 text-[0.95rem] sm:grid-cols-3">
									<div><dt className="text-sepia">Team</dt><dd className="font-bold">{s.players} players</dd></div>
									<div><dt className="text-sepia">Game</dt><dd className="font-bold">{p?.gameMinutes ?? 60} min ({minutesLabel(r.durationMin)} visit)</dd></div>
									<div><dt className="text-sepia">Age</dt><dd className="font-bold">{p?.minAge ?? 12}+</dd></div>
									<div><dt className="text-sepia">Difficulty</dt><dd><Meter kind="candle" value={s.difficulty} label="Difficulty" tone="#7a1e22" /></dd></div>
									<div><dt className="text-sepia">Fear</dt><dd><Meter kind="key" value={s.fear} label="Fear" tone="#1e3a30" /></dd></div>
									<div><dt className="text-sepia">Escape rate</dt><dd className="font-bold">{p?.successRate ?? 50}%</dd></div>
								</dl>
								<p className="mt-7 flex flex-wrap items-center gap-3">
									<Link href={`/rooms/${r.slug}`} className="plate">
										Open the volume
									</Link>
									<Link href={`/rooms/${r.slug}#book`} className="plate plate-ghost">
										Book from {formatWholePrice(s.fromPrice)}
									</Link>
								</p>
							</div>
						</article>
					);
				})}
				{!catalogue.rooms.length ? <p className="text-center">No rooms yet: add the `rooms` collection in your Opencals dashboard.</p> : null}
			</section>
		</>
	);
}
