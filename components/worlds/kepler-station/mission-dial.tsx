'use client';

import { useEffect, useRef, useState } from 'react';
import { PHASES, met } from './mission';
import { useMission } from './mission-state';
import s from './dial.module.css';

const R = 30;
const C = Math.round(2 * Math.PI * R * 100) / 100;

/**
 * THE MISSION CLOCK. The page's own navigation: a round dial docked in the
 * bottom-left corner that reads the mission elapsed time from where you are on
 * the page (T+00:00 at first contact, T+90:00 at the final docking), ticks for
 * each phase, and opens into the phase list to jump between them. It shows only
 * while the world is on screen and steps aside when the booking panel is in view
 * (so it never sits on the panel's sticky total bar).
 */
export function MissionDial({ gameMinutes }: { gameMinutes: number }) {
	const { o2, power } = useMission();
	const [share, setShare] = useState(0);
	const [active, setActive] = useState(0);
	const [show, setShow] = useState(false);
	const [open, setOpen] = useState(false);
	const panelRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		let raf = 0;
		let bookOn = false;
		const book = document.getElementById('book');
		const io = new IntersectionObserver(([e]) => {
			bookOn = Boolean(e?.isIntersecting);
			measure();
		});
		if (book) io.observe(book);
		const measure = () => {
			raf = 0;
			const vh = window.innerHeight;
			const els = PHASES.map((p) => document.getElementById(p.id));
			let idx = 0;
			for (let i = 0; i < els.length; i++) {
				const el = els[i];
				if (el && el.getBoundingClientRect().top < vh * 0.45) idx = i;
			}
			const cur = els[idx];
			const next = els[idx + 1];
			let q = 0;
			if (cur) {
				const top = cur.getBoundingClientRect().top - vh * 0.45;
				const span = next ? next.getBoundingClientRect().top - cur.getBoundingClientRect().top : cur.offsetHeight;
				q = Math.max(0, Math.min(1, -top / Math.max(1, span)));
			}
			const a = PHASES[idx]!.at;
			const b = PHASES[idx + 1]?.at ?? 1;
			setActive(idx);
			setShare(Math.round((a + (b - a) * q) * 1000) / 1000);
			const first = els[0];
			const world = first?.parentElement;
			const pastHero = first ? first.getBoundingClientRect().bottom < vh * 0.55 : false;
			const worldOn = world ? world.getBoundingClientRect().bottom > vh * 0.6 : false;
			setShow(pastHero && worldOn && !bookOn);
		};
		const on = () => {
			if (!raf) raf = requestAnimationFrame(measure);
		};
		measure();
		window.addEventListener('scroll', on, { passive: true });
		window.addEventListener('resize', on);
		return () => {
			cancelAnimationFrame(raf);
			io.disconnect();
			window.removeEventListener('scroll', on);
			window.removeEventListener('resize', on);
		};
	}, []);

	useEffect(() => {
		if (!show) setOpen(false);
	}, [show]);
	useEffect(() => {
		if (!open) return;
		const close = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
		window.addEventListener('keydown', close);
		return () => window.removeEventListener('keydown', close);
	}, [open]);

	const phase = PHASES[active]!;
	return (
		<nav className={s.dock} data-show={show} data-open={open} aria-label="Mission phases">
			<div ref={panelRef} className={s.panel} id="k-phase-list" hidden={!open}>
				<p className={s.panelHead}>
					<span>MISSION CLOCK</span>
					<span data-ok={power}>O₂ {o2.toFixed(1)}%</span>
				</p>
				<ol className={s.list}>
					{PHASES.map((p, i) => (
						<li key={p.id} data-state={i < active ? 'done' : i === active ? 'now' : 'next'}>
							<a href={`#${p.id}`} onClick={() => setOpen(false)}>
								<span className={s.n}>{p.n}</span>
								<span className={s.label}>{p.label}</span>
								<span className={s.t}>{met(p.at, gameMinutes).replace('T+', '+')}</span>
							</a>
						</li>
					))}
					<li data-state="next">
						<a href="#book" onClick={() => setOpen(false)}>
							<span className={s.n}>▸</span>
							<span className={s.label}>Book the docking</span>
						</a>
					</li>
				</ol>
			</div>
			<button type="button" className={s.dial} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="k-phase-list" tabIndex={show ? 0 : -1}>
				<svg viewBox="0 0 80 80" aria-hidden className={s.ring}>
					<circle cx="40" cy="40" r={R} className={s.track} />
					<circle cx="40" cy="40" r={R} className={s.arc} strokeDasharray={`${Math.round(C * share * 100) / 100} ${C}`} />
					{PHASES.map((p) => {
						const a = p.at * Math.PI * 2 - Math.PI / 2;
						return <line key={p.id} x1={Math.round((40 + Math.cos(a) * 34) * 100) / 100} y1={Math.round((40 + Math.sin(a) * 34) * 100) / 100} x2={Math.round((40 + Math.cos(a) * 38) * 100) / 100} y2={Math.round((40 + Math.sin(a) * 38) * 100) / 100} className={s.tick} />;
					})}
				</svg>
				<span className={s.face}>
					<span className={s.phaseN}>{phase.n}</span>
					<span className={s.met}>{met(share, gameMinutes)}</span>
				</span>
				<span className={s.caption}>
					<b>{phase.label}</b>
					<span>Mission clock · phases</span>
				</span>
			</button>
		</nav>
	);
}
