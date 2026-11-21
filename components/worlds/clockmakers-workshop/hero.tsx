'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { GreatClock, WindKeyArt } from './art';
import { GearTrain } from './gear-train';
import type { GearSpec } from './gears';
import { HiddenKey } from './keys';
import { HeroLoop } from './hero-loop';
import { playCuckoo, setSound, useSound } from './sound';
import { useMainspring, useWound, windBy } from './spring';
import s from './clockmaker.module.css';

/** The big train behind the hero copy (module 9: correct mesh, five sizes, one compound pair). */
const BACK_TRAIN: GearSpec[] = [
	{ id: 'main', teeth: 56, x: 0, y: 0, tone: 'brass' },
	{ id: 'b', teeth: 22, parent: 'main', dir: -28, tone: 'copper' },
	{ id: 'b2', teeth: 40, axle: 'b', tone: 'brass' },
	{ id: 'c', teeth: 16, parent: 'b2', dir: 40, tone: 'steel' },
	{ id: 'd', teeth: 30, parent: 'main', dir: 64, tone: 'brass' },
	{ id: 'e', teeth: 14, parent: 'd', dir: 10, tone: 'copper' },
	{ id: 'f', teeth: 26, parent: 'main', dir: 168, tone: 'copper' },
];
/** A smaller train behind the clock. */
const CLOCK_TRAIN: GearSpec[] = [
	{ id: 'a', teeth: 36, x: 0, y: 0, k: -0.8, tone: 'brass' },
	{ id: 'b', teeth: 18, parent: 'a', dir: 200, tone: 'steel' },
	{ id: 'c', teeth: 28, parent: 'a', dir: 105, tone: 'copper' },
	{ id: 'd', teeth: 12, parent: 'c', dir: 30, tone: 'brass' },
];

const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, n));

export function Hero({ title, kicker, tagline, facts, cta, loop, poster }: { title: string; kicker: string; tagline: string; facts: string[]; cta: string; loop?: string; poster?: string }) {
	const rootRef = useRef<HTMLElement>(null);
	const clockRef = useRef<HTMLDivElement>(null);
	const keyRef = useRef<HTMLButtonElement>(null);
	const drag = useRef<{ last: number; pointer: number } | null>(null);
	const moved = useRef(0);
	const keyAngle = useRef(0);
	const keyOffset = useRef(0);
	const masterRef = useRef(0);
	const wound = useWound();
	const sound = useSound();
	const [cuckoo, setCuckoo] = useState<string | null>(null);
	const [said, setSaid] = useState('');
	const fullOnce = useRef(false);
	const timer = useRef(0);

	const pop = useCallback((text: string) => {
		setCuckoo(text);
		setSaid(text);
		playCuckoo();
		window.clearTimeout(timer.current);
		timer.current = window.setTimeout(() => setCuckoo(null), 2600);
	}, []);

	// Hands and pendulum follow the mainspring; the key follows it too (it unwinds as the spring runs), except while held.
	useMainspring(rootRef, (a) => {
		masterRef.current = a;
		clockRef.current?.style.setProperty('--a', a.toFixed(2));
		if (!drag.current && keyRef.current) {
			keyAngle.current = a * 0.5 + keyOffset.current;
			keyRef.current.style.setProperty('--key', `${keyAngle.current.toFixed(1)}deg`);
		}
	});

	useEffect(() => {
		clockRef.current?.style.setProperty('--swing', String(Math.round(2 + (wound / 100) * 9)));
		if (wound >= 100 && !fullOnce.current) {
			fullOnce.current = true;
			pop('Fully wound! Open the cabinet ↓');
		}
	}, [wound, pop]);

	useEffect(() => {
		const t = window.setTimeout(() => pop('Cuck-oo! Turn my key.'), 1300);
		return () => {
			window.clearTimeout(t);
			window.clearTimeout(timer.current);
		};
	}, [pop]);

	const angleAt = (e: PointerEvent) => {
		const r = keyRef.current!.getBoundingClientRect();
		return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
	};

	const turn = (deg: number) => {
		keyAngle.current += deg;
		keyRef.current?.style.setProperty('--key', `${keyAngle.current.toFixed(1)}deg`);
		windBy(deg);
	};

	const onDown = (e: PointerEvent<HTMLButtonElement>) => {
		e.currentTarget.setPointerCapture(e.pointerId);
		drag.current = { last: angleAt(e), pointer: e.pointerId };
		moved.current = 0;
	};
	const onMove = (e: PointerEvent<HTMLButtonElement>) => {
		const d = drag.current;
		if (!d || d.pointer !== e.pointerId) return;
		const now = angleAt(e);
		let delta = now - d.last;
		if (delta > 180) delta -= 360;
		if (delta < -180) delta += 360;
		d.last = now;
		moved.current += Math.abs(delta);
		// A ratchet: the key only winds clockwise.
		if (delta > 0) turn(clamp(delta, 0, 45));
	};
	const onUp = () => {
		if (!drag.current) return;
		drag.current = null;
		keyOffset.current = keyAngle.current - masterRef.current * 0.5;
	};
	const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
		if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
			e.preventDefault();
			turn(30);
			keyOffset.current = keyAngle.current - masterRef.current * 0.5;
		}
	};
	const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		// Keyboard Enter/Space and plain taps (no drag) give the key a quarter turn.
		if (e.detail === 0 || moved.current < 6) {
			turn(e.detail === 0 ? 90 : 60);
			keyOffset.current = keyAngle.current - masterRef.current * 0.5;
		}
	};

	const words = title.split(' ');
	const last = words.pop();

	return (
		<header ref={rootRef} className={s.hero} data-cw-section="The great clock" data-cw-quiet="">
			<div className={s.heroWall} aria-hidden />
			<HeroLoop src={loop} poster={poster} className={s.heroLoop} />
			<div className={s.heroLamp} aria-hidden />
			<GearTrain specs={BACK_TRAIN} m={9} className={s.heroTrain} />
			<GearTrain specs={CLOCK_TRAIN} m={7} className={s.heroTrain2} speed={1.4} />
			<div className={s.heroShade} aria-hidden />

			<div className={s.heroInner}>
				<div className={s.heroCopy}>
					<p className={s.heroKicker}>{kicker}</p>
					<h1 className={s.heroTitle}>
						<span>{words.join(' ')}</span> <span className={s.heroTitleBig}>{last}</span>
					</h1>
					<p className={s.heroTagline}>{tagline}</p>
					<ul className={s.heroFacts}>
						{facts.map((f) => (
							<li key={f}>{f}</li>
						))}
					</ul>
					<div className={s.heroActions}>
						<a href="#book" className={s.btnCopper}>
							{cta}
						</a>
						<a href="#cabinet" className={s.btnGhost}>
							Open the cabinet
						</a>
					</div>
				</div>

				<div className={s.heroMachine}>
					<div className={s.keyPlate}>
						<button
							ref={keyRef}
							type="button"
							className={s.windKey}
							onPointerDown={onDown}
							onPointerMove={onMove}
							onPointerUp={onUp}
							onPointerCancel={onUp}
							onKeyDown={onKey}
							onClick={onClick}
							aria-label={`Wind the workshop: turn the key clockwise. Wound ${wound}%`}
							style={{ '--key': '0deg' } as CSSProperties}
						>
							<WindKeyArt className={s.windKeyArt} />
						</button>
						<span className={s.keyhole} aria-hidden />
						<p className={s.keyHelp} aria-hidden>
							<svg viewBox="0 0 60 40" className={s.keyArrow}>
								<path d="M6 30 C10 10 34 4 50 14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
								<path d="M42 8 L51 14 L44 22" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
							Turn me!
						</p>
						<div className={s.woundMeter} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={wound} aria-label="How wound the workshop is">
							<span className={s.woundLabel}>Wound</span>
							<span className={s.woundTrack}>
								<i style={{ width: `${wound}%` }} />
							</span>
							<span className={s.woundNum}>{wound}%</span>
						</div>
						<button type="button" className={s.soundToggle} aria-pressed={sound} onClick={() => setSound(!sound)}>
							<svg viewBox="0 0 24 24" aria-hidden>
								<path d="M4 9 L8 9 L13 5 L13 19 L8 15 L4 15 Z" fill="currentColor" />
								{sound ? <path d="M16 8 C18 10 18 14 16 16 M18.5 5.5 C22 9 22 15 18.5 18.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /> : <path d="M16 9 L21 15 M21 9 L16 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />}
							</svg>
							Cuckoo sound {sound ? 'on' : 'off'}
						</button>
					</div>

					<div ref={clockRef} className={s.clock} data-cuckoo={cuckoo ? 'on' : undefined} style={{ '--a': '0', '--swing': '2' } as CSSProperties}>
						<GreatClock />
						<p className={s.balloon} data-show={cuckoo ? 'true' : undefined} aria-live="polite">
							{said}
						</p>
						<HiddenKey n={1} className={s.key1} tilt={-18} />
					</div>
				</div>
			</div>
			<div className={s.crown} aria-hidden>
				<span className={s.crownRail} />
			</div>
		</header>
	);
}
