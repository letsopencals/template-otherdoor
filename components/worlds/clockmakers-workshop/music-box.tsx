'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { playPluck } from './sound';
import s from './clockmaker.module.css';

/**
 * THE MUSIC BOX. A brass drum whose pins spell the room's three numbers
 * (players, minutes, age) in a 5×7 dot face across its front. Hover, focus or
 * tap "Play the tune" and the drum makes one full turn: pins roll under, pluck
 * the steel comb (each tine shivers, a note floats up, and with sound on it
 * really plays), and come back round to spell the numbers again.
 * Pins are projected from the unwrapped drum: y = R·sin φ, size and light by cos φ.
 * The numbers are also real text beside the drum; the SVG is decorative.
 */

const GLYPHS: Record<string, string[]> = {
	'0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
	'1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
	'2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
	'3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
	'4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
	'5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
	'6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
	'7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
	'8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
	'9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
	'+': ['00000', '00100', '00100', '11111', '00100', '00100', '00000'],
	'–': ['00000', '00000', '00000', '01110', '00000', '00000', '00000'],
};

const W = 760;
const H = 300;
const CY = 128;
const R = 92;
const X0 = 70;
const X1 = 690;
const DX = 11;
const ROW = 10; // degrees per glyph row
const COMB_Y = CY + R;
const SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51];

interface Pin {
	x: number;
	phi: number;
	glyph: boolean;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

function layout(words: string[]): Pin[] {
	const pins: Pin[] = [];
	const groupW = (X1 - X0) / words.length;
	words.forEach((w, gi) => {
		const chars = [...w];
		const width = chars.length * 6 * DX - DX;
		let x = X0 + gi * groupW + (groupW - width) / 2;
		for (const ch of chars) {
			const g = GLYPHS[ch];
			if (g) {
				g.forEach((row, ri) => {
					[...row].forEach((bit, ci) => {
						if (bit === '1') pins.push({ x: r2(x + ci * DX), phi: (ri - 3) * ROW, glyph: true });
					});
				});
			}
			x += 6 * DX;
		}
	});
	// The tune on the back of the drum (deterministic, no Math.random).
	let seed = 11;
	const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
	for (let i = 0; i < 70; i++) {
		pins.push({ x: r2(X0 + 10 + rnd() * (X1 - X0 - 20)), phi: 55 + rnd() * 250, glyph: false });
	}
	return pins;
}

function project(p: Pin, rot: number) {
	const a = (((p.phi + rot) % 360) + 360) % 360;
	const rad = (a * Math.PI) / 180;
	const c = Math.cos(rad);
	return { y: r2(CY + R * Math.sin(rad)), c, a };
}

export function MusicBox({ players, minutes, age }: { players: string; minutes: string; age: string }) {
	const pins = useMemo(() => layout([players, minutes, age]), [players, minutes, age]);
	const svgRef = useRef<SVGSVGElement>(null);
	const notesRef = useRef<HTMLDivElement>(null);
	const raf = useRef(0);
	const playing = useRef(false);
	const tines = useMemo(() => Array.from({ length: Math.floor((X1 - X0) / 14) + 1 }, (_, i) => r2(X0 + i * 14)), []);

	const pluck = (x: number) => {
		const svg = svgRef.current;
		const idx = Math.round((x - X0) / 14);
		const tine = svg?.querySelector<SVGRectElement>(`[data-tine="${idx}"]`);
		if (tine) {
			tine.classList.remove(s.tineHit ?? '');
			void tine.getBBox();
			tine.classList.add(s.tineHit ?? '');
		}
		playPluck(SCALE[idx % SCALE.length] ?? 660);
		const box = notesRef.current;
		if (box && box.childElementCount < 10) {
			const n = document.createElement('span');
			n.className = s.note ?? '';
			n.textContent = idx % 3 === 0 ? '♪' : idx % 3 === 1 ? '♫' : '♩';
			n.style.left = `${((x / W) * 100).toFixed(2)}%`;
			box.appendChild(n);
			n.addEventListener('animationend', () => n.remove());
		}
	};

	const draw = useCallback(
		(rot: number, prev: number) => {
			const svg = svgRef.current;
			if (!svg) return;
			const els = svg.querySelectorAll<SVGCircleElement>('[data-pin]');
			els.forEach((el, i) => {
				const p = pins[i];
				if (!p) return;
				const { y, c, a } = project(p, rot);
				const vis = c > 0.04;
				el.setAttribute('cy', String(y));
				el.setAttribute('r', vis ? String(r2(2.2 + 2.2 * c)) : '0');
				el.style.opacity = vis ? String(r2(0.35 + 0.65 * c)) : '0';
				// A pin crossing the bottom (φ = 90°) plucks the comb.
				const before = (((p.phi + prev) % 360) + 360) % 360;
				if (playing.current && before < 90 && a >= 90 && a - before < 60) pluck(p.x);
			});
		},
		[pins],
	);

	const play = useCallback(() => {
		if (playing.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		playing.current = true;
		const t0 = performance.now();
		const dur = 5200;
		let prev = 0;
		const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
		const step = (t: number) => {
			const k = Math.min(1, (t - t0) / dur);
			const rot = ease(k) * 360;
			draw(rot, prev);
			prev = rot;
			if (k < 1) raf.current = requestAnimationFrame(step);
			else {
				playing.current = false;
				draw(0, 0);
			}
		};
		raf.current = requestAnimationFrame(step);
	}, [draw]);

	useEffect(() => () => cancelAnimationFrame(raf.current), []);

	return (
		<div className={s.mbox} onPointerEnter={(e) => (e.pointerType === 'mouse' ? play() : undefined)}>
			<div className={s.mboxStage}>
				<svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className={s.drumSvg} aria-hidden focusable="false">
					<defs>
						<linearGradient id="cw-drum" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor="#6b4512" />
							<stop offset=".12" stopColor="#c8953b" />
							<stop offset=".3" stopColor="#fbe7a6" />
							<stop offset=".42" stopColor="#e7bf66" />
							<stop offset=".75" stopColor="#a8762a" />
							<stop offset="1" stopColor="#4a300c" />
						</linearGradient>
						<linearGradient id="cw-comb" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor="#f4f6f8" />
							<stop offset=".5" stopColor="#aab1ba" />
							<stop offset="1" stopColor="#5b626b" />
						</linearGradient>
						<radialGradient id="cw-pin" cx="35%" cy="30%" r="70%">
							<stop offset="0" stopColor="#ffffff" />
							<stop offset=".4" stopColor="#d6dbe0" />
							<stop offset="1" stopColor="#4f5660" />
						</radialGradient>
					</defs>
					{/* bed: the drum's cradle */}
					<rect x="30" y={CY - R - 14} width="700" height={R * 2 + 28} rx="12" fill="#1b2a52" />
					<rect x="30" y={CY - R - 14} width="700" height={R * 2 + 28} rx="12" fill="none" stroke="#0e1733" strokeWidth="3" />
					{/* end bearings */}
					{[X0 - 22, X1 + 22].map((x) => (
						<g key={x}>
							<rect x={x - 12} y={CY - 26} width="24" height="52" rx="5" fill="url(#cw-brass-lin)" stroke="#6b4512" />
							<circle cx={x} cy={CY} r="7" fill="url(#cw-screw)" stroke="#3b3f45" />
						</g>
					))}
					{/* the drum */}
					<rect x={X0 - 8} y={CY - R} width={X1 - X0 + 16} height={R * 2} rx="10" fill="url(#cw-drum)" />
					<ellipse cx={X0 - 8} cy={CY} rx="9" ry={R} fill="#8a6326" stroke="#5a3a10" />
					<ellipse cx={X1 + 8} cy={CY} rx="9" ry={R} fill="#b8862f" stroke="#5a3a10" />
					{/* turned grooves */}
					{[0.2, 0.5, 0.8].map((f) => (
						<line key={f} x1={r2(X0 + (X1 - X0) * f)} y1={CY - R + 2} x2={r2(X0 + (X1 - X0) * f)} y2={CY + R - 2} stroke="#6b4512" strokeOpacity=".35" strokeWidth="1.5" />
					))}
					{/* pins */}
					{pins.map((p, i) => {
						const { y, c } = project(p, 0);
						const vis = c > 0.04;
						return <circle key={i} data-pin cx={p.x} cy={y} r={vis ? r2(2.2 + 2.2 * c) : 0} fill="url(#cw-pin)" stroke="#3b3f45" strokeWidth=".6" style={{ opacity: vis ? r2(0.35 + 0.65 * c) : 0 }} />;
					})}
					{/* specular band over the drum (stays put while it turns) */}
					<rect x={X0 - 8} y={CY - R * 0.62} width={X1 - X0 + 16} height={R * 0.16} rx="6" fill="#fff" opacity=".22" />
					{/* the steel comb */}
					<rect x={X0 - 10} y={COMB_Y + 22} width={X1 - X0 + 20} height="34" rx="4" fill="url(#cw-comb)" stroke="#3d434b" />
					{tines.map((x, i) => (
						<rect key={x} data-tine={i} x={x - 4} y={COMB_Y - 2} width="8" height={24 + (i % 8) * 0.5} rx="2" fill="url(#cw-comb)" stroke="#3d434b" strokeWidth=".8" className={s.tine} />
					))}
					{[X0 + 30, (X0 + X1) / 2, X1 - 30].map((x) => (
						<circle key={x} cx={r2(x)} cy={COMB_Y + 39} r="6" fill="url(#cw-screw)" stroke="#3b3f45" />
					))}
				</svg>
				<div ref={notesRef} className={s.notes} aria-hidden />
			</div>
			<div className={s.mboxFacts}>
				<dl>
					<div>
						<dt>Players</dt>
						<dd>{players}</dd>
					</div>
					<div>
						<dt>Minutes of play</dt>
						<dd>{minutes}</dd>
					</div>
					<div>
						<dt>Ages</dt>
						<dd>{age}</dd>
					</div>
				</dl>
				<button type="button" className={s.playBtn} onClick={play}>
					<span aria-hidden>♫</span> Play the tune
				</button>
			</div>
		</div>
	);
}
