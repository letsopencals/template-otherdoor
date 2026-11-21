'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Diamond, INK, PAPER, RED, Sparkle, YELLOW } from './art';
import { Sfx } from './lettering';
import s from './lumiere.module.css';

/**
 * THE PENTHOUSE SAFE. Drag the dial round (or use the arrow keys): every number
 * that passes the red marker clicks. Rest on 19, then 63, then 9 (the year and
 * the issue, from the planner's note) and the tumblers fall one by one; the door
 * swings and the Étoile Bleue catches the light. "Just open it" skips the
 * puzzle: nothing here gates booking.
 */

export const COMBINATION = [19, 63, 9] as const;
const REST_MS = 420;

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Dial geometry, computed once at module scope (rounded: hydration-safe). */
const TICKS = Array.from({ length: 100 }, (_, i) => {
	const a = (Math.PI * 2 * i) / 100;
	const r0 = i % 10 === 0 ? 128 : i % 5 === 0 ? 136 : 142;
	return `M${r2(Math.sin(a) * 152)} ${r2(-Math.cos(a) * 152)} L${r2(Math.sin(a) * r0)} ${r2(-Math.cos(a) * r0)}`;
}).join(' ');
const NUMBERS = Array.from({ length: 10 }, (_, i) => {
	const a = (Math.PI * 2 * i) / 10;
	return { n: i * 10, x: r2(Math.sin(a) * 108), y: r2(-Math.cos(a) * 108), rot: i * 36 };
});
const KNURL = Array.from({ length: 36 }, (_, i) => {
	const a = (Math.PI * 2 * i) / 36;
	return `M${r2(Math.sin(a) * 58)} ${r2(-Math.cos(a) * 58)} L${r2(Math.sin(a) * 68)} ${r2(-Math.cos(a) * 68)}`;
}).join(' ');

/** The number under the marker for a dial rotated by `deg` (clockwise positive). */
function valueAt(deg: number): number {
	return (((Math.round(-deg / 3.6) % 100) + 100) % 100);
}

export function SafeDial() {
	const dialRef = useRef<SVGGElement>(null);
	const svgRef = useRef<SVGSVGElement>(null);
	const rot = useRef(0);
	const lastAngle = useRef<number | null>(null);
	const lastValue = useRef(0);
	const restTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const stepRef = useRef(0);
	const [value, setValue] = useState(0);
	const [step, setStep] = useState(0);
	const [open, setOpen] = useState(false);
	const [clicks, setClicks] = useState(0);

	const paint = useCallback(() => {
		if (dialRef.current) dialRef.current.style.transform = `rotate(${r2(rot.current)}deg)`;
	}, []);

	const settle = useCallback(() => {
		if (restTimer.current) clearTimeout(restTimer.current);
		restTimer.current = setTimeout(() => {
			const v = valueAt(rot.current);
			const want = COMBINATION[stepRef.current];
			if (want === undefined) return;
			if (v === want) {
				stepRef.current += 1;
				setStep(stepRef.current);
				if (stepRef.current === COMBINATION.length) setTimeout(() => setOpen(true), 380);
			}
		}, REST_MS);
	}, []);

	const turnTo = useCallback(
		(deg: number) => {
			rot.current = deg;
			paint();
			const v = valueAt(deg);
			if (v !== lastValue.current) {
				lastValue.current = v;
				setValue(v);
				setClicks((c) => c + 1);
			}
			settle();
		},
		[paint, settle],
	);

	useEffect(() => () => {
		if (restTimer.current) clearTimeout(restTimer.current);
	}, []);

	const angleOf = (e: React.PointerEvent) => {
		const r = svgRef.current?.getBoundingClientRect();
		if (!r) return 0;
		return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
	};

	const onDown = (e: React.PointerEvent<SVGSVGElement>) => {
		if (open) return;
		e.currentTarget.setPointerCapture(e.pointerId);
		lastAngle.current = angleOf(e);
	};
	const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
		if (lastAngle.current === null) return;
		const a = angleOf(e);
		let d = a - lastAngle.current;
		if (d > 180) d -= 360;
		if (d < -180) d += 360;
		lastAngle.current = a;
		turnTo(rot.current + d);
	};
	const onUp = () => {
		lastAngle.current = null;
	};
	const onKey = (e: React.KeyboardEvent) => {
		if (open) return;
		const step = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? -1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? 1 : e.key === 'PageUp' ? -10 : e.key === 'PageDown' ? 10 : 0;
		if (!step) return;
		e.preventDefault();
		turnTo(rot.current + step * 3.6);
	};

	const reset = () => {
		stepRef.current = 0;
		setStep(0);
		setOpen(false);
		turnTo(0);
	};
	const skip = () => {
		stepRef.current = COMBINATION.length;
		setStep(COMBINATION.length);
		setOpen(true);
	};

	return (
		<div className={s.safe} data-open={open ? '' : undefined}>
			<div className={s.safeBody}>
				{/* inside: the jewel */}
				<div className={s.safeInside} aria-hidden={!open}>
					<svg viewBox="0 0 320 320" className={s.safeJewel} aria-hidden focusable="false">
						<rect width="320" height="320" fill="#1B1020" />
						<path d="M120 0 L200 0 L300 320 L20 320 Z" fill={YELLOW} opacity=".9" />
						<path d="M120 0 L200 0 L300 320 L20 320 Z" fill="url(#lm-dots-paper)" opacity=".5" />
						<path d="M70 250 C70 214 250 214 250 250 L250 280 C250 296 70 296 70 280 Z" fill="#8E1B3F" stroke={INK} strokeWidth="5" />
						<path d="M90 240 C130 226 190 226 230 240" stroke="#D84B78" strokeWidth="5" fill="none" strokeLinecap="round" />
						<g className={s.jewelLift}>
							<Diamond x={160} y={188} s={1.6} />
						</g>
						<Sparkle x={214} y={136} s={1} className={s.spark} />
						<Sparkle x={102} y={160} s={0.6} className={`${s.spark} ${s.spark2}`} />
						<Sparkle x={190} y={236} s={0.45} className={`${s.spark} ${s.spark3}`} />
					</svg>
					<p className={s.jewelCap}>The Étoile Bleue. Forty-one carats, and yours for about four seconds.</p>
				</div>
				{/* the door */}
				<div className={s.safeDoor}>
					<svg viewBox="0 0 320 320" className={s.safeDoorArt} aria-hidden focusable="false">
						<rect x="6" y="6" width="308" height="308" rx="10" fill="#7F93A8" stroke={INK} strokeWidth="6" />
						<rect x="6" y="6" width="308" height="308" rx="10" fill="url(#lm-dots-ink-s)" opacity=".35" />
						<rect x="26" y="26" width="268" height="268" rx="6" fill="none" stroke={INK} strokeWidth="3" />
						{[[34, 34], [286, 34], [34, 286], [286, 286]].map(([x, y]) => (
							<circle key={`${x}${y}`} cx={x} cy={y} r="6" fill="#C9D3DD" stroke={INK} strokeWidth="2.5" />
						))}
						<rect x="282" y="120" width="22" height="80" rx="6" fill="#C9D3DD" stroke={INK} strokeWidth="3" />
						<text x="160" y="300" textAnchor="middle" className={s.safeMaker}>HÔTEL LUMIÈRE</text>
					</svg>
					<svg
						ref={svgRef}
						viewBox="-170 -170 340 340"
						className={s.dial}
						role="slider"
						tabIndex={open ? -1 : 0}
						aria-label="Safe dial"
						aria-valuemin={0}
						aria-valuemax={99}
						aria-valuenow={value}
						aria-valuetext={`${value}. Tumblers set: ${step} of 3`}
						onPointerDown={onDown}
						onPointerMove={onMove}
						onPointerUp={onUp}
						onPointerCancel={onUp}
						onKeyDown={onKey}
					>
						<circle r="166" fill="#5D6F82" stroke={INK} strokeWidth="6" />
						<g ref={dialRef} className={s.dialFace}>
							<circle r="156" fill={PAPER} stroke={INK} strokeWidth="5" />
							<path d={TICKS} stroke={INK} strokeWidth="3" strokeLinecap="round" />
							{NUMBERS.map((d) => (
								<text key={d.n} x={d.x} y={d.y} transform={`rotate(${d.rot} ${d.x} ${d.y})`} textAnchor="middle" dominantBaseline="central" className={s.dialNum}>
									{d.n}
								</text>
							))}
							<circle r="72" fill={INK} />
							<path d={KNURL} stroke="#9AA8B7" strokeWidth="3" />
							<circle r="50" fill="#C9D3DD" stroke={INK} strokeWidth="4" />
							<path d="M-30 -18 A 36 36 0 0 1 10 -34" stroke="#FFFFFF" strokeWidth="6" fill="none" strokeLinecap="round" />
						</g>
						<path d="M0 -150 L-13 -172 L13 -172 Z" fill={RED} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
					</svg>
					<span key={clicks} className={s.click} aria-hidden>
						{clicks ? 'click' : ''}
					</span>
				</div>
				{open ? <Sfx text="KA-CHUNK" fill={YELLOW} shade={RED} size={0.62} tilt={-8} className={s.openSfx} /> : null}
			</div>
			<div className={s.safeReadout}>
				<p className={s.safeNum} aria-hidden>
					{String(value).padStart(2, '0')}
				</p>
				<ol className={s.tumblers} aria-label="Tumblers">
					{COMBINATION.map((n, i) => (
						<li key={n} data-on={i < step ? '' : undefined}>
							<span className="sr-only">{i < step ? 'set' : 'not set'}</span>
						</li>
					))}
				</ol>
				<p className={s.safeStatus} role="status" aria-live="polite">
					{open ? 'KA-CHUNK. The safe is open.' : step ? `Tumbler ${step} down. Next number…` : 'Turn the dial and rest on each number.'}
				</p>
				<div className={s.safeActions}>
					{open ? (
						<button type="button" onClick={reset} className={s.safeBtn}>
							Close the safe
						</button>
					) : (
						<button type="button" onClick={skip} className={s.safeBtnGhost}>
							Too fiddly? Just open it
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
