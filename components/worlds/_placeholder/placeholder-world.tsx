import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import type { RoomWorldProps } from '@/lib/worlds';
import { minutesLabel } from '@/lib/when';
import { SafeImg } from '@/components/ui/safe-img';
import s from './placeholder-world.module.css';

/**
 * The placeholder (and generic) world. Each room's world agent replaces
 * `components/worlds/<slug>/index.tsx` with the real thing; this stays as the
 * fallback for store rooms without a world folder.
 */
export default function PlaceholderWorld({ room, presentation: p, photos, gameMaster, next, booking, emblem }: RoomWorldProps & { emblem?: ReactNode }) {
	const vars = {
		'--w-ground': p.palette.ground,
		'--w-ink': p.palette.ink,
		'--w-accent': p.palette.accent,
		'--w-accent-ink': p.palette.accentInk,
		'--w-second': p.palette.second,
	} as CSSProperties;
	const nextVars = next ? ({ '--n-ground': next.palette.ground, '--n-ink': next.palette.ink } as CSSProperties) : undefined;
	return (
		<div className={s.world} style={vars}>
			<header className={s.hero}>
				{emblem ? <div className={s.emblem} aria-hidden>{emblem}</div> : null}
				<div className="wrap">
					<p className={s.kicker}>
						Volume {p.volume} · {p.genre}
						{p.year ? `, ${p.year}` : ''}
					</p>
					<h1 className={s.title}>{room.title}</h1>
					<p className={s.tagline}>{p.tagline}</p>
					<dl className={s.stats}>
						<div><dt>Players</dt><dd><b>{p.minPlayers}–{p.maxPlayers}</b></dd></div>
						<div><dt>Game</dt><dd><b>{p.gameMinutes} min</b></dd></div>
						<div><dt>Difficulty</dt><dd><b>{p.difficulty}/5</b></dd></div>
						<div><dt>Fear</dt><dd><b>{p.fear}/5</b></dd></div>
						<div><dt>Age</dt><dd><b>{p.minAge}+</b></dd></div>
						<div><dt>Escape rate</dt><dd><b>{p.successRate}%</b></dd></div>
					</dl>
					<p style={{ marginTop: 28 }}>
						<a className="plate plate-gold" href="#book">
							Book from {room.fromPriceLabel}
						</a>
					</p>
				</div>
			</header>

			<section className="wrap">
				<div className={s.story}>
					{p.beats.map((b, i) => (
						<article key={b.title} className={s.beat}>
							<span className={s.beatNum}>{i + 1}</span>
							<div>
								<h3>{b.title}</h3>
								<p>{b.body}</p>
							</div>
						</article>
					))}
				</div>
				{photos.length ? (
					<div className={s.photos}>
						{photos.map((src) => (
							<SafeImg key={src} src={src} alt={`Inside ${room.title}`} />
						))}
					</div>
				) : null}
			</section>

			<section className="wrap">
				<div className={s.bookWrap}>
					<div>
						<p className={s.kicker}>The briefing</p>
						<p className={s.desc}>{room.description || p.tagline}</p>
						<p className={s.desc} style={{ marginTop: 16 }}>
							{minutesLabel(room.visitMinutes)} visit: briefing, {p.gameMinutes} minutes in the room, then photos and a debrief.
							{room.venue ? ` At ${room.venue.name}.` : ''}
						</p>
						{gameMaster ? (
							<div className={s.gm}>
								<p className={s.kicker}>Your game master</p>
								<p style={{ fontSize: '1.2rem' }}>
									<b>{gameMaster.name}</b>, {gameMaster.title}
								</p>
								<p className={s.desc}>{gameMaster.bio}</p>
							</div>
						) : null}
					</div>
					<div>{booking}</div>
				</div>
			</section>

			{next ? (
				<Link href={next.href} className={s.next} style={nextVars}>
					<div className="wrap">
						<p className={s.kicker}>Next volume · {next.genre}</p>
						<h2>{next.title}</h2>
						<p>{next.tagline}</p>
					</div>
				</Link>
			) : null}
		</div>
	);
}
