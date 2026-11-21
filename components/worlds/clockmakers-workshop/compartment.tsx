'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { GearTrain } from './gear-train';
import type { GearSpec } from './gears';
import s from './clockmaker.module.css';

/** The little drive in each nameplate: a pinion that slides into mesh, then the train turns. */
const ENGAGE: GearSpec[] = [
	{ id: 'drive', teeth: 18, x: 0, y: 0, tone: 'brass' },
	{ id: 'idler', teeth: 10, parent: 'drive', dir: 0, tone: 'steel' },
	{ id: 'out', teeth: 14, parent: 'idler', dir: 0, tone: 'copper' },
];

/**
 * A compartment of the clockmaker's cabinet. Rendered OPEN on the server (no
 * JS, reduced motion and deep links always see the content); after mount, the
 * ones still below the fold close, and each opens once when it scrolls in: its
 * nameplate gear engages, then the doors swing / the drawer front drops / the
 * lid lifts. The cover is an overlay sibling of the content: nothing here
 * transforms, filters or clips the content (the booking panel's sticky bar
 * lives in one of these).
 */
export function Compartment({ id, no, name, title, kind, children, tone = 'cream', className, quiet = false }: { quiet?: boolean; id?: string; no: number; name: string; title: ReactNode; kind: 'doors' | 'drawer' | 'lid' | 'glass'; children: ReactNode; tone?: 'cream' | 'walnut' | 'night'; className?: string }) {
	const ref = useRef<HTMLElement>(null);
	const [state, setState] = useState<'open' | 'closed' | 'opening'>('open');

	useEffect(() => {
		const el = ref.current;
		if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const hashInside = () => {
			const h = window.location.hash.slice(1);
			if (!h) return false;
			const t = document.getElementById(h);
			return Boolean(t && el.contains(t)) || h === id;
		};
		if (hashInside() || el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
		setState('closed');
		let t = 0;
		const open = () => {
			io.disconnect();
			setState('opening');
			t = window.setTimeout(() => setState('open'), 1500);
		};
		const io = new IntersectionObserver(([e]) => (e?.isIntersecting ? open() : undefined), { rootMargin: '0px 0px -22% 0px', threshold: 0 });
		io.observe(el);
		// Anchor jumps (#book from the hero) land on an open compartment.
		const onHash = () => (hashInside() ? (io.disconnect(), setState('open')) : undefined);
		const onClick = (e: MouseEvent) => {
			const a = (e.target as Element | null)?.closest?.('a[href^="#"]');
			const h = a?.getAttribute('href')?.slice(1);
			if (!h) return;
			const tgt = document.getElementById(h);
			if ((tgt && el.contains(tgt)) || h === id) {
				io.disconnect();
				setState('open');
			}
		};
		window.addEventListener('hashchange', onHash);
		document.addEventListener('click', onClick, true);
		return () => {
			io.disconnect();
			window.clearTimeout(t);
			window.removeEventListener('hashchange', onHash);
			document.removeEventListener('click', onClick, true);
		};
	}, [id]);

	return (
		<section ref={ref} id={id} className={`${s.compartment} ${className ?? ''}`} data-kind={kind} data-state={state} data-tone={tone} data-cw-section={name} data-cw-quiet={quiet ? '' : undefined}>
			<div className={s.frame}>
				<header className={s.plate}>
					<div className={s.plateGears} aria-hidden>
						<GearTrain specs={ENGAGE} m={2.6} running={state !== 'closed'} speed={1.6} />
					</div>
					<p className={s.plateNo}>No. {no}</p>
					<p className={s.plateName}>{name}</p>
				</header>
				<h2 className={s.cTitle}>{title}</h2>
				<div className={s.cBody}>{children}</div>
				<div className={s.cover} aria-hidden>
					{kind === 'doors' || kind === 'glass' ? (
						<>
							<span className={`${s.leaf} ${s.leafL}`}>
								<span className={s.leafPanel} />
								<span className={s.knob} />
							</span>
							<span className={`${s.leaf} ${s.leafR}`}>
								<span className={s.leafPanel} />
								<span className={s.knob} />
							</span>
						</>
					) : null}
					{kind === 'drawer' ? (
						<span className={s.drawerFront}>
							<span className={s.drawerPull} />
							<span className={s.drawerLabel}>{name}</span>
						</span>
					) : null}
					{kind === 'lid' ? (
						<span className={s.lid}>
							<span className={s.lidInlay} />
							<span className={s.lidClasp} />
						</span>
					) : null}
				</div>
			</div>
		</section>
	);
}
