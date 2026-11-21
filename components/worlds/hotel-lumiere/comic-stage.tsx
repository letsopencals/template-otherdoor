'use client';

import { useEffect, useRef, type ReactNode } from 'react';

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * The page-turner. IntersectionObservers ink each `[data-panel]` in once (`data-in`), and run or
 * pause `[data-live]` zones. One rAF-throttled scroll listener writes `--sp` on visible
 * `[data-pin]` sequences (progress through a tall section whose child is sticky) and sets
 * `data-phase` (0…n-1) from `data-phases`, so CSS can swap captions and fire the sound effect.
 */
export function ComicStage({ className, children }: { className: string; children: ReactNode }) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const root = ref.current;
		if (!root) return;
		const pins = new Set<HTMLElement>();
		let raf = 0;

		const update = () => {
			raf = 0;
			const vh = window.innerHeight;
			for (const el of pins) {
				const r = el.getBoundingClientRect();
				const sp = clamp(-r.top / Math.max(1, r.height - vh));
				el.style.setProperty('--sp', sp.toFixed(4));
				const n = Number(el.dataset.phases || 0);
				if (n) {
					const phase = String(Math.min(n - 1, Math.floor(sp * n)));
					if (el.dataset.phase !== phase) el.dataset.phase = phase;
				}
			}
		};
		const schedule = () => {
			if (!raf) raf = requestAnimationFrame(update);
		};

		const panelIo = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (e.isIntersecting) {
						(e.target as HTMLElement).dataset.in = 'true';
						panelIo.unobserve(e.target);
					}
				}
			},
			{ rootMargin: '0px 0px -10% 0px', threshold: 0.15 },
		);
		const liveIo = new IntersectionObserver((entries) => {
			for (const e of entries) (e.target as HTMLElement).dataset.live = e.isIntersecting ? 'on' : 'off';
		});
		const pinIo = new IntersectionObserver((entries) => {
			for (const e of entries) {
				if (e.isIntersecting) pins.add(e.target as HTMLElement);
				else pins.delete(e.target as HTMLElement);
			}
			schedule();
		});
		root.querySelectorAll('[data-panel]').forEach((el) => panelIo.observe(el));
		root.querySelectorAll('[data-live]').forEach((el) => liveIo.observe(el));
		root.querySelectorAll('[data-pin]').forEach((el) => pinIo.observe(el));

		root.dataset.ready = 'true';
		window.addEventListener('scroll', schedule, { passive: true });
		window.addEventListener('resize', schedule);
		return () => {
			window.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', schedule);
			panelIo.disconnect();
			liveIo.disconnect();
			pinIo.disconnect();
			if (raf) cancelAnimationFrame(raf);
		};
	}, []);

	return (
		<div ref={ref} className={className}>
			{children}
		</div>
	);
}
