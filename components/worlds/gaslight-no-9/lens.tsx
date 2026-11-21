'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import s from './gaslight.module.css';

/**
 * A magnifying lens over a printed page. The page renders twice: the readable original, and a
 * magnified copy inside the lens (with `.magnified` on its root, which reveals `.hiddenInk`).
 * Mouse/pen: the lens follows the pointer (rAF-throttled). Touch: tap or drag sideways to move it
 * (vertical drags still scroll). Idle and on screen: it drifts slowly over the page on its own.
 * Reduced motion: it rests over a clue and stays there.
 */
export function Lens({ page, magnified, rest = [0.66, 0.62], zoom = 2.2 }: { page: ReactNode; magnified: ReactNode; rest?: [number, number]; zoom?: number }) {
	const wrapRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const wrap = wrapRef.current;
		if (!wrap) return;
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		let w = 0;
		let h = 0;
		let x = 0;
		let y = 0;
		let tx = 0;
		let ty = 0;
		let raf = 0;
		let visible = false;
		let lastUser = -1e9;
		const t0 = performance.now();

		const apply = () => {
			wrap.style.setProperty('--lx', `${x.toFixed(1)}px`);
			wrap.style.setProperty('--ly', `${y.toFixed(1)}px`);
		};
		const measure = () => {
			const r = wrap.getBoundingClientRect();
			w = r.width;
			h = r.height;
			wrap.style.setProperty('--pw', `${w.toFixed(1)}px`);
			if (!x && !y) {
				x = tx = w * rest[0];
				y = ty = h * rest[1];
			}
			apply();
		};
		const tick = (now: number) => {
			raf = 0;
			if (!visible) return;
			if (now - lastUser > 2600) {
				const t = (now - t0) / 1000;
				tx = w * (0.5 + 0.34 * Math.sin(t * 0.37));
				ty = h * (0.48 + 0.3 * Math.sin(t * 0.61 + 1));
			}
			x += (tx - x) * 0.14;
			y += (ty - y) * 0.14;
			apply();
			raf = requestAnimationFrame(tick);
		};
		const start = () => {
			if (!raf && !reduce) raf = requestAnimationFrame(tick);
		};
		const move = (e: PointerEvent) => {
			const r = wrap.getBoundingClientRect();
			tx = Math.min(w, Math.max(0, e.clientX - r.left));
			ty = Math.min(h, Math.max(0, e.clientY - r.top));
			lastUser = performance.now();
			if (reduce) {
				x = tx;
				y = ty;
				apply();
			} else start();
		};

		measure();
		wrap.setAttribute('data-lens', 'on');
		const ro = new ResizeObserver(measure);
		ro.observe(wrap);
		const io = new IntersectionObserver(([e]) => {
			visible = Boolean(e?.isIntersecting);
			if (visible) start();
		});
		io.observe(wrap);
		wrap.addEventListener('pointermove', move);
		wrap.addEventListener('pointerdown', move);
		return () => {
			ro.disconnect();
			io.disconnect();
			wrap.removeEventListener('pointermove', move);
			wrap.removeEventListener('pointerdown', move);
			if (raf) cancelAnimationFrame(raf);
		};
	}, [rest]);

	return (
		<div ref={wrapRef} className={s.lensWrap} style={{ '--zoom': zoom } as CSSProperties}>
			{page}
			<div className={s.lens} aria-hidden>
				<div className={s.lensInner}>{magnified}</div>
				<span className={s.lensGlass} />
			</div>
			<span className={s.lensHandle} aria-hidden />
		</div>
	);
}
