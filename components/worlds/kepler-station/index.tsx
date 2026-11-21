import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { RoomWorldProps } from '@/lib/worlds';
import { minutesLabel } from '@/lib/when';
import { SafeImg } from '@/components/ui/safe-img';
import { michroma } from './font';
import { Starfield } from './starfield';
import { HeroVideo } from './hero-video';
import { Docking } from './docking';
import { Airlock } from './airlock';
import { Brackets, DeckMap } from './hud';
import { LifeSupport, MissionClock } from './life-support';
import s from './kepler.module.css';

const MEDIA = '/worlds/kepler-station';

/**
 * KEPLER STATION (2187): a derelict ring station, failing life support, two
 * decks and a docking window. Built on the media in public/worlds/kepler-station
 * (hero loop, wide exterior, starfield plate, command deck, airlock corridor,
 * lever detail) with code on top: a parallax starfield canvas, HUD overlays
 * (life support, deck map, reticle, readouts), a scroll-driven docking approach
 * and airlock doors that part between scenes. The booking panel is skinned with
 * --bp-* only.
 */
export default function KeplerStation({ room, presentation: p, photos, gameMaster, next, records, booking }: RoomWorldProps) {
	const m = p.media;
	const stills = m.stills ?? [];
	const wide = stills[0] ?? `${MEDIA}/wide.jpg`;
	const deck = stills[1] ?? `${MEDIA}/command-deck.jpg`;
	const corridor = stills[2] ?? `${MEDIA}/airlock-corridor.jpg`;
	const lever = stills[3] ?? `${MEDIA}/detail-lever.jpg`;
	const plate = stills[4] ?? `${MEDIA}/plate-starfield.jpg`;
	const [setup, stakes, todo, inside] = p.beats;

	return (
		<div className={`${s.world} ${michroma.variable}`} style={{ '--door': p.palette.glow } as CSSProperties}>
			{/* ---------------------------------------------------------------- Hero */}
			<header className={s.hero}>
				<HeroVideo src={m.loop} poster={m.poster} className={s.heroMedia} />
				<Starfield className={s.heroStars} density={0.6} />
				<div className={s.heroShade} aria-hidden />
				<Brackets className={s.heroFrame} />
				<div className={s.hudTop} aria-hidden>
					<span>KPLR-7 · HIGH ORBIT · 412 KM</span>
					<span className={s.blink}>● BEACON ACTIVE</span>
					<span>
						WINDOW <MissionClock />
					</span>
				</div>
				<div className={`wrap ${s.heroInner}`}>
					<p className={s.kicker}>
						Door 04 · {p.genre} · {p.year} · {room.venue?.name ?? 'Otherdoor Leith'}
					</p>
					<h1 className={s.title}>
						<span>Kepler</span>
						<span>Station</span>
					</h1>
					<p className={s.tagline}>{p.tagline}</p>
					<div className={s.heroActions}>
						<a href="#book" className={s.primary}>
							Book the docking · from {room.fromPriceLabel}
						</a>
						<a href="#approach" className={s.ghost}>
							Begin approach ↓
						</a>
					</div>
					<dl className={s.heroStats}>
						<div><dt>Crew</dt><dd>{p.minPlayers}–{p.maxPlayers}</dd></div>
						<div><dt>Mission</dt><dd>{p.gameMinutes} min</dd></div>
						<div><dt>Difficulty</dt><dd>{p.difficulty}/5</dd></div>
						<div><dt>Escape rate</dt><dd>{p.successRate}%</dd></div>
					</dl>
				</div>
				<div className={s.heroGauge} aria-hidden>
					<LifeSupport size={150} />
				</div>
			</header>

			{/* ---------------------------------------------------------------- Signal */}
			<section className={s.signal}>
				<Starfield className={s.bgStars} density={0.5} />
				<div className={`wrap ${s.signalInner}`}>
					<div className={s.transmission}>
						<Brackets />
						<p className={s.txHead}>
							<span className={s.blink}>●</span> INCOMING SIGNAL · 2187.11.21 · ORIGIN KPLR-7
						</p>
						<h2 className={s.h2}>{setup?.title ?? 'The signal'}</h2>
						<p className={s.txBody}>{setup?.body}</p>
						<p className={s.txDesc}>{room.description}</p>
					</div>
					<div className={s.signalSide}>
						<p className={s.mono}>THE EPIC · 90-MINUTE MISSION · TWO DECKS</p>
						<p className={s.lede}>Our biggest room. The crew splits across two decks, talks over comms, and only one docking window opens.</p>
					</div>
				</div>
			</section>

			{/* ---------------------------------------------------------------- Docking approach */}
			<div id="approach">
				<Docking station={wide} plate={plate} beats={[stakes, todo, inside].filter(Boolean) as Array<{ title: string; body: string }>} />
			</div>

			{/* ---------------------------------------------------------------- Airlock → command deck */}
			<Airlock label="AIRLOCK 2 · DECK ONE">
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={deck} alt="The command deck: crash couches facing a curved viewport onto the nebula" className={s.sceneImg} />
				<div className={s.sceneShade} aria-hidden />
				<div className={`wrap ${s.sceneHud}`}>
					<div className={s.panel}>
						<Brackets />
						<p className={s.panelHead}>SYS · LIFE SUPPORT</p>
						<LifeSupport size={170} />
						<p className={s.panelNote}>Falling. Restore deck two before it reaches 12%.</p>
					</div>
					<div className={`${s.panel} ${s.mapPanel}`}>
						<Brackets />
						<p className={s.panelHead}>NAV · DECK MAP</p>
						<DeckMap />
					</div>
					<div className={s.sceneCopy}>
						<p className={s.mono}>DECK ONE · COMMAND</p>
						<h2 className={s.h2}>Two decks. One crew.</h2>
						<p>Half of you take command and comms; half climb down to the reactor and life support. Nobody sees the whole station, so everything goes over the radio.</p>
					</div>
				</div>
			</Airlock>

			{/* ---------------------------------------------------------------- Inside */}
			<section className={s.inside}>
				<div className={`wrap ${s.insideGrid}`}>
					<div className={s.leverFrame}>
						<SafeImg src={lever} alt="A gloved hand on an amber emergency lever beside the life-support dial" className={s.leverImg} fallback={<span className={s.imgFallback} />} />
						<Brackets />
						<span className={s.leverTag}>EMERG. VENT · HOLD 3 S</span>
					</div>
					<div>
						<p className={s.mono}>INSIDE THE ROOM</p>
						<h2 className={s.h2}>Built at full scale on the Shore.</h2>
						<p className={s.lede}>{inside?.body}</p>
						<dl className={s.specs}>
							<div><dt>Crew</dt><dd>{p.minPlayers}–{p.maxPlayers} players</dd></div>
							<div><dt>Mission</dt><dd>{p.gameMinutes} min</dd></div>
							<div><dt>Visit</dt><dd>{minutesLabel(room.visitMinutes)}</dd></div>
							<div><dt>Difficulty</dt><dd><Bars n={p.difficulty} /></dd></div>
							<div><dt>Fear</dt><dd><Bars n={p.fear} /></dd></div>
							<div><dt>Min. age</dt><dd>{p.minAge}+</dd></div>
							<div><dt>Escape rate</dt><dd>{p.successRate}%</dd></div>
							<div><dt>Record</dt><dd>{p.record}</dd></div>
						</dl>
					</div>
				</div>
				{photos.length ? (
					<div className={`wrap ${s.photos}`}>
						{photos.slice(0, 3).map((src, i) => (
							<figure key={src} className={s.photo}>
								<SafeImg src={src} alt={`Inside Kepler Station, view ${i + 1}`} fallback={<span className={s.imgFallback} />} />
								<figcaption>CAM {String(i + 1).padStart(2, '0')}</figcaption>
							</figure>
						))}
					</div>
				) : null}
			</section>

			{/* ---------------------------------------------------------------- Corridor band */}
			<section className={s.corridor} aria-hidden>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={corridor} alt="" />
				<p>Ninety minutes. Then the window closes.</p>
			</section>

			{/* ---------------------------------------------------------------- Mission control + log */}
			<section className={s.control}>
				<div className={`wrap ${s.controlGrid}`}>
					{gameMaster ? (
						<div className={s.comms}>
							<Brackets />
							<div className={s.commsHead}>
								<span className={s.blink}>●</span> MISSION CONTROL · CH 4
							</div>
							<div className={s.commsBody}>
								<div className={s.portrait}>
									<SafeImg src={gameMaster.image} alt={gameMaster.name} fallback={<span className={s.imgFallback} />} />
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
					<div>
						<p className={s.mono}>DOCKING LOG · SAMPLE RECORDS</p>
						<h2 className={s.h2}>Fastest crews.</h2>
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

			{/* ---------------------------------------------------------------- Booking */}
			<section className={s.booking}>
				<div className={`wrap ${s.bookGrid}`}>
					<div className={s.brief}>
						<p className={s.mono}>MISSION BRIEF</p>
						<h2 className={s.h2}>Book the docking.</h2>
						<p className={s.lede}>The price is for the whole crew. Choose a launch time and how many of you are going; the station holds up to {p.maxPlayers}.</p>
						<ol className={s.timeline}>
							<li><b>T−15 min</b> Arrive at {room.venue?.name ?? 'Otherdoor Leith'}. Lockers, briefing, suits optional.</li>
							<li><b>T 0</b> Hatch seals. {p.gameMinutes} minutes on the station.</li>
							<li><b>T+{p.gameMinutes}</b> Docked or not: photos and a debrief in the Lobby.</li>
						</ol>
						<p className={s.wear}>{p.wear}</p>
					</div>
					<div className={s.panelWrap}>{booking}</div>
				</div>
			</section>

			{/* ---------------------------------------------------------------- Next door */}
			{next ? (
				<Link href={next.href} className={s.next} style={{ '--n': next.palette.glow } as CSSProperties}>
					<span className={s.hatch} aria-hidden>
						<SafeImg src={next.cover} alt="" className={s.hatchImg} fallback={null} />
						<i />
					</span>
					<span>
						<span className={s.mono}>NEXT DOOR · {next.genre}</span>
						<span className={s.nextTitle}>{next.title}</span>
						<span className={s.nextTag}>{next.tagline}</span>
					</span>
				</Link>
			) : null}
		</div>
	);
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
