'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BEACON, TRANSMISSION } from './mission';
import { useMission } from './mission-state';
import s from './decoder.module.css';

const GLYPHS = '░▒▓/\\#·';
const r1 = (n: number) => Math.round(n * 10) / 10;

/** Deterministic 0–1 per character so the scramble is stable while you tune. */
function hash(i: number) {
	let x = Math.imul(i + 1, 2654435761) >>> 0;
	x ^= x >>> 13;
	x = Math.imul(x, 0x5bd1e995) >>> 0;
	x ^= x >>> 15;
	return (x >>> 0) / 4294967296;
}

function scramble(text: string, clarity: number, offset: number) {
	let out = '';
	for (let i = 0; i < text.length; i++) {
		const ch = text[i]!;
		if (ch === ' ') {
			out += ' ';
			continue;
		}
		const h = hash(i + offset);
		out += h < clarity * clarity ? ch : GLYPHS[Math.floor(hash(i * 3 + offset) * GLYPHS.length)];
	}
	return out;
}

const TICKS = Array.from({ length: (BEACON.max - BEACON.min) * 2 + 1 }, (_, i) => BEACON.min + i / 2);

/**
 * SIGNAL DECODER. The comms booth's receiver: slide the band (a native range
 * input under a hand-drawn tuning scale) to clear the static and lock the
 * waveform on the beacon; the commander's last transmission resolves letter by
 * letter as you get closer and types out cleanly once locked. Animation runs only
 * while the receiver is on screen. Reduced motion: no noise or sweep animation,
 * the transcript appears at once.
 */
export function Decoder() {
	const { markTuned, tuned } = useMission();
	const [freq, setFreq] = useState(409.2);
	const [typed, setTyped] = useState(0);
	const [still, setStill] = useState(false);
	const wrapRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const waveRef = useRef<SVGPathElement>(null);
	const ghostRef = useRef<SVGPathElement>(null);
	const live = useRef({ clarity: 0, locked: false });

	const dist = Math.abs(freq - BEACON.target);
	const locked = dist <= BEACON.tolerance;
	const clarity = locked ? 1 : Math.max(0, Math.min(1, 1 - dist / 7));
	live.current = { clarity, locked };
	const fullText = useMemo(() => TRANSMISSION.lines.join('\n'), []);
	const decoded = tuned || typed >= fullText.length;

	useEffect(() => setStill(window.matchMedia('(prefers-reduced-motion: reduce)').matches), []);

	// lock: type the transmission out once
	useEffect(() => {
		if (!locked || decoded) return;
		if (still) {
			setTyped(fullText.length);
			return;
		}
		const t = window.setInterval(() => setTyped((n) => Math.min(fullText.length, n + 2)), 28);
		return () => window.clearInterval(t);
	}, [locked, decoded, still, fullText.length]);
	useEffect(() => {
		if (typed >= fullText.length) markTuned();
	}, [typed, fullText.length, markTuned]);

	// static + waveform, only while visible
	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext('2d');
		const wrap = wrapRef.current;
		if (!canvas || !ctx || !wrap) return;
		const W = 160;
		const H = 60;
		canvas.width = W;
		canvas.height = H;
		const img = ctx.createImageData(W, H);
		let raf = 0;
		let visible = false;
		let phase = 0;
		let last = 0;
		const drawNoise = () => {
			const a = live.current.locked ? 0 : 1 - live.current.clarity;
			for (let i = 0; i < img.data.length; i += 4) {
				const v = Math.random() * 255;
				img.data[i] = v * 0.75;
				img.data[i + 1] = v;
				img.data[i + 2] = v;
				img.data[i + 3] = Math.random() < 0.55 ? a * 230 : 0;
			}
			ctx.putImageData(img, 0, 0);
		};
		const drawWave = () => {
			const { clarity: c, locked: l } = live.current;
			const amp = 18 + c * 34;
			let d = '';
			let g = '';
			for (let i = 0; i <= 120; i++) {
				const x = (i / 120) * 640;
				const base = Math.sin(i * 0.21 + phase) * amp + Math.sin(i * 0.63 + phase * 1.7) * amp * 0.18;
				const jitter = l ? 0 : (Math.random() - 0.5) * (1 - c) * 120;
				d += `${i ? 'L' : 'M'}${r1(x)} ${r1(100 + base * (l ? 1 : 0.4 + c * 0.6) + jitter)}`;
				g += `${i ? 'L' : 'M'}${r1(x)} ${r1(100 + Math.sin(i * 0.21 + phase - 0.5) * amp)}`;
			}
			waveRef.current?.setAttribute('d', d);
			ghostRef.current?.setAttribute('d', g);
		};
		const tick = (t: number) => {
			raf = 0;
			if (t - last > 50) {
				last = t;
				drawNoise();
			}
			phase += live.current.locked ? 0.06 : 0.11;
			drawWave();
			if (visible && !still) raf = requestAnimationFrame(tick);
		};
		const io = new IntersectionObserver(([e]) => {
			visible = Boolean(e?.isIntersecting);
			if (visible && !raf && !still) raf = requestAnimationFrame(tick);
		});
		io.observe(wrap);
		drawNoise();
		drawWave();
		return () => {
			cancelAnimationFrame(raf);
			io.disconnect();
		};
	}, [still]);

	// reduced motion: redraw once per change
	useEffect(() => {
		if (!still) return;
		const canvas = canvasRef.current;
		if (!canvas) return;
		canvas.style.opacity = String(locked ? 0 : 1 - clarity);
	}, [still, locked, clarity]);

	const pct = ((freq - BEACON.min) / (BEACON.max - BEACON.min)) * 100;
	const bars = Math.round(clarity * 5);
	const shown = decoded ? fullText : locked ? fullText.slice(0, typed) : scramble(fullText, clarity * 0.85, 7);

	return (
		<div className={s.rx} ref={wrapRef} data-locked={locked || decoded}>
			<div className={s.head}>
				<span className={s.headLabel}>
					<i className={s.lamp} data-on={locked} /> RX-2 · COMMS BOOTH · DECK 1
				</span>
				<span className={s.lockLabel}>{locked ? 'SIGNAL LOCKED' : decoded ? 'TRANSCRIPT SAVED' : 'SEARCHING'}</span>
			</div>

			<div className={s.screen}>
				<svg viewBox="0 0 640 200" className={s.scope} aria-hidden preserveAspectRatio="none">
					<g className={s.grid}>
						{Array.from({ length: 17 }, (_, i) => (
							<line key={`v${i}`} x1={i * 40} x2={i * 40} y1="0" y2="200" />
						))}
						{Array.from({ length: 6 }, (_, i) => (
							<line key={`h${i}`} x1="0" x2="640" y1={i * 40} y2={i * 40} />
						))}
						<line x1="0" x2="640" y1="100" y2="100" className={s.axis} />
					</g>
					<path ref={ghostRef} className={s.ghost} d="M0 100H640" />
					<path ref={waveRef} className={s.wave} d="M0 100H640" />
				</svg>
				<canvas ref={canvasRef} className={s.noise} aria-hidden />
				<div className={s.scan} aria-hidden />
				<div className={s.readout}>
					<span className={s.freq}>
						{freq.toFixed(2)}
						<small>MHz</small>
					</span>
					<span className={s.bars} aria-hidden>
						{Array.from({ length: 5 }, (_, i) => (
							<i key={i} data-on={i < bars} style={{ height: `${6 + i * 4}px` }} />
						))}
					</span>
				</div>
			</div>

			<div className={s.band}>
				<div className={s.scale} aria-hidden>
					{TICKS.map((t) => (
						<span key={t} className={s.tick} data-major={t % 5 === 0} style={{ left: `${((t - BEACON.min) / (BEACON.max - BEACON.min)) * 100}%` }}>
							{t % 5 === 0 ? <em>{t}</em> : null}
						</span>
					))}
					<span className={s.needle} style={{ left: `${pct}%` }} />
				</div>
				<input
					type="range"
					className={s.range}
					min={BEACON.min}
					max={BEACON.max}
					step={BEACON.step}
					value={freq}
					onChange={(e) => setFreq(Number(e.target.value))}
					aria-label="Receiver frequency"
					aria-valuetext={`${freq.toFixed(2)} megahertz${locked ? ', signal locked' : ''}`}
				/>
			</div>
			<div className={s.fine}>
				<button type="button" onClick={() => setFreq((f) => Math.max(BEACON.min, Math.round((f - 0.1) * 100) / 100))} aria-label="Tune down 0.1 megahertz">
					− 0.1
				</button>
				<span>Drag the band. The comms mast said where to look.</span>
				<button type="button" onClick={() => setFreq((f) => Math.min(BEACON.max, Math.round((f + 0.1) * 100) / 100))} aria-label="Tune up 0.1 megahertz">
					+ 0.1
				</button>
			</div>

			<div className={s.transcript}>
				<p className={s.txMeta}>
					<span>{TRANSMISSION.stamp}</span>
					<span>{TRANSMISSION.from}</span>
				</p>
				<p className={s.txBody} aria-live="polite" aria-label={decoded || locked ? undefined : 'Transmission unreadable: tune the receiver'}>
					{shown}
					{locked && !decoded ? <span className={s.caret} /> : null}
				</p>
			</div>
		</div>
	);
}
