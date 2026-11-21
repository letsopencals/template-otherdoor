import Link from 'next/link';
import { getCatalogue, getRoomRanges } from '@/lib/server-data';
import { shelfRooms } from '@/lib/shelf';
import { gameMasterViews } from '@/lib/people';
import { roomSessions } from '@/lib/sessions';
import { siteConfig } from '@/lib/site-config';
import { formatWholePrice } from '@/lib/format';
import { dayLabel } from '@/lib/when';
import { LanternHero } from '@/components/home/lantern-hero';
import { CompassNeedle } from '@/components/home/compass-needle';
import { ShelfSection } from '@/components/home/shelf-section';
import { Tonight } from '@/components/home/tonight';
import { PathQuiz } from '@/components/home/path-quiz';
import { Cryptex } from '@/components/home/cryptex';
import { HallOfFame } from '@/components/home/hall-of-fame';
import { VenuePlate } from '@/components/venues/venue-plate';
import { GameMasterCard } from '@/components/people/game-master-card';
import { ChapterHead } from '@/components/ui/chapter-head';
import { FaqCards } from '@/components/ui/faq-cards';

export const revalidate = 60;

export default async function Home() {
	const [catalogue, ranges] = await Promise.all([getCatalogue(), getRoomRanges(null)]);
	const shelf = shelfRooms(catalogue);
	const renderedAt = Date.now();

	// The compass points at the next free session anywhere.
	const next = catalogue.rooms
		.map((r) => ({ r, s: roomSessions(ranges[r.slug] ?? [], { durationMin: r.durationMin, now: renderedAt })[0] }))
		.filter((x) => x.s)
		.sort((a, b) => a.s!.start - b.s!.start)[0];
	const nextLabel = next ? { label: `${shelf.find((x) => x.slug === next.r.slug)?.short ?? next.r.title}, ${dayLabel(next.s!.start)} ${next.s!.time}`, href: `/rooms/${next.r.slug}?date=${next.s!.date}&time=${next.s!.time}#book` } : null;

	const tonightRooms = catalogue.rooms.map((r) => {
		const s = shelf.find((x) => x.slug === r.slug)!;
		return { slug: r.slug, title: r.title, venueShort: s.venueShort, durationMin: r.durationMin, spine: s.palette.spine, foil: s.palette.foil, fromPrice: formatWholePrice(s.fromPrice) };
	});
	const venues = Object.entries(siteConfig.venues);
	const gms = gameMasterViews(catalogue);

	return (
		<>
			<LanternHero mapSrc={siteConfig.media.heroMap} clue="The society’s word is what every room is. Six letters." compass={<CompassNeedle next={nextLabel} />} />

			<section id="shelf" className="wrap scroll-mt-24 py-24">
				<ChapterHead n={1} label="The Shelf" title="Six volumes. Pull one out." lede="Every room is an illustrated adventure in the society’s library. Hover a spine, open the volume and walk into its world. Each one is a 60-minute game for a private team; the Cartographer’s Tomb runs 90." />
				<div className="mt-14">
					<ShelfSection shelf={shelf} />
				</div>
			</section>

			<div className="marble" aria-hidden />
			<section id="tonight" className="band-green scroll-mt-24 py-24">
				<div className="wrap">
					<ChapterHead n={2} label="Tonight’s expeditions" title="Who’s going in next?" lede="The next free sessions in every room, live. Tap a time to book it." />
					<div className="mt-12 rounded-[2px] bg-parchment p-4 text-deep-ink shadow-2xl md:p-8">
						<Tonight rooms={tonightRooms} initialRanges={ranges} renderedAt={renderedAt} />
						<p className="mt-6 text-center">
							<Link href="/book" className="plate">
								See every session
							</Link>
						</p>
					</div>
				</div>
			</section>
			<div className="marble" aria-hidden />

			<section className="wrap py-24">
				<ChapterHead n={3} label="Which room are you?" title="Chart your route." lede="Four questions, one dotted line, and an X where your team belongs." />
				<div className="mt-14">
					<PathQuiz questions={siteConfig.quiz} rooms={shelf} />
				</div>
			</section>

			<section className="band-oxblood py-24">
				<div className="wrap">
					<ChapterHead n={4} label="The Cryptex" title="A lock for the curious." lede="The word is hidden on this page. Open the cryptex and the society will reward you." />
					<div className="mt-12">
						<Cryptex word={siteConfig.cryptex.word} code={siteConfig.cryptex.code} offer={siteConfig.cryptex.offer} clues={siteConfig.cryptex.clues} />
					</div>
				</div>
			</section>

			<section className="wrap py-24">
				<ChapterHead n={5} label="The Hall of Fame" title="The fastest escapes on record." />
				<div className="mt-12">
					<HallOfFame rooms={shelf.map((r) => ({ slug: r.slug, short: r.short }))} records={siteConfig.hallOfFame} />
				</div>
			</section>

			<div className="marble" aria-hidden />
			<section className="py-24">
				<div className="wrap">
					<ChapterHead n={6} label="The two houses" title="Under the Old Town. On the Shore." />
					<div className="mt-14 grid gap-10 md:grid-cols-2">
						{venues.map(([slug, v]) => (
							<article key={slug} className="paper p-4">
								<VenuePlate kind={v.key} className="block w-full" />
								<div className="p-3 pt-6">
									<p className="engraved text-sepia">{v.key === 'vaults' ? 'Three rooms below ground' : 'Three rooms and the Workshop Hall'}</p>
									<h3 className="font-display mt-1 text-[2rem]">{v.name}</h3>
									<p className="typed mt-1 text-[0.9rem]">
										{v.address}, {v.postcode}
									</p>
									<p className="mt-4 leading-relaxed">{v.blurb}</p>
									<p className="mt-3 text-[0.95rem]">
										<b>{v.lounge.name}.</b> {v.lounge.body}
									</p>
									<p className="mt-5 flex flex-wrap gap-2">
										<Link href={`/venues/${slug}`} className="plate plate-sm">
											Visit the house
										</Link>
										<Link href={`/book?venue=${slug}`} className="plate plate-ghost plate-sm">
											Its sessions
										</Link>
									</p>
								</div>
							</article>
						))}
					</div>
				</div>
			</section>

			{gms.length ? (
				<section className="wrap pb-24">
					<ChapterHead n={7} label="The game masters" title="Your guides behind the glass." lede="Every team has a game master watching, cueing clues and sounding the final bell. Meet the society’s keepers." />
					<div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{gms.map((gm) => (
							<GameMasterCard key={gm.slug} gm={gm} />
						))}
					</div>
				</section>
			) : null}

			<section className="band-green py-24">
				<div className="wrap">
					<ChapterHead n={8} label="Parties of explorers" title="Team days, birthdays, stag and hen." />
					<div className="mt-12 grid gap-px bg-[#d9c08a]/30 sm:grid-cols-2 lg:grid-cols-4">
						{siteConfig.groups.map((g) => (
							<div key={g.key} className="bg-ink-green p-7">
								<h3 className="font-display text-[1.7rem] text-[#f1dfb2]">{g.title}</h3>
								<p className="mt-3 text-[0.95rem] leading-relaxed text-[#e1d4b4]">{g.body}</p>
							</div>
						))}
					</div>
					<p className="mt-10 text-center">
						<Link href="/groups" className="plate plate-gold">
							Plan a group visit
						</Link>
					</p>
				</div>
			</section>

			<section className="wrap max-w-4xl py-24">
				<ChapterHead n={9} label="Before you come" title="Questions explorers ask." />
				<div className="mt-12">
					<FaqCards items={siteConfig.faq.slice(0, 6)} />
				</div>
				<p className="mt-8 text-center">
					<Link href="/faq" className="underline underline-offset-4">
						All questions
					</Link>
				</p>
				<p className="typed mt-12 text-center text-[0.78rem] text-sepia">¹ The gilt letters on the shelf spell more than titles.</p>
			</section>
		</>
	);
}
