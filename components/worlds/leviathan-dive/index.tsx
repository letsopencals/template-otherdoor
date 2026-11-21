import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import type { RoomWorldProps } from '@/lib/worlds';
import { minutesLabel, roman } from '@/lib/when';
import { SafeImg } from '@/components/ui/safe-img';
import { DiveStage } from './dive-stage';
import { Angler, BrassDefs, GaugeFace, Jelly, Speaker, Submarine, Tentacle, TrenchView } from './art';
import { plateFont } from './font';
import s from './leviathan.module.css';

/**
 * THE LEVIATHAN DIVE: scrolling is the descent. The page itself is the water column (surface teal
 * to abyss); a brass depth gauge in fathoms and an oxygen dial follow the scroll; each scene hangs
 * off a sounding line at its depth. Booking happens at the helm, on the trench floor.
 */

const MAX_FATHOMS = 1200;
const DEPTHS = [40, 210, 460, 720];
const range = (n: number) => Array.from({ length: n }, (_, i) => i);

export default function LeviathanDiveWorld({ room, presentation: p, cover, photos, gameMaster, next, records, booking }: RoomWorldProps) {
	const words = room.title.split(' ');
	const lead = /^the$/i.test(words[0] ?? '') ? words.shift() : null;
	const beats = p.beats;
	const stats: Array<{ label: string; value: string; frac: number }> = [
		{ label: 'Crew', value: `${p.minPlayers}–${p.maxPlayers}`, frac: p.maxPlayers / 8 },
		{ label: 'Minutes', value: String(p.gameMinutes), frac: p.gameMinutes / 120 },
		{ label: 'Difficulty', value: `${p.difficulty}/5`, frac: p.difficulty / 5 },
		{ label: 'Fear', value: `${p.fear}/5`, frac: p.fear / 5 },
		{ label: 'Age', value: `${p.minAge}+`, frac: p.minAge / 18 },
		{ label: 'Surfaced', value: `${p.successRate}%`, frac: p.successRate / 100 },
	];

	return (
		<DiveStage className={`${s.world} ${plateFont.variable}`} maxFathoms={MAX_FATHOMS}>
			<BrassDefs />

			{/* The sea: fixed layers clipped to the world, tinted by --depth. */}
			<div className={s.sea} aria-hidden>
				<div className={s.rays} />
				<div className={s.snow} />
				<div className={s.abyss}>
					<Jelly className={`${s.jelly} ${s.j1}`} />
					<Jelly className={`${s.jelly} ${s.j2}`} hue="#d58cff" />
					<Jelly className={`${s.jelly} ${s.j3}`} hue="#7fd8ff" />
					<Angler className={s.angler} />
				</div>
				<div className={s.bubbles} data-live>
					{range(16).map((i) => (
						<span key={i} style={{ '--x': `${(i * 37) % 100}%`, '--d': `${7 + (i % 5) * 1.7}s`, '--delay': `${(i * -1.9) % 11}s`, '--sz': `${4 + (i % 4) * 4}px` } as CSSProperties} />
					))}
				</div>
			</div>

			{/* The depth gauge (HUD): information, so it stays in reduced motion; hidden at the helm. */}
			<aside className={s.hud} aria-hidden>
				<div className={s.hudGauge}>
					<GaugeFace ticks={24} major={4} label="FATHOMS" />
					<span className={s.hudNeedle} />
					<span className={s.hudCap} />
				</div>
				<div className={s.hudRead}>
					<b data-fathoms>0</b>
					<span>fathoms</span>
					<i>
						O<sub>2</sub> <b data-oxygen>60</b> min
					</i>
				</div>
			</aside>

			{/* ---------------------------------------------------------------- Surface: the hero */}
			<header className={s.hero}>
				<div className={s.surface} aria-hidden />
				<div className={`wrap ${s.heroInner}`}>
					<div className={s.plaque}>
						<span className={s.screw} />
						<span className={s.screw} />
						<span className={s.screw} />
						<span className={s.screw} />
						<p className={s.kicker}>
							Volume {roman(p.volume)} · {p.genre} · {p.year}
						</p>
						<h1 className={s.title}>
							{lead ? <small>{lead}</small> : null}
							{words.map((w) => (
								<span key={w}>{w}</span>
							))}
						</h1>
						<p className={s.tagline}>{p.tagline}</p>
						<div className={s.heroActions}>
							<a href="#book" className={s.brassBtn}>
								Book the dive · from {room.fromPriceLabel}
							</a>
							<a href="#descent" className={s.ghostBtn}>
								Begin the descent ↓
							</a>
						</div>
					</div>
				</div>
				<div className={s.subWrap}>
					<Submarine className={s.sub} />
				</div>
				<p className={s.scrollHint} aria-hidden>
					<span /> Scroll to dive
				</p>
			</header>

			{/* ---------------------------------------------------------------- The descent */}
			<div id="descent" className={s.column}>
				<div className={s.line} aria-hidden>
					{range(13).map((i) => (
						<span key={i} style={{ top: `${(i / 12) * 100}%` }}>
							{i * 100}
						</span>
					))}
				</div>

				{beats[0] ? (
					<Scene depth={DEPTHS[0]!} index={1} title={beats[0].title} body={beats[0].body} art={<LogArt cover={cover} title={room.title} />} />
				) : null}

				{beats[1] ? <Scene depth={DEPTHS[1]!} index={2} title={beats[1].title} body={beats[1].body} art={<OxygenArt minutes={p.gameMinutes} />} flip /> : null}

				{beats[2] ? <Scene depth={DEPTHS[2]!} index={3} title={beats[2].title} body={beats[2].body} art={<SonarArt />} /> : null}

				{beats[3] ? (
					<section className={`${s.scene} ${s.sceneWide}`} data-scene>
						<Fathom depth={DEPTHS[3]!} index={4} />
						<div className={s.porthole} data-scrub>
							<div className={s.portRing}>
								{range(12).map((i) => (
									<span key={i} style={{ transform: `rotate(${i * 30}deg) translateY(calc(var(--port) * -0.465))` }} />
								))}
							</div>
							<div className={s.portGlass}>
								<SafeImg src={photos[0]} alt={`Inside ${room.title}`} className={s.portPhoto} fallback={<TrenchView className={s.portPhoto} />} />
								<Tentacle className={s.tentacle} />
								<span className={s.glare} />
							</div>
						</div>
						<div className={s.sceneText}>
							<h2 className={s.sceneTitle}>{beats[3].title}</h2>
							<p>{beats[3].body}</p>
							{photos.length > 1 ? (
								<div className={s.miniPorts}>
									{photos.slice(1, 4).map((src) => (
										<SafeImg key={src} src={src} alt={`Inside ${room.title}`} className={s.miniPort} />
									))}
								</div>
							) : null}
						</div>
					</section>
				) : null}

				{beats.slice(4).map((b, i) => (
					<Scene key={b.title} depth={800 + i * 40} index={5 + i} title={b.title} body={b.body} art={null} />
				))}

				{/* The instrument panel: the stats as brass gauges. */}
				<section className={s.panelBoard} data-scene aria-label="The room in numbers">
					<p className={s.boardTitle}>Instrument panel</p>
					<dl className={s.gauges}>
						{stats.map((st) => (
							<div key={st.label} className={s.gauge} style={{ '--v': Math.min(1, Math.max(0, st.frac)).toFixed(3) } as CSSProperties}>
								<div className={s.gaugeDial}>
									<GaugeFace ticks={20} major={5} />
									<span className={s.needle} />
									<span className={s.cap} />
								</div>
								<dt>{st.label}</dt>
								<dd>{st.value}</dd>
							</div>
						))}
					</dl>
					<p className={s.boardNote}>
						Record ascent: <b>{p.record}</b> · {minutesLabel(room.visitMinutes)} visit with briefing and debrief
					</p>
				</section>

				{/* The voice on the speaker. */}
				{gameMaster ? (
					<section className={`${s.scene} ${s.voice}`} data-scene>
						<Fathom depth={880} index={beats.length + 1} />
						<div className={s.voiceArt}>
							{gameMaster.image ? (
								<div className={s.gmPort}>
									<SafeImg src={gameMaster.image} alt={gameMaster.name} className={s.portPhoto} fallback={<Speaker className={s.speaker} />} />
								</div>
							) : (
								<Speaker className={s.speaker} />
							)}
							<span className={s.wave} data-live>
								{range(5).map((i) => (
									<i key={i} />
								))}
							</span>
						</div>
						<div className={s.sceneText}>
							<p className={s.kicker}>The voice on the speaker</p>
							<h2 className={s.sceneTitle}>{gameMaster.name}</h2>
							<p className={s.gmTitle}>{gameMaster.title}</p>
							<p>{gameMaster.bio}</p>
						</div>
					</section>
				) : null}
			</div>

			{/* ---------------------------------------------------------------- The helm: booking on the trench floor */}
			<section className={s.helm} data-helm-zone aria-labelledby="lv-helm">
				<div className={`wrap ${s.helmGrid}`}>
					<div className={s.helmStory}>
						<Fathom depth={MAX_FATHOMS} index={0} label="Trench floor" />
						<h2 id="lv-helm" className={s.helmTitle}>
							Take the helm
						</h2>
						<p className={s.helmLead}>{room.description || p.tagline}</p>
						<ul className={s.helmFacts}>
							<li>
								<b>{minutesLabel(room.visitMinutes)}</b> visit: briefing, {p.gameMinutes} minutes aboard, then photos and a debrief.
							</li>
							{room.venue ? (
								<li>
									<b>Moored at</b> <Link href={room.venue.href}>{room.venue.name}</Link>
									{room.venue.address ? `, ${room.venue.address}` : ''}
								</li>
							) : null}
							<li>
								<b>Wear</b> {p.wear}
							</li>
						</ul>
						{records.length ? (
							<div className={s.ledger}>
								<p className={s.boardTitle}>Fastest ascents</p>
								<ol>
									{records.map((r) => (
										<li key={r.team}>
											<span>{r.team}</span>
											<b>{r.time}</b>
										</li>
									))}
								</ol>
							</div>
						) : null}
					</div>
					<div className={s.helmPanel}>{booking}</div>
				</div>
			</section>

			{/* ---------------------------------------------------------------- Surface into the next volume */}
			{next ? (
				<Link href={next.href} className={s.next} style={{ '--n-ground': next.palette.ground, '--n-accent': next.palette.accent, '--n-ink': next.palette.ink } as CSSProperties}>
					<span className={s.nextPort} aria-hidden>
						<SafeImg src={next.cover} alt="" className={s.portPhoto} fallback={<span className={s.nextSwatch} />} />
					</span>
					<span className={s.nextText}>
						<span className={s.kicker}>Blow the tanks · next volume</span>
						<span className={s.nextTitle}>{next.title}</span>
						<span className={s.nextTag}>{next.tagline}</span>
					</span>
					<span className={s.nextArrow} aria-hidden>
						↑
					</span>
				</Link>
			) : null}
		</DiveStage>
	);
}

function Fathom({ depth, index, label }: { depth: number; index: number; label?: string }) {
	return (
		<p className={s.fathom}>
			<span className={s.fathomNum}>{depth.toLocaleString('en-GB')}</span>
			<span>fathoms{label ? ` · ${label}` : index ? ` · log ${roman(index)}` : ''}</span>
		</p>
	);
}

function Scene({ depth, index, title, body, art, flip }: { depth: number; index: number; title: string; body: string; art: ReactNode; flip?: boolean }) {
	return (
		<section className={`${s.scene} ${flip ? s.flip : ''}`} data-scene>
			<Fathom depth={depth} index={index} />
			{art ? <div className={s.sceneArt}>{art}</div> : null}
			<div className={s.sceneText}>
				<h2 className={s.sceneTitle}>{title}</h2>
				<p>{body}</p>
			</div>
		</section>
	);
}

/** Log I: the captain's log, a brass-bound page with the dive chart, or the store's cover art. */
function LogArt({ cover, title }: { cover: string | null; title: string }) {
	return (
		<div className={s.log}>
			<SafeImg
				src={cover}
				alt={`${title} cover art`}
				className={s.logCover}
				fallback={
					<svg viewBox="0 0 300 380" className={s.logChart} role="img" aria-label="Illustration: the dive chart from the captain's log">
						<rect x="0" y="0" width="300" height="380" fill="#efe2bf" />
						<rect x="12" y="12" width="276" height="356" fill="none" stroke="#7a5418" strokeWidth="1.5" />
						<rect x="18" y="18" width="264" height="344" fill="none" stroke="#7a5418" strokeWidth="0.6" />
						<text x="150" y="50" textAnchor="middle" className={s.chartHead}>
							CHART OF DESCENT
						</text>
						<text x="150" y="68" textAnchor="middle" className={s.chartSub}>
							Firth of Forth · 1870
						</text>
						{range(10).map((i) => (
							<g key={i}>
								<line x1="40" y1={90 + i * 26} x2="260" y2={90 + i * 26} stroke="#b89a5e" strokeWidth="0.6" strokeDasharray="2 3" />
								<text x="36" y={93 + i * 26} textAnchor="end" className={s.chartTick}>
									{i * 120}
								</text>
							</g>
						))}
						<path d="M60,90 C90,120 70,170 120,200 C170,230 140,280 190,300 C220,312 230,330 236,344" fill="none" stroke="#8b2a22" strokeWidth="2" strokeDasharray="5 4" />
						<circle cx="236" cy="344" r="6" fill="none" stroke="#8b2a22" strokeWidth="2" />
						<path d="M230,338 l12,12 M242,338 l-12,12" stroke="#8b2a22" strokeWidth="2" />
						<path d="M200,110 c20,-10 40,0 50,14 c-16,4 -36,0 -50,-14Z" fill="#7a5418" opacity="0.6" />
					</svg>
				}
			/>
			<span className={s.logStrap} aria-hidden />
		</div>
	);
}

/** Log II: the oxygen dial; the readout follows the descent. */
function OxygenArt({ minutes }: { minutes: number }) {
	return (
		<div className={s.oxygen}>
			<div className={s.oxyDial}>
				<GaugeFace ticks={60} major={10} label="OXYGEN" />
				<span className={s.oxyNeedle} />
				<span className={s.cap} />
				<p className={s.oxyRead}>
					<b data-oxygen>{minutes}</b>
					<span>min left</span>
				</p>
			</div>
			<div className={s.pipes} aria-hidden>
				<span />
				<span />
				<span />
			</div>
			<div className={s.pressure}>
				<GaugeFace ticks={16} major={4} label="BALLAST" />
				<span className={s.wobble} data-live />
				<span className={s.cap} />
			</div>
		</div>
	);
}

/** Log III: the sonar scope, sweep and returning pings. */
function SonarArt() {
	const blips = [
		{ x: 66, y: 32, l: 'Engine room' },
		{ x: 28, y: 60, l: 'Trench wall' },
		{ x: 70, y: 72, l: 'Ballast tanks' },
	];
	return (
		<div className={s.sonar} data-live>
			<div className={s.scope}>
				<span className={s.sweep} />
				{blips.map((b, i) => (
					<span key={b.l} className={s.blip} data-side={b.x > 50 ? 'l' : 'r'} style={{ left: `${b.x}%`, top: `${b.y}%`, '--i': i } as CSSProperties}>
						<i>{b.l}</i>
					</span>
				))}
			</div>
		</div>
	);
}
