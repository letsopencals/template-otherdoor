'use client';

import { useEffect, useRef } from 'react';
import s from './gaslight.module.css';

/**
 * Red string between the pins of an evidence board. Not a line draw: each string appears slack
 * (hanging deep under its pins) and is pulled taut with a damped spring, one after another,
 * once the cards have pinned themselves. Pins are the board's `[data-pin]` elements (in DOM
 * order); positions are measured live, so the strings follow any layout (desktop board or the
 * stacked phone board). Reduced motion: drawn taut straight away.
 */
export function RedStrings({ pairs, delay = 1500 }: { pairs: Array<[number, number]>; delay?: number }) {
	const ref = useRef<SVGSVGElement>(null);

	useEffect(() => {
		const svg = ref.current;
		const board = svg?.parentElement;
		if (!svg || !board) return;
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const groups = Array.from(svg.querySelectorAll('g'));
		let t0 = reduce ? -1e9 : 0;
		let raf = 0;

		const draw = (now: number) => {
			const b = board.getBoundingClientRect();
			svg.setAttribute('viewBox', `0 0 ${b.width.toFixed(1)} ${b.height.toFixed(1)}`);
			const pins = board.querySelectorAll<HTMLElement>('[data-pin]');
			let busy = false;
			pairs.forEach(([a, c], i) => {
				const g = groups[i];
				const pa = pins[a]?.getBoundingClientRect();
				const pc = pins[c]?.getBoundingClientRect();
				if (!g || !pa || !pc) return;
				const x1 = pa.left + pa.width / 2 - b.left;
				const y1 = pa.top + pa.height / 2 - b.top;
				const x2 = pc.left + pc.width / 2 - b.left;
				const y2 = pc.top + pc.height / 2 - b.top;
				const len = Math.hypot(x2 - x1, y2 - y1);
				const t = t0 ? Math.max(0, (now - t0 - delay - i * 280) / 1000) : 0;
				if (t0 && t < 1.6) busy = true;
				const sag = len * (0.05 + (t ? 0.5 * Math.exp(-4.2 * t) * Math.cos(9 * t) : 0.5));
				const d = `M${x1.toFixed(1)} ${y1.toFixed(1)}Q${((x1 + x2) / 2).toFixed(1)} ${((y1 + y2) / 2 + sag).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
				g.querySelectorAll('path').forEach((p) => p.setAttribute('d', d));
				g.style.opacity = t0 && (t > 0 || reduce) ? '1' : '0';
			});
			return busy;
		};
		const loop = (now: number) => {
			raf = draw(now) ? requestAnimationFrame(loop) : 0;
		};
		const io = new IntersectionObserver(([e]) => {
			if (e?.isIntersecting && !t0) {
				t0 = performance.now();
				raf = requestAnimationFrame(loop);
				io.disconnect();
			}
		}, { threshold: 0.2 });
		if (reduce) draw(performance.now());
		else io.observe(board);
		const ro = new ResizeObserver(() => {
			if (!raf) draw(performance.now());
		});
		ro.observe(board);
		return () => {
			io.disconnect();
			ro.disconnect();
			if (raf) cancelAnimationFrame(raf);
		};
	}, [pairs, delay]);

	return (
		<svg ref={ref} className={s.strings} aria-hidden focusable="false">
			{pairs.map(([a, c]) => (
				<g key={`${a}-${c}`} style={{ opacity: 0 }}>
					<path className={s.stringShadow} />
					<path className={s.string} />
				</g>
			))}
		</svg>
	);
}
