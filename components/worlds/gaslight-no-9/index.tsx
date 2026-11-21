import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import type { RoomWorldProps } from '@/lib/worlds';
import { minutesLabel } from '@/lib/when';
import { SafeImg } from '@/components/ui/safe-img';
import { gaslightFont } from './font';
import { GaslightStage } from './stage';
import { Lens } from './lens';
import { RedStrings } from './red-strings';
import { Engraving, GasLamp, GaslightDefs, KeySketch, MagnifierPip, ProfessorSketch, StreetScene, StudyArt, WatchSketch } from './art';
import s from './gaslight.module.css';

/**
 * THE GASLIGHT AFFAIR AT NO. 9: an 1891 Victorian detective world.
 * Scenes: the street in fog and rain (hero) → I the case file (typed, stamped) → II the evening
 * paper under a magnifying glass → III the evidence board (cards pin themselves, red string pulls
 * taut; the particulars of the case live on it) → IV the study through rain on the window →
 * V the inspector's calling card + register → booking (a case folder) → next volume.
 */

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

const FALLBACK_BEATS = [
	{ title: 'The case', body: 'A study locked from the inside, and nobody in it.' },
	{ title: 'The stakes', body: 'The inspector arrives within the hour and wants a name.' },
	{ title: 'What you’ll do', body: 'Read the evidence, test the alibis and name the culprit.' },
	{ title: 'Inside the room', body: 'A gaslit Victorian study, rebuilt drawer by drawer.' },
];

/** Red string: pairs of pin indexes (cards in DOM order). */
const PAIRS: Array<[number, number]> = [
	[0, 2],
	[1, 2],
	[0, 5],
	[2, 4],
	[4, 3],
	[5, 6],
	[6, 8],
	[3, 8],
];

function initials(name: string) {
	return name
		.split(/\s+/)
		.map((w) => w[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();
}

function Typed({ label, value, d }: { label: string; value: string; d: number }) {
	const line = `${label.padEnd(10, '.')} ${value}`;
	return (
		<span className={s.typeLine} style={{ '--n': line.length, '--d': `${d}s` } as CSSProperties}>
			{line}
		</span>
	);
}

/** The evening paper. Rendered twice: readable, and magnified inside the lens (hidden ink shows). */
function Newspaper({ magnified = false, deck, year }: { magnified?: boolean; deck: string; year: string }) {
	return (
		<div className={`${s.paper} ${magnified ? s.magnified : ''}`}>
			<p className={s.paperTop}>
				<span>No. 4,117</span>
				<span>Edinburgh, Wednesday 4 November {year || '1891'}</span>
				<span>Price One Penny</span>
			</p>
			<p className={s.masthead}>The Edinburgh Evening Lantern</p>
			<p className={s.paperRule} />
			<p className={s.headline}>Inventor vanishes from locked study</p>
			<p className={s.deck}>{deck}</p>
			<div className={s.columns}>
				<p>
					<b>A door bolted from within.</b> The household at No. 9 Heriot Row was roused before seven by the housekeeper, who found the study door bolted, the lamp still burning and the professor’s chair empty. The window was latched. The chimney, a constable remarked, would not admit a cat.{' '}
					<span className={s.hiddenInk}>The study clock runs eleven minutes fast.</span>
				</p>
				<figure className={s.paperFig}>
					<Engraving />
					<figcaption>No. 9, as it stood on Tuesday evening.</figcaption>
				</figure>
				<p>
					<b>The professor’s inventions.</b> Among the papers on the desk were drawings for a gas regulator, a clockwork cipher and a lock “that answers only to its maker”. None has been found in working order. His assistant declined to comment. <span className={s.hiddenInk}>Who read the gas meter on Tuesday?</span>
				</p>
				<p>
					<b>Fog expected.</b> The observatory on Calton Hill reports no change in the weather, and advises lamplighters to begin their rounds an hour early until further notice.
				</p>
				<p>
					<b>Callers at the house.</b> A neighbour recalls a cab at a quarter to midnight and a gentleman in a grey coat who did not ring. The cabman has not come forward. <span className={s.hiddenInk}>Third drawer: two bottoms.</span>
				</p>
				<div className={s.adverts}>
					<p>
						<b>QUILL’S PATENT GAS REGULATOR.</b> Saves one shilling in five. Of all good ironmongers.
					</p>
					<p>
						<b>LOST,</b> a brass key of unusual pattern. Reward on return to No. 9. <span className={s.hiddenInk}>Q. The cipher is the date. A.</span>
					</p>
					<p>
						<b>MRS. HALDANE’S REGISTRY</b> for respectable domestic servants. George Street.
					</p>
				</div>
			</div>
		</div>
	);
}

function Card({ i, x, y, r, wide, children, tone }: { i: number; x: string; y: string; r: number; wide?: boolean; tone?: 'paper' | 'index' | 'photo' | 'accuse'; children: ReactNode }) {
	return (
		<article className={`${s.card} ${wide ? s.cardWide : ''}`} data-tone={tone ?? 'index'} style={{ '--x': x, '--y': y, '--r': `${r}deg`, '--d': `${0.12 + i * 0.14}s` } as CSSProperties}>
			<span className={s.pin} data-pin aria-hidden />
			{children}
		</article>
	);
}

export default function GaslightWorld({ room, presentation: p, cover, photos, gameMaster, next, records, booking }: RoomWorldProps) {
	const beat = (i: number) => p.beats[i] ?? FALLBACK_BEATS[i]!;
	const vol = ROMAN[p.volume] ?? String(p.volume);
	const players = p.minPlayers === p.maxPlayers ? `${p.minPlayers}` : `${p.minPlayers}–${p.maxPlayers}`;
	const panes = photos.length ? photos.slice(0, 3) : [null, null, null];
	const nextStyle = next ? ({ '--n-ground': next.palette.ground, '--n-ink': next.palette.ink, '--n-accent': next.palette.accent } as CSSProperties) : undefined;

	return (
		<GaslightStage className={`${s.world} ${gaslightFont.variable}`}>
			<GaslightDefs />

			{/* ───────────── The street (hero) ───────────── */}
			<section className={s.hero} data-anim aria-labelledby="gl-title">
				<StreetScene />
				<div className={s.lampWrap} aria-hidden>
					<span className={s.halo} />
					<GasLamp />
				</div>
				<div className={s.fog} aria-hidden>
					<span />
					<span />
					<span />
					<span />
				</div>
				<div className={s.rain} aria-hidden>
					<span />
					<span />
				</div>
				<div className={s.heroCopy}>
					<p className={s.kicker}>
						<span>Volume {vol}</span>
						<span>
							{p.genre}
							{p.year ? `, ${p.year}` : ''}
						</span>
					</p>
					<h1 id="gl-title" className={s.title}>
						{room.title}
					</h1>
					<p className={s.tagline}>{p.tagline}</p>
					<dl className={s.heroMeta}>
						<div>
							<dt>Detectives</dt>
							<dd>{players}</dd>
						</div>
						<div>
							<dt>On the case</dt>
							<dd>{p.gameMinutes} min</dd>
						</div>
						<div>
							<dt>Difficulty</dt>
							<dd className={s.pips} aria-label={`${p.difficulty} of 5`}>
								{[1, 2, 3, 4, 5].map((n) => (
									<MagnifierPip key={n} on={n <= p.difficulty} />
								))}
							</dd>
						</div>
					</dl>
					<div className={s.ctas}>
						<a href="#book" className={s.btnAmber}>
							Take the case · from {room.fromPriceLabel}
						</a>
						<a href="#gl-case" className={s.btnLine}>
							Open the file
						</a>
					</div>
				</div>
			</section>

			{/* ───────────── I · The case file ───────────── */}
			<section id="gl-case" className={s.dossierScene} data-scene aria-labelledby="gl-s1">
				<div className="wrap">
					<header className={s.sceneHead}>
						<p className={s.folio}>
							<span>I</span> Case file
						</p>
						<h2 id="gl-s1" className={s.h2}>
							{beat(0).title}
						</h2>
						<p className={s.lead}>{beat(0).body}</p>
					</header>
					<div className={s.folder}>
						<span className={s.folderTab} aria-hidden>
							No. 9 · Confidential
						</span>
						<div className={s.folderLeft}>
							<figure className={s.exhibit}>
								<span className={s.clip} aria-hidden />
								<SafeImg src={cover} alt={`${room.title}: the case, as illustrated`} fallback={<ProfessorSketch />} />
								<figcaption>Exhibit A</figcaption>
							</figure>
						</div>
						<div className={s.folderRight}>
							<p className={s.typed}>
								<Typed label="CASE" value="No. 9, HERIOT ROW" d={0.3} />
								<Typed label="FILED" value={p.year || '1891'} d={1.3} />
								<Typed label="SUBJECT" value="THE PROFESSOR, MISSING" d={1.9} />
								<Typed label="DOOR" value="LOCKED FROM WITHIN" d={3.1} />
								<Typed label="STATUS" value="UNSOLVED" d={4.1} />
							</p>
							{room.description ? <p className={s.typedBody}>{room.description}</p> : null}
							<span className={s.stamp} aria-hidden>
								Unsolved
							</span>
						</div>
					</div>
				</div>
			</section>

			{/* ───────────── II · The evening paper ───────────── */}
			<section className={s.pressScene} data-scene aria-labelledby="gl-s2">
				<div className="wrap">
					<div className={s.pressGrid}>
						<div>
							<p className={s.folio}>
								<span>II</span> The evening paper
							</p>
							<h2 id="gl-s2" className={s.h2}>
								{beat(1).title}
							</h2>
							<p className={s.lead}>{beat(1).body}</p>
							<p className={s.hint}>
								<MagnifierPip on />
								Move the glass over the page. Some of the print is smaller than it looks.
							</p>
						</div>
						<Lens page={<Newspaper deck={beat(1).body} year={p.year} />} magnified={<Newspaper magnified deck={beat(1).body} year={p.year} />} />
					</div>
				</div>
			</section>

			{/* ───────────── III · The evidence board ───────────── */}
			<section className={s.boardScene} data-scene aria-labelledby="gl-s3">
				<div className="wrap">
					<header className={s.sceneHead}>
						<p className={s.folio}>
							<span>III</span> The evidence
						</p>
						<h2 id="gl-s3" className={s.h2}>
							{beat(2).title}
						</h2>
						<p className={s.lead}>{beat(2).body}</p>
					</header>
					<div className={s.board}>
						<Card i={0} x="3%" y="3%" r={-3} tone="photo">
							<ProfessorSketch />
							<p className={s.cardCaption}>The professor. Last seen Tuesday.</p>
						</Card>
						<Card i={1} x="27%" y="5%" r={2}>
							<h3>Read the evidence</h3>
							<p>Every drawer, ledger and scorch mark in the study is a statement. Some of them lie.</p>
						</Card>
						<Card i={2} x="51%" y="2%" r={-2} tone="paper">
							<KeySketch />
							<p className={s.cardCaption}>Found inside. The door was bolted.</p>
						</Card>
						<Card i={3} x="75%" y="6%" r={3}>
							<h3>Test the alibis</h3>
							<p>Four callers, four stories. Hold each one up against the gas bill.</p>
						</Card>
						<Card i={4} x="73%" y="40%" r={-4} tone="paper">
							<p className={s.bill}>
								<b>Edinburgh &amp; Leith Gas Co.</b>
								<span>No. 9 Heriot Row</span>
								<span>Mon ... 112 ft³</span>
								<span>Tue ... 486 ft³</span>
								<span>Wed ... 0 ft³</span>
							</p>
						</Card>
						<Card i={5} x="4%" y="42%" r={4} tone="paper">
							<WatchSketch />
							<p className={s.cardCaption}>Stopped at 11:49.</p>
						</Card>
						<Card i={6} x="14%" y="72%" r={-2}>
							<h3>Decode the inventions</h3>
							<p>A clockwork cipher, a lock that answers to its maker, and a regulator that hums.</p>
						</Card>
						<Card i={7} x="31%" y="37%" r={1} wide tone="index">
							<h3 className={s.particularsHead}>Particulars of the case</h3>
							<dl className={s.particulars}>
								<div>
									<dt>Detectives</dt>
									<dd>{players}</dd>
								</div>
								<div>
									<dt>Time on the case</dt>
									<dd>{p.gameMinutes} min</dd>
								</div>
								<div>
									<dt>Difficulty</dt>
									<dd>
										<span className={s.pips}>
											{[1, 2, 3, 4, 5].map((n) => (
												<MagnifierPip key={n} on={n <= p.difficulty} />
											))}
										</span>
										<span className={s.srOnly}>{p.difficulty} of 5</span>
									</dd>
								</div>
								<div>
									<dt>Fear</dt>
									<dd>{p.fear}/5</dd>
								</div>
								<div>
									<dt>Age</dt>
									<dd>{p.minAge}+</dd>
								</div>
								<div>
									<dt>Cases closed</dt>
									<dd>{p.successRate}%</dd>
								</div>
								{p.record ? (
									<div>
										<dt>Fastest solve</dt>
										<dd>{p.record}</dd>
									</div>
								) : null}
							</dl>
						</Card>
						<Card i={8} x="61%" y="73%" r={2} tone="accuse">
							<h3>Name the culprit</h3>
							<p>Then say it to the inspector’s face before the hour is out.</p>
						</Card>
						<RedStrings pairs={PAIRS} />
					</div>
				</div>
			</section>

			{/* ───────────── IV · The study, through rain on the window ───────────── */}
			<section className={s.studyScene} data-scene data-anim aria-labelledby="gl-s4">
				<div className="wrap">
					<div className={s.studyGrid}>
						<div className={s.window}>
							{panes.map((src, i) => (
								<figure key={src ?? i} className={s.pane}>
									<SafeImg src={src} alt={src ? `Inside ${room.title}` : ''} fallback={<StudyArt variant={i} />} />
								</figure>
							))}
							<figure className={s.pane} aria-hidden>
								<StudyArt variant={3} />
							</figure>
							<span className={s.glass} aria-hidden>
								<i />
								<i />
								<i />
								<i />
								<i />
								<i />
							</span>
						</div>
						<div>
							<p className={s.folio}>
								<span>IV</span> The study
							</p>
							<h2 id="gl-s4" className={s.h2}>
								{beat(3).title}
							</h2>
							<p className={s.lead}>{beat(3).body}</p>
							{room.venue ? (
								<p className={s.body}>
									At <Link href={room.venue.href}>{room.venue.name}</Link>, {room.venue.address}. {minutesLabel(room.visitMinutes)} from the knock at the door to the debrief.
								</p>
							) : null}
						</div>
					</div>
				</div>
			</section>

			{/* ───────────── V · The inspector's card + the register ───────────── */}
			{gameMaster || records.length ? (
				<section className={s.callScene} data-scene aria-labelledby="gl-s5">
					<div className="wrap">
						<p className={s.folio}>
							<span>V</span> Your host for the evening
						</p>
						<div className={s.callGrid}>
							{gameMaster ? (
								<div className={s.callCard}>
									<div className={s.cameo}>
										<SafeImg src={gameMaster.image} alt={gameMaster.name} fallback={<span>{initials(gameMaster.name)}</span>} />
									</div>
									<div className={s.callText}>
										<h2 id="gl-s5" className={s.callName}>
											{gameMaster.name}
										</h2>
										<p className={s.callTitle}>{gameMaster.title}</p>
										<p className={s.callAddr}>No. 9 Heriot Row · By appointment</p>
									</div>
								</div>
							) : (
								<h2 id="gl-s5" className={s.h2}>
									The register
								</h2>
							)}
							<div>
								{gameMaster?.bio ? <p className={s.body}>{gameMaster.bio}</p> : null}
								{records.length ? (
									<div className={s.register}>
										<p className={s.registerHead}>Register of cases closed, fastest first</p>
										<ol>
											{records.map((r) => (
												<li key={r.team + r.date}>
													<span>{r.team}</span>
													<span className={s.registerTime}>{r.time}</span>
												</li>
											))}
										</ol>
									</div>
								) : null}
							</div>
						</div>
					</div>
				</section>
			) : null}

			{/* ───────────── Booking: the case folder ───────────── */}
			<section className={s.book} aria-labelledby="gl-book">
				<div className="wrap">
					<div className={s.bookGrid}>
						<div className={s.bookCopy}>
							<p className={s.folio}>
								<span>✒</span> Take the case
							</p>
							<h2 id="gl-book" className={s.h2}>
								Choose an evening. Bring your best minds.
							</h2>
							<ul className={s.memo}>
								<li>
									<b>{minutesLabel(room.visitMinutes)} at No. 9.</b> A briefing, {p.gameMinutes} minutes on the case, then the debrief and photographs.
								</li>
								<li>
									<b>{players} detectives.</b> From {room.fromPriceLabel} for the whole party. The study is yours alone.
								</li>
								{room.venue ? (
									<li>
										<b>{room.venue.name}.</b> {room.venue.address}, {room.venue.postcode}.
									</li>
								) : null}
								<li>
									<b>Dress.</b> {p.wear}
								</li>
							</ul>
						</div>
						<div className={s.caseFolder}>
							<span className={s.caseTab} aria-hidden>
								Appointments · No. 9
							</span>
							<span className={s.caseClip} aria-hidden />
							{booking}
						</div>
					</div>
				</div>
			</section>

			{/* ───────────── Next volume ───────────── */}
			{next ? (
				<Link href={next.href} className={s.next} style={nextStyle} data-anim>
					<span className={s.nextFog} aria-hidden>
						<span />
						<span />
					</span>
					<span className={s.nextInner}>
						{next.cover ? (
							<span className={s.nextCover}>
								<SafeImg src={next.cover} alt="" />
							</span>
						) : null}
						<span className={s.nextText}>
							<span className={s.nextKicker}>The fog lifts · Next volume · {next.genre}</span>
							<span className={s.nextTitle}>{next.title}</span>
							{next.tagline ? <span className={s.nextTag}>{next.tagline}</span> : null}
							<span className={s.nextGo}>Follow the next lead →</span>
						</span>
					</span>
				</Link>
			) : null}
		</GaslightStage>
	);
}
