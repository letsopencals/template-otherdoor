'use client';

import { useEffect, useRef, type RefObject } from 'react';

/**
 * Calls `onFrame(p, dt)` in rAF while the element is near the viewport and the page
 * scrolls, and keeps going while `onFrame` returns true (an animation still settling).
 * `pinned`: p goes 0 → 1 while a tall track's sticky child is pinned (top at viewport
 * top → bottom at viewport bottom). `pass`: 0 when the element's top enters at the
 * bottom of the viewport, 1 when its bottom leaves at the top.
 */
export function useProgress(ref: RefObject<HTMLElement | null>, mode: 'pinned' | 'pass', onFrame: (p: number, dt: number) => boolean | void) {
	const cb = useRef(onFrame);
	const kickRef = useRef<() => void>(() => undefined);
	useEffect(() => {
		cb.current = onFrame;
	});

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		let raf = 0;
		let near = false;
		let last = 0;
		const frame = (t: number) => {
			raf = 0;
			const dt = last ? Math.min(64, t - last) : 16;
			last = t;
			const r = el.getBoundingClientRect();
			const vh = window.innerHeight;
			const raw = mode === 'pinned' ? -r.top / Math.max(1, r.height - vh) : (vh - r.top) / (vh + r.height);
			const keep = cb.current(Math.min(1, Math.max(0, raw)), dt);
			if (keep && near) raf = requestAnimationFrame(frame);
			else last = 0;
		};
		const kick = () => {
			if (!raf && near) raf = requestAnimationFrame(frame);
		};
		kickRef.current = kick;
		const io = new IntersectionObserver(
			([e]) => {
				near = Boolean(e?.isIntersecting);
				kick();
			},
			{ rootMargin: '25% 0px' },
		);
		io.observe(el);
		window.addEventListener('scroll', kick, { passive: true });
		window.addEventListener('resize', kick);
		return () => {
			cancelAnimationFrame(raf);
			io.disconnect();
			window.removeEventListener('scroll', kick);
			window.removeEventListener('resize', kick);
		};
	}, [ref, mode]);

	/** Call `.current()` to run frames without a scroll (e.g. after a click starts an animation). */
	return kickRef;
}
