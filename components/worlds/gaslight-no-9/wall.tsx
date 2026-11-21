'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { WALL_H } from './layout';
import s from './gaslight.module.css';

/** Must match the wall-mode media query in gaslight.module.css. */
const WALL_QUERY = '(min-width: 1024px) and (min-aspect-ratio: 5/4) and (min-height: 600px) and (prefers-reduced-motion: no-preference)';

export interface WallIndexItem {
	key: string;
	label: string;
	x: number;
	w: number;
}

/**
 * The detective's evidence wall. On a wide, landscape screen the page's vertical scroll walks
 * you sideways along the wall: the section is as tall as the wall is wide (pure CSS, so `#book`
 * deep links land correctly before hydration), its stage is sticky, and the track slides by
 * `--p`. JS only writes `--p`, draws the red string in segment by segment as the wall passes,
 * lets documents drop onto their pins as they arrive, maps keyboard focus to scroll, and
 * drives the exhibit index. Phones, portrait and short screens, and reduced motion get the
 * same documents as a vertical stack (CSS), each tied to the last with its own string.
 */
export function Wall({ width, strings, knots, index, backdrop, notes, children }: { width: number; strings: Array<{ d: string; from: number; to: number }>; knots: Array<{ x: number; y: number }>; index: WallIndexItem[]; backdrop: ReactNode; notes: ReactNode; children: ReactNode }) {
	const wrapRef = useRef<HTMLElement>(null);
	const trackRef = useRef<HTMLDivElement>(null);
	const svgRef = useRef<SVGSVGElement>(null);
	const geo = useRef({ fs: 15, vw: 1440, vh: 900, wide: false });
	const [active, setActive] = useState(index[0]?.key ?? '');
	const activeRef = useRef(active);

	/** Scroll position (px) that brings wall x (em) to the middle of the screen. */
	const scrollFor = useCallback(
		(xEm: number) => {
			const wrap = wrapRef.current;
			if (!wrap) return null;
			const { fs, vw, vh } = geo.current;
			const travel = Math.max(1, width * fs - vw);
			const p = Math.min(1, Math.max(0, (xEm * fs - vw / 2) / travel));
			const top = wrap.getBoundingClientRect().top + window.scrollY;
			return top + p * (wrap.offsetHeight - vh);
		},
		[width],
	);

	useEffect(() => {
		const wrap = wrapRef.current;
		const track = trackRef.current;
		const svg = svgRef.current;
		if (!wrap || !track || !svg) return;
		wrap.setAttribute('data-js', '');
		const mq = window.matchMedia(WALL_QUERY);
		const segs = Array.from(svg.querySelectorAll<SVGPathElement>('[data-seg]'));
		const knotEls = Array.from(svg.querySelectorAll<SVGGElement>('[data-knot]'));
		let raf = 0;

		const measure = () => {
			geo.current = { fs: parseFloat(getComputedStyle(track).fontSize) || 15, vw: window.innerWidth, vh: window.innerHeight, wide: mq.matches };
		};
		const frame = () => {
			raf = 0;
			const { fs, vw, vh, wide } = geo.current;
			if (!wide) {
				wrap.style.removeProperty('--p');
				return;
			}
			const r = wrap.getBoundingClientRect();
			const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - vh)));
			wrap.style.setProperty('--p', p.toFixed(4));
			const scrolled = p * Math.max(0, width * fs - vw);
			// The string runs a little ahead of the middle of the screen, and reaches the end of the wall as the walk ends.
			const frontier = (scrolled + vw * (0.72 + 0.4 * p)) / fs;
			strings.forEach((sg, i) => {
				const f = Math.min(1, Math.max(0, (frontier - sg.from) / (sg.to - sg.from)));
				const off = (1 - f).toFixed(4);
				for (const el of [segs[i * 2], segs[i * 2 + 1]]) if (el) el.style.strokeDashoffset = off;
			});
			knots.forEach((k, i) => knotEls[i]?.toggleAttribute('data-on', frontier >= k.x));
			const mid = (scrolled + vw / 2) / fs;
			let cur = index[0]?.key ?? '';
			for (const it of index) if (it.x <= mid) cur = it.key;
			if (cur !== activeRef.current) {
				activeRef.current = cur;
				setActive(cur);
			}
		};
		const on = () => {
			if (!raf) raf = requestAnimationFrame(frame);
		};
		const resize = () => {
			measure();
			on();
		};

		// Documents drop onto their pins as they arrive (horizontally on the wall, vertically in the stack).
		const io = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (e.isIntersecting) {
						e.target.setAttribute('data-in', '');
						io.unobserve(e.target);
					}
				}
			},
			{ rootMargin: '0px -6% -8% 0px', threshold: 0.2 },
		);
		track.querySelectorAll('[data-doc]').forEach((d) => io.observe(d));

		// Keyboard: focusing something on a document that is off to the side scrolls the wall to it.
		const focus = (e: FocusEvent) => {
			if (!geo.current.wide) return;
			const doc = (e.target as HTMLElement).closest<HTMLElement>('[data-doc]');
			if (!doc) return;
			const x = Number(doc.dataset.x) + Number(doc.dataset.w) / 2;
			const top = scrollFor(x);
			if (top != null && Math.abs(top - window.scrollY) > 4) window.scrollTo({ top, behavior: 'instant' as ScrollBehavior });
		};

		measure();
		frame();
		window.addEventListener('scroll', on, { passive: true });
		window.addEventListener('resize', resize);
		mq.addEventListener('change', resize);
		track.addEventListener('focusin', focus);
		return () => {
			cancelAnimationFrame(raf);
			io.disconnect();
			window.removeEventListener('scroll', on);
			window.removeEventListener('resize', resize);
			mq.removeEventListener('change', resize);
			track.removeEventListener('focusin', focus);
		};
	}, [width, strings, knots, index, scrollFor]);

	const go = (it: WallIndexItem) => {
		const top = scrollFor(it.x + it.w / 2);
		if (top == null) return;
		const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		window.scrollTo({ top, behavior: smooth ? 'smooth' : ('instant' as ScrollBehavior) });
	};

	return (
		<section ref={wrapRef} id="wall" className={s.wall} style={{ '--wall-w': `${width}em` } as CSSProperties} aria-label="The evidence wall">
			<div className={s.stage}>
				<div className={s.trackBox}>
					<div ref={trackRef} className={s.track}>
						<svg ref={svgRef} className={s.strings} viewBox={`0 0 ${width} ${WALL_H + 8}`} aria-hidden>
							{strings.map((sg, i) => (
								<g key={`s${i}`}>
									<path d={sg.d} pathLength={1} className={s.stringShadow} data-seg="" />
									<path d={sg.d} pathLength={1} className={s.string} data-seg="" />
								</g>
							))}
							{knots.map((k, i) => (
								<g key={`k${i}`} data-knot="" className={s.knot} transform={`translate(${k.x} ${k.y})`}>
									<path d="M-0.55 -0.15L0.6 0.3M-0.4 0.45L0.45 -0.4" className={s.knotTie} />
									<circle r="0.62" className={s.pinHead} />
									<circle r="0.2" cx="-0.18" cy="-0.2" className={s.pinGlint} />
								</g>
							))}
						</svg>
						{children}
					</div>
				</div>
				<div className={s.stageFront} aria-hidden>
					{backdrop}
				</div>
				<div className={s.stageLight} aria-hidden />
				<nav className={s.index} aria-label="Evidence">
					{index.map((it) => (
						<button key={it.key} type="button" onClick={() => go(it)} aria-current={active === it.key ? 'true' : undefined}>
							{it.label}
						</button>
					))}
					<a href="#warrant">The warrant ↓</a>
				</nav>
				{notes}
			</div>
		</section>
	);
}
