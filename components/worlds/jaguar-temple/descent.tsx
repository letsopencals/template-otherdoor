'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import s from './jaguar.module.css';

export interface Layer {
	id: string;
	name: string;
	/** Metres below the canopy top. */
	depth: number;
}

/**
 * The descent: one scroll loop for the whole world, in rAF, no React state per frame.
 * - writes `--part` (0 closed → 1 parted) on every `[data-curtain]` near the viewport, so
 *   the foreground leaves of that layer draw apart as it arrives;
 * - drives the plumb line on the right edge: a rope with a knot per layer, a brass bob
 *   that sinks as you scroll, and a depth readout in metres interpolated between layers.
 * Without JS (and with reduced motion) curtains stay parted (`--part` defaults to 1).
 */
export function Descent({ layers, className, style, children }: { layers: Layer[]; className?: string; style?: CSSProperties; children: ReactNode }) {
	const root = useRef<HTMLDivElement>(null);
	const bob = useRef<HTMLSpanElement>(null);
	const readout = useRef<HTMLSpanElement>(null);
	const [knots, setKnots] = useState<number[]>([]);
	const [active, setActive] = useState(0);
	const activeRef = useRef(0);

	useEffect(() => {
		const el = root.current;
		if (!el) return;
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const curtains = Array.from(el.querySelectorAll<HTMLElement>('[data-curtain]'));
		let tops: number[] = [];
		let height = 1;
		let raf = 0;

		const measure = () => {
			const r = el.getBoundingClientRect();
			const y0 = r.top + window.scrollY;
			height = el.offsetHeight;
			tops = layers.map((l) => {
				const node = document.getElementById(l.id);
				return node ? node.getBoundingClientRect().top + window.scrollY - y0 : 0;
			});
			const span = Math.max(1, height - window.innerHeight);
			setKnots(tops.map((t) => Math.min(1, Math.max(0, (t - window.innerHeight * 0.35) / span))));
		};

		const frame = () => {
			raf = 0;
			const vh = window.innerHeight;
			const r = el.getBoundingClientRect();
			const span = Math.max(1, r.height - vh);
			const p = Math.min(1, Math.max(0, -r.top / span));
			el.style.setProperty('--depth', p.toFixed(4));
			// The hero's frame of leaves and the canopy lift away over the first screen.
			if (window.scrollY < vh * 1.5) el.style.setProperty('--hero-out', Math.min(1, window.scrollY / vh).toFixed(4));
			if (bob.current) bob.current.style.transform = `translate3d(0, calc(${(p * 100).toFixed(2)} * var(--rope-h) / 100), 0)`;

			// Which layer are we in, and how deep (metres, interpolated to the next layer)?
			const y = -r.top + vh * 0.35;
			let i = 0;
			while (i < tops.length - 1 && y >= tops[i + 1]!) i++;
			const a = tops[i] ?? 0;
			const b = tops[i + 1] ?? height;
			const k = Math.min(1, Math.max(0, (y - a) / Math.max(1, b - a)));
			const m = layers[i]!.depth + ((layers[i + 1]?.depth ?? layers[i]!.depth + 4) - layers[i]!.depth) * k;
			if (readout.current) readout.current.textContent = `−${Math.max(0, m).toFixed(1)} m`;
			if (i !== activeRef.current) {
				activeRef.current = i;
				setActive(i);
			}

			if (!reduced) {
				for (const c of curtains) {
					const cr = c.getBoundingClientRect();
					if (cr.top > vh * 1.6 || cr.bottom < -vh * 0.5) continue;
					const part = Math.min(1, Math.max(0, (vh * 0.98 - cr.top) / (vh * 0.62)));
					c.style.setProperty('--part', part.toFixed(3));
				}
			}
		};
		const on = () => {
			if (!raf) raf = requestAnimationFrame(frame);
		};
		const onResize = () => {
			measure();
			on();
		};

		measure();
		frame();
		// Fonts and images settle the layout late; re-measure once they have.
		const late = window.setTimeout(onResize, 1200);
		window.addEventListener('scroll', on, { passive: true });
		window.addEventListener('resize', onResize);
		return () => {
			cancelAnimationFrame(raf);
			window.clearTimeout(late);
			window.removeEventListener('scroll', on);
			window.removeEventListener('resize', onResize);
		};
	}, [layers]);

	return (
		<div ref={root} className={className} style={style}>
			{children}
			<nav className={s.plumb} aria-label="Descend to a layer">
				<span className={s.rope} aria-hidden />
				{layers.map((l, i) => (
					<a key={l.id} href={`#${l.id}`} className={s.knot} data-on={i === active ? '' : undefined} data-past={i < active ? '' : undefined} style={{ '--k': knots[i] ?? i / Math.max(1, layers.length - 1) } as CSSProperties}>
						<i aria-hidden />
						<span>
							<b>{l.name}</b> −{l.depth} m
						</span>
					</a>
				))}
				<span ref={bob} className={s.bob} aria-hidden>
					<svg viewBox="0 0 24 40">
						<path d="M12 0v6" stroke="#c9b27a" strokeWidth="1.4" />
						<path d="M12 6c5 0 8 4 8 9 0 7-5 14-8 23-3-9-8-16-8-23 0-5 3-9 8-9Z" fill="url(#jt2-metal)" />
						<path d="M8.5 13c1-3 3-4 5-4" stroke="#fff6cf" strokeOpacity=".8" strokeWidth="1.3" fill="none" strokeLinecap="round" />
					</svg>
					<span ref={readout} className={s.readout}>
						−0.0 m
					</span>
				</span>
			</nav>
		</div>
	);
}
