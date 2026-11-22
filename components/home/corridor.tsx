'use client';

import Link from 'next/link';
import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import type { DoorRoom } from '@/lib/doors';
import { doorsForMood } from '@/lib/doors';
import type { Mood } from '@/lib/site-config';
import { setDoorLight } from '@/lib/door-light';
import { formatWholePrice } from '@/lib/format';
import { DoorArt } from '@/components/doors/door-art';
import { doorArt } from '@/components/doors/door-sources';
import { ArrowIcon } from '@/components/shell/icons';
import s from './corridor.module.css';

const PHONE = '(max-width: 767px)';

/**
 * A muted world loop behind the door. It loads on the first open and only
 * becomes visible once frames are actually playing, over a poster that is the
 * clip's first frame, so the scene never swaps pictures.
 */
function Glimpse({ src, poster, active }: { src?: string; poster?: string; active: boolean }) {
	const ref = useRef<HTMLVideoElement>(null);
	const [broken, setBroken] = useState(false);
	const [playing, setPlaying] = useState(false);
	useLayoutEffect(() => {
		const v = ref.current;
		if (!v || broken) return;
		if (active && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			v.muted = true;
			v.play().catch(() => undefined);
		} else v.pause();
	}, [active, broken]);
	if (!src || broken) return null;
	return <video ref={ref} className={s.glimpse} src={src} poster={poster} muted loop playsInline preload="none" aria-hidden onPlaying={() => setPlaying(true)} onError={() => setBroken(true)} data-on={playing} />;
}

/** The scene behind a door: the loop's first frame when there is a loop (so the video picks up seamlessly), else the key art chain. */
function sceneArt(d: DoorRoom) {
	return d.media.loop && d.media.poster ? [d.media.poster, ...doorArt(d)] : doorArt(d);
}

/**
 * The Corridor: six doors in a dark hall, light leaking round their edges.
 * Hover or focus a door: the lever turns, the leaf swings out towards you on its
 * hinge, the room's light comes on behind it and its loop starts; the whole
 * shell takes its colour. Click enters the world. On phones the doors stack; the first tap
 * opens one, the second walks in. Mood filters re-order the corridor.
 */
export function Corridor({ doors, moods }: { doors: DoorRoom[]; moods: ReadonlyArray<{ key: Mood | 'all'; label: string }> }) {
	const [mood, setMood] = useState<Mood | 'all'>('all');
	const [open, setOpen] = useState<string | null>(null);
	const listRef = useRef<HTMLOListElement>(null);
	const rects = useRef<Map<string, DOMRect>>(new Map());
	const tapped = useRef<string | null>(null);
	const ordered = doorsForMood(doors, mood);

	const focus = useCallback((d: DoorRoom | null) => {
		setOpen(d?.slug ?? null);
		setDoorLight(d?.palette.glow ?? null);
	}, []);

	// FLIP: doors glide to their new places when the mood changes.
	const pickMood = (m: Mood | 'all') => {
		const map = new Map<string, DOMRect>();
		listRef.current?.querySelectorAll<HTMLElement>('[data-slug]').forEach((el) => map.set(el.dataset.slug!, el.getBoundingClientRect()));
		rects.current = map;
		setMood(m);
	};
	useLayoutEffect(() => {
		const prev = rects.current;
		if (!prev.size || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		listRef.current?.querySelectorAll<HTMLElement>('[data-slug]').forEach((el) => {
			const a = prev.get(el.dataset.slug!);
			if (!a) return;
			const b = el.getBoundingClientRect();
			const dx = a.left - b.left;
			const dy = a.top - b.top;
			if (!dx && !dy) return;
			el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 700, easing: 'cubic-bezier(0.22, 0.8, 0.24, 1)' });
		});
		rects.current = new Map();
	}, [mood]);

	return (
		<div className={s.corridor}>
			<ol ref={listRef} className={s.doors} onMouseLeave={() => focus(null)}>
				{ordered.map(({ door: d, match }, idx) => {
					const isOpen = open === d.slug;
					return (
						<li key={d.slug} data-slug={d.slug} className={s.item} data-dim={!match} data-open={isOpen} style={{ "--slit": d.palette.glow, "--i": idx } as CSSProperties}>
							<Link
								href={`/rooms/${d.slug}`}
								className={s.door}
								onMouseEnter={() => focus(d)}
								onFocus={() => focus(d)}
								onClick={(e) => {
									if (window.matchMedia(PHONE).matches && tapped.current !== d.slug) {
										e.preventDefault();
										tapped.current = d.slug;
										focus(d);
									}
								}}
								aria-label={`${d.title}: ${d.genre}, ${d.year}. ${d.players} players, from ${formatWholePrice(d.fromPrice)}.`}
							>
								<span className={s.frame}>
									<span className={s.inside} aria-hidden>
										<DoorArt sources={sceneArt(d)} alt="" glow={d.palette.glow} className={s.art} loading="eager" />
										<Glimpse src={d.media.loop} poster={d.media.poster} active={isOpen} />
										<span className={s.wash} />
										<span className={s.motes} />
									</span>
									<span className={s.gap} aria-hidden />
									<span className={s.leaf} aria-hidden>
										<span className={s.face}>
											<span className={s.plate}>{String(d.number).padStart(2, '0')}</span>
											<span className={s.glass}>
												<DoorArt sources={sceneArt(d)} alt="" glow={d.palette.glow} className={s.glassArt} loading="eager" />
											</span>
											<span className={s.panelBottom}>
												<span className={s.year}>{d.year}</span>
											</span>
											<span className={s.handle}>
												<span className={s.lever} />
											</span>
										</span>
										<span className={s.edge} />
										<span className={s.back} />
									</span>
									<span className={s.spill} aria-hidden />
								</span>
								<span className={`slit ${s.sill}`} aria-hidden />
								<span className={s.floor} aria-hidden />
								<span className={s.caption}>
									<span className={s.title}>{d.title}</span>
									<span className={s.meta}>
										{d.genre} · {d.players} players{d.epic ? ' · the Epic' : ''}
									</span>
								</span>
								<span className={s.enter} aria-hidden>
									Enter <ArrowIcon size={14} />
								</span>
							</Link>
						</li>
					);
				})}
			</ol>

			<div className={s.moods} role="group" aria-label="Pick by mood">
				<span className={s.moodsLabel}>Tonight I want</span>
				<div className={s.moodChips}>
					{moods.map((m) => (
						<button key={m.key} type="button" className={s.mood} aria-pressed={mood === m.key} onClick={() => pickMood(m.key)}>
							{m.label}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
