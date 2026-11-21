import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { RoomWorldProps } from '@/lib/worlds';
import { minutesLabel } from '@/lib/when';
import { SafeImg } from '@/components/ui/safe-img';
import { DoorArt } from '@/components/doors/door-art';
import s from './placeholder-world.module.css';

/**
 * The generic world, in the dark shell, lit by the room's door colour. Every room
 * without its own folder (and any store room this template doesn't know)
 * renders this until its world agent replaces it.
 */
export default function PlaceholderWorld({ room, presentation: p, cover, photos, gameMaster, next, booking }: RoomWorldProps) {
	const vars = { '--w-glow': p.palette.glow, '--slit': p.palette.glow } as CSSProperties;
	return (
		<div className={s.world} style={vars}>
			<header className={s.hero}>
				<div className={s.heroArt} aria-hidden>
					<DoorArt sources={[p.media.poster, cover, p.media.key]} alt="" glow={p.palette.glow} className={s.heroImg} loading="eager" />
				</div>
				<div className="wrap relative">
					<p className="label">
						{p.genre} · {p.year}
						{room.venue ? ` · ${room.venue.short}` : ''}
					</p>
					<h1 className={s.title}>{room.title}</h1>
					<p className={s.tagline}>{p.tagline}</p>
					<dl className={s.stats}>
						<div><dt>Players</dt><dd>{p.minPlayers}–{p.maxPlayers}</dd></div>
						<div><dt>Game</dt><dd>{p.gameMinutes} min</dd></div>
						<div><dt>Difficulty</dt><dd>{p.difficulty}/5</dd></div>
						<div><dt>Fear</dt><dd>{p.fear}/5</dd></div>
						<div><dt>Age</dt><dd>{p.minAge}+</dd></div>
						<div><dt>Escape rate</dt><dd>{p.successRate}%</dd></div>
					</dl>
					<p className="mt-8">
						<a className="btn btn-lg" href="#book">
							Book from {room.fromPriceLabel}
						</a>
					</p>
				</div>
			</header>

			<section className="wrap">
				<div className={s.story}>
					{p.beats.map((b, i) => (
						<article key={b.title} className={s.beat}>
							<span className={s.beatNum}>{String(i + 1).padStart(2, '0')}</span>
							<h3>{b.title}</h3>
							<p>{b.body}</p>
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
						<p className="label">The briefing</p>
						<p className={s.desc}>{room.description || p.tagline}</p>
						<p className={s.desc}>
							{minutesLabel(room.visitMinutes)} visit: briefing, {p.gameMinutes} minutes in the room, then photos and a debrief.
							{room.venue ? ` At ${room.venue.name}.` : ''}
						</p>
						{gameMaster ? (
							<div className={s.gm}>
								<p className="label">Your game master</p>
								<p className="mt-3 text-[1.2rem]">
									<b className="font-semibold">{gameMaster.name}</b>
									<span className="block text-[0.9rem] text-ink-3">{gameMaster.title}</span>
								</p>
								<p className={s.desc}>{gameMaster.bio}</p>
							</div>
						) : null}
					</div>
					<div>{booking}</div>
				</div>
			</section>

			{next ? (
				<Link href={next.href} className={s.next} style={{ '--slit': next.palette.glow } as CSSProperties}>
					<div className="wrap">
						<p className="label">Next door · {next.genre}</p>
						<h2>{next.title}</h2>
						<p>{next.tagline}</p>
					</div>
				</Link>
			) : null}
		</div>
	);
}
