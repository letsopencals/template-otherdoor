import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { RoomWorldProps } from '@/lib/worlds';
import { minutesLabel } from '@/lib/when';
import { SafeImg } from '@/components/ui/safe-img';
import { jungleFont } from './font';
import { JungleStage } from './stage';
import { Boulder, DoorScene, Fern, Fireflies, HeroBackdrop, InteriorArt, JungleDefs, Liana, Monstera, TabletIcon } from './art';
import s from './jungle.module.css';

/**
 * THE JAGUAR TEMPLE: a 1936 jungle expedition world.
 * Scenes: the canopy (hero) → I the expedition (telegram on a vine) → II the stakes (the stone
 * door grinds open on the idol, scroll-scrubbed) → III what you'll do (carved tablets under
 * leaves) → the run (rolling stone + stats) → IV inside the room → the guide → booking → next.
 */

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

const FALLBACK_BEATS = [
	{ title: 'The expedition', body: 'An expedition went into the canopy and never came back. You are the search party.' },
	{ title: 'The stakes', body: 'The temple seals itself at moonrise. Reach the inner chamber before it does.' },
	{ title: 'What you’ll do', body: 'Read carvings, balance offerings, map the corridors and outrun the stone.' },
	{ title: 'Inside the room', body: 'Carved stone, roots and lantern light, built by hand in our own workshop.' },
];

const LIANAS: Array<{ x: number; len: number; seed: number; delay: number; sway: number; coil?: boolean; back?: boolean }> = [
	{ x: 3, len: 520, seed: 3, delay: 0.1, sway: 6.5, coil: true },
	{ x: 11, len: 300, seed: 11, delay: 0.35, sway: 5.2, back: true },
	{ x: 19, len: 420, seed: 5, delay: 0.2, sway: 7.4 },
	{ x: 30, len: 220, seed: 23, delay: 0.55, sway: 5.8, back: true },
	{ x: 68, len: 260, seed: 31, delay: 0.5, sway: 6.1, back: true },
	{ x: 78, len: 460, seed: 17, delay: 0.15, sway: 7.0, coil: true },
	{ x: 87, len: 340, seed: 29, delay: 0.4, sway: 5.5 },
	{ x: 95, len: 560, seed: 13, delay: 0.05, sway: 6.8 },
];

const TABLETS = [
	{ kind: 'read', title: 'Read the carvings', body: 'Every wall is a sentence. Work out the grammar of the glyphs before the torches gutter.' },
	{ kind: 'balance', title: 'Balance the offerings', body: 'Gold, jade and stone on the altar scales. One wrong weight and the floor remembers.' },
	{ kind: 'map', title: 'Map the corridors', body: 'Two chambers, one way through. Chart it as a team or walk in circles.' },
	{ kind: 'run', title: 'Outrun the stone', body: 'It has rolled for four hundred years. Tonight it rolls for you.' },
] as const;

const DUST = Array.from({ length: 16 }, (_, i) => ({ x: 36 + ((i * 37) % 28), d: 1.6 + ((i * 7) % 10) / 6, o: (i * 0.23) % 2.4, w: 2 + (i % 3) }));

function Pips({ n, of = 5, kind }: { n: number; of?: number; kind: 'eye' | 'fang' }) {
	return (
		<span className={s.pips} aria-hidden>
			{Array.from({ length: of }, (_, i) => (
				<i key={i} className={kind === 'eye' ? s.pipEye : s.pipFang} data-on={i < n} />
			))}
		</span>
	);
}

const DROPS: Array<{ x: number; len: number; seed: number; delay: number }> = [
	{ x: 4, len: 260, seed: 61, delay: 0 },
	{ x: 15, len: 160, seed: 67, delay: 0.3 },
	{ x: 84, len: 200, seed: 71, delay: 0.15 },
	{ x: 95, len: 300, seed: 73, delay: 0.45 },
];

/** Lianas that drop in from the top edge of a scene when it scrolls into view. */
function DropLianas({ offset = 0 }: { offset?: number }) {
	return (
		<div className={s.dropLianas} aria-hidden>
			{DROPS.map((l, i) => (
				<div key={l.seed} className={s.dropLiana} style={{ left: `${(l.x + offset) % 100}%`, '--delay': `${l.delay}s`, '--sw': `${5 + i}s` } as CSSProperties}>
					<div className={s.lianaSway}>
						<Liana len={l.len} seed={l.seed + offset} coil={i % 2 === 0} />
					</div>
				</div>
			))}
		</div>
	);
}

/** Place a monstera by its stem point (x, y inside the parent), its width and blade angle. */
function leafAt(x: string, y: string, w: string, angle: number, delay = 0): CSSProperties {
	return { left: `calc(${x} - ${w} / 2)`, top: `calc(${y} - ${w} * 1.5)`, width: w, rotate: `${angle}deg`, animationDelay: `${delay}s` };
}

function initials(name: string) {
	return name
		.split(/\s+/)
		.map((w) => w[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();
}

export default function JaguarTempleWorld({ room, presentation: p, cover, photos, gameMaster, next, records, booking }: RoomWorldProps) {
	const beat = (i: number) => p.beats[i] ?? FALLBACK_BEATS[i]!;
	const vol = ROMAN[p.volume] ?? String(p.volume);
	const players = p.minPlayers === p.maxPlayers ? `${p.minPlayers}` : `${p.minPlayers}–${p.maxPlayers}`;
	const nextStyle = next ? ({ '--n-ground': next.palette.ground, '--n-ink': next.palette.ink, '--n-accent': next.palette.accent } as CSSProperties) : undefined;

	return (
		<JungleStage className={`${s.world} ${jungleFont.variable}`}>
			<JungleDefs />

			{/* ───────────── The canopy (hero) ───────────── */}
			<section className={s.hero} data-anim data-scrub="out" aria-labelledby="jt-title">
				<HeroBackdrop />
				<div className={s.rays} aria-hidden>
					<span />
					<span />
					<span />
					<span />
					<span />
				</div>
				<div className={s.mist} aria-hidden>
					<span />
					<span />
					<span />
				</div>
				<Fireflies />
				<div className={s.lianas} aria-hidden>
					{LIANAS.map((l) => (
						<div key={l.seed} className={s.liana} data-back={l.back ? 'true' : undefined} style={{ left: `${l.x}%`, '--delay': `${l.delay}s`, '--sw': `${l.sway}s` } as CSSProperties}>
							<div className={s.lianaSway}>
								<Liana len={l.len} seed={l.seed} coil={l.coil} />
							</div>
						</div>
					))}
				</div>
				<div className={s.leavesL} aria-hidden>
					<div className={s.partL}>
						<Monstera className={s.leaf} dark style={leafAt('0%', '14%', 'min(19vw, 270px)', 116)} />
						<Monstera className={s.leaf} style={leafAt('-1%', '58%', 'min(23vw, 320px)', 74, -3)} />
						<Fern className={s.fern} dark style={{ left: '-3%', bottom: '-3%', width: 'min(34vw, 440px)', rotate: '-6deg' }} />
						<Monstera className={s.leaf} style={leafAt('5%', '108%', 'min(17vw, 240px)', 38, -6)} />
					</div>
				</div>
				<div className={s.leavesR} aria-hidden>
					<div className={s.partR}>
						<Monstera className={s.leaf} dark style={leafAt('100%', '10%', 'min(20vw, 280px)', -118)} />
						<Monstera className={s.leaf} style={leafAt('101%', '54%', 'min(23vw, 330px)', -78, -4)} />
						<Fern className={s.fern} variant={1} dark style={{ right: '-3%', bottom: '-3%', width: 'min(34vw, 440px)', rotate: '6deg', scale: '-1 1' }} />
						<Monstera className={s.leaf} style={leafAt('95%', '108%', 'min(17vw, 240px)', -36, -2)} />
					</div>
				</div>

				<div className={s.heroCopy}>
					<p className={s.kicker}>
						Volume {vol} · {p.genre}
						{p.year ? `, ${p.year}` : ''}
					</p>
					<h1 id="jt-title" className={s.title}>
						{room.title}
					</h1>
					<p className={s.tagline}>{p.tagline}</p>
					<ul className={s.facts}>
						<li>{players} explorers</li>
						<li>{p.gameMinutes} min</li>
						<li>Difficulty {p.difficulty}/5</li>
						<li>Ages {p.minAge}+</li>
					</ul>
					<div className={s.ctas}>
						<a href="#book" className={s.btnGold}>
							Book the expedition · from {room.fromPriceLabel}
						</a>
						<a href="#jt-story" className={s.btnGhost}>
							Enter the temple
						</a>
					</div>
				</div>
				<a href="#jt-story" className={s.cue} aria-label="Scroll into the story">
					<span>Into the canopy</span>
					<i />
				</a>
			</section>

			{/* ───────────── I · The expedition ───────────── */}
			<section id="jt-story" className={`${s.scene} ${s.expedition}`} data-scene aria-labelledby="jt-s1">
				<Monstera className={s.edgeLeaf} dark style={{ left: '-120px', top: '-40px', rotate: '140deg' }} />
				<Monstera className={s.edgeLeaf} dark style={{ right: '-140px', bottom: '-80px', rotate: '-30deg' }} />
				<div className="wrap">
					<div className={s.split}>
						<div>
							<p className={s.chapter}>
								<span className={s.chapterNum}>I</span> The story
							</p>
							<h2 id="jt-s1" className={s.h2}>
								{beat(0).title}
							</h2>
							<p className={s.lead}>{beat(0).body}</p>
							{room.description ? <p className={s.body}>{room.description}</p> : null}
							{cover ? (
								<figure className={s.coverPlate}>
									<SafeImg src={cover} alt={`${room.title}, the cover of volume ${vol}`} fallback={<span className={s.coverFallback} />} />
									<figcaption className={s.coverBand} aria-hidden>
										<small>Volume {vol}</small>
										<b>{room.title}</b>
									</figcaption>
								</figure>
							) : null}
						</div>
						<div className={s.hangWrap} aria-hidden>
							<div className={s.hang}>
								<div className={s.hangVine}>
									<Liana len={200} seed={44} />
								</div>
								<div className={s.telegram}>
									<p className={s.telegramHead}>
										<span>Telegram</span>
										<span>Canopy station · {p.year || '1936'}</span>
									</p>
									<p className={s.strip}>FOUND IT STOP</p>
									<p className={s.strip}>DO NOT FOLLOW STOP</p>
									<p className={s.strip}>THE DOOR CLOSES AT MOONRISE</p>
									<p className={s.telegramSign}>— A.V.</p>
									<span className={s.telegramStamp}>Received</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ───────────── II · The stakes: the door ───────────── */}
			<section className={s.door} data-scrub="pin" data-anim aria-labelledby="jt-s2">
				<div className={s.doorSticky}>
					<div className={s.doorStage}>
						<DoorScene />
						<div className={s.dust} aria-hidden>
							{DUST.map((d, i) => (
								<span key={i} style={{ left: `${d.x}%`, width: d.w, height: d.w, '--d': `${d.d}s`, '--o': `-${d.o}s` } as CSSProperties} />
							))}
						</div>
					</div>
					<p className={s.doorHint} aria-hidden>
						Keep scrolling. The stone is moving.
					</p>
					<div className={s.doorCopy}>
						<p className={s.chapter}>
							<span className={s.chapterNum}>II</span> {beat(1).title}
						</p>
						<h2 id="jt-s2" className={s.h2}>
							{beat(1).body}
						</h2>
					</div>
				</div>
			</section>

			{/* ───────────── III · What you'll do ───────────── */}
			<section className={`${s.scene} ${s.tabletsScene}`} data-scene data-anim aria-labelledby="jt-s3">
				<DropLianas />
				<Fireflies count={10} />
				<div className={`wrap ${s.above}`}>
					<div className={s.sceneHead}>
						<p className={s.chapter}>
							<span className={s.chapterNum}>III</span> The trials
						</p>
						<h2 id="jt-s3" className={s.h2}>
							{beat(2).title}
						</h2>
						<p className={s.lead}>{beat(2).body}</p>
					</div>
					<ol className={s.tablets}>
						{TABLETS.map((t, i) => (
							<li key={t.kind} className={s.tablet} style={{ '--i': `${0.15 + i * 0.22}s` } as CSSProperties}>
								<TabletIcon kind={t.kind} />
								<h3>{t.title}</h3>
								<p>{t.body}</p>
								<span className={s.tabletNum} aria-hidden>
									{ROMAN[i + 1]}
								</span>
								<span className={s.tabletLeaf} aria-hidden>
									<Monstera style={{ width: '150%', rotate: `${i % 2 ? -24 : 24}deg` }} />
								</span>
							</li>
						))}
					</ol>
				</div>
			</section>

			{/* ───────────── The run: the rolling stone + the stats ───────────── */}
			<section className={s.run} data-anim aria-labelledby="jt-run">
				<div className="wrap">
					<p className={s.chapter}>
						<span className={s.chapterNum}>✦</span> The expedition at a glance
					</p>
					<h2 id="jt-run" className={s.h2}>
						{p.gameMinutes} minutes. One corridor. A very old stone.
					</h2>
					<dl className={s.stats}>
						<div className={s.stat}>
							<dt>Explorers</dt>
							<dd>{players}</dd>
						</div>
						<div className={s.stat}>
							<dt>In the temple</dt>
							<dd>{p.gameMinutes} min</dd>
						</div>
						<div className={s.stat}>
							<dt>Difficulty</dt>
							<dd>
								{p.difficulty}/5 <Pips n={p.difficulty} kind="eye" />
							</dd>
						</div>
						<div className={s.stat}>
							<dt>Fear</dt>
							<dd>
								{p.fear}/5 <Pips n={p.fear} kind="fang" />
							</dd>
						</div>
						<div className={s.stat}>
							<dt>Age</dt>
							<dd>{p.minAge}+</dd>
						</div>
						<div className={s.stat}>
							<dt>Escape rate</dt>
							<dd>{p.successRate}%</dd>
						</div>
						{p.record ? (
							<div className={s.stat}>
								<dt>Record</dt>
								<dd>{p.record}</dd>
							</div>
						) : null}
					</dl>
				</div>
				<div className={s.corridor} data-scrub="pass" aria-hidden>
					<div className={s.corridorWall} />
					{[18, 50, 82].map((x) => (
						<span key={x} className={s.torch} style={{ left: `${x}%` }}>
							<i />
						</span>
					))}
					<div className={s.corridorFloor} />
					<div className={s.boulderTrack}>
						<span className={s.trail} />
						<Boulder className={s.boulder} />
					</div>
				</div>
			</section>

			{/* ───────────── IV · Inside the room ───────────── */}
			<section className={`${s.scene} ${s.inside}`} data-scene data-anim aria-labelledby="jt-s4">
				<DropLianas offset={7} />
				<div className={`wrap ${s.above}`}>
					<div className={s.insideGrid}>
						<div>
							<p className={s.chapter}>
								<span className={s.chapterNum}>IV</span> The set
							</p>
							<h2 id="jt-s4" className={s.h2}>
								{beat(3).title}
							</h2>
							<p className={s.lead}>{beat(3).body}</p>
							{room.venue ? (
								<p className={s.body}>
									At <Link href={room.venue.href}>{room.venue.name}</Link>, {room.venue.address}.
								</p>
							) : null}
						</div>
						<div className={photos.length > 1 ? s.photoGrid : s.photoOne}>
							{(photos.length ? photos.slice(0, 3) : [null]).map((src, i) => (
								<figure key={src ?? i} className={s.photo}>
									<SafeImg src={src} alt={`Inside ${room.title}`} fallback={<InteriorArt variant={(i % 3) as 0 | 1 | 2} />} />
								</figure>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* ───────────── V · Your guide + the expedition log ───────────── */}
			{gameMaster || records.length ? (
				<section className={`${s.scene} ${s.guide}`} data-scene aria-labelledby="jt-s5">
					<div className="wrap">
						<div className={s.guideGrid}>
							{gameMaster ? (
								<div className={s.guideCard}>
									<div className={s.medallion}>
										<SafeImg src={gameMaster.image} alt={gameMaster.name} fallback={<span className={s.initials}>{initials(gameMaster.name)}</span>} />
									</div>
									<div>
										<p className={s.chapter}>
											<span className={s.chapterNum}>V</span> Your guide
										</p>
										<h2 id="jt-s5" className={s.h2}>
											{gameMaster.name}
										</h2>
										<p className={s.guideTitle}>{gameMaster.title}</p>
										{gameMaster.bio ? <p className={s.body}>{gameMaster.bio}</p> : null}
									</div>
								</div>
							) : (
								<h2 id="jt-s5" className={s.h2}>
									The expedition log
								</h2>
							)}
							{records.length ? (
								<div className={s.log}>
									<p className={s.logHead}>Fastest out with the idol</p>
									<ol>
										{records.map((r) => (
											<li key={r.team + r.date}>
												<span className={s.logTeam}>{r.team}</span>
												<span className={s.logTime}>{r.time}</span>
											</li>
										))}
									</ol>
								</div>
							) : null}
						</div>
					</div>
				</section>
			) : null}

			{/* ───────────── Booking ───────────── */}
			<section className={s.book} aria-labelledby="jt-book">
				<Fern className={s.bookFern} dark />
				<Fern className={s.bookFernR} variant={1} dark />
				<div className="wrap">
					<div className={s.bookGrid}>
						<div className={s.bookCopy}>
							<p className={s.chapter}>
								<span className={s.chapterNum}>✦</span> Join the expedition
							</p>
							<h2 id="jt-book" className={s.h2}>
								Choose your night. Bring your party.
							</h2>
							<ul className={s.bookList}>
								<li>
									<b>{minutesLabel(room.visitMinutes)} visit.</b> Briefing in kit, {p.gameMinutes} minutes in the temple, then photos and the debrief.
								</li>
								<li>
									<b>{players} explorers,</b> from {room.fromPriceLabel} for the whole party. The room is yours alone.
								</li>
								{room.venue ? (
									<li>
										<b>{room.venue.name}.</b> {room.venue.address}, {room.venue.postcode}.
									</li>
								) : null}
								<li>
									<b>What to wear.</b> {p.wear}
								</li>
							</ul>
						</div>
						<div className={s.panelFrame}>
							<span className={s.frameCorner} data-c="tl" aria-hidden />
							<span className={s.frameCorner} data-c="tr" aria-hidden />
							<span className={s.frameCorner} data-c="bl" aria-hidden />
							<span className={s.frameCorner} data-c="br" aria-hidden />
							{booking}
						</div>
					</div>
				</div>
			</section>

			{/* ───────────── Next volume ───────────── */}
			{next ? (
				<Link href={next.href} className={s.next} style={nextStyle} data-anim>
					<Monstera className={s.nextLeafL} dark />
					<Monstera className={s.nextLeafR} dark />
					{next.cover ? (
						<span className={s.nextCover}>
							<SafeImg src={next.cover} alt="" />
						</span>
					) : null}
					<span className={s.nextInner}>
						<span className={s.nextKicker}>The path continues · Next volume · {next.genre}</span>
						<span className={s.nextTitle}>{next.title}</span>
						{next.tagline ? <span className={s.nextTag}>{next.tagline}</span> : null}
						<span className={s.nextGo}>Open the next volume →</span>
					</span>
				</Link>
			) : null}
		</JungleStage>
	);
}
