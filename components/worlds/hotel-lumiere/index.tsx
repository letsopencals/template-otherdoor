import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import type { RoomWorldProps } from '@/lib/worlds';
import { minutesLabel } from '@/lib/when';
import { SafeImg } from '@/components/ui/safe-img';
import { bowlby, shantell } from './font';
import { BLUE, BeamsVignette, ClockFace, Coupe, CoverArt, CrewPortrait, DetectiveShadow, DialVignette, Diamond, DiamondVignette, DoorKnob, INK, LumiereDefs, PINK, Palm, RED, YELLOW, burstPath, type CrewKey } from './art';
import { Balloon, Caption, Sfx } from './lettering';
import { SlamObserver } from './slam-observer';
import { SplashLoop } from './splash-loop';
import { LaserGrid } from './laser-grid';
import { SafeDial } from './safe-dial';
import s from './lumiere.module.css';

const MEDIA = '/worlds/hotel-lumiere';

const CREW: Array<{ key: CrewKey; role: string; alias: string; line: string; stats: [string, number][]; tone: string }> = [
	{ key: 'safecracker', role: 'The safecracker', alias: '“Feathers”', line: 'Hears a tumbler fall through two inches of Swiss steel.', stats: [['Nerve', 5], ['Patience', 4], ['Small talk', 1]], tone: 'cyan' },
	{ key: 'face', role: 'The face', alias: '“Coco”', line: 'Keeps the house detective dancing while the rest of you work.', stats: [['Charm', 5], ['Bluff', 5], ['Lockpicking', 2]], tone: 'pink' },
	{ key: 'driver', role: 'The driver', alias: '“Rocket”', line: 'Coupé idling on the Promenade, engine warm, one eye on the clock.', stats: [['Timing', 5], ['Maps', 4], ['Patience', 1]], tone: 'yellow' },
	{ key: 'inside', role: 'The inside man', alias: '“Luc, room service”', line: 'Knows which lift is slow and which waiter never looks up.', stats: [['Keys', 5], ['Gossip', 4], ['Nerve', 3]], tone: 'blue' },
];

/**
 * THE HÔTEL LUMIÈRE JOB (1963): the page is a comic book. Issue No. 9 opens on
 * its cover, then reads as pages of panels (a splash page, a three-tier page,
 * a diagonal crew page, the vault corridor, the safe, the back-page small ads)
 * and ends on "The plan: pick your night" around the shared booking panel and a
 * "Next issue" box. Panels slam in with halftone screens resolving, balloons pop
 * in reading order, sound effects land; the laser grid and the safe dial are
 * playable. Light newsprint world: headerTone 'dark'. Panel skinned via --bp-*.
 */
export default function HotelLumiere({ room, presentation: p, photos, gameMaster, next, records, booking }: RoomWorldProps) {
	const m = p.media;
	const vault = still(m.stills, 'vault.jpg');
	const wide = still(m.stills, 'wide.jpg');
	const corridor = still(m.stills, 'laser-corridor.jpg');
	const crewShot = still(m.stills, 'balcony-crew.jpg');
	const sunset = still(m.stills, 'plate-sunset.jpg');
	const [job, stakes, todo, inside] = p.beats;
	const venue = room.venue?.name ?? 'Otherdoor Leith';
	const doorNo = String(p.order).padStart(2, '0');
	const setPhotos = photos.slice(0, 3);
	const planner = gameMaster?.name ?? 'Eilidh Baxter';
	const plannerFirst = planner.split(' ')[0] ?? planner;

	return (
		<div className={`${s.world} ${bowlby.variable} ${shantell.variable}`} style={{ '--door': p.palette.glow } as CSSProperties} data-lm-root>
			<LumiereDefs />
			<SlamObserver />

			{/* ================================================================ THE COVER */}
			<header className={s.cover}>
				<div className={s.coverSheet}>
					<div className={s.coverTop}>
						<div className={s.issueBox} aria-label="Issue number 9, price 12 new francs, November 1963">
							<span className={s.issueNo}>No.</span>
							<span className={s.issueNum}>9</span>
							<span className={s.issuePrice}>12 NF</span>
							<span className={s.issueMonth}>Nov. ’63</span>
						</div>
						<p className={s.presents}>
							<span>Otherdoor Picture Stories</span>
							<span>presents</span>
						</p>
						<p className={s.coverDoor}>
							<span>Door {doorNo}</span>
							<span>{venue}</span>
						</p>
					</div>
					<div className={s.masthead} aria-hidden>
						<span className={s.mastheadWord}>Lumière</span>
						<span className={s.mastheadTag}>Riviera capers in full colour!</span>
					</div>
					<div className={s.coverArtWrap}>
						<CoverArt className={s.coverArt} />
						<div className={s.coverText}>
							<h1 className={s.coverTitle}>
								<span>The Hôtel</span>
								<span>Lumière Job</span>
							</h1>
							<p className={s.coverTagline}>{p.tagline}</p>
							<div className={s.coverActions}>
								<a href="#book" className={s.btnPop}>
									Book your night · from {room.fromPriceLabel}
								</a>
								<a href="#page-1" className={s.btnPaper}>
									Read the issue ↓
								</a>
							</div>
						</div>
						<div className={s.coverBurst} aria-hidden>
							<svg viewBox="-110 -110 220 220">
								<path d={burstPath(16, 104, 80, 0.05)} fill={YELLOW} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
							</svg>
							<span>
								One jewel!
								<br />
								One safe!
								<br />
								<b>{p.gameMinutes} minutes!</b>
							</span>
						</div>
						<div className={s.coverStamp} aria-hidden>
							<span>Ages</span>
							<b>{p.minAge}+</b>
							<span>Edinburgh</span>
						</div>
					</div>
					<p className={s.coverFoot}>
						<span>{p.year} · {p.genre}</span>
						<span>{p.minPlayers}–{p.maxPlayers} players · {p.gameMinutes} min · difficulty {p.difficulty}/5</span>
					</p>
				</div>
			</header>

			{/* ================================================================ PAGE 1: the splash */}
			<Page id="page-1" n={1} title="Chapter one" sub={job?.title ?? 'The job'}>
				<div className={s.splashGrid}>
					<figure className={`${s.panel} ${s.splash}`} data-slam>
						<SplashLoop src={m.loop} poster={m.poster} className={s.splashMedia} />
						<span className={s.splashScreen} aria-hidden />
						<span className={s.screen} aria-hidden />
						<Caption i={0} className={s.splashCap1}>
							Cap Lumière, on the Riviera. Summer 1963. The band starts at nine.
						</Caption>
						<Balloon i={1} tail="bl" className={s.splashB1}>
							Nobody gets past my grid, Madame la Comtesse. Your Étoile sleeps soundly.
						</Balloon>
						<Balloon i={2} kind="whisper" tail="br" className={s.splashB2}>
							Wanna bet?
						</Balloon>
						<Sfx text="SHHH" fill="#FFFFFF" shade={BLUE} size={0.9} tilt={-10} className={s.splashSfx} />
						<figcaption className="sr-only">The Hôtel Lumière at sunset across the bay, its searchlights coming on.</figcaption>
					</figure>
					<figure className={`${s.panel} ${s.inset} ${s.insetGem}`} data-slam style={{ '--d': '160ms' } as CSSProperties}>
						<DiamondVignette className={s.fill} />
						<span className={s.screen} aria-hidden />
						<Caption i={0} tone="paper" className={s.insetCap}>
							{job?.body}
						</Caption>
					</figure>
				</div>
			</Page>

			{/* ================================================================ PAGE 2: three tiers */}
			<Page id="page-2" n={2} title="Chapter two" sub="Sixty minutes while the band plays">
				<div className={s.tiers}>
					<div className={s.tier1}>
						<figure className={`${s.panel} ${s.pDetective}`} data-slam>
							<DetectiveShadow className={s.fill} />
							<span className={s.screen} aria-hidden />
							<div className={s.clockPin}>
								<ClockFace className={s.clock} />
							</div>
							<Caption i={0} className={s.capTL}>
								{stakes?.title ?? 'The stakes'}. {stakes?.body}
							</Caption>
							<Sfx text="TICK·TOCK" fill={YELLOW} shade={RED} size={0.62} tilt={6} className={s.tickSfx} />
						</figure>
						<figure className={`${s.panel} ${s.pNarration}`} data-slam style={{ '--d': '140ms' } as CSSProperties}>
							<span className={s.narrationKicker}>Previously, at the Lumière…</span>
							<p className={s.narration}>{room.description}</p>
						</figure>
					</div>
					<div className={s.tier2}>
						<figure className={`${s.panel} ${s.pSmall}`} data-slam>
							<DoorKnob className={s.fill} />
							<span className={s.screen} aria-hidden />
							<Sfx text="KA-CHUNK" fill={YELLOW} shade={RED} size={0.56} tilt={-8} className={s.smallSfx} />
							<Caption i={0} tone="paper" className={s.capBottom}>Case the suite.</Caption>
						</figure>
						<figure className={`${s.panel} ${s.pSmall}`} data-slam style={{ '--d': '120ms' } as CSSProperties}>
							<DialVignette className={s.fill} />
							<span className={s.screen} aria-hidden />
							<Sfx text="CLICK" fill="#FFFFFF" shade={BLUE} size={0.42} tilt={8} className={s.smallSfx} />
							<Caption i={0} tone="paper" className={s.capBottom}>Crack the safe.</Caption>
						</figure>
						<figure className={`${s.panel} ${s.pSmall}`} data-slam style={{ '--d': '240ms' } as CSSProperties}>
							<SafeImg src={corridor} alt="" className={`${s.photoFill} ${s.smallPhoto}`} fallback={<BeamsVignette className={s.fill} />} />
							<span className={`${s.screen} ${s.duoScreen}`} aria-hidden />
							<Caption i={0} tone="paper" className={s.capBottom}>Slip the grid.</Caption>
						</figure>
					</div>
					<p className={s.tierLine}>
						<span>{todo?.body ?? 'Case the suite, crack the safe, slip the laser grid and be back in the ballroom before the encore.'}</span>
					</p>
					<div className={s.tier3}>
						<figure className={`${s.panel} ${s.pInside}`} data-slam>
							<SafeImg src={setPhotos[0] ?? wide} alt={setPhotos[0] ? 'Inside the Hôtel Lumière set' : 'The Hôtel Lumière above the bay at sunset'} className={s.photoFill} fallback={<DiamondVignette className={s.fill} />} />
							<span className={`${s.screen} ${s.screenLight}`} aria-hidden />
							<Caption i={0} className={s.capTL}>
								{inside?.title ?? 'Inside the room'}. {inside?.body}
							</Caption>
						</figure>
						<figure className={`${s.panel} ${s.pCar}`} data-slam style={{ '--d': '160ms' } as CSSProperties}>
							<div className={s.carScene} aria-hidden>
								<SafeImg src={sunset} alt="" className={`${s.photoFill} ${s.carPlate}`} fallback={<span className={s.carSun} />} />
								<span className={s.carRoad} />
								<Coupe className={s.coupe} />
							</div>
							<Sfx text="VROOOM" fill={RED} shade={YELLOW} size={0.6} tilt={-5} className={s.carSfx} />
							<Balloon i={1} tail="bl" className={s.carBalloon}>
								Engine’s warm. You’ve got {p.gameMinutes} minutes, not a second more!
							</Balloon>
						</figure>
					</div>
				</div>
			</Page>

			{/* ================================================================ PAGE 3: the crew */}
			<Page id="page-3" n={3} title="Meet the crew" sub={`You are the crew: ${p.minPlayers} to ${p.maxPlayers} of you`}>
				<p className={s.crewIntro}>Pick your parts at the briefing. Every role has its own puzzles, and the job only works if you talk.</p>
				<figure className={`${s.panel} ${s.crewShot}`} data-slam>
					<SafeImg src={crewShot} alt="Three of the crew on the hotel terrace at sunset, one checking his watch" className={s.photoFill} fallback={<DiamondVignette className={s.fill} />} />
					<span className={`${s.screen} ${s.duoScreen}`} aria-hidden />
					<Caption i={0} className={s.capTL}>
						8.47 pm, the terrace. The band starts at nine.
					</Caption>
					<Balloon i={1} kind="whisper" tail="br" className={s.crewShotBalloon}>
						Synchronise watches.
					</Balloon>
				</figure>
				<ul className={s.crew}>
					{CREW.map((c, i) => (
						<li key={c.key} className={s.crewCard} data-tone={c.tone} data-slam style={{ '--d': `${i * 110}ms` } as CSSProperties}>
							<div className={s.crewArt}>
								<CrewPortrait who={c.key} className={s.crewSvg} />
							</div>
							<div className={s.crewText}>
								<p className={s.crewRole}>{c.role}</p>
								<p className={s.crewAlias}>{c.alias}</p>
								<p className={s.crewLine}>{c.line}</p>
								<dl className={s.crewStats}>
									{c.stats.map(([k, v]) => (
										<div key={k}>
											<dt>{k}</dt>
											<dd>
												<Pips n={v} />
											</dd>
										</div>
									))}
								</dl>
							</div>
						</li>
					))}
				</ul>
				<article className={`${s.panel} ${s.planner}`} data-slam>
					<div className={s.plannerArt}>
						<SafeImg src={gameMaster?.image} alt={planner} className={s.plannerPhoto} fallback={<CrewPortrait who="planner" className={s.crewSvg} />} />
						<span className={`${s.screen} ${s.screenLight}`} aria-hidden />
					</div>
					<div className={s.plannerText}>
						<p className={s.crewRole}>The planner · your game master</p>
						<h3 className={s.plannerName}>{planner}</h3>
						{gameMaster?.title ? <p className={s.plannerTitle}>{gameMaster.title}</p> : null}
						<p className={s.plannerBio}>{gameMaster?.bio ?? 'Eilidh trained as a stage magician and runs the Hôtel Lumière Job.'}</p>
						<Balloon i={1} tail="tl" className={s.plannerBalloon}>
							I’m in your ear the whole job. Ask for a hint any time: no shame, just style.
						</Balloon>
					</div>
				</article>
			</Page>

			{/* ================================================================ PAGE 4: the laser grid */}
			<Page id="page-4" n={4} title="Chapter three" sub="The vault corridor" dark>
				<figure className={`${s.panel} ${s.laserPanel}`} data-slam>
					<LaserGrid />
					<Caption i={0} className={s.laserCap}>
						Six beams. One corridor. The case at the far end.
					</Caption>
				</figure>
			</Page>

			{/* ================================================================ PAGE 5: the safe */}
			<Page id="page-5" n={5} title="Chapter four" sub="The penthouse safe">
				<div className={s.safeGrid}>
					<figure className={`${s.panel} ${s.safePanel}`} data-slam>
						<SafeDial />
					</figure>
					<aside className={s.safeSide}>
						<div className={s.note} data-slam style={{ '--d': '160ms' } as CSSProperties}>
							<p className={s.noteHead}>From the planner’s pocket</p>
							<p className={s.noteBody}>
								Stop on <b>19</b>, then <b>63</b>, then <b>9</b>.
								<br />
								The year, then the issue.
							</p>
							<p className={s.noteSig}>Burn after reading. {plannerFirst}</p>
						</div>
						<figure className={`${s.panel} ${s.vaultPanel}`} data-slam style={{ '--d': '260ms' } as CSSProperties}>
							<SafeImg src={vault} alt="A gloved hand swings the vault door open on the jewel under a spotlight" className={s.photoFill} fallback={<DiamondVignette className={s.fill} />} />
							<Sfx text="KA-CHUNK" fill={YELLOW} shade={RED} size={0.5} tilt={-9} className={s.vaultSfx} />
						</figure>
					</aside>
				</div>
			</Page>

			{/* ================================================================ PAGE 6: back pages */}
			<Page id="page-6" n={6} title="The back pages" sub="Small ads, the set, the rogues’ gallery">
				<div className={s.ads}>
					<Ad tone="red" big={`${p.minPlayers}–${p.maxPlayers}`} label="players">
						Bring the whole gang! One price for the crew.
					</Ad>
					<Ad tone="paper" big={`${p.gameMinutes}`} label="minutes">
						Not a second more. ({minutesLabel(room.visitMinutes)} with briefing and debrief.)
					</Ad>
					<Ad tone="yellow" big={<Stars n={p.difficulty} />} label={`difficulty ${p.difficulty}/5`}>
						Tricky but fair. The best first room we have.
					</Ad>
					<Ad tone="cyan" big={`${p.fear}/5`} label="fear">
						Hardly any! A nervous laugh at most.
					</Ad>
					<Ad tone="paper" big={`${p.minAge}+`} label="ages">
						Under-16s play with at least one adult on the team.
					</Ad>
					<Ad tone="blue" big={`${p.successRate}%`} label="escape">
						Will <em>your</em> crew make the encore?
					</Ad>
					<Ad tone="pink" big={p.record} label="room record">
						Think you’re faster? Our planner keeps the stopwatch.
					</Ad>
					<Ad tone="ink" big={room.fromPriceLabel} label="for the whole crew, from">
						<a href="#book">Clip this coupon: pick your night ↓</a>
					</Ad>
				</div>

				<h3 className={s.backHead}>From the set</h3>
				<div className={s.setStrip}>
					{(setPhotos.length ? setPhotos : [wide, vault]).map((src, i) => (
						<figure key={src} className={`${s.panel} ${s.setPhoto}`} data-slam style={{ '--d': `${i * 120}ms` } as CSSProperties}>
							<SafeImg src={src} alt={`Inside the Hôtel Lumière Job, view ${i + 1}`} className={s.photoFill} fallback={<DiamondVignette className={s.fill} />} />
							<figcaption className={s.setCap}>Panel {i + 1}</figcaption>
						</figure>
					))}
					{setPhotos.length < 3 ? (
						<figure className={`${s.panel} ${s.setPhoto} ${s.setArt}`} data-slam style={{ '--d': '160ms' } as CSSProperties}>
							<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className={s.fill} aria-hidden>
								<rect width="400" height="300" fill={RED} />
								<rect width="400" height="300" fill="url(#lm-dots-yellow)" opacity=".5" />
								<Palm x={330} y={110} s={0.55} flip />
								<Diamond x={150} y={150} s={2.2} />
							</svg>
							<figcaption className={s.setCap}>The penthouse, Leith edition</figcaption>
						</figure>
					) : null}
				</div>

				{records.length ? (
					<div className={s.rogues}>
						<h3 className={s.backHead}>The rogues’ gallery</h3>
						<p className={s.roguesNote}>Fastest crews · sample records</p>
						<ol className={s.roguesList}>
							{records.map((r, i) => (
								<li key={r.team}>
									<span className={s.rogueNo}>{i + 1}</span>
									<span className={s.rogueTeam}>{r.team}</span>
									<span className={s.rogueTime}>{r.time}</span>
								</li>
							))}
						</ol>
					</div>
				) : null}
			</Page>

			{/* ================================================================ FINAL PAGE: the plan */}
			<section className={s.plan} aria-labelledby="lm-plan-title">
				<div className={s.planFrame}>
					<div className={s.planHead}>
						<p className={s.pageKicker}>Final page</p>
						<h2 id="lm-plan-title" className={s.planTitle}>
							The plan: pick your night
						</h2>
					</div>
					<div className={s.planGrid}>
						<div className={s.planNotes}>
							<p className={s.planLede}>The price is for the whole crew, not per head. Choose a night, a time, and how many of you are in on it: up to {p.maxPlayers}.</p>
							<ol className={s.planSteps}>
								<li>
									<b>−15 min</b>
									<span>Arrive at {venue} 15 minutes before your time. Cocktail-hour briefing with {plannerFirst}.</span>
								</li>
								<li>
									<b>Your time</b>
									<span>The band strikes up. {p.gameMinutes} minutes in the penthouse.</span>
								</li>
								<li>
									<b>Encore</b>
									<span>Jewel or no jewel: team photo and a debrief in the Lobby.</span>
								</li>
							</ol>
							<p className={s.planWear}>
								<b>Dress code.</b> {p.wear}
							</p>
							<p className={s.planWhere}>
								{room.venue ? (
									<Link href={room.venue.href}>
										{room.venue.name}, {room.venue.address} {room.venue.postcode}
									</Link>
								) : (
									venue
								)}
							</p>
						</div>
						<div className={s.planPanel}>{booking}</div>
					</div>
				</div>
			</section>

			{/* ================================================================ NEXT ISSUE */}
			{next ? (
				<Link href={next.href} className={s.next} style={{ '--n': next.palette.glow } as CSSProperties}>
					<span className={s.nextBurst} aria-hidden>
						<svg viewBox="-110 -110 220 220">
							<path d={burstPath(12, 104, 76, 0.07)} fill={PINK} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
						</svg>
						<span>Next issue!</span>
					</span>
					<span className={s.nextCover}>
						<SafeImg src={next.cover} alt="" className={s.photoFill} fallback={
								<span className={s.nextFallback} style={{ background: next.palette.accent }}>
									<span>{next.title}</span>
								</span>
							} />
						<span className={`${s.screen} ${s.screenLight}`} aria-hidden />
					</span>
					<span className={s.nextText}>
						<span className={s.nextKicker}>Door {String(p.order + 1).padStart(2, '0')} · {next.genre}</span>
						<span className={s.nextTitle}>{next.title}</span>
						<span className={s.nextTag}>{next.tagline}</span>
						<span className={s.nextGo}>On sale now →</span>
					</span>
				</Link>
			) : null}

			<p className={s.colophon}>Otherdoor Picture Stories, No. 9. Every character in this issue is invented; any resemblance to a real jewel thief is a coincidence we would love to hear about.</p>
		</div>
	);
}

/* ------------------------------------------------------------------ module-scope pieces */

/** A named world still: the manifest's entry when declared, else the file in public/worlds/hotel-lumiere. */
function still(list: string[] | undefined, name: string): string {
	return list?.find((x) => x.endsWith(`/${name}`)) ?? `${MEDIA}/${name}`;
}

function Page({ id, n, title, sub, dark = false, children }: { id: string; n: number; title: string; sub: string; dark?: boolean; children: ReactNode }) {
	return (
		<section id={id} className={s.page} data-dark={dark ? '' : undefined} aria-labelledby={`${id}-t`}>
			<div className={s.pageHead}>
				<p className={s.pageKicker}>{title}</p>
				<h2 id={`${id}-t`} className={s.pageTitle}>
					{sub}
				</h2>
			</div>
			{children}
			<p className={s.folio} aria-hidden>
				<span>The Hôtel Lumière Job</span>
				<span>{n}</span>
			</p>
		</section>
	);
}

function Ad({ tone, big, label, children }: { tone: string; big: ReactNode; label: string; children: ReactNode }) {
	return (
		<div className={s.ad} data-tone={tone} data-slam>
			<p className={s.adBig}>{big}</p>
			<p className={s.adLabel}>{label}</p>
			<p className={s.adText}>{children}</p>
		</div>
	);
}

function Pips({ n }: { n: number }) {
	return (
		<span className={s.pips} role="img" aria-label={`${n} of 5`}>
			{Array.from({ length: 5 }, (_, i) => (
				<i key={i} data-on={i < n ? '' : undefined} />
			))}
		</span>
	);
}

function Stars({ n }: { n: number }) {
	return (
		<span className={s.stars} role="img" aria-label={`${n} of 5`}>
			{Array.from({ length: 5 }, (_, i) => (
				<svg key={i} viewBox="-12 -12 24 24" data-on={i < n ? '' : undefined} aria-hidden>
					<path d={burstPath(5, 11, 4.6)} />
				</svg>
			))}
		</span>
	);
}
