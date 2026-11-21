'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { Boulder } from './art';
import { useProgress } from './use-progress';
import s from './jaguar.module.css';

/**
 * THE RUN. A corridor strip the stone rumbles across as you scroll: it rolls (rotation =
 * distance / radius, so it never skids), the corridor shudders with its speed and dust
 * kicks up behind it. It rolls over the words, between the copy and the torches.
 * Reduced motion: the stone rests at the far end and nothing shakes.
 */
export function StoneRun({ wall, children }: { wall: string; children: ReactNode }) {
	const strip = useRef<HTMLElement>(null);
	const last = useRef({ x: -1, energy: 0, t: 0 });
	const reduced = useRef(false);

	useEffect(() => {
		reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced.current) strip.current?.style.setProperty('--roll', '0.86');
	}, []);

	useProgress(strip, 'pass', (p, dt) => {
		const el = strip.current;
		if (!el || reduced.current) return false;
		const roll = Math.min(1, Math.max(0, (p - 0.12) / 0.72));
		const w = el.offsetWidth;
		const size = Math.min(w * 0.42, 420);
		const x = -size + roll * (w + size * 2);
		const st = last.current;
		const v = st.x < 0 ? 0 : Math.abs(x - st.x) / Math.max(1, dt);
		st.energy = Math.max(st.energy * 0.9, Math.min(1, v / 3));
		st.t += dt;
		st.x = x;
		const deg = (x / (size / 2)) * (180 / Math.PI);
		el.style.setProperty('--roll', roll.toFixed(4));
		el.style.setProperty('--x', `${x.toFixed(1)}px`);
		el.style.setProperty('--size', `${size.toFixed(0)}px`);
		el.style.setProperty('--spin', `${deg.toFixed(1)}deg`);
		el.style.setProperty('--quake', `${(Math.sin(st.t / 19) * 3 * st.energy).toFixed(2)}px`);
		el.style.setProperty('--energy', st.energy.toFixed(3));
		return st.energy > 0.01;
	});

	return (
		<section ref={strip} id="jt-run" className={s.run} aria-labelledby="jt-run-title">
			<div className={s.runQuake}>
				<div className={s.runWall} style={{ backgroundImage: `url(${wall})` }} aria-hidden>
					<span className={s.torch} style={{ left: '12%' }} />
					<span className={s.torch} style={{ left: '46%' }} />
					<span className={s.torch} style={{ left: '82%' }} />
				</div>
				<div className={s.runCopy}>{children}</div>
				<div className={s.runFloor} aria-hidden />
				<div className={s.stone} aria-hidden>
					<span className={s.stoneDust}>
						<i />
						<i />
						<i />
						<i />
					</span>
					<Boulder className={s.boulder} />
				</div>
			</div>
		</section>
	);
}
