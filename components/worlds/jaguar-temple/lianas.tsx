'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { Liana } from './art';
import s from './jaguar.module.css';

export interface LianaSpec {
	/** Left edge, % of the hero width. */
	x: number;
	len: number;
	seed: number;
	/** Drop delay (s). */
	delay: number;
	/** Hidden on phones. */
	wide?: boolean;
	/** Further back: smaller, darker. */
	back?: boolean;
}

/**
 * Lianas that drop from the canopy on load (CSS, staggered, with a heavy bounce) and swing
 * to the pointer: each vine is a damped pendulum pushed by the pointer's horizontal speed
 * when it passes close, and gently leaning toward a pointer that lingers. The rAF loop
 * runs only while something is moving and the hero is on screen.
 */
export function Lianas({ items }: { items: LianaSpec[] }) {
	const wrap = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const host = wrap.current;
		if (!host || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const nodes = Array.from(host.querySelectorAll<HTMLElement>('[data-swing]'));
		const state = nodes.map(() => ({ a: 0, v: 0 }));
		let px = -1;
		let py = -1;
		let lastX = -1;
		let lastT = 0;
		let raf = 0;
		let visible = true;
		/** The vine's hanging point (the outer `.liana` box is not rotated). */
		const anchorX = (n: HTMLElement) => {
			const b = (n.closest('[data-anchor]') as HTMLElement | null)?.getBoundingClientRect();
			return b ? b.left + b.width / 2 : 0;
		};

		const step = () => {
			raf = 0;
			let moving = false;
			const rect = host.getBoundingClientRect();
			nodes.forEach((n, i) => {
				const st = state[i]!;
				const cx = anchorX(n);
				const len = n.offsetHeight;
				let target = 0;
				if (px >= 0 && py - rect.top < len + 60) {
					const dx = px - cx;
					const near = Math.max(0, 1 - Math.abs(dx) / 260);
					target = Math.max(-1, Math.min(1, dx / 260)) * 5 * near;
				}
				// Damped spring toward the target angle (degrees).
				st.v += (target - st.a) * 0.035;
				st.v *= 0.93;
				st.a = Math.max(-12, Math.min(12, st.a + st.v));
				if (Math.abs(st.v) > 0.01 || Math.abs(target - st.a) > 0.02) moving = true;
				n.style.transform = `rotate(${st.a.toFixed(2)}deg)`;
			});
			if (moving && visible) raf = requestAnimationFrame(step);
		};
		const kick = () => {
			if (!raf && visible) raf = requestAnimationFrame(step);
		};
		const onMove = (e: PointerEvent) => {
			const now = performance.now();
			const rect = host.getBoundingClientRect();
			px = e.clientX;
			py = e.clientY;
			if (lastX >= 0 && now - lastT < 80) {
				const vx = (e.clientX - lastX) / Math.max(8, now - lastT);
				nodes.forEach((n, i) => {
					const cx = anchorX(n);
					if (Math.abs(e.clientX - cx) < 70 && e.clientY - rect.top < n.offsetHeight + 40) {
						const st = state[i]!;
						st.v = Math.max(-1.2, Math.min(1.2, st.v + vx * 0.5));
					}
				});
			}
			lastX = e.clientX;
			lastT = now;
			kick();
		};
		const onLeave = () => {
			px = -1;
			lastX = -1;
			kick();
		};
		const io = new IntersectionObserver(([e]) => {
			visible = Boolean(e?.isIntersecting);
			if (visible) kick();
		});
		const zone = host.parentElement ?? host;
		io.observe(zone);
		zone.addEventListener('pointermove', onMove, { passive: true });
		zone.addEventListener('pointerleave', onLeave);
		return () => {
			cancelAnimationFrame(raf);
			io.disconnect();
			zone.removeEventListener('pointermove', onMove);
			zone.removeEventListener('pointerleave', onLeave);
		};
	}, []);

	return (
		<div ref={wrap} className={s.lianas} aria-hidden>
			{items.map((l) => (
				<div key={l.seed} data-anchor className={s.liana} data-wide={l.wide ? '' : undefined} data-back={l.back ? '' : undefined} style={{ left: `${l.x}%`, '--delay': `${l.delay}s` } as CSSProperties}>
					<div className={s.lianaDrop}>
						<div data-swing className={s.lianaSwing}>
							<div className={s.lianaIdle} style={{ animationDuration: `${5 + (l.seed % 4)}s` }}>
								<Liana len={l.len} seed={l.seed} />
							</div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
