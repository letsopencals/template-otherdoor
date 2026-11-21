import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { RoomWorldProps } from '@/lib/worlds';
import { minutesLabel } from '@/lib/when';
import { SafeImg } from '@/components/ui/safe-img';
import { rakkas } from './font';
import { Bird, Canopy, Glyph, JungleDefs, Leaf } from './art';
import { Curtain, type LeafSpot } from './curtain';
import { Descent, type Layer } from './descent';
import { TempleLoop } from './hero-video';
import { Lianas, type LianaSpec } from './lianas';
import { DoorStage } from './door-stage';
import { StoneRun } from './stone-run';
import { fireflies } from './geometry';
import s from './jaguar.module.css';

const MEDIA = '/worlds/jaguar-temple';

/**
 * THE JAGUAR TEMPLE (1936). The page is one continuous descent, from the canopy to the
 * idol chamber: canopy → understory → temple face → carved steps → the hall → the sealed
 * door → the run → the chamber of gold. A plumb line on the right edge sinks with you and
 * names each layer; the colour temperature falls from humid green to torch gold.
 * Signature moments: foreground leaves that part like curtains as each layer arrives,
 * lianas that drop on load and swing to the pointer, a glyph lock on the photo-real
 * sealed door that slides open onto the golden idol, and a rolling stone across the run.
 * The booking panel sits in a carved tablet in the chamber, skinned only with --bp-*.
 */

const LAYERS: Layer[] = [
	{ id: 'jt-canopy', name: 'Canopy', depth: 0 },
	{ id: 'jt-understory', name: 'Understory', depth: 12 },
	{ id: 'jt-face', name: 'Temple face', depth: 27 },
	{ id: 'jt-steps', name: 'The steps', depth: 38 },
	{ id: 'jt-hall', name: 'The hall', depth: 51 },
	{ id: 'jt-door', name: 'Sealed door', depth: 63 },
	{ id: 'jt-run', name: 'The run', depth: 70 },
	{ id: 'jt-chamber', name: 'Chamber of gold', depth: 74 },
];

const LIANAS: LianaSpec[] = [
	{ x: 2, len: 520, seed: 3, delay: 0.15 },
	{ x: 9, len: 300, seed: 11, delay: 0.45, back: true, wide: true },
	{ x: 16, len: 430, seed: 5, delay: 0.3, wide: true },
	{ x: 27, len: 200, seed: 23, delay: 0.7, back: true, wide: true },
	{ x: 66, len: 240, seed: 31, delay: 0.6, back: true, wide: true },
	{ x: 76, len: 470, seed: 17, delay: 0.25, wide: true },
	{ x: 85, len: 330, seed: 29, delay: 0.5, back: true },
	{ x: 93, len: 580, seed: 13, delay: 0.05 },
];

/* Leaf frames, one composition per layer (the right side mirrors the left unless given). */
const HERO_FRAME: LeafSpot[] = [
	{ kind: 'monstera', seed: 4, tone: 'near', x: -2, y: 40, w: 'clamp(220px, 26vw, 420px)', r: 64, rim: 'moon' },
	{ kind: 'palm', seed: 8, tone: 'mid', x: -4, y: 96, w: 'clamp(260px, 30vw, 480px)', r: -28, wide: true },
	{ kind: 'fern', seed: 6, tone: 'near', x: -3, y: 104, w: 'clamp(240px, 30vw, 460px)', r: -14 },
	{ kind: 'monstera', seed: 9, tone: 'mid', x: 4, y: 112, w: 'clamp(200px, 22vw, 360px)', r: 38, wide: true },
];
const HERO_FRAME_R: LeafSpot[] = [
	{ kind: 'monstera', seed: 12, tone: 'near', x: -3, y: 30, w: 'clamp(220px, 25vw, 400px)', r: 78 },
	{ kind: 'fern', seed: 14, tone: 'mid', x: -4, y: 100, w: 'clamp(240px, 30vw, 460px)', r: -18, wide: true },
	{ kind: 'palm', seed: 2, tone: 'near', x: -5, y: 104, w: 'clamp(260px, 32vw, 500px)', r: -34 },
];
const UNDER_L: LeafSpot[] = [
	{ kind: 'monstera', seed: 21, tone: 'near', x: -4, y: 22, w: 'clamp(260px, 30vw, 480px)', r: 102 },
	{ kind: 'palm', seed: 22, tone: 'mid', x: -6, y: 60, w: 'clamp(300px, 34vw, 540px)', r: -6 },
	{ kind: 'monstera', seed: 23, tone: 'mid', x: 0, y: 92, w: 'clamp(240px, 27vw, 430px)', r: 70, wide: true },
	{ kind: 'fern', seed: 24, tone: 'near', x: -5, y: 108, w: 'clamp(280px, 32vw, 500px)', r: -20 },
];
const UNDER_R: LeafSpot[] = [
	{ kind: 'palm', seed: 25, tone: 'near', x: -6, y: 16, w: 'clamp(300px, 34vw, 540px)', r: 14 },
	{ kind: 'monstera', seed: 26, tone: 'mid', x: -3, y: 56, w: 'clamp(260px, 29vw, 460px)', r: 96 },
	{ kind: 'fern', seed: 27, tone: 'mid', x: -4, y: 96, w: 'clamp(280px, 32vw, 500px)', r: -10, wide: true },
];
const FACE_L: LeafSpot[] = [
	{ kind: 'fern', seed: 31, tone: 'near', x: -6, y: 30, w: 'clamp(280px, 32vw, 520px)', r: 8 },
	{ kind: 'monstera', seed: 32, tone: 'near', x: -3, y: 74, w: 'clamp(260px, 30vw, 480px)', r: 84 },
	{ kind: 'palm', seed: 33, tone: 'mid', x: -6, y: 104, w: 'clamp(300px, 36vw, 560px)', r: -24, wide: true },
];
const HALL_L: LeafSpot[] = [
	{ kind: 'monstera', seed: 41, tone: 'lit', rim: 'gold', x: -4, y: 28, w: 'clamp(240px, 28vw, 440px)', r: 96 },
	{ kind: 'fern', seed: 42, tone: 'gold', rim: 'gold', x: -5, y: 70, w: 'clamp(260px, 30vw, 480px)', r: -4, wide: true },
	{ kind: 'monstera', seed: 43, tone: 'near', rim: 'gold', x: -2, y: 104, w: 'clamp(230px, 26vw, 420px)', r: 58 },
];
const HALL_R: LeafSpot[] = [
	{ kind: 'palm', seed: 44, tone: 'gold', rim: 'gold', x: -6, y: 22, w: 'clamp(300px, 34vw, 540px)', r: 10, wide: true },
	{ kind: 'monstera', seed: 45, tone: 'lit', rim: 'gold', x: -3, y: 66, w: 'clamp(240px, 28vw, 440px)', r: 88 },
];

const FLIES_HERO = fireflies(26, 5);
const FLIES_UNDER = fireflies(34, 9);
const FLIES_CHAMBER = fireflies(22, 13);

/** Dr. Vance's three faces (sun, serpent, eye) are inlaid on steps 4–6: the second hint. */
const STEP_GLYPHS = [3, 5, 0, 1, 2, 4];

const TRIALS = [
	{ g: 2, title: 'Read the carvings', body: 'Every wall is a sentence. Learn the grammar of the glyphs before the torches gutter.' },
	{ g: 5, title: 'Balance the offerings', body: 'Gold, jade and stone on the altar scales. One wrong weight and the floor remembers.' },
	{ g: 3, title: 'Map the corridors', body: 'Two chambers, one way through. Chart it together or walk in circles.' },
	{ g: 1, title: 'Outrun the stone', body: 'It has rolled for four hundred years. Tonight it rolls for you.' },
];

export default function JaguarTemple({ room, presentation: p, photos, gameMaster, next, records, booking }: RoomWorldProps) {
	const m = p.media;
	const stills = m.stills ?? [];
	const wide = stills[0] ?? `${MEDIA}/wide.jpg`;
	const idol = stills[1] ?? `${MEDIA}/idol.jpg`;
	const door = stills[2] ?? `${MEDIA}/stone-door.jpg`;
	const shafts = stills[3] ?? `${MEDIA}/light-shafts.jpg`;
	const foliage = stills[4] ?? `${MEDIA}/layer-foliage.jpg`;
	const [b0, b1, b2, b3] = p.beats;
	const players = p.minPlayers === p.maxPlayers ? `${p.minPlayers}` : `${p.minPlayers}–${p.maxPlayers}`;
	const venue = room.venue?.name ?? 'Otherdoor Vaults';
	const story = room.description.split(/\n\s*\n/).filter(Boolean);
	const [titleSmall, titleBig] = splitTitle(room.title);

	const steps = [
		{ v: players, l: 'explorers', note: 'one price for the team' },
		{ v: String(p.gameMinutes), l: 'minutes', note: `${minutesLabel(room.visitMinutes)} with the briefing` },
		{ v: `${p.difficulty}/5`, l: 'difficulty', bar: p.difficulty },
		{ v: `${p.fear}/5`, l: 'fear', bar: p.fear, note: 'dark corners, nothing jumps' },
		{ v: `${p.minAge}+`, l: 'age', note: 'under-16s with an adult' },
		{ v: `${p.successRate}%`, l: 'get out', note: `record ${p.record}` },
	];

	return (
		<Descent layers={LAYERS} className={`${s.world} ${rakkas.variable}`} style={{ '--door': p.palette.glow } as CSSProperties}>
			<JungleDefs />

			{/* ─────────────────────────────── 0 m · The canopy */}
			<header id="jt-canopy" className={s.hero}>
				<TempleLoop src={m.loop} poster={m.poster ?? `${MEDIA}/hero-poster.jpg`} className={s.heroMedia} />
				<div className={s.heroHaze} aria-hidden />
				<div className={s.rays} aria-hidden>
					<i />
					<i />
					<i />
				</div>
				<div className={s.birds} aria-hidden>
					<Bird className={s.bird} style={{ '--y': '9%', '--t': '19s', '--o': '-4s', '--k': '1' } as CSSProperties} />
					<Bird className={s.bird} style={{ '--y': '13%', '--t': '23s', '--o': '-6s', '--k': '.7' } as CSSProperties} />
					<Bird className={s.bird} style={{ '--y': '6%', '--t': '27s', '--o': '-15s', '--k': '.55' } as CSSProperties} />
				</div>
				<Canopy className={s.canopy} />
				<Flies items={FLIES_HERO} className={s.fliesHero} />
				<Lianas items={LIANAS} />
				<Curtain left={HERO_FRAME} right={HERO_FRAME_R} className={s.heroFrame} />

				<div className={s.heroCopy}>
					<p className={s.kicker}>
						<span>Door {String(p.order || 1).padStart(2, '0')}</span>
						<span>{p.genre}</span>
						<span>{p.year || '1936'}</span>
						<span>{venue}</span>
					</p>
					<h1 className={s.title}>
						{titleSmall ? <small>{titleSmall}</small> : null}
						<span>{titleBig}</span>
					</h1>
					<p className={s.tagline}>{p.tagline}</p>
					<div className={s.heroActions}>
						<a href="#book" className={s.goldBtn}>
							Book the descent <span>from {room.fromPriceLabel}</span>
						</a>
						<a href="#jt-understory" className={s.ropeBtn}>
							Climb down
						</a>
					</div>
					<ul className={s.heroFacts}>
						<li>
							<b>{players}</b> explorers
						</li>
						<li>
							<b>{p.gameMinutes}</b> minutes
						</li>
						<li>
							<b>{p.difficulty}/5</b> difficulty
						</li>
						<li>
							<b>{p.successRate}%</b> get out
						</li>
					</ul>
				</div>
			</header>

			{/* ─────────────────────────────── −12 m · The understory */}
			<section id="jt-understory" className={s.under} data-curtain aria-labelledby="jt-under-title">
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={foliage} alt="" className={s.underFoliage} loading="lazy" decoding="async" aria-hidden />
				<div className={s.mist} aria-hidden>
					<i />
					<i />
					<i />
				</div>
				<Flies items={FLIES_UNDER} className={s.fliesUnder} />
				<div className={`wrap ${s.underGrid}`}>
					<div className={s.underStory}>
						<p className={s.layerTag}>−12 m · The understory</p>
						<div className={s.cable} aria-label="Telegram from Dr. Aurelia Vance, 14 March 1936">
							<span className={s.cableHead}>Cable · Belém relay · 14 Mar 1936 · 06:40</span>
							<span className={s.cableBody}>Found it stop seals at moonrise stop do not follow stop</span>
							<span className={s.cableSig}>Vance</span>
						</div>
						<h2 id="jt-under-title" className={s.h2}>
							{b0?.title ?? 'The telegram'}
						</h2>
						<p className={s.lede}>{b0?.body}</p>
						{story.map((para, i) => (
							<p key={i} className={s.body}>
								{para}
							</p>
						))}
					</div>
					<figure className={s.notebook}>
						<figcaption className={s.nbHead}>
							<span>Field notebook · A. Vance</span>
							<span>p. 31</span>
						</figcaption>
						<p className={s.nbHand}>
							Day thirty-one. The door has three faces and they <em>turn</em>. The carvers wrote the order on the lintel the way they wrote everything: what rises, what crawls, what watches.
						</p>
						<ol className={s.nbGlyphs} aria-label="Sketch of the three faces, in order: sun, serpent, eye">
							{[0, 1, 2].map((g, i) => (
								<li key={g}>
									<span className={s.nbNum}>{['i', 'ii', 'iii'][i]}</span>
									<Glyph i={g} gold className={s.nbGlyph} />
								</li>
							))}
						</ol>
						<p className={s.nbHand}>Rises. Crawls. Watches. Do not get it wrong twice.</p>
						<span className={s.nbStain} aria-hidden />
					</figure>
				</div>
				<Curtain left={UNDER_L} right={UNDER_R} />
			</section>

			{/* ─────────────────────────────── −27 m · The temple face */}
			<section id="jt-face" className={s.face} data-curtain aria-labelledby="jt-face-title">
				<div className={s.faceMedia} aria-hidden>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src={wide} alt="" loading="lazy" decoding="async" />
				</div>
				<span className={s.moon} aria-hidden />
				<div className={s.faceShade} aria-hidden />
				<div className={`wrap ${s.faceCopy}`}>
					<p className={s.layerTag}>−27 m · The temple face · {b1?.title ?? 'The stakes'}</p>
					<h2 id="jt-face-title" className={s.h2xl}>
						It seals at <em>moonrise</em>.
					</h2>
					<p className={s.lede}>{b1?.body}</p>
					<p className={s.body}>Roots have spent four hundred years pulling the temple back into the hill, and they have nearly finished. Vance’s rope still hangs from the top step. Nobody has used it to climb out.</p>
				</div>
				<Curtain left={FACE_L} />
			</section>

			{/* ─────────────────────────────── −38 m · The carved steps */}
			<section id="jt-steps" className={s.steps} aria-labelledby="jt-steps-title">
				<div className={`wrap ${s.stepsHead}`}>
					<p className={s.layerTag}>−38 m · The carved steps</p>
					<h2 id="jt-steps-title" className={s.h2}>
						Six steps down. Each one tells you something.
					</h2>
				</div>
				<ol className={`wrap ${s.stair}`}>
					{steps.map((st, i) => (
						<li key={st.l} className={s.step} style={{ '--i': i } as CSSProperties}>
							<Glyph i={STEP_GLYPHS[i]!} gold={i >= 3} className={s.stepGlyph} />
							<span className={s.stepValue}>{st.v}</span>
							<span className={s.stepLabel}>{st.l}</span>
							{st.bar !== undefined ? <Notches n={st.bar} label={st.l} /> : null}
							{st.note ? <span className={s.stepNote}>{st.note}</span> : null}
						</li>
					))}
				</ol>
				<div className={`wrap ${s.trials}`}>
					<div className={s.trialsIntro}>
						<p className={s.layerTag}>{b2?.title ?? 'What you’ll do'}</p>
						<p className={s.lede}>{b2?.body}</p>
					</div>
					<ul className={s.trialList}>
						{TRIALS.map((t) => (
							<li key={t.title}>
								<Glyph i={t.g} className={s.trialGlyph} />
								<b>{t.title}</b>
								<span>{t.body}</span>
							</li>
						))}
					</ul>
				</div>
			</section>

			{/* ─────────────────────────────── −51 m · The hall */}
			<section id="jt-hall" className={s.hall} data-curtain aria-labelledby="jt-hall-title">
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={shafts} alt="" className={s.hallBg} loading="lazy" decoding="async" aria-hidden />
				<div className={s.hallShade} aria-hidden />
				<div className={s.shafts} aria-hidden>
					<i />
					<i />
					<i />
					<i />
				</div>
				<div className={`wrap ${s.hallInner}`}>
					<div className={s.hallHead}>
						<p className={s.layerTag}>−51 m · The hall · {b3?.title ?? 'Inside the room'}</p>
						<h2 id="jt-hall-title" className={s.h2}>
							Built by hand, under the Cowgate.
						</h2>
						<p className={s.lede}>{b3?.body}</p>
					</div>
					{photos.length ? (
						<div className={s.arches}>
							{photos.slice(0, 3).map((src, i) => (
								<figure key={src} className={s.arch} style={{ '--i': i } as CSSProperties}>
									<SafeImg src={src} alt={`Inside the Jaguar Temple, view ${i + 1}`} fallback={<span className={s.archFallback} />} />
									<span className={s.archBeam} aria-hidden />
									<figcaption>{['The antechamber', 'The offering scales', 'The inner corridor'][i]}</figcaption>
								</figure>
							))}
						</div>
					) : null}
					<div className={s.hallFoot}>
						{gameMaster ? (
							<div className={s.guide}>
								<div className={s.medallion}>
									<SafeImg src={gameMaster.image} alt={gameMaster.name} fallback={<span className={s.initials}>{initials(gameMaster.name)}</span>} />
								</div>
								<div>
									<p className={s.layerTag}>Your guide on the radio</p>
									<p className={s.guideName}>{gameMaster.name}</p>
									<p className={s.guideTitle}>{gameMaster.title}</p>
									<p className={s.body}>{gameMaster.bio || 'She watches every game from the radio hut and talks you through when the temple gets the better of you.'}</p>
								</div>
							</div>
						) : null}
						{records.length ? (
							<div className={s.carvedNames}>
								<p className={s.layerTag}>Cut into the hall wall · fastest teams</p>
								<ol>
									{records.slice(0, 5).map((r, i) => (
										<li key={r.team}>
											<span>{['I', 'II', 'III', 'IV', 'V'][i]}</span>
											<b>{r.team}</b>
											<em>{r.time}</em>
										</li>
									))}
								</ol>
							</div>
						) : null}
					</div>
				</div>
				<Curtain left={HALL_L} right={HALL_R} />
			</section>

			{/* ─────────────────────────────── −63 m · The sealed door */}
			<DoorStage door={door} idol={idol} title="Three faces. One order." body="Turn the faces in the order Vance sketched, or skip it and push. Keep climbing down and the stone gives way regardless: the temple is old, not unreasonable." />

			{/* ─────────────────────────────── −70 m · The run */}
			<StoneRun wall={shafts}>
				<p className={s.layerTag}>−70 m · The run</p>
				<h2 id="jt-run-title" className={s.h2xl}>
					Lift it, and the floor <em>sighs</em>.
				</h2>
				<p className={s.lede}>Then something round and four tonnes heavy starts down the corridor behind you. It has done this for four hundred years. The fastest team to outrun it took {p.record || '41:07'}.</p>
			</StoneRun>

			{/* ─────────────────────────────── −74 m · The chamber of gold */}
			<section id="jt-chamber" className={s.chamber} aria-labelledby="jt-chamber-title">
				<Flies items={FLIES_CHAMBER} className={s.fliesGold} />
				<div className={`wrap ${s.chamberGrid}`}>
					<div className={s.chamberCopy}>
						<p className={s.layerTag}>−74 m · The chamber of gold</p>
						<h2 id="jt-chamber-title" className={s.h2}>
							Claim your hour in the temple.
						</h2>
						<p className={s.lede}>
							One price for the whole team, {players} explorers. Pick a night, a time and how many of you are coming down.
						</p>
						<ol className={s.itinerary}>
							<li>
								<b>15 min before</b>
								<span>
									Arrive at {venue}
									{room.venue?.address ? `, ${room.venue.address}` : ''}. Bags in the lockers, the briefing by lamplight.
								</span>
							</li>
							<li>
								<b>{p.gameMinutes} minutes</b>
								<span>The door seals behind you. Your guide is on the radio if you need her.</span>
							</li>
							<li>
								<b>After</b>
								<span>Out with the idol or carried out by the stone: team photo and a drink in the Lobby.</span>
							</li>
						</ol>
						<p className={s.wear}>
							<b>Wear</b> {p.wear}
						</p>
						<Leaf kind="monstera" seed={51} tone="gold" rim="gold" className={s.chamberLeaf} />
					</div>
					<div className={s.tablet}>
						<span className={s.tabletFrieze} aria-hidden>
							{[0, 1, 2, 3, 4, 5, 0].map((g, i) => (
								<Glyph key={i} i={g} gold={i === 3} />
							))}
						</span>
						<div className={s.tabletInner}>{booking}</div>
					</div>
				</div>
			</section>

			{/* ─────────────────────────────── Next door */}
			{next ? (
				<Link href={next.href} className={s.next} style={{ '--n': next.palette.glow } as CSSProperties}>
					<span className={s.nextTunnel} aria-hidden>
						<SafeImg src={next.cover} alt="" className={s.nextImg} fallback={null} />
						<i />
					</span>
					<span className={s.nextText}>
						<span className={s.layerTag}>Further along the Cowgate · the next door</span>
						<span className={s.nextTitle}>{next.title}</span>
						<span className={s.nextTag}>{next.tagline}</span>
						<span className={s.nextGo}>
							{next.genre} <span aria-hidden>→</span>
						</span>
					</span>
				</Link>
			) : null}
		</Descent>
	);
}

function Flies({ items, className }: { items: ReturnType<typeof fireflies>; className?: string }) {
	return (
		<div className={`${s.flies} ${className ?? ''}`} aria-hidden>
			{items.map((f, i) => (
				<i key={i} style={{ left: `${f.x}%`, top: `${f.y}%`, width: f.s, height: f.s, animationDuration: `${f.d}s, ${r2(f.d * 0.37)}s`, animationDelay: `${f.o}s, ${r2(f.o * 0.5)}s`, '--dx': `${f.dx}px`, '--dy': `${f.dy}px` } as CSSProperties} />
			))}
		</div>
	);
}

function Notches({ n, label }: { n: number; label: string }) {
	return (
		<span className={s.notches} role="img" aria-label={`${label} ${n} of 5`}>
			{Array.from({ length: 5 }, (_, i) => (
				<i key={i} data-on={i < n ? '' : undefined} />
			))}
		</span>
	);
}

const r2 = (n: number) => Math.round(n * 100) / 100;

/** "The Jaguar Temple" → ["The", "Jaguar Temple"]. */
function splitTitle(title: string): [string, string] {
	const m = /^(The)\s+(.+)$/i.exec(title);
	return m ? [m[1]!, m[2]!] : ['', title];
}

function initials(name: string) {
	return name
		.split(/\s+/)
		.map((w) => w[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();
}
