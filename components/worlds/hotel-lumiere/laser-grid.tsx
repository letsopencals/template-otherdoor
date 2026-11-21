'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Diamond, INK, PAPER } from './art';
import s from './lumiere.module.css';

/**
 * THE VAULT CORRIDOR. Six beams sweep the corridor on their own rhythms. Bring
 * your pointer in at the door (left) and reach the case (right) without
 * touching a beam; touch one and the alarm goes: red flash, WHOOP WHOOP, reset.
 * On touch screens a tap tests that spot. Beams move only while the panel is on
 * screen (rAF), and freeze in place under reduced motion (still trippable).
 */

const W = 1000;
const H = 500;
const TOP = 70;
const FLOOR = 430;

type Seg = { x1: number; y1: number; x2: number; y2: number; on: boolean };

/** Beam positions at time t (seconds). Pure, so the first paint can use t = 0. */
function beamsAt(t: number): Seg[] {
	const sweep = (pivotX: number, pivotY: number, a: number, on: boolean): Seg => {
		const len = (FLOOR - TOP) / Math.max(0.2, Math.abs(Math.sin(a)));
		const dir = pivotY < (TOP + FLOOR) / 2 ? 1 : -1;
		return { x1: pivotX, y1: pivotY, x2: pivotX + Math.cos(a) * len * dir, y2: pivotY + Math.abs(Math.sin(a)) * len * dir, on };
	};
	const x1 = 250 + Math.sin(t * 1.1) * 70;
	const yh = 250 + Math.sin(t * 0.9 + 1) * 130;
	// Every full-height beam has a timed gap (a clean run is about waiting for it).
	return [
		{ x1, y1: TOP, x2: x1 + 30, y2: FLOOR, on: t % 3 < 1.9 },
		sweep(430, TOP, Math.PI / 2 + Math.sin(t * 0.8) * 0.62, (t + 1) % 3.4 < 2.2),
		{ x1: 470, y1: yh, x2: 660, y2: yh + Math.sin(t * 1.7) * 26, on: true },
		{ x1: 712, y1: TOP, x2: 698, y2: FLOOR, on: t % 2.6 < 1.7 },
		sweep(830, FLOOR, Math.PI / 2 + Math.sin(t * 0.7 + 2) * 0.58, (t + 2) % 3.2 < 2),
		{ x1: 140, y1: 404, x2: 880, y2: 396, on: true },
	];
}

function distToSeg(px: number, py: number, g: Seg): number {
	const dx = g.x2 - g.x1;
	const dy = g.y2 - g.y1;
	const l2 = dx * dx + dy * dy || 1;
	const t = Math.max(0, Math.min(1, ((px - g.x1) * dx + (py - g.y1) * dy) / l2));
	return Math.hypot(px - (g.x1 + t * dx), py - (g.y1 + t * dy));
}

const r1 = (n: number) => Math.round(n * 10) / 10;

type Run = 'idle' | 'armed' | 'tripped' | 'clean';

export function LaserGrid() {
	const svgRef = useRef<SVGSVGElement>(null);
	const lines = useRef<Array<SVGGElement | null>>([]);
	const segs = useRef<Seg[]>(beamsAt(0));
	const t0 = useRef(0);
	const raf = useRef(0);
	const runRef = useRef<Run>('idle');
	const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [run, setRun] = useState<Run>('idle');
	const [trips, setTrips] = useState(0);
	const [cleans, setCleans] = useState(0);
	const [tap, setTap] = useState<{ x: number; y: number; hit: boolean; k: number } | null>(null);
	const [still, setStill] = useState(false);
	const lastPt = useRef<{ x: number; y: number } | null>(null);
	const tripRef = useRef<() => void>(() => undefined);

	const setRunBoth = useCallback((r: Run) => {
		runRef.current = r;
		setRun(r);
	}, []);

	const draw = useCallback(() => {
		segs.current.forEach((g, i) => {
			const el = lines.current[i];
			if (!el) return;
			el.style.opacity = g.on ? '1' : '0';
			for (const ln of Array.from(el.children)) {
				ln.setAttribute('x1', String(r1(g.x1)));
				ln.setAttribute('y1', String(r1(g.y1)));
				ln.setAttribute('x2', String(r1(g.x2)));
				ln.setAttribute('y2', String(r1(g.y2)));
			}
		});
	}, []);

	// Animate only while visible.
	useEffect(() => {
		const svg = svgRef.current;
		if (!svg) return;
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		setStill(reduce);
		if (reduce) {
			segs.current = beamsAt(0.8);
			draw();
			return;
		}
		const loop = (now: number) => {
			if (!t0.current) t0.current = now;
			segs.current = beamsAt((now - t0.current) / 1000);
			draw();
			// A beam sweeping over a pointer that holds still trips it too.
			const p = lastPt.current;
			if (p && runRef.current === 'armed' && segs.current.some((g) => g.on && distToSeg(p.x, p.y, g) < 10)) tripRef.current();
			raf.current = requestAnimationFrame(loop);
		};
		const io = new IntersectionObserver(([e]) => {
			cancelAnimationFrame(raf.current);
			if (e?.isIntersecting) raf.current = requestAnimationFrame(loop);
		});
		io.observe(svg);
		return () => {
			io.disconnect();
			cancelAnimationFrame(raf.current);
		};
	}, [draw]);

	useEffect(() => () => {
		if (resetTimer.current) clearTimeout(resetTimer.current);
	}, []);

	const toSvg = (e: React.PointerEvent): { x: number; y: number } | null => {
		const svg = svgRef.current;
		const m = svg?.getScreenCTM();
		if (!svg || !m) return null;
		const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
		return { x: p.x, y: p.y };
	};

	const hitAt = (x: number, y: number) => segs.current.some((g) => g.on && distToSeg(x, y, g) < 10);

	const trip = () => {
		lastPt.current = null;
		setTrips((n) => n + 1);
		setRunBoth('tripped');
		if (resetTimer.current) clearTimeout(resetTimer.current);
		resetTimer.current = setTimeout(() => setRunBoth('idle'), 1600);
	};

	tripRef.current = trip;

	const onMove = (e: React.PointerEvent) => {
		if (e.pointerType === 'touch') return;
		const p = toSvg(e);
		if (!p || runRef.current === 'tripped') return;
		lastPt.current = p;
		const inBand = p.y > TOP && p.y < FLOOR;
		if (p.x < 120 && inBand) {
			if (runRef.current !== 'armed') setRunBoth('armed');
			return;
		}
		if (runRef.current !== 'armed') return;
		// Ceiling and floor are out of bounds: no sneaking round the beams.
		if (!inBand) return setRunBoth('idle');
		if (hitAt(p.x, p.y)) return trip();
		if (p.x > 890) {
			lastPt.current = null;
			setCleans((n) => n + 1);
			setRunBoth('clean');
			if (resetTimer.current) clearTimeout(resetTimer.current);
			resetTimer.current = setTimeout(() => setRunBoth('idle'), 2200);
		}
	};

	const onLeave = () => {
		lastPt.current = null;
		if (runRef.current === 'armed') setRunBoth('idle');
	};

	const onDown = (e: React.PointerEvent) => {
		if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return;
		const p = toSvg(e);
		if (!p) return;
		const hit = hitAt(p.x, p.y);
		setTap({ x: Math.round(p.x), y: Math.round(p.y), hit, k: Date.now() });
		if (hit) trip();
	};

	const testCentre = () => {
		const hit = hitAt(500, 250);
		setTap({ x: 500, y: 250, hit, k: Date.now() });
		if (hit) trip();
	};

	const init = beamsAt(0);
	const status =
		run === 'tripped' ? 'Alarm! You touched a beam.' : run === 'clean' ? 'Clean run: you reached the case without a sound.' : run === 'armed' ? 'You’re in. Now reach the case on the right.' : 'Start at the door on the left.';

	return (
		<div className={s.laser} data-run={run}>
			<svg
				ref={svgRef}
				viewBox={`0 0 ${W} ${H}`}
				preserveAspectRatio="xMidYMid slice"
				className={s.laserSvg}
				onPointerMove={onMove}
				onPointerLeave={onLeave}
				onPointerDown={onDown}
				role="img"
				aria-label="The vault corridor, crossed by six moving laser beams, with the jewel's glass case at the far end"
			>
				<rect width={W} height={H} fill="#0C1534" />
				<rect width={W} height={H} fill="url(#lm-dots-blue)" opacity=".55" />
				{/* wall panels */}
				{Array.from({ length: 9 }, (_, i) => (
					<rect key={i} x={140 + i * 84} y={TOP + 24} width="64" height="230" fill="none" stroke="#24356B" strokeWidth="3" />
				))}
				<rect x="0" y={TOP - 14} width={W} height="14" fill="#1A2550" stroke={INK} strokeWidth="3" />
				{/* floor */}
				<path d={`M0 ${FLOOR} L${W} ${FLOOR} L${W} ${H} L0 ${H} Z`} fill="#141E44" stroke={INK} strokeWidth="3" />
				{Array.from({ length: 13 }, (_, i) => (
					<line key={i} x1={i * 84 - 40} y1={FLOOR} x2={i * 84 - 120} y2={H} stroke="#24356B" strokeWidth="2.5" />
				))}
				{/* the door you came in by */}
				<rect x="18" y={TOP + 26} width="92" height={FLOOR - TOP - 26} fill="#FFE9A8" stroke={INK} strokeWidth="4" />
				<rect x="18" y={TOP + 26} width="92" height={FLOOR - TOP - 26} fill="url(#lm-dots-yellow)" opacity=".7" />
				<path d={`M110 ${TOP + 26} L150 ${TOP + 40} L150 ${FLOOR + 6} L110 ${FLOOR}`} fill="#3B2A1A" stroke={INK} strokeWidth="3" />
				{/* the case */}
				<rect x="904" y="312" width="72" height={FLOOR - 312} fill="#3B2A1A" stroke={INK} strokeWidth="4" />
				<rect x="898" y="300" width="84" height="14" fill="#5A3E26" stroke={INK} strokeWidth="3" />
				<rect x="906" y="216" width="68" height="84" fill="rgba(189,239,250,.18)" stroke={PAPER} strokeWidth="3" />
				<Diamond x={940} y={266} s={0.7} />
				{/* emitters */}
				{[250, 430, 712, 830].map((x) => (
					<rect key={x} x={x - 14} y={TOP - 4} width="28" height="12" fill="#2A2A2A" stroke={INK} strokeWidth="2" />
				))}
				{/* beams */}
				{init.map((g, i) => (
					<g
						key={i}
						ref={(el) => {
							lines.current[i] = el;
						}}
						className={s.beam}
					>
						<line x1={r1(g.x1)} y1={r1(g.y1)} x2={r1(g.x2)} y2={r1(g.y2)} stroke="#FF2A1A" strokeWidth="16" opacity=".35" filter="url(#lm-glow)" />
						<line x1={r1(g.x1)} y1={r1(g.y1)} x2={r1(g.x2)} y2={r1(g.y2)} stroke="#FF4B36" strokeWidth="4.5" strokeLinecap="round" />
						<line x1={r1(g.x1)} y1={r1(g.y1)} x2={r1(g.x2)} y2={r1(g.y2)} stroke="#FFE1D8" strokeWidth="1.6" strokeLinecap="round" />
					</g>
				))}
				{tap ? (
					<g key={tap.k} className={s.tapMark} transform={`translate(${tap.x} ${tap.y})`}>
						<circle r="18" fill="none" stroke={tap.hit ? '#FF4B36' : '#7CF0C8'} strokeWidth="4" />
						<circle r="4" fill={tap.hit ? '#FF4B36' : '#7CF0C8'} />
					</g>
				) : null}
				{/* zone labels */}
				<text x="64" y={TOP + 16} textAnchor="middle" className={s.laserLabel}>START</text>
				<text x="940" y="204" textAnchor="middle" className={s.laserLabel}>THE CASE</text>
			</svg>
			<div className={s.alarmFlash} aria-hidden />
			<p className={s.whoop} aria-hidden>
				WHOOP! WHOOP!
			</p>
			<p className={s.smooth} aria-hidden>
				Smooth.
			</p>
			<div className={s.laserBar}>
				<p className={s.laserStatus} role="status" aria-live="polite">
					{status}
				</p>
				<p className={s.laserScore}>
					<span>Alarms <b>{trips}</b></span>
					<span>Clean runs <b>{cleans}</b></span>
				</p>
				<button type="button" className={s.laserTest} onClick={testCentre}>
					Test the middle of the corridor
				</button>
			</div>
			<p className={s.laserHint}>
				<span className={s.hintMouse}>Bring your pointer in through the door on the left, then get to the case on the right without touching red. Beams blink off: wait for your gap.</span>
				<span className={s.hintTouch}>Tap anywhere in the corridor to test a spot. Hit a beam and the alarm goes.</span>
				{still ? <span> The beams are holding still for you.</span> : null}
			</p>
		</div>
	);
}
