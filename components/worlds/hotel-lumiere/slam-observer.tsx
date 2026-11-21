'use client';

import { useEffect, useRef } from 'react';

/**
 * The page-turn engine: marks the world root `data-js` (so un-hydrated or
 * script-less pages stay fully inked), then flags each `[data-slam]` panel with
 * `data-in` the first time it comes into view. CSS does the rest: the panel
 * slams in, its halftone resolves, its balloons pop in reading order.
 */
export function SlamObserver() {
	const ref = useRef<HTMLSpanElement>(null);
	useEffect(() => {
		const root = ref.current?.closest<HTMLElement>('[data-lm-root]');
		if (!root) return;
		const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-slam]'));
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
			panels.forEach((p) => p.setAttribute('data-in', ''));
			return;
		}
		// Panels already on screen at load land immediately (no flash of empty frames).
		const vh = window.innerHeight;
		panels.forEach((p) => {
			const r = p.getBoundingClientRect();
			if (r.top < vh * 0.9 && r.bottom > 0) p.setAttribute('data-in', '');
		});
		root.setAttribute('data-js', '');
		const io = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (e.isIntersecting) {
						e.target.setAttribute('data-in', '');
						io.unobserve(e.target);
					}
				}
			},
			{ rootMargin: '0px 0px -12% 0px', threshold: 0.18 },
		);
		panels.filter((p) => !p.hasAttribute('data-in')).forEach((p) => io.observe(p));
		return () => io.disconnect();
	}, []);
	return <span ref={ref} hidden />;
}
