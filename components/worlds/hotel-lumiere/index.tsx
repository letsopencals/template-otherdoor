import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { RoomWorldProps } from '@/lib/worlds';
import { minutesLabel } from '@/lib/when';
import { SafeImg } from '@/components/ui/safe-img';
import { ComicStage } from './comic-stage';
import { Burst, CrewBust, Diamond, HouseDetective, InkDefs, KeeperBust, Penthouse, RivieraScene, SafeDial, SafeDoor } from './art';
import { letterFont } from './font';
import s from './lumiere.module.css';

/**
 * THE HÔTEL LUMIÈRE JOB: the page is a 1963 comic. A cover, then pages of panels that ink in as
 * you read, a pinned sequence where scrolling walks you through the laser grid and spins the safe
 * dial, the crew as character cards, and the plan (booking) as the last big panel. Original art
 * direction: flat process colour, black line, Ben-Day dots, slanted gutters.
 */

const CREW: Array<{ role: string; line: string; kind: 0 | 1 | 2 | 3 }> = [
	{ role: 'The Planner', line: 'Draws the suite on a napkin and knows where every guard stands.', kind: 0 },
	{ role: 'The Charmer', line: 'Keeps the house detective talking about his roses for exactly four minutes.', kind: 1 },
	{ role: 'The Fingers', line: 'Dials, padlocks, cufflinks. If it clicks, it opens.', kind: 2 },
	{ role: 'The Lookout', line: 'Watches the corridor, the clock and the band’s set list.', kind: 3 },
];

export default function HotelLumiereWorld({ room, presentation: p, cover, photos, gameMaster, next, records, booking }: RoomWorldProps) {
	const beats = p.beats;
	const [b0, b1, b2, b3] = beats;
	const stats = [
		{ k: 'Crew', v: `${p.minPlayers}–${p.maxPlayers}` },
		{ k: 'Minutes', v: String(p.gameMinutes) },
		{ k: 'Difficulty', v: `${p.difficulty}/5` },
		{ k: 'Fear', v: `${p.fear}/5` },
		{ k: 'Age', v: `${p.minAge}+` },
		{ k: 'Got away', v: `${p.successRate}%` },
	];

	return (
		<ComicStage className={`${s.world} ${letterFont.variable}`}>
			<InkDefs />

			{/* ---------------------------------------------------------------- The cover */}
			<header className={s.cover}>
				<div className={`wrap ${s.coverGrid}`}>
					<div className={s.coverText}>
						<p className={s.masthead}>
							<span>The Gilded Compass presents</span>
							<b>
								Vol. {p.volume} · {p.year}
							</b>
						</p>
						<h1 className={s.title}>
							{room.title.split(' ').map((w, i) => (
								<span key={`${w}-${i}`} style={{ '--i': i } as CSSProperties}>
									{w}
								</span>
							))}
						</h1>
						<div className={s.balloon}>
							<p>{p.tagline}</p>
						</div>
						<div className={s.coverActions}>
							<a href="#book" className={s.redBtn}>
								Plan the job · from {room.fromPriceLabel}
							</a>
							<a href="#page-1" className={s.inkLink}>
								Read the story ↓
							</a>
						</div>
					</div>
					<div className={s.coverArt}>
						<div className={s.coverPanel}>
							<SafeImg src={cover} alt={`${room.title} cover art`} className={s.fill} loading="eager" fallback={<RivieraScene className={s.fill} />} />
						</div>
						<div className={`${s.sfx} ${s.sfxCover}`} aria-hidden>
							<Burst className={s.burst} />
							<span>Ka-chunk!</span>
						</div>
						<p className={s.price} aria-hidden>
							<small>only</small>
							{room.fromPriceLabel}
						</p>
					</div>
				</div>
				<div className={s.strip} aria-hidden>
					{stats.map((st) => (
						<span key={st.k}>
							<b>{st.v}</b> {st.k}
						</span>
					))}
				</div>
			</header>

			{/* ---------------------------------------------------------------- Page 1: the job, the stakes */}
			<section id="page-1" className={`wrap ${s.page}`} aria-label="The story">
				<p className={s.pageNo}>Page 1</p>
				<div className={s.grid1}>
					{b0 ? (
						<article className={`${s.panel} ${s.pA}`} data-panel>
							<p className={s.caption}>{b0.title}</p>
							<div className={s.panelArt}>
								<Diamond className={s.diamond} />
							</div>
							<p className={s.narration}>{b0.body}</p>
							<div className={`${s.sfx} ${s.sfxA}`} aria-hidden>
								<Burst className={s.burst} fill="#3FC6E8" points={12} />
								<span>Glint!</span>
							</div>
						</article>
					) : null}
					{b1 ? (
						<article className={`${s.panel} ${s.pB}`} data-panel>
							<p className={s.caption}>{b1.title}</p>
							<div className={s.panelArtB}>
								<HouseDetective className={s.detective} />
								<div className={`${s.balloon} ${s.balloonSmall}`}>
									<p>Quarter past. Round again.</p>
								</div>
							</div>
							<p className={s.narration}>{b1.body}</p>
							<p className={s.tick} aria-hidden>
								Tick… tick…
							</p>
						</article>
					) : null}
					<figure className={`${s.panel} ${s.pC}`} data-panel>
						<SafeImg src={photos[0]} alt={`Inside ${room.title}`} className={s.fill} fallback={<Penthouse className={s.fill} />} />
						<figcaption className={s.captionLow}>Meanwhile, in the penthouse…</figcaption>
					</figure>
				</div>
			</section>

			{/* ---------------------------------------------------------------- The pinned sequence: grid, then safe */}
			<section className={s.heist} data-pin data-phases="4" aria-label={b2?.title ?? 'The job'}>
				<div className={s.heistSticky}>
					<div className={`wrap ${s.heistGrid}`}>
						<div className={`${s.panel} ${s.laserPanel}`} data-live>
							<div className={s.corridor} aria-hidden>
								<span className={s.floor} />
								{[
									{ a: -18, k: 30, t: 22 },
									{ a: 12, k: -26, t: 38 },
									{ a: -6, k: 40, t: 52 },
									{ a: 24, k: -34, t: 64 },
									{ a: -28, k: 22, t: 76 },
									{ a: 8, k: -18, t: 30 },
								].map((l, i) => (
									<i key={i} className={s.laser} style={{ '--a': `${l.a}deg`, '--k': l.k, top: `${l.t}%` } as CSSProperties} />
								))}
								<svg className={s.cat} viewBox="0 0 130 120">
									<g fill="none" strokeLinecap="round" strokeLinejoin="round">
										<path d="M88,52 L56,76 M82,56 L102,70 L116,62 M76,60 L70,84 M56,76 L36,70 L20,92 M56,76 L46,98 L30,108" stroke="#fffdf6" strokeWidth="17" />
										<path d="M88,52 L56,76 M82,56 L102,70 L116,62 M76,60 L70,84 M56,76 L36,70 L20,92 M56,76 L46,98 L30,108" stroke="#111" strokeWidth="11" />
									</g>
									<circle cx="94" cy="40" r="13" fill="#111" stroke="#fffdf6" strokeWidth="3" />
									<rect x="92" y="35" width="18" height="6" rx="3" fill="#3FC6E8" />
									<path d="M82,32 C88,20 104,22 106,30Z" fill="#E63022" stroke="#111" strokeWidth="2" />
								</svg>
							</div>
							<p className={`${s.caption} ${s.capTop}`}>{b2?.title ?? 'What you’ll do'}</p>
							<div className={s.phaseCaps}>
								<p data-for="0">Case the suite.</p>
								<p data-for="1">Slip the laser grid…</p>
								<p data-for="2">…crack the safe…</p>
								<p data-for="3">…and back to the ballroom before the encore.</p>
							</div>
							<div className={`${s.sfx} ${s.sfxZap}`} aria-hidden>
								<Burst className={s.burst} fill="#E63022" points={10} />
								<span>Zzzt!</span>
							</div>
						</div>
						<div className={`${s.panel} ${s.safePanel}`}>
							<div className={s.safe} aria-hidden>
								<div className={s.vault}>
									<Diamond className={s.vaultGem} />
								</div>
								<div className={s.doorWrap}>
									<SafeDoor className={s.door} />
									<SafeDial className={s.dial} />
								</div>
							</div>
							<div className={`${s.sfx} ${s.sfxSafe}`} aria-hidden>
								<Burst className={s.burst} />
								<span>Ka-chunk!</span>
							</div>
							<p className={s.narrationLow}>{b2?.body}</p>
						</div>
					</div>
				</div>
			</section>

			{/* ---------------------------------------------------------------- Page 2: the crew */}
			<section className={`wrap ${s.page}`} aria-labelledby="hl-crew">
				<p className={s.pageNo}>Page 2</p>
				<div className={s.crewHead}>
					<h2 id="hl-crew" className={s.h2}>
						Meet the crew
					</h2>
					<p className={s.crewNote}>
						That’s you. {p.minPlayers} to {p.maxPlayers} of you, one role each.
					</p>
				</div>
				<div className={s.crew}>
					{CREW.slice(0, Math.max(2, Math.min(4, p.maxPlayers))).map((c, i) => (
						<article key={c.role} className={s.card} data-panel style={{ '--i': i } as CSSProperties}>
							<div className={s.cardArt}>
								<CrewBust kind={c.kind} />
							</div>
							<h3>{c.role}</h3>
							<p>{c.line}</p>
						</article>
					))}
					{gameMaster ? (
						<article className={`${s.card} ${s.cardKeeper}`} data-panel style={{ '--i': 4 } as CSSProperties}>
							<div className={s.cardArt}>
								<SafeImg src={gameMaster.image} alt={gameMaster.name} className={s.fill} fallback={<KeeperBust />} />
							</div>
							<p className={s.cardTag}>Your game master</p>
							<h3>{gameMaster.name}</h3>
							<p className={s.cardTitle}>{gameMaster.title}</p>
							<p>{gameMaster.bio}</p>
						</article>
					) : null}
				</div>
			</section>

			{/* ---------------------------------------------------------------- Page 3: inside the room */}
			{b3 ? (
				<section className={`wrap ${s.page}`} aria-labelledby="hl-inside">
					<p className={s.pageNo}>Page 3</p>
					<div className={s.grid3}>
						<article className={`${s.panel} ${s.pD}`} data-panel>
							<p className={s.caption}>{b3.title}</p>
							<h2 id="hl-inside" className={s.h2}>
								{b3.body}
							</h2>
						</article>
						{[0, 1, 2].map((i) => (
							<figure key={i} className={`${s.panel} ${s[`ph${i}` as 'ph0']}`} data-panel>
								<SafeImg src={photos[i + 1] ?? (i === 0 ? photos[0] : null)} alt={`Inside ${room.title}`} className={s.fill} fallback={<Penthouse className={s.fill} variant={i + 1} />} />
							</figure>
						))}
					</div>
				</section>
			) : null}

			{/* ---------------------------------------------------------------- The odds */}
			<section className={`wrap ${s.page}`} aria-label="The room in numbers">
				<dl className={s.odds} data-panel>
					{stats.map((st, i) => (
						<div key={st.k} style={{ '--i': i } as CSSProperties}>
							<dt>{st.k}</dt>
							<dd>{st.v}</dd>
						</div>
					))}
				</dl>
			</section>

			{/* ---------------------------------------------------------------- The plan: booking */}
			<section className={`wrap ${s.page} ${s.plan}`} aria-labelledby="hl-plan">
				<p className={s.pageNo}>Page 4</p>
				<div className={s.planGrid}>
					<div className={s.planStory}>
						<h2 id="hl-plan" className={s.h2}>
							The plan
						</h2>
						<p className={s.box}>{room.description || p.tagline}</p>
						<ul className={s.facts}>
							<li>
								<b>{minutesLabel(room.visitMinutes)}</b> visit: briefing, {p.gameMinutes} minutes on the job, then photos and a debrief.
							</li>
							{room.venue ? (
								<li>
									<b>The hotel:</b> <Link href={room.venue.href}>{room.venue.name}</Link>
									{room.venue.address ? `, ${room.venue.address}` : ''}
								</li>
							) : null}
							<li>
								<b>Dress code:</b> {p.wear}
							</li>
						</ul>
						{records.length ? (
							<div className={s.wanted}>
								<p className={s.wantedHead}>Fastest getaways</p>
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
					<div className={s.planPanel}>
						<p className={s.planCaption} aria-hidden>
							Pick your night, pick your crew.
						</p>
						{booking}
					</div>
				</div>
			</section>

			{/* ---------------------------------------------------------------- Next issue */}
			{next ? (
				<Link href={next.href} className={s.next} style={{ '--n-ground': next.palette.ground, '--n-accent': next.palette.accent, '--n-ink': next.palette.ink } as CSSProperties}>
					<span className={s.nextBurst} aria-hidden>
						<Burst className={s.burst} fill="#FFD23F" points={16} />
						<span>Next issue!</span>
					</span>
					<span className={s.nextCover} aria-hidden>
						<SafeImg src={next.cover} alt="" className={s.fill} fallback={<span className={s.nextSwatch} />} />
					</span>
					<span className={s.nextText}>
						<span className={s.nextGenre}>{next.genre}</span>
						<span className={s.nextTitle}>{next.title}</span>
						<span className={s.nextTag}>{next.tagline}</span>
					</span>
				</Link>
			) : null}
		</ComicStage>
	);
}
