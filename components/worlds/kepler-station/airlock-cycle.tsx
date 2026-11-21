'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { SafeImg } from '@/components/ui/safe-img';
import s from './airlock.module.css';

const HOLD_MS = 1700;
const KPA = 101.3;

const STEPS = [
	{ at: 0, text: 'Hatch sealed · 0.0 kPa · hold to cycle' },
	{ at: 0.08, text: 'Seals check · valves opening' },
	{ at: 0.35, text: 'Pressurising · hssssss' },
	{ at: 0.7, text: 'Equalising with the shuttle' },
	{ at: 0.97, text: 'Pressure matched · clamps releasing' },
];

/**
 * AIRLOCK CYCLE. The threshold to the final docking (and the booking panel
 * below it): press and hold to pressurise; the gauge climbs, warning lights
 * cycle, and at full pressure the doors part onto the corridor. Let go early and
 * it vents back down. Space/Enter hold too. The panel is never behind these
 * doors: it sits below the section in normal flow, and arriving with #book opens
 * them. Reduced motion: one press opens.
 */
export function AirlockCycle({ corridor, gameMinutes }: { corridor: string; gameMinutes: number }) {
	const rootRef = useRef<HTMLDivElement>(null);
	const [open, setOpen] = useState(false);
	const [p, setP] = useState(0);
	const holding = useRef(false);
	const prog = useRef(0);
	const raf = useRef(0);
	const still = useRef(false);

	useEffect(() => {
		still.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (window.location.hash === '#book') {
			setOpen(true);
			setP(1);
		}
		return () => cancelAnimationFrame(raf.current);
	}, []);

	const loop = () => {
		let last = performance.now();
		const step = (t: number) => {
			const dt = t - last;
			last = t;
			prog.current = holding.current ? Math.min(1, prog.current + dt / HOLD_MS) : Math.max(0, prog.current - (dt / HOLD_MS) * 2.2);
			rootRef.current?.style.setProperty('--hold', prog.current.toFixed(3));
			setP(Math.round(prog.current * 1000) / 1000);
			if (prog.current >= 1) {
				holding.current = false;
				setOpen(true);
				return;
			}
			if (holding.current || prog.current > 0) raf.current = requestAnimationFrame(step);
			else raf.current = 0;
		};
		cancelAnimationFrame(raf.current);
		raf.current = requestAnimationFrame(step);
	};

	const start = () => {
		if (open) return;
		if (still.current) {
			prog.current = 1;
			setP(1);
			setOpen(true);
			return;
		}
		holding.current = true;
		loop();
	};
	const stop = () => {
		if (!holding.current) return;
		holding.current = false;
	};
	const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
		if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
			e.preventDefault();
			start();
		}
	};
	const onKeyUp = (e: KeyboardEvent<HTMLButtonElement>) => {
		if (e.key === ' ' || e.key === 'Enter') {
			e.preventDefault();
			stop();
		}
	};

	const step = [...STEPS].reverse().find((x) => p >= x.at) ?? STEPS[0]!;
	const kpa = (p * KPA).toFixed(1);

	return (
		<div ref={rootRef} className={s.lock} data-open={open} style={{ ['--hold' as string]: open ? 1 : p }}>
			<div className={s.frame}>
				<SafeImg src={corridor} alt="" className={s.beyond} fallback={<span className={s.beyondFallback} />} />
				<div className={s.beyondShade} aria-hidden />
				<div className={s.cleared}>
					<p className={s.clearedKicker}>Airlock 3 · pressure matched</p>
					<p className={s.clearedTitle}>Crew cleared to board.</p>
					<a href="#book" className={s.clearedCta}>
						Pick your launch window ↓
					</a>
				</div>

				<div className={s.doors} aria-hidden>
					<span className={`${s.door} ${s.left}`}>
						<i className={s.panel} />
						<i className={s.wheel} />
						<b className={s.stencil}>AIR</b>
						<i className={s.port} />
						<i className={s.stripes} />
						<i className={s.bolts} />
					</span>
					<span className={`${s.door} ${s.right}`}>
						<i className={s.panel} />
						<i className={s.wheel} />
						<b className={s.stencil}>LOCK 3</b>
						<i className={s.port} />
						<i className={s.stripes} />
						<i className={s.bolts} />
					</span>
					<span className={s.seam} />
				</div>
				<div className={s.sweep} aria-hidden />

				<div className={s.beacons} aria-hidden>
					{[0, 1, 2, 3, 4, 5].map((i) => (
						<i key={i} data-on={p * 6 > i || open} />
					))}
				</div>
				<div className={s.gauge} aria-hidden>
					<span className={s.gaugeFill} />
					{[0, 25, 50, 75, 100].map((v) => (
						<em key={v} style={{ bottom: `${v}%` }}>
							{Math.round((v / 100) * KPA)}
						</em>
					))}
				</div>
			</div>

			<div className={s.controls}>
				<button
					type="button"
					className={s.hold}
					onPointerDown={(e) => {
						try {
							e.currentTarget.setPointerCapture(e.pointerId);
						} catch {
							/* synthetic pointers can't be captured; the hold still works */
						}
						start();
					}}
					onPointerUp={stop}
					onPointerCancel={stop}
					onLostPointerCapture={stop}
					onKeyDown={onKeyDown}
					onKeyUp={onKeyUp}
					onBlur={stop}
					onContextMenu={(e) => e.preventDefault()}
					disabled={open}
					aria-label={open ? 'Airlock open' : 'Press and hold to cycle the airlock'}
				>
					<svg viewBox="0 0 100 100" aria-hidden className={s.holdRing}>
						<circle cx="50" cy="50" r="44" className={s.holdTrack} />
						<circle cx="50" cy="50" r="44" className={s.holdArc} pathLength={100} />
					</svg>
					<span className={s.holdLabel}>{open ? 'Open' : 'Hold'}</span>
				</button>
				<div className={s.readout} aria-live="polite">
					<p className={s.kpa}>
						{open ? KPA.toFixed(1) : kpa}
						<small>kPa</small>
					</p>
					<p className={s.stepText}>{open ? `Hatch open · ${gameMinutes} minutes start on the other side` : step.text}</p>
				</div>
				<a href="#book" className={s.skip}>
					Skip to booking
				</a>
			</div>
		</div>
	);
}
