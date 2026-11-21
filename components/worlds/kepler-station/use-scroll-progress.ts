'use client';

import { useEffect, type RefObject } from 'react';

/**
 * Writes the element's scroll progress (0 → 1 while it passes through the
 * viewport, or through its sticky track) to `--p` on the element, in rAF, without
 * React state. Reduced motion pins `--p` to 1 (the finished state).
 * `mode: 'track'` measures a tall wrapper whose child is sticky: 0 when its top
 * reaches the top of the viewport, 1 when its bottom reaches the bottom.
 */
export function useScrollProgress(ref: RefObject<HTMLElement | null>, mode: 'track' | 'pass' = 'track', onChange?: (p: number) => void) {
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			el.style.setProperty('--p', '1');
			onChange?.(1);
			return;
		}
		let raf = 0;
		const measure = () => {
			raf = 0;
			const r = el.getBoundingClientRect();
			const vh = window.innerHeight;
			const p = mode === 'track' ? -r.top / Math.max(1, r.height - vh) : (vh - r.top) / (vh + r.height);
			const c = Math.min(1, Math.max(0, p));
			el.style.setProperty('--p', c.toFixed(4));
			onChange?.(c);
		};
		const on = () => {
			if (!raf) raf = requestAnimationFrame(measure);
		};
		measure();
		window.addEventListener('scroll', on, { passive: true });
		window.addEventListener('resize', on);
		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener('scroll', on);
			window.removeEventListener('resize', on);
		};
	}, [ref, mode, onChange]);
}
