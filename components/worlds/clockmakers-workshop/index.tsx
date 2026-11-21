import type { CSSProperties } from 'react';
import type { RoomWorldProps } from '@/lib/worlds';
import { fullDateLabel, minutesLabel } from '@/lib/when';
import { SafeImg } from '@/components/ui/safe-img';
import { caprasimo } from './font';
import { WorkshopDefs } from './gear-art';
import { PocketWatch, ToolMark } from './art';
import { Hero } from './hero';
import { Compartment } from './compartment';
import { ToyShelf } from './toys';
import { MusicBox } from './music-box';
import { HiddenKey, KeyBoard } from './keys';
import { CuckooCorner } from './cuckoo';
import { HintLever } from './hint-lever';
import { GearTrain } from './gear-train';
import { gearOutline, type GearSpec } from './gears';
import s from './clockmaker.module.css';

/**
 * THE CLOCKMAKER'S WORKSHOP: the page is a mechanical toy you wind up.
 *
 * The hero is the great clock on a midnight-blue wall, stopped at twelve, with
 * a wind-up key: turn it (or just scroll) and the mainspring (spring.ts) drives
 * every gear on the page, the clock's hands and its pendulum. Below, the
 * clockmaker's cabinet: six compartments that open as their nameplate gear
 * engages (double doors, drawers, a music-box lid, a glass case). A cuckoo in
 * the corner calls each compartment as it arrives; wind-up toys walk the shelf;
 * the music-box drum spells the room's numbers in pins; five brass keys hide
 * around the page. The booking panel sits in the last compartment, skinned with
 * --bp-* only. No media exist for this world yet: hand-drawn SVG carries it,
 * the store's interiors fill the glass case, and every image falls back.
 */

const FOOT_TRAIN: GearSpec[] = [
	{ id: 'a', teeth: 40, x: 0, y: 0, tone: 'brass' },
	{ id: 'b', teeth: 16, parent: 'a', dir: -20, tone: 'steel' },
	{ id: 'c', teeth: 28, parent: 'b', dir: 30, tone: 'copper' },
	{ id: 'd', teeth: 20, parent: 'a', dir: 190, tone: 'copper' },
	{ id: 'e', teeth: 12, parent: 'd', dir: 150, tone: 'brass' },
];

const TOOLS = [
	{ kind: 'gears' as const, title: 'Mend the gear trains', body: 'Find the missing gears and fit them so the big wheel turns. Small fingers are perfect for this.' },
	{ kind: 'music' as const, title: 'Play the music box', body: 'Listen closely: the tune is hiding a secret. Everyone can hum along.' },
	{ kind: 'blueprint' as const, title: 'Follow the blueprints', body: 'Master Wren drew plans for everything. Read them together and build what they show.' },
	{ kind: 'key' as const, title: 'Help the toys find their keys', body: 'The wind-up toys have lost their keys. Find them, and they’ll show you the way.' },
];

const MEDIA = '/worlds/clockmakers-workshop';
const PLATE = ['I', 'II', 'III'];
const COG = gearOutline(10, 1.6);

export default function ClockmakersWorkshop({ room, presentation: p, photos, gameMaster, next, records, booking }: RoomWorldProps) {
	const [setup, stakes, , inside] = p.beats;
	const players = `${p.minPlayers}–${p.maxPlayers}`;
	const paragraphs = room.description.split(/\n\s*\n/).filter(Boolean);
	const venue = room.venue;
	// Store interiors first; without them, the world's own stills fill the case.
	const shots = photos.length ? photos.slice(0, 3) : [`${MEDIA}/hero-poster.jpg`, `${MEDIA}/key.jpg`, `${MEDIA}/toys.jpg`];

	return (
		<div data-cw-root className={`${s.world} ${caprasimo.variable}`} style={{ '--door': p.palette.glow } as CSSProperties}>
			<WorkshopDefs />

			<Hero
				title={room.title}
				kicker={`Door ${String(p.order).padStart(2, '0')} · ${p.genre} · ${venue?.name ?? 'Otherdoor Leith'}`}
				tagline={p.tagline}
				facts={[`Ages ${p.minAge}+`, `${players} players`, `${p.gameMinutes} minutes`, p.fear === 0 ? 'No scares' : `Fear ${p.fear}/5`]}
				cta={`Book your family’s hour · from ${room.fromPriceLabel}`}
				loop={p.media.loop ?? `${MEDIA}/hero.mp4`}
				poster={p.media.poster ?? `${MEDIA}/hero-poster.jpg`}
			/>

			<div id="cabinet" className={s.cabinet}>
				<div className={s.cabinetHead}>
					<p className={s.cabinetKicker}>Master Wren’s cabinet</p>
					<p className={s.cabinetLede}>Six compartments, one for each part of the story. Keep winding: each one opens when its little gear catches.</p>
				</div>

				{/* 1 ─ The story (double doors) */}
				<Compartment no={1} name="The story" kind="doors" title="The night every clock stopped">
					<figure className={s.panorama}>
						<SafeImg src={`${MEDIA}/wide.jpg`} alt="Master Wren at his bench under the great glass clock, showing a young visitor how the gears fit" className={s.panoramaImg} fallback={<span className={s.panoramaFallback} />} />
						<figcaption className={s.panoramaCap}>The workshop, the evening before the clocks stopped</figcaption>
					</figure>
					<div className={s.storyGrid}>
						<div className={s.watchCol}>
							<PocketWatch />
							<p className={s.watchCaption}>Master Wren’s pocket watch. Twelve o’clock, and not a tick since.</p>
							<HiddenKey n={2} className={s.key2} tilt={28} />
						</div>
						<div className={s.letter}>
							<p className={s.letterHead}>{setup?.title ?? 'The workshop'}</p>
							<p className={s.letterLead}>{setup?.body}</p>
							{paragraphs.map((t) => (
								<p key={t.slice(0, 24)}>{t}</p>
							))}
							{stakes ? (
								<div className={s.tag}>
									<span className={s.tagHole} aria-hidden />
									<p className={s.tagTitle}>{stakes.title}</p>
									<p>{stakes.body}</p>
								</div>
							) : null}
						</div>
					</div>
				</Compartment>

				{/* 2 ─ What you'll do (drawer) */}
				<Compartment no={2} name="What you’ll do" kind="drawer" title="Four jobs for small hands (and big ones)">
					<ul className={s.tools}>
						{TOOLS.map((t) => (
							<li key={t.kind} className={s.tool}>
								<ToolMark kind={t.kind} />
								<h3>{t.title}</h3>
								<p>{t.body}</p>
							</li>
						))}
					</ul>
					<ToyShelf />
					<div className={s.realToys}>
						<SafeImg src={`${MEDIA}/toys.jpg`} alt="A tin robot, a wind-up mouse and a clockwork bird in a cage on the workshop shelf" className={s.realToysImg} fallback={null} />
						<p>
							<b>The real ones are on the shelf.</b> Inside the room the toys are made of tin, felt and brass, and every one of them hides a clue.
						</p>
					</div>
				</Compartment>

				{/* 3 ─ The music box (lid): the numbers */}
				<Compartment no={3} name="The music box" kind="lid" tone="night" title="The numbers, played on a drum">
					<MusicBox players={players} minutes={String(p.gameMinutes)} age={`${p.minAge}+`} />
					<ul className={s.instruments}>
						<li>
							<span className={s.instLabel}>Difficulty</span>
							<span className={s.cogs} aria-hidden>
								{Array.from({ length: 5 }, (_, i) => (
									<svg key={i} viewBox="-10 -10 20 20" data-on={i < p.difficulty ? 'true' : undefined}>
										<path d={COG} />
										<circle r="2.6" className={s.cogHole} />
									</svg>
								))}
							</span>
							<span className={s.instValue}>{p.difficulty <= 2 ? 'Gentle' : p.difficulty === 3 ? 'Tricky' : 'Tough'} · {p.difficulty} of 5</span>
						</li>
						<li>
							<span className={s.instLabel}>Scares</span>
							<span className={s.instBig}>{p.fear === 0 ? 'None' : `${p.fear} of 5`}</span>
							<span className={s.instValue}>{p.fear === 0 ? 'Nothing jumps out. Promise.' : 'A little spooky'}</span>
						</li>
						<li>
							<span className={s.instLabel}>Families who escape</span>
							<span className={s.gauge} style={{ '--v': p.successRate } as CSSProperties} aria-hidden>
								<i />
							</span>
							<span className={s.instValue}>{p.successRate}% make it out</span>
						</li>
						<li>
							<span className={s.instLabel}>Fastest family</span>
							<span className={s.instBig}>{p.record}</span>
							<span className={s.instValue}>minutes : seconds</span>
						</li>
						<li>
							<span className={s.instLabel}>Whole visit</span>
							<span className={s.instBig}>{minutesLabel(room.visitMinutes)}</span>
							<span className={s.instValue}>with welcome and debrief</span>
						</li>
						<li>
							<span className={s.instLabel}>One price per team</span>
							<span className={s.instBig}>{room.fromPriceLabel}</span>
							<span className={s.instValue}>from, for {p.minPlayers} players</span>
						</li>
					</ul>
					<HiddenKey n={4} className={s.key4} tilt={-8} />
				</Compartment>

				{/* 4 ─ Inside (glass case) */}
				<Compartment no={4} name="Inside the workshop" kind="glass" title="A hundred moving parts, all real">
					<div className={s.insideRow}>
						<p className={s.insideLede}>{inside?.body} At its heart stands the great clock, and every puzzle in the room leads back to it.</p>
						<figure className={s.giantFig}>
							<SafeImg src={`${MEDIA}/giant-clock.jpg`} alt="The great clock’s movement: brass wheels, a heavy pendulum and a tiny mechanical bird, lit by candles" className={s.giantImg} fallback={<FrameFallback i={9} />} />
						</figure>
					</div>
					<div className={s.frames} data-count={shots.length}>
						{shots.map((src, i) => (
							<figure key={src} className={s.frameFig}>
								<div className={s.frameArch}>
									<SafeImg src={src} alt={`Inside the Clockmaker’s Workshop, plate ${PLATE[i]}`} className={s.frameImg} fallback={<FrameFallback i={i} />} />
								</div>
								<figcaption className={s.frameTag}>Plate {PLATE[i]}</figcaption>
							</figure>
						))}
						<HiddenKey n={5} className={s.key5} tilt={40} />
					</div>
				</Compartment>

				{/* 5 ─ The game master (drawer) */}
				<Compartment no={5} name="The Master of Springs" kind="drawer" title={gameMaster ? `Meet ${firstName(gameMaster.name)}, your game master` : 'Your game master'}>
					<div className={s.gmGrid}>
						{gameMaster ? (
							<div className={s.gm}>
								<div className={s.oval}>
									<SafeImg src={gameMaster.image} alt={gameMaster.name} className={s.ovalImg} fallback={<span className={s.monogram}>{initials(gameMaster.name)}</span>} />
								</div>
								<div>
									<p className={s.gmName}>{gameMaster.name}</p>
									<p className={s.gmRole}>
										<span className={s.springsBadge}>Master of Springs</span> {gameMaster.title}
									</p>
									<p className={s.gmBio}>{gameMaster.bio}</p>
									<HintLever name={firstName(gameMaster.name)} />
								</div>
							</div>
						) : null}
						<div className={s.sideStack}>
							<KeyBoard />
							{records.length ? (
								<div className={s.cards}>
									<p className={s.cardsHead}>
										The fastest families <span>(sample records)</span>
									</p>
									<ol>
										{records.map((r, i) => (
											<li key={r.team} className={s.card}>
												<span className={s.cardNo}>{i + 1}</span>
												<span className={s.cardTeam}>{r.team}</span>
												<span className={s.cardTime}>{r.time}</span>
												<span className={s.cardDate}>{fullDateLabel(`${r.date}T12:00:00Z`)}</span>
											</li>
										))}
									</ol>
								</div>
							) : null}
						</div>
					</div>
				</Compartment>

				{/* 6 ─ Booking (double doors onto the panel) */}
				<Compartment no={6} id="family-hour" name="Book your family’s hour" kind="doors" quiet title="Book your family’s hour">
					<div className={s.bookGrid}>
						<div className={s.bookNotes}>
							<figure className={s.cuckooFig}>
								<SafeImg src={`${MEDIA}/cuckoo.jpg`} alt="The carved walnut cuckoo clock with its copper bird calling" className={s.cuckooImg} fallback={null} />
								<figcaption>Sixty minutes, and the cuckoo is counting.</figcaption>
							</figure>
							<p className={s.bookLede}>Pick a day, pick a time, tell us how many of you there are. One price covers the whole team.</p>
							<dl className={s.notes2}>
								<div>
									<dt>Who it’s for</dt>
									<dd>Families with children {p.minAge} and up. {p.wear}</dd>
								</div>
								<div>
									<dt>Team</dt>
									<dd>
										{players} players, from {room.fromPriceLabel} for {p.minPlayers}
									</dd>
								</div>
								<div>
									<dt>Time</dt>
									<dd>
										{p.gameMinutes} minutes of play, {minutesLabel(room.visitMinutes)} visit in all
									</dd>
								</div>
								<div>
									<dt>Scares</dt>
									<dd>{p.fear === 0 ? 'None. Warm light, friendly toys, no surprises in the dark.' : `${p.fear} of 5`}</dd>
								</div>
								{venue ? (
									<div>
										<dt>Where</dt>
										<dd>
											<a href={venue.href} className={s.inlineLink}>
												{venue.name}
											</a>
											, {venue.address}, {venue.postcode}
										</dd>
									</div>
								) : null}
							</dl>
							<p className={s.kidsNote}>
								<b>For young clockmakers:</b> bring sharp eyes, good listening ears and your best winding hand.
							</p>
						</div>
						<div className={s.bookPanel}>{booking}</div>
					</div>
				</Compartment>

				<div className={s.cabinetFoot} aria-hidden>
					<GearTrain specs={FOOT_TRAIN} m={5} className={s.footTrain} />
				</div>
			</div>

			{next ? (
				<section className={s.next} data-cw-section="The next door" style={{ '--next': next.palette.glow, '--next-bg': next.palette.ground } as CSSProperties}>
					<SafeImg src={`${MEDIA}/layer-gears.jpg`} alt="" className={s.nextGears} fallback={null} />
					<a href={next.href} className={s.nextLink}>
						<span className={s.nextDoor} aria-hidden>
							<SafeImg src={next.cover} alt="" className={s.nextImg} fallback={<span className={s.nextFallback} />} />
							<span className={s.nextLeaf} />
						</span>
						<span className={s.nextText}>
							<span className={s.nextKicker}>The next door · {next.genre}</span>
							<span className={s.nextTitle}>{next.title}</span>
							<span className={s.nextTag}>{next.tagline}</span>
							<span className={s.nextGo}>Open it →</span>
						</span>
					</a>
				</section>
			) : null}

			<CuckooCorner />
		</div>
	);
}

function firstName(name: string) {
	return name.split(' ')[0] ?? name;
}

function initials(name: string) {
	return name
		.split(' ')
		.map((w) => w[0] ?? '')
		.join('')
		.slice(0, 2);
}

/** A drawn plate for an empty frame: a little gear study, so the case never looks broken. */
function FrameFallback({ i }: { i: number }) {
	return (
		<span className={s.frameFallback} data-i={i}>
			<svg viewBox="0 0 120 120" aria-hidden>
				<circle cx="60" cy="60" r="34" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 5" />
				<circle cx="60" cy="60" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
				<path d="M60 18 L60 30 M60 90 L60 102 M18 60 L30 60 M90 60 L102 60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
			</svg>
			<span>Come and see it for yourselves</span>
		</span>
	);
}
