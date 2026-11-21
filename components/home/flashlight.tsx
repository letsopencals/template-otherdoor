'use client';

import { useEffect, useRef } from 'react';
import s from './flashlight.module.css';

/**
 * The dark room: move the torch (pointer, or drag on a phone) and the words in
 * the dark come up, including a line meant for the keypad. Without a pointer
 * the torch drifts on its own; reduced motion shows everything lit.
 */
export function Flashlight({ lines, hidden }: { lines: string[]; hidden: string[] }) {
	const ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		let raf = 0;
		let px = 0.5;
		let py = 0.5;
		let idle = true;
		let t = 0;
		const set = () => {
			el.style.setProperty('--x', `${(px * 100).toFixed(2)}%`);
			el.style.setProperty('--y', `${(py * 100).toFixed(2)}%`);
		};
		const drift = () => {
			if (idle) {
				t += 0.006;
				px = 0.5 + Math.sin(t * 1.3) * 0.36;
				py = 0.5 + Math.sin(t * 2.1) * 0.3;
				set();
			}
			raf = requestAnimationFrame(drift);
		};
		const move = (e: PointerEvent) => {
			const r = el.getBoundingClientRect();
			idle = false;
			px = (e.clientX - r.left) / r.width;
			py = (e.clientY - r.top) / r.height;
			cancelAnimationFrame(raf);
			raf = requestAnimationFrame(() => {
				set();
				raf = requestAnimationFrame(drift);
			});
		};
		const leave = () => {
			idle = true;
		};
		if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) raf = requestAnimationFrame(drift);
		el.addEventListener('pointermove', move);
		el.addEventListener('pointerleave', leave);
		return () => {
			cancelAnimationFrame(raf);
			el.removeEventListener('pointermove', move);
			el.removeEventListener('pointerleave', leave);
		};
	}, []);
	const text = (
		<>
			{lines.map((l, i) => (
				<p key={i} className={s.line}>
					{l}
				</p>
			))}
		</>
	);
	return (
		<div ref={ref} className={s.room}>
			<div className={s.dim} aria-hidden>
				{text}
			</div>
			<div className={s.lit}>
				{text}
				<div className={s.hidden}>
					{hidden.map((h) => (
						<span key={h}>{h}</span>
					))}
				</div>
			</div>
			<span className={s.hint} aria-hidden>
				Move your torch
			</span>
		</div>
	);
}
