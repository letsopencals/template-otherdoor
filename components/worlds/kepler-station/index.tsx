import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { RoomWorldProps } from '@/lib/worlds';
import { minutesLabel } from '@/lib/when';
import { SafeImg } from '@/components/ui/safe-img';
import { michroma } from './font';
import { MissionRoot } from './mission-state';
import { PHASES, met } from './mission';
import { Starfield } from './starfield';
import { HeroVideo } from './hero-video';
import { Brackets } from './hud';
import { LifeSupport, O2Value } from './life-support';
import { HeroOrbit, HullSeam } from './ornaments';
import { Station } from './station';
import { Docking } from './docking';
import { Cutaway } from './cutaway';
import { Decoder } from './decoder';
import { PowerGrid } from './power-grid';
import { AirlockCycle } from './airlock-cycle';
import { MissionDial } from './mission-dial';
import s from './kepler.module.css';

const MEDIA = '/worlds/kepler-station';

/**
 * KEPLER STATION (2187), the Epic. The page is the mission timeline, from first
 * contact to the final docking, with its own navigation (the mission clock dial,
 * bottom left) and a hull seam between phases:
 *   00 Contact     hero on the station loop, starfield, glare, debris, trajectory
 *   01 Approach    the station you can turn (hand-built projected ring, hotspots)
 *   02 Hard dock   the scroll docking approach on the wide still
 *   03 The decks   cutaway of both decks, lights failing as you scroll, rooms open
 *   04 Deck 1      habitation: the signal decoder (commander's last transmission)
 *   05 Deck 2      command: restore power (conduit board + main bus lever), Morag
 *   06 Final       the airlock cycle (press and hold), then the booking panel
 * Restoring power is shared state: the lights come back across the whole page.
 * The booking panel sits in normal flow, skinned only with --bp-*.
 */
export default function KeplerStation({ room, presentation: p, photos, gameMaster, next, records, booking }: RoomWorldProps) {
	const m = p.media;
	const stills = m.stills ?? [];
	const wide = stills[0] ?? `${MEDIA}/wide.jpg`;
	const deck = stills[1] ?? `${MEDIA}/command-deck.jpg`;
	const corridor = stills[2] ?? `${MEDIA}/airlock-corridor.jpg`;
	const lever = stills[3] ?? `${MEDIA}/detail-lever.jpg`;
	const plate = stills[4] ?? `${MEDIA}/plate-starfield.jpg`;
	const paras = room.description.split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);
	const [para1 = room.description, para2 = '', para3 = ''] = paras.length >= 3 ? paras : [room.description];
	const venue = room.venue?.name ?? 'Otherdoor Leith';
	const crew = `${p.minPlayers}–${p.maxPlayers}`;
	const g = p.gameMinutes;
	const at = (id: string) => met(PHASES.find((x) => x.id === id)?.at ?? 0, g);
	const [cam1, cam2, cam3] = [photos[0] ?? null, photos[1] ?? null, photos[2] ?? null];

	return (
		<MissionRoot className={`${s.world} ${michroma.variable}`} style={{ '--door': p.palette.glow } as CSSProperties}>
			{/* ================================================================ 00 CONTACT */}
			<header id="k-contact" className={s.hero}>
				<HeroVideo src={m.loop} poster={m.poster} className={s.heroMedia} />
				<Starfield className={s.heroStars} density={0.6} />
				<div className={s.glare} aria-hidden />
				<HeroOrbit className={s.orbit} />
				<div className={s.heroShade} aria-hidden />
				<Brackets className={s.heroFrame} />
				<div className={s.hudTop} aria-hidden>
					<span>KPLR-7 · HIGH ORBIT · GAS GIANT B</span>
					<span className={s.blink}>● BEACON ACTIVE · SILENT 19 DAYS</span>
					<span>
						O₂ <O2Value />
					</span>
				</div>
				<div className={`wrap ${s.heroInner}`}>
					<p className={s.kicker}>
						Door {String(p.order).padStart(2, '0')} · The Epic · {p.year} · {venue}
					</p>
					<h1 className={s.title}>
						{titleLines(room.title).map((line) => (
							<span key={line}>{line}</span>
						))}
					</h1>
					<p className={s.tagline}>{p.tagline}</p>
					<div className={s.heroActions}>
						<a href="#book" className={s.primary}>
							Book the docking · from {room.fromPriceLabel}
						</a>
						<a href="#k-approach" className={s.ghost}>
							Begin approach ↓
						</a>
					</div>
					<dl className={s.heroStats}>
						<div>
							<dt>Crew</dt>
							<dd>{crew}</dd>
						</div>
						<div>
							<dt>Mission</dt>
							<dd>{g} min</dd>
						</div>
						<div>
							<dt>Visit</dt>
							<dd>{minutesLabel(room.visitMinutes)}</dd>
						</div>
						<div>
							<dt>Difficulty</dt>
							<dd>{p.difficulty}/5</dd>
						</div>
						<div>
							<dt>Get out</dt>
							<dd>{p.successRate}%</dd>
						</div>
					</dl>
				</div>
				<div className={s.heroGauge} aria-hidden>
					<LifeSupport size={150} />
				</div>
			</header>

			{/* ================================================================ 01 APPROACH */}
			<section id="k-approach" className={s.approach}>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={plate} alt="" className={s.approachPlate} aria-hidden loading="lazy" />
				<Starfield className={s.approachStars} density={0.45} />
				<div className={`wrap ${s.approachInner}`}>
					<PhaseHead n="01" label="Approach" t={at('k-approach')} title="A ring station, silent for nineteen days." lede={para1} />
					<Station />
				</div>
			</section>

			{/* ================================================================ 02 HARD DOCK */}
			<HullSeam n="02" label="Hard dock" t={at('k-dock')} />
			<div id="k-dock">
				<Docking
					station={wide}
					plate={plate}
					beats={[
						{ title: 'Range closing', body: 'The shuttle drifts in on thrusters. Lights flicker along one side of the ring only: the habitation side.' },
						{ title: 'Life support', body: `Life support is at 31% and falling. ${g} minutes to bring both decks back and fly the station into its last docking window.` },
						{ title: 'Hard dock', body: `Clamps engage on docking port 3. The inner hatch opens half-way and sticks. All ${crew} of you go in together.` },
					]}
				/>
			</div>

			{/* ================================================================ 03 THE TWO DECKS */}
			<HullSeam n="03" label="The two decks" t={at('k-decks')} />
			<section id="k-decks" className={s.decks}>
				<div className="wrap">
					<PhaseHead n="03" label="The two decks" t={at('k-decks')} title="Two decks. Nobody sees the whole station." lede={para2 || 'The crew splits across two decks and talks over the comms. Everything you find on one deck matters on the other.'} />
					<Cutaway />
					<div className={s.specRow}>
						<dl className={s.specs} aria-label="Mission parameters">
							<SpecRow k="Crew" v={`${crew} players`} />
							<SpecRow k="Mission" v={`${g} min`} />
							<SpecRow k="Whole visit" v={minutesLabel(room.visitMinutes)} />
							<div>
								<dt>Difficulty</dt>
								<dd>
									<Bars n={p.difficulty} /> <span className={s.specSmall}>{p.difficulty}/5</span>
								</dd>
							</div>
							<div>
								<dt>Fear</dt>
								<dd>
									<Bars n={p.fear} /> <span className={s.specSmall}>{p.fear}/5</span>
								</dd>
							</div>
							<SpecRow k="Minimum age" v={`${p.minAge}+`} />
							<SpecRow k="Crews who dock" v={`${p.successRate}%`} />
							<SpecRow k="Record" v={p.record} />
						</dl>
						<figure className={s.setShot}>
							<SafeImg src={cam1 ?? deck} alt="Inside Kepler Station at Otherdoor Leith: the command deck set with its viewport and consoles" className={s.setImg} fallback={<span className={s.imgFallback} />} />
							<figcaption>
								<span>SET · {venue.toUpperCase()}</span> Built at full scale in a bonded warehouse on the Shore.
							</figcaption>
						</figure>
					</div>
				</div>
			</section>

			{/* ================================================================ 04 DECK 1 · HABITATION */}
			<HullSeam n="04" label="Deck 1 · Habitation" t={at('k-habitation')} />
			<section id="k-habitation" className={s.hab}>
				<div className={`wrap ${s.habGrid}`}>
					<div className={s.habCopy}>
						<PhaseHead n="04" label="Deck 1 · Habitation" t={at('k-habitation')} title="The commander left a message." lede="Bunks, lockers, a galley and a comms booth still recording. The crew’s logs tell you what happened on day nineteen. The commander’s last transmission tells you what to do about it." />
						<ul className={s.habList}>
							<li>
								<b>Logs</b> Eight personal logs, eight bunks, one pattern.
							</li>
							<li>
								<b>Lockers</b> Opened in the order the logs were recorded.
							</li>
							<li>
								<b>The booth</b> Tune the receiver. Relay the orders to Deck 2.
							</li>
						</ul>
						<div className={s.cams}>
							{[cam3 ?? corridor, cam2 ?? lever].map((src, i) => (
								<figure key={i} className={s.cam}>
									<SafeImg src={src} alt={i === 0 ? 'A crew heading through the airlock into the station' : 'A crew working the consoles together on the command deck'} className={s.camImg} fallback={<span className={s.imgFallback} />} />
									<figcaption>
										<span className={s.rec}>● REC</span> HELMET CAM {String(i + 1).padStart(2, '0')}
									</figcaption>
								</figure>
							))}
						</div>
					</div>
					<div className={s.habRx}>
						<Decoder />
					</div>
				</div>
			</section>

			{/* ================================================================ 05 DECK 2 · COMMAND */}
			<HullSeam n="05" label="Deck 2 · Command" t={at('k-command')} />
			<section id="k-command" className={s.cmd}>
				<div className={s.viewport}>
					<SafeImg src={deck} alt="The command deck: crash couches facing a curved viewport onto the nebula" className={s.viewportImg} fallback={<span className={s.imgFallback} />} />
					<div className={s.viewportShade} aria-hidden />
					<div className={`wrap ${s.viewportCopy}`}>
						<PhaseHead n="05" label="Deck 2 · Command" t={at('k-command')} title="Bring the station back by hand." lede="The docking computer can’t be trusted, so Deck 2 comes back junction by junction: reactor, life support, navigation, then the bridge. Try the board below. Restore power and every light on this page comes back with it." />
					</div>
				</div>
				<div className={`wrap ${s.cmdGrid}`}>
					<PowerGrid />
					<figure className={s.leverShot}>
						<SafeImg src={lever} alt="A gloved hand on an amber emergency lever beside the life-support dial" className={s.leverImg} fallback={<span className={s.imgFallback} />} />
						<Brackets />
						<figcaption>MAIN BUS · DECK 2 · HOLD 3 S</figcaption>
					</figure>
				</div>

				<div className={`wrap ${s.controlGrid}`}>
					{gameMaster ? (
						<div className={s.comms}>
							<Brackets />
							<div className={s.commsHead}>
								<span className={s.blink}>●</span> MISSION CONTROL · CH 4 · YOUR GAME MASTER
							</div>
							<div className={s.commsBody}>
								<div className={s.portrait}>
									<SafeImg src={gameMaster.image} alt={gameMaster.name} fallback={<span className={s.portraitFallback}>{initials(gameMaster.name)}</span>} />
								</div>
								<div>
									<p className={s.gmName}>{gameMaster.name}</p>
									<p className={s.gmTitle}>{gameMaster.title}</p>
									<span className={s.wave} aria-hidden>
										{Array.from({ length: 28 }, (_, i) => (
											<i key={i} style={{ animationDelay: `${(i % 7) * -0.13}s` }} />
										))}
									</span>
								</div>
							</div>
							<p className={s.commsText}>{gameMaster.bio}</p>
						</div>
					) : null}
					<div className={s.logWrap}>
						<p className={s.mono}>DOCKING LOG · SAMPLE RECORDS</p>
						<h2 className={s.h2}>Fastest crews home.</h2>
						<ol className={s.log}>
							{records.map((r, i) => (
								<li key={r.team}>
									<span>{String(i + 1).padStart(2, '0')}</span>
									<b>{r.team}</b>
									<em>{r.time}</em>
								</li>
							))}
						</ol>
					</div>
				</div>
			</section>

			{/* ================================================================ 06 FINAL DOCKING */}
			<HullSeam n="06" label="Final docking" t={at('k-final')} />
			<section id="k-final" className={s.final}>
				<div className="wrap">
					<PhaseHead n="06" label="Final docking" t={at('k-final')} title="The window opens once." lede={para3 || 'Get everyone back to the shuttle.'} />
					<AirlockCycle corridor={corridor} gameMinutes={g} />
				</div>
				<div className={`wrap ${s.bookGrid}`}>
					<div className={s.brief}>
						<p className={s.mono}>MISSION BRIEF</p>
						<h2 className={s.h2}>Book the docking.</h2>
						<p className={s.lede}>One price for the whole crew. Choose a launch time and how many of you are going; the station takes {crew}.</p>
						<ol className={s.timeline}>
							<li>
								<b>T−15 min</b> Arrive at {venue}. Lockers, briefing, flight suits if you want them.
							</li>
							<li>
								<b>T 0</b> The hatch seals. {g} minutes on the station.
							</li>
							<li>
								<b>T+{g}</b> Docked or not: team photo and a debrief in the Lobby. {minutesLabel(room.visitMinutes)} in all.
							</li>
						</ol>
						<p className={s.wear}>
							<span>Wear</span> {p.wear}
						</p>
					</div>
					<div className={s.panelWrap}>{booking}</div>
				</div>
			</section>

			{/* ================================================================ NEXT DOOR */}
			{next ? (
				<Link href={next.href} className={s.next} style={{ '--n': next.palette.glow } as CSSProperties}>
					<span className={s.hatch} aria-hidden>
						<SafeImg src={next.cover} alt="" className={s.hatchImg} fallback={null} />
						<i />
					</span>
					<span>
						<span className={s.mono}>NEXT DOOR · {next.genre.toUpperCase()}</span>
						<span className={s.nextTitle}>{next.title}</span>
						<span className={s.nextTag}>{next.tagline}</span>
					</span>
				</Link>
			) : null}

			<MissionDial gameMinutes={g} />
		</MissionRoot>
	);
}

function PhaseHead({ n, label, t, title, lede }: { n: string; label: string; t: string; title: string; lede: string }) {
	return (
		<div className={s.phaseHead}>
			<p className={s.phaseTag}>
				<span className={s.phaseN}>{n}</span>
				<span>{label}</span>
				<span className={s.phaseT}>{t}</span>
			</p>
			<h2 className={s.h2}>{title}</h2>
			{lede ? <p className={s.lede}>{lede}</p> : null}
		</div>
	);
}

function SpecRow({ k, v }: { k: string; v: string }) {
	return (
		<div>
			<dt>{k}</dt>
			<dd>{v}</dd>
		</div>
	);
}

/** "Kepler Station" → ["Kepler", "Station"]: the first word on its own line, the rest below. */
function titleLines(title: string): string[] {
	const [first, ...rest] = title.split(' ');
	return rest.length ? [first ?? title, rest.join(' ')] : [title];
}

function initials(name: string) {
	return name
		.split(' ')
		.map((w) => w[0])
		.join('')
		.slice(0, 2);
}

function Bars({ n }: { n: number }) {
	return (
		<span className={s.bars} role="img" aria-label={`${n} of 5`}>
			{Array.from({ length: 5 }, (_, i) => (
				<i key={i} data-on={i < n} />
			))}
		</span>
	);
}
