'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * The descent engine. One rAF-throttled scroll listener writes:
 * - `--depth` (0 at the surface, 1 at the trench floor) on the world root, which the fixed sea
 *   layers, the depth gauge needle and the oxygen dial read;
 * - the gauge and oxygen readouts (`[data-fathoms]`, `[data-oxygen]`) as text;
 * - `--sp` (0→1 while an element crosses the viewport) on visible `[data-scrub]` elements.
 * IntersectionObservers mark `[data-scene]` as `data-in` once and `[data-live]` zones as
 * running/paused, so looping animations stop offscreen. Reduced motion: the readouts still
 * follow the scroll (they are information), the CSS drops every animation.
 */
export function DiveStage({ className, style, maxFathoms, children }: { className: string; style?: CSSProperties; maxFathoms: number; children: ReactNode }) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const root = ref.current;
		if (!root) return;
		const fathoms = Array.from(root.querySelectorAll<HTMLElement>('[data-fathoms]'));
		const oxygen = Array.from(root.querySelectorAll<HTMLElement>('[data-oxygen]'));
		const scrubs = new Set<HTMLElement>();
		let raf = 0;
		let lastF = -1;
		let lastO = -1;

		const update = () => {
			raf = 0;
			const vh = window.innerHeight;
			const r = root.getBoundingClientRect();
			const depth = clamp(-r.top / Math.max(1, r.height - vh));
			root.style.setProperty('--depth', depth.toFixed(4));
			const f = Math.round(depth * maxFathoms) || 0;
			if (f !== lastF) {
				lastF = f;
				for (const el of fathoms) el.textContent = f.toLocaleString('en-GB');
			}
			const o = Math.max(0, Math.round(60 - depth * 51));
			if (o !== lastO) {
				lastO = o;
				for (const el of oxygen) el.textContent = String(o).padStart(2, '0');
			}
			for (const el of scrubs) {
				const b = el.getBoundingClientRect();
				el.style.setProperty('--sp', clamp((vh - b.top) / (vh + b.height)).toFixed(4));
			}
		};
		const schedule = () => {
			if (!raf) raf = requestAnimationFrame(update);
		};

		const sceneIo = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (e.isIntersecting) {
						(e.target as HTMLElement).dataset.in = 'true';
						sceneIo.unobserve(e.target);
					}
				}
			},
			{ rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
		);
		const liveIo = new IntersectionObserver((entries) => {
			for (const e of entries) (e.target as HTMLElement).dataset.live = e.isIntersecting ? 'on' : 'off';
		});
		const scrubIo = new IntersectionObserver((entries) => {
			for (const e of entries) {
				if (e.isIntersecting) scrubs.add(e.target as HTMLElement);
				else scrubs.delete(e.target as HTMLElement);
			}
			schedule();
		});
		const helmIo = new IntersectionObserver(
			(entries) => {
				for (const e of entries) root.dataset.helm = e.isIntersecting ? 'in' : 'out';
			},
			{ rootMargin: '-20% 0px -20% 0px' },
		);
		root.querySelectorAll('[data-scene]').forEach((el) => sceneIo.observe(el));
		root.querySelectorAll('[data-live]').forEach((el) => liveIo.observe(el));
		root.querySelectorAll('[data-scrub]').forEach((el) => scrubIo.observe(el));
		const helm = root.querySelector('[data-helm-zone]');
		if (helm) helmIo.observe(helm);

		root.dataset.ready = 'true';
		update();
		window.addEventListener('scroll', schedule, { passive: true });
		window.addEventListener('resize', schedule);
		return () => {
			window.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', schedule);
			sceneIo.disconnect();
			liveIo.disconnect();
			scrubIo.disconnect();
			helmIo.disconnect();
			if (raf) cancelAnimationFrame(raf);
		};
	}, [maxFathoms]);

	return (
		<div ref={ref} className={className} style={style}>
			{children}
		</div>
	);
}
