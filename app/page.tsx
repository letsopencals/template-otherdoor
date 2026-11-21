import Link from 'next/link';
import type { CSSProperties } from 'react';
import { getCatalogue, getRoomRanges } from '@/lib/server-data';
import { doorRooms } from '@/lib/doors';
import { gameMasterViews } from '@/lib/people';
import { siteConfig } from '@/lib/site-config';
import { formatWholePrice } from '@/lib/format';
import { doorArt } from "@/components/doors/door-sources";
import { CorridorHero } from '@/components/home/corridor-hero';
import { Tonight } from '@/components/home/tonight';
import { Keypad } from '@/components/home/keypad';
import { WhichDoor } from '@/components/home/which-door';
import { Flashlight } from '@/components/home/flashlight';
import { HallOfFame } from '@/components/home/hall-of-fame';
import { GameMasterCard } from '@/components/people/game-master-card';
import { SectionHead } from '@/components/ui/section-head';
import { FaqCards } from '@/components/ui/faq-cards';
import { SafeImg } from '@/components/ui/safe-img';
import { Lamp } from '@/components/ui/lamp';
import { ArrowIcon } from '@/components/shell/icons';
import s from '@/components/home/home.module.css';

export const revalidate = 60;

export default async function Home() {
	const [catalogue, ranges] = await Promise.all([getCatalogue(), getRoomRanges(null)]);
	const doors = doorRooms(catalogue);
	const renderedAt = Date.now();
	const tonightRooms = doors.map((d) => ({ slug: d.slug, number: d.number, title: d.title, venueShort: d.venueShort, durationMin: catalogue.rooms.find((r) => r.slug === d.slug)?.durationMin ?? 90, glow: d.palette.glow, fromPrice: formatWholePrice(d.fromPrice), art: doorArt(d) }));
	const venues = Object.entries(siteConfig.venues);
	const gms = gameMasterViews(catalogue);
	const k = siteConfig.keypad;

	return (
		<>
			<CorridorHero doors={doors} />

			<Lamp id="tonight" className="section scroll-mt-24" aria-labelledby="tonight-title">
				<div className="wrap">
					<SectionHead n="01" label="Tonight" id="tonight-title" title="Who goes in next?" lede="The next free sessions in every room, live. Tap a time and it opens in that room’s booking panel." />
					<div className="mt-12">
						<Tonight rooms={tonightRooms} initialRanges={ranges} renderedAt={renderedAt} />
					</div>
					<p className="mt-8">
						<Link href="/book" className="btn btn-glass">
							Every session, every room <ArrowIcon />
						</Link>
					</p>
				</div>
			</Lamp>

			<Lamp className="section" style={{ '--pool-x': '20%' } as CSSProperties}>
				<div className="wrap">
					<SectionHead n="02" label="How it works" title="Three steps to the other side." />
					<ol className={s.steps}>
						{siteConfig.steps.map((st, i) => (
							<li key={st.title} className={s.step}>
								<span className={s.stepNum}>{String(i + 1).padStart(2, '0')}</span>
								<h3>{st.title}</h3>
								<p>{st.body}</p>
							</li>
						))}
					</ol>
				</div>
			</Lamp>

			<Lamp id="which-door" className="section scroll-mt-24" style={{ '--pool-x': '75%' } as CSSProperties}>
				<div className="wrap">
					<SectionHead n="03" label="Which door is yours?" title="Four questions. One door opens." lede="Answer honestly. The light under each door shows how close it is to being yours." />
					<div className="mt-14">
						<WhichDoor questions={siteConfig.quiz} doors={doors} />
					</div>
				</div>
			</Lamp>

			<section className="section pt-0" aria-label="The dark room">
				<div className="wrap">
					<Flashlight lines={['Every room has a secret.', 'Most teams walk straight past it.', 'Bring a torch.']} hidden={['the keypad wants a year', 'the door furthest from tonight', 'it is written on the door']} />
				</div>
			</section>

			<Lamp id="keypad" className="section pt-0 scroll-mt-24">
				<div className="wrap">
					<SectionHead n="04" label="The lock" title="A lock for the curious." lede="Some locks you open with a key. This one you open with your eyes." />
					<div className="mt-14">
						<Keypad code={k.code} reward={k.reward} offer={k.offer} clues={k.clues} />
					</div>
				</div>
			</Lamp>

			<Lamp className="section" style={{ '--pool-x': '30%' } as CSSProperties}>
				<div className="wrap">
					<SectionHead n="05" label="Two venues" title="Under the Old Town. On the Shore." lede="Each venue has three rooms and a Lobby: a bar for the briefing, the team photo and the post-mortem." />
					<div className={s.venues}>
						{venues.map(([slug, v]) => (
							<article key={slug} className={s.venue}>
								<Link href={`/venues/${slug}`} className={s.venuePhoto}>
									<SafeImg src={v.image} alt={`${v.name}, ${v.address}`} className={s.venueImg} fallback={<span className={s.venueFallback} />} />
									<span className={s.venueKicker}>{v.kicker}</span>
								</Link>
								<h3>{v.name}</h3>
								<p className="mono mt-1 text-[0.8rem] text-ink-3">
									{v.address}, {v.postcode}
								</p>
								<p className="mt-4 leading-relaxed text-ink-2">{v.blurb}</p>
								<p className="mt-5 flex flex-wrap gap-2">
									<Link href={`/venues/${slug}`} className="btn btn-sm">
										The venue
									</Link>
									<Link href={`/book?venue=${slug}`} className="btn btn-glass btn-sm">
										Its sessions
									</Link>
								</p>
							</article>
						))}
					</div>
				</div>
			</Lamp>

			{gms.length ? (
				<Lamp className="section pt-0">
					<div className="wrap">
						<SectionHead n="06" label="Game masters" title="Someone is always watching." lede="Every game has a game master behind the glass: cueing clues, playing the voices, opening the last door." />
						<div className={s.gms}>
							{gms.map((gm) => (
								<GameMasterCard key={gm.slug} gm={gm} />
							))}
						</div>
					</div>
				</Lamp>
			) : null}

			<Lamp className="section pt-0">
				<div className="wrap">
					<SectionHead n="07" label="Hall of Fame" title="The fastest escapes." lede="Sample records for this template. Your venue’s real times go here." />
					<div className="mt-12">
						<HallOfFame doors={doors.map((d) => ({ slug: d.slug, title: d.title, glow: d.palette.glow }))} records={siteConfig.hallOfFame} />
					</div>
				</div>
			</Lamp>

			<Lamp className="section pt-0">
				<div className="wrap">
					<div className={s.groups}>
						<div className={s.groupsPhoto}>
							<SafeImg src={siteConfig.media.lobby} alt="The Lobby at Otherdoor: a bar with velvet banquettes and a row of doors" className={s.groupsImg} fallback={<span className={s.venueFallback} />} />
						</div>
						<div>
							<SectionHead stack n="08" label="Groups" title="Team days, birthdays, stag and hen." />
							<div className={s.groupList}>
								{siteConfig.groups.map((g) => (
									<div key={g.key} className={s.group}>
										<h3>{g.title}</h3>
										<p>{g.body}</p>
									</div>
								))}
							</div>
							<p className="mt-8">
								<Link href="/groups" className="btn">
									Plan a group visit
								</Link>
							</p>
						</div>
					</div>
				</div>
			</Lamp>

			<Lamp className="section pt-0">
				<div className="wrap max-w-[1000px]">
					<SectionHead n="09" label="Before you come" title="Questions people ask." />
					<div className="mt-10">
						<FaqCards items={siteConfig.faq.slice(0, 6)} />
					</div>
					<p className="mt-8 flex flex-wrap items-center justify-between gap-4">
						<Link href="/faq" className="link">
							All questions
						</Link>
						<span className="mono text-[0.74rem] text-ink-3">PS. The keypad wants four digits. Look at the doors.</span>
					</p>
				</div>
			</Lamp>
		</>
	);
}
