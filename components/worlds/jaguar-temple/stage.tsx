'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

/**
 * The jungle's scroll choreographer (a tiny client island around server-rendered art).
 * - `[data-scene]` gets `data-in="true"` once it enters the viewport (CSS animates it).
 * - `[data-anim]` gets `data-live` while on screen, so looping animations pause offscreen.
 * - `[data-scrub="pin|pass|out"]` gets `--p` (0–1) from its scroll position, rAF-throttled,
 *   written only while it intersects.
 * Before hydration (and without JS) everything renders in its finished state; the root only
 * hides pre-animation states once `data-ready` is set. Reduced motion: finished state, no loops.
 */
export function JungleStage({ className, style, children }: { className?: string; style?: CSSProperties; children: ReactNode }) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const root = ref.current;
		if (!root) return;
		const scenes = Array.from(root.querySelectorAll<HTMLElement>('[data-scene]'));
		const anims = Array.from(root.querySelectorAll<HTMLElement>('[data-anim]'));
		const scrubs = Array.from(root.querySelectorAll<HTMLElement>('[data-scrub]'));

		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			scenes.forEach((el) => el.setAttribute('data-in', 'true'));
			scrubs.forEach((el) => { if (el.dataset.scrub === 'pin') el.style.setProperty('--p', '1'); });
			root.setAttribute('data-ready', 'reduced');
			return;
		}

		const sceneIo = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (e.isIntersecting) {
						e.target.setAttribute('data-in', 'true');
						sceneIo.unobserve(e.target);
					}
				}
			},
			{ rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
		);
		scenes.forEach((el) => sceneIo.observe(el));

		const liveIo = new IntersectionObserver((entries) => {
			for (const e of entries) e.target.setAttribute('data-live', e.isIntersecting ? 'true' : 'false');
		}, { rootMargin: '120px 0px' });
		anims.forEach((el) => liveIo.observe(el));

		const active = new Set<HTMLElement>();
		let raf = 0;
		const update = () => {
			raf = 0;
			const vh = window.innerHeight;
			const reads: Array<[HTMLElement, number]> = [];
			active.forEach((el) => {
				const r = el.getBoundingClientRect();
				const mode = el.dataset.scrub;
				let p: number;
				if (mode === 'pin') p = -r.top / Math.max(1, r.height - vh);
				else if (mode === 'out') p = -r.top / Math.max(1, r.height);
				else p = (vh - r.top) / (vh + r.height);
				reads.push([el, Math.min(1, Math.max(0, p))]);
			});
			for (const [el, p] of reads) el.style.setProperty('--p', p.toFixed(4));
		};
		const schedule = () => {
			if (!raf) raf = requestAnimationFrame(update);
		};
		const scrubIo = new IntersectionObserver((entries) => {
			for (const e of entries) {
				const el = e.target as HTMLElement;
				if (e.isIntersecting) active.add(el);
				else active.delete(el);
			}
			schedule();
		});
		scrubs.forEach((el) => scrubIo.observe(el));
		window.addEventListener('scroll', schedule, { passive: true });
		window.addEventListener('resize', schedule);
		root.setAttribute('data-ready', 'true');
		schedule();

		return () => {
			sceneIo.disconnect();
			liveIo.disconnect();
			scrubIo.disconnect();
			window.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', schedule);
			if (raf) cancelAnimationFrame(raf);
		};
	}, []);

	return (
		<div ref={ref} className={className} style={style}>
			{children}
		</div>
	);
}
