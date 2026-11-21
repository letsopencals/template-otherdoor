'use client';

import Link from 'next/link';
import { useEffect, useRef, type ReactNode } from 'react';
import { SafeImg } from '@/components/ui/safe-img';
import { HeroMap, InkLayer } from './hero-map';
import s from './lantern-hero.module.css';

/**
 * The lantern hero: a dark chart; the pointer (or a finger) is a warm lantern
 * whose light shows the parchment and the invisible-ink routes beneath (a CSS
 * radial mask over the lit layer). With no pointer the lantern drifts along the
 * routes by itself; with reduced motion it rests over the first note.
 */
export function LanternHero({ clue, compass, mapSrc, children }: { clue: string; compass: ReactNode; mapSrc?: string | null; children?: ReactNode }) {
	const ref = useRef<HTMLElement>(null);
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		let target = { x: 0.7, y: 0.42 };
		let pos = { ...target };
		let last = 0;
		let raf = 0;
		const set = () => {
			el.style.setProperty('--lx', `${(pos.x * 100).toFixed(2)}%`);
			el.style.setProperty('--ly', `${(pos.y * 100).toFixed(2)}%`);
		};
		set();
		if (reduce) return;
		const tick = (t: number) => {
			if (t - last > 2600) {
				// Idle: drift along a slow figure-of-eight over the routes.
				const k = t / 5200;
				target = { x: 0.62 + Math.sin(k) * 0.22, y: 0.5 + Math.sin(k * 2) * 0.16 };
			}
			pos = { x: pos.x + (target.x - pos.x) * 0.09, y: pos.y + (target.y - pos.y) * 0.09 };
			set();
			raf = requestAnimationFrame(tick);
		};
		const move = (e: PointerEvent) => {
			const r = el.getBoundingClientRect();
			target = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
			last = performance.now();
		};
		el.addEventListener('pointermove', move);
		el.addEventListener('pointerdown', move);
		raf = requestAnimationFrame(tick);
		return () => {
			cancelAnimationFrame(raf);
			el.removeEventListener('pointermove', move);
			el.removeEventListener('pointerdown', move);
		};
	}, []);

	return (
		<section ref={ref} className={s.hero} aria-label="The Gilded Compass">
			<div className={s.night}>
				<SafeImg src={mapSrc} alt="" className={s.mapImgNight} loading="eager" fallback={<HeroMap variant="night" />} />
			</div>
			<div className={s.lit}>
				<SafeImg src={mapSrc} alt="" className={s.mapImg} loading="eager" fallback={<HeroMap variant="lit" />} />
				<InkLayer clue={clue} />
			</div>
			<div className={s.glow} />
			<div className={s.shade} />
			<div className={s.compass}>{compass}</div>
			<div className={`wrap ${s.content}`}>
				<p className={`engraved ${s.kicker}`}>Adventure rooms · Edinburgh · Est. by the society</p>
				<h1 className={s.title}>
					Every room is a story <em>you walk into.</em>
				</h1>
				<p className={s.lede}>Six original adventures under the Old Town and on the Shore at Leith. A sealed temple, a gaslit study, a desert tomb, a brass submarine, a Riviera jewel job and a clockwork workshop.</p>
				<div className={s.ctas}>
					<Link href="#shelf" className="plate plate-gold">
						Open a volume
					</Link>
					<Link href="/book" className="plate plate-ghost">
						Plan an expedition
					</Link>
				</div>
				<p className={s.hint}>Move your lantern over the chart. Some routes are written in invisible ink.</p>
				{children}
			</div>
		</section>
	);
}
