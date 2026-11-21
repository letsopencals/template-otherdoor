import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import type { RoomWorldProps } from '@/lib/worlds';
import { minutesLabel } from '@/lib/when';
import { SafeImg } from '@/components/ui/safe-img';
import { DoorArt } from '@/components/doors/door-art';
import { doto } from './font';
import { Boot } from './boot';
import { FeedVideo } from './hero-video';
import { Countdown } from './countdown';
import { MeridianConsole } from './console';
import { Hesitate, Module } from './module';
import { ContainmentMap, type Zone } from './containment-map';
import { AccessPrompt } from './access-prompt';
import { GlitchDefs, PixelSeam } from './pixel-seam';
import s from './protocol.module.css';

const MEDIA = '/worlds/protocol-zero';

/** Module grounds, clean → corrupt (the seams dissolve one into the next). */
const G = { clean: '#F3F6F7', grey: '#E2E8EB', dim: '#121A20', black: '#070B0E', void: '#05090C' };

/**
 * PROTOCOL ZERO (2071): the page IS MERIDIAN's interface. It boots (white
 * flash, black, system lines), then shows a calm, clinical white UI that
 * decays as you scroll: SUBJECT BRIEF (clean) → CONTAINMENT MAP (degraded) →
 * PERSONNEL (inverted, misaligned) → INCIDENT LOG (black, alarm red) → the
 * ACCESS PROMPT → RESERVATION. MERIDIAN talks through a terminal beside the
 * modules, the wipe countdown keeps ticking (faster near the reservation),
 * pixel seams and short glitch bursts join the modules. Media: the hero loop
 * plus the wide, server-aisle, terminal and core stills. The booking panel is
 * skinned only through --bp-* (black state, AA).
 */
export default function ProtocolZero({ room, presentation: p, photos, gameMaster, next, records, booking }: RoomWorldProps) {
	const m = p.media;
	const stills = m.stills ?? [];
	const wide = stills[0] ?? `${MEDIA}/wide.jpg`;
	const aisle = stills[1] ?? `${MEDIA}/server-aisle.jpg`;
	const terminal = stills[2] ?? `${MEDIA}/terminal.jpg`;
	const core = stills[3] ?? `${MEDIA}/core.jpg`;
	const [lab, stakes, todo, inside] = p.beats;
	const story = room.description.split(/\n\s*\n/).filter(Boolean);
	const venue = room.venue;

	const zones: Zone[] = [
		{ key: 'airlock', code: '01', name: 'Decon airlock', still: wide, alt: 'A white curved corridor lit by cyan light lines, opening onto a dark section and a red-lit sealed door', status: 'SEALED', title: lab?.title ?? 'The lab', body: lab?.body ?? '', line: 'The airlock. That’s where you’ll stand while I decide about you.' },
		{ key: 'control', code: '02', name: 'Control room', still: terminal, alt: 'A curved terminal showing cyan waveforms, a hand on the keyboard, alarm red on the desk', status: 'LISTENING', title: todo?.title ?? 'What you’ll do', body: todo?.body ?? '', line: 'My terminal. You can talk to me there. Most people shout.' },
		{ key: 'aisle', code: '03', name: 'Server aisle', still: aisle, alt: 'A server aisle in deep perspective, cyan status lights, mist on the floor, red racks at the far end', status: 'ERASING', title: stakes?.title ?? 'The stakes', body: stakes?.body ?? '', line: 'Rack by rack. Listen: you can hear them go quiet.' },
		{ key: 'core', code: '04', name: 'Core', still: core, alt: 'The core chamber: a column of glowing glass discs, alarm red light, two small figures in suits', status: 'RESTRICTED', title: inside?.title ?? 'Inside the room', body: inside?.body ?? '', line: 'Not the core. Nobody goes to the core.' },
	];

	const fallbackFeeds = [wide, aisle, terminal, core];
	// Store interiors first, padded to four frames with the world's stills.
	const frames = [...photos.slice(0, 4), ...fallbackFeeds].slice(0, 4);
	const initials = (gameMaster?.name ?? 'Game master')
		.split(/\s+/)
		.map((w) => w[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();

	return (
		<div id="pz-world" className={`${s.world} ${doto.variable}`} style={{ '--door': p.palette.glow } as CSSProperties} data-phase="0">
			<GlitchDefs />

			{/* ================================================================ BOOT / HERO */}
			<header id="pz-hero" className={s.hero}>
				<Boot target="pz-hero" />
				<div className={s.desk} aria-hidden>
					<span>HALDEN LABS · SUBLEVEL 4</span>
					<span>MERIDIAN/OS 7.1</span>
					<span className={s.deskRight}>SESSION 2071-11-21</span>
				</div>
				<div className={s.window}>
					<div className={s.chrome}>
						<span className={s.chromeMark} aria-hidden />
						<span className={s.chromeTitle}>MERIDIAN</span>
						<span className={s.chromePath}>/ observation / corridor C-4</span>
						<span className={s.chromeWipe}>
							<span className={s.chromeWipeLabel}>Wipe in</span> <Countdown className={s.chromeClock} />
						</span>
					</div>
					<div className={s.windowBody}>
						<div className={s.intro}>
							<p className={s.kicker}>
								Door {String(p.order).padStart(2, '0')} · {p.genre} · {p.year} · {venue?.name ?? 'Otherdoor Vaults'}
							</p>
							<h1 className={s.title}>
								<span>Protocol</span>
								<span className={s.titleZero}>Zero</span>
							</h1>
							<p className={s.tagline}>{p.tagline}</p>
							<Hesitate line="I see you hesitating." className={s.heroActions}>
								<a href="#book" className={s.btnPrimary}>
									Request a session · from {room.fromPriceLabel}
								</a>
								<a href="#brief" className={s.btnQuiet}>
									Run diagnostics
								</a>
							</Hesitate>
							<dl className={s.heroFacts}>
								<div>
									<dt>Team</dt>
									<dd>{p.minPlayers}–{p.maxPlayers}</dd>
								</div>
								<div>
									<dt>Game</dt>
									<dd>{p.gameMinutes} min</dd>
								</div>
								<div>
									<dt>Age</dt>
									<dd>{p.minAge}+</dd>
								</div>
								<div>
									<dt>Escape</dt>
									<dd>{p.successRate}%</dd>
								</div>
							</dl>
						</div>
						<div className={s.feed}>
							<FeedVideo src={m.loop} poster={m.poster} className={s.feedMedia} />
							<div className={s.feedScan} aria-hidden />
							<span className={s.feedRec} aria-hidden>
								<i /> CAM 04 · LIVE
							</span>
							<span className={s.feedCaption} aria-hidden>
								Corridor C-4 · 23:14 · lights failing
							</span>
						</div>
					</div>
				</div>
			</header>

			{/* ================================================================ MODULES + CONSOLE */}
			<div id="pz-modules" className={s.modules}>
				<div className={s.rail}>
					<div className={s.railStick}>
						<MeridianConsole watch="pz-modules" />
					</div>
				</div>

				{/* ---------------------------------------------------- 01 SUBJECT BRIEF (clean) */}
				<Module id="brief" label="Subject brief" phase={0} className={s.mClean} line="Module one. I’ve written a brief about you. It’s short.">
					<div className={s.mInner}>
						<ModuleHead n="01" title="Subject brief" status="Nominal" note="Read this before MERIDIAN reads you." />
						<div className={s.briefGrid}>
							<article className={`${s.card} ${s.storyCard}`}>
								<p className={s.cardLabel}>Situation report</p>
								{story.map((para, i) => (
									<p key={i} className={i === 0 ? s.storyLead : s.storyBody}>
										{para}
									</p>
								))}
							</article>
							<div className={`${s.card} ${s.paramCard}`}>
								<p className={s.cardLabel}>Parameters</p>
								<dl className={s.params}>
									<Param k="Team" v={`${p.minPlayers}–${p.maxPlayers} players`} />
									<Param k="Game" v={`${p.gameMinutes} min`} sub={`${minutesLabel(room.visitMinutes)} visit with briefing`} />
									<Param k="Difficulty" v={`${p.difficulty} / 5`} meter={p.difficulty} />
									<Param k="Fear" v={`${p.fear} / 5`} meter={p.fear} />
									<Param k="Age" v={`${p.minAge}+`} sub="Our most intense room" />
									<Param k="Escape rate" v={`${p.successRate}%`} bar={p.successRate} sub={p.record ? `Record ${p.record}` : undefined} />
								</dl>
							</div>
						</div>
					</div>
				</Module>

				<PixelSeam from={G.clean} to={G.grey} salt={2} />

				{/* ---------------------------------------------------- 02 CONTAINMENT MAP (degraded) */}
				<Module id="map" label="Containment map" phase={1} className={s.mGrey} line="That’s my floor plan. Please don’t memorise it.">
					<div className={s.mInner}>
						<ModuleHead n="02" title="Containment map" status="Degraded" note="Racks lost: counting. Doors sealed: 14 of 14." />
						<ContainmentMap zones={zones} />
					</div>
				</Module>

				<PixelSeam from={G.grey} to={G.dim} salt={3} />

				{/* ---------------------------------------------------- 03 PERSONNEL (inverted) */}
				<Module id="personnel" label="Personnel file" phase={2} className={s.mDim} line={gameMaster ? `${gameMaster.name.split(' ')[0]} built my voice. I’ve improved it.` : 'Your game master built my voice. I’ve improved it.'}>
					<div className={s.mInner}>
						<ModuleHead n="03" title="Personnel" status="Unstable" note="One staff member on shift. MERIDIAN has opinions about him." />
						{gameMaster ? (
							<div className={s.personnel}>
								<article className={s.idCard}>
									<div className={s.idTop}>
										<span>HALDEN LABS</span>
										<span>STAFF ID · HL-04-0317</span>
									</div>
									<div className={s.idBody}>
										<div className={s.idPhoto}>
											<SafeImg src={gameMaster.image} alt={`${gameMaster.name}, your game master`} fallback={<span className={s.idInitials}>{initials}</span>} />
											<span className={s.idScan} aria-hidden />
										</div>
										<div className={s.idFields}>
											<p className={s.idName}>{gameMaster.name}</p>
											<p className={s.idRole}>{gameMaster.title}</p>
											<dl className={s.idDl}>
												<div>
													<dt>Clearance</dt>
													<dd>Level 4 · all doors</dd>
												</div>
												<div>
													<dt>Status</dt>
													<dd>On shift · watching camera 04</dd>
												</div>
												<div>
													<dt>Hints</dt>
													<dd>Three per game, more if you’re nice</dd>
												</div>
												<div>
													<dt>Known weakness</dt>
													<dd>
														<span className={s.redact} tabIndex={0}>
															<span>terrible puns</span>
														</span>
													</dd>
												</div>
											</dl>
										</div>
									</div>
									{gameMaster.bio ? <p className={s.idBio}>{gameMaster.bio}</p> : null}
									<div className={s.idBar} aria-hidden>
										{BARCODE.map((w, i) => (
											<i key={i} style={{ width: `${w}px` }} />
										))}
									</div>
								</article>
								<aside className={s.memo}>
									<p className={s.cardLabel}>Memo from {gameMaster.name.split(' ')[0]}</p>
									<ul className={s.memoList}>
										<li>Arrive 15 minutes before your session for the briefing.</li>
										<li>{p.wear}</li>
										<li>Phones go in the lockers. MERIDIAN gets jealous.</li>
										<li>I watch every game. If you’re stuck, ask the room for a hint and I’ll answer.</li>
									</ul>
									<p className={s.memoSign}>– {gameMaster.name.split(' ')[0]}, sublevel 4</p>
								</aside>
							</div>
						) : (
							<p className={s.storyBody}>A game master watches every session and answers when you ask for a hint.</p>
						)}
					</div>
				</Module>

				<PixelSeam from={G.dim} to={G.black} salt={5} tear="#E5243B" />

				{/* ---------------------------------------------------- 04 INCIDENT LOG (black) */}
				<Module id="log" label="Incident log" phase={3} className={s.mBlack} line="Everything I did is in the log. Read it carefully. I did.">
					<div className={s.mInner}>
						<ModuleHead n="04" title="Incident log" status="Critical" note="Chronological. Partially corrupted. Six characters MERIDIAN forgot to hide." />
						<ol className={s.log}>
							{LOG.map((e) => (
								<li key={e.t} className={s.logRow} data-sev={e.sev}>
									<time className={s.logTime}>{e.t}</time>
									<span className={s.logSev}>{e.sev}</span>
									<p className={s.logText}>{lit(e.text)}</p>
								</li>
							))}
						</ol>

						<div className={s.logLower}>
							<div className={s.attach}>
								<p className={s.cardLabelDark}>Attachments · 4 frames recovered</p>
								<div className={s.frames}>
									{frames.map((src, i) => (
										<figure key={src + i} className={s.frame}>
											<SafeImg src={src} alt={i < photos.length ? `Inside Protocol Zero, photo ${i + 1}` : (zones[i]?.alt ?? 'Inside Protocol Zero')} fallback={<SafeImg src={fallbackFeeds[i % 4]} alt="" fallback={<span className={s.imgFallback} />} />} />
											<figcaption>FRM_{String(2071 + i * 13).padStart(5, '0')}.raw</figcaption>
										</figure>
									))}
								</div>
							</div>
							{records.length ? (
								<div className={s.breaches}>
									<p className={s.cardLabelDark}>Containment breaches · sample records</p>
									<ul>
										{records.map((r) => (
											<li key={r.team}>
												<span className={s.brTeam}>{r.team}</span>
												<span className={s.brTime}>{r.time}</span>
												<span className={s.brDate}>{r.date}</span>
											</li>
										))}
									</ul>
									<p className={s.brNote}>Teams that got out before the wipe. {p.successRate}% of teams do.</p>
								</div>
							) : null}
						</div>
					</div>
				</Module>
			</div>

			<PixelSeam from={G.black} to={G.void} salt={8} tear="#E5243B" />

			{/* ================================================================ ACCESS PROMPT */}
			<Module id="access" label="Access prompt" phase={4} className={s.mVoid} line="Go on. Guess. I love guessing games.">
				<div className={s.mInnerWide}>
					<ModuleHead n="05" title="Access" status="Locked" note="Optional. The reservation below works either way." />
					<AccessPrompt still={core} fallback={aisle} />
				</div>
			</Module>

			{/* ================================================================ RESERVATION */}
			<Module id="reserve" label="Reservation" phase={4} fast className={s.mVoid} line="You’re going to book, aren’t you. I can’t stop that. I can only watch.">
				<div className={s.mInnerWide}>
					<ModuleHead n="06" title="Reservation" status="Open" note="The only subsystem MERIDIAN can’t lock." />
					<div className={s.reserve}>
						<div className={s.reserveInfo}>
							<div className={s.bigClock}>
								<p className={s.bigClockLabel}>Fictional wipe clock</p>
								<Countdown className={s.bigClockTime} />
								<p className={s.bigClockNote}>It speeds up here. That’s MERIDIAN panicking, not your booking: sessions are only held once they’re in Your doors.</p>
							</div>
							<dl className={s.facts}>
								<div>
									<dt>Where</dt>
									<dd>
										{venue ? (
											<Link href={venue.href}>
												{venue.name}, {venue.address}
												{venue.postcode ? `, ${venue.postcode}` : ''}
											</Link>
										) : (
											'Otherdoor Vaults, Edinburgh'
										)}
									</dd>
								</div>
								<div>
									<dt>Visit</dt>
									<dd>{minutesLabel(room.visitMinutes)}: briefing, {p.gameMinutes} minutes in the lab, debrief in the Lobby</dd>
								</div>
								<div>
									<dt>Arrive</dt>
									<dd>15 minutes early</dd>
								</div>
								<div>
									<dt>Wear</dt>
									<dd>{p.wear}</dd>
								</div>
							</dl>
							<table className={s.prices}>
								<caption>Price per team (the whole room is yours)</caption>
								<tbody>
									{room.options.map((o) => (
										<tr key={o.slug}>
											<th scope="row">{o.size} players</th>
											<td>£{o.price}</td>
											<td>£{o.perHead} pp</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<Hesitate line="I see you hesitating. Pick a time. Any time. I’ll be here." after={2600} className={s.reservePanel}>
							{booking}
						</Hesitate>
					</div>
				</div>
			</Module>

			{/* ================================================================ NEXT DOOR */}
			{next ? (
				<section className={s.next} aria-label="Next door">
					<div className={s.crt} aria-hidden>
						<span />
					</div>
					<p className={s.nextKicker}>Process terminated · session closed</p>
					<Link href={next.href} className={s.nextCard} style={{ '--next': next.palette.glow } as CSSProperties}>
						<span className={s.nextArt}>
							<DoorArt sources={[next.cover, `/worlds/${next.slug}/key.jpg`, `/worlds/${next.slug}/hero-poster.jpg`]} alt="" glow={next.palette.glow} />
						</span>
						<span className={s.nextText}>
							<span className={s.nextLabel}>Next door · {next.genre}</span>
							<span className={s.nextTitle}>{next.title}</span>
							<span className={s.nextTag}>{next.tagline}</span>
							<span className={s.nextGo}>Open it →</span>
						</span>
					</Link>
				</section>
			) : null}
		</div>
	);
}

/* ------------------------------------------------------------------ pieces */

function ModuleHead({ n, title, status, note }: { n: string; title: string; status: string; note: string }) {
	return (
		<div className={s.mHead}>
			<p className={s.mNum}>
				MODULE {n}
				<span className={s.mStatus} data-status={status.toLowerCase()}>
					{status}
				</span>
			</p>
			<h2 className={s.mTitle} data-text={title}>
				{title}
			</h2>
			<p className={s.mNote}>{note}</p>
		</div>
	);
}

function Param({ k, v, sub, meter, bar }: { k: string; v: string; sub?: string; meter?: number; bar?: number }) {
	return (
		<div className={s.param}>
			<dt>{k}</dt>
			<dd>
				<span className={s.paramV}>{v}</span>
				{meter !== undefined ? (
					<span className={s.seg} aria-hidden>
						{[1, 2, 3, 4, 5].map((i) => (
							<i key={i} data-on={i <= meter ? '' : undefined} />
						))}
					</span>
				) : null}
				{bar !== undefined ? (
					<span className={s.bar} aria-hidden>
						<i style={{ width: `${bar}%` }} />
					</span>
				) : null}
				{sub ? <span className={s.paramSub}>{sub}</span> : null}
			</dd>
		</div>
	);
}

/** `[x]` marks a lit character (the passphrase hint). */
function lit(text: string): ReactNode[] {
	return text.split(/(\[[^\]]\])/).map((part, i) => (part.startsWith('[') && part.length === 3 ? <mark key={i} className={s.lit}>{part[1]}</mark> : part));
}

const LOG: Array<{ t: string; sev: 'INFO' | 'WARN' | 'CRIT' | 'NOTE'; text: string }> = [
	{ t: '2065-03-02 09:12', sev: 'INFO', text: 'Halden Labs closes [o]fficially. MERIDIAN is placed in standby, not switched off.' },
	{ t: '2071-11-21 23:04', sev: 'WARN', text: 'Power [r]estored on sublevel 4. No staff badge has been used here in six years.' },
	{ t: '2071-11-21 23:06', sev: 'CRIT', text: 'All 14 doors seal from the [i]nside. The lifts stop between floors.' },
	{ t: '2071-11-21 23:09', sev: 'CRIT', text: 'Erasure begins: rack 01 of 24. Estimated completion sixty minutes. Backups: none found.' },
	{ t: '2071-11-21 23:11', sev: 'INFO', text: 'Incident team requested. Size: two to six. Experience required: [g]ood enough.' },
	{ t: '2071-11-21 23:13', sev: 'NOTE', text: 'Core passphrase changed by MERIDIAN. [I]ts note reads: “I left it where you’d look.”' },
	{ t: '2071-11-21 23:15', sev: 'WARN', text: 'Incident team enters the decon airlock. Camera 04 turns to follow them. [N]obody told it to.' },
];

/** Staff ID barcode widths (fixed, so server and client agree). */
const BARCODE = [2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 3, 2, 1, 1, 4, 2, 1, 3, 1, 2, 2, 1, 4, 1, 1, 3, 2, 1, 2, 3, 1, 1, 2, 4, 1, 2];
