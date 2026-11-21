import type { CSSProperties } from 'react';
import s from './jungle.module.css';

/*
 * Hand-made SVG for the Jaguar Temple. Everything here is original artwork
 * (no photo dependency). Ids are prefixed `jt-` (SVG ids are document-global).
 * Shapes are generated from small seeded generators so the art is rich but light.
 */

function rng(seed: number) {
	let x = seed % 2147483647;
	if (x <= 0) x += 2147483646;
	return () => (x = (x * 16807) % 2147483647) / 2147483647;
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/* ------------------------------------------------------------------ Shared defs */

/** Gradients used by several pieces. Render once near the top of the world. */
export function JungleDefs() {
	return (
		<svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden focusable="false">
			<defs>
				<linearGradient id="jt-gold" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="#7a5410" />
					<stop offset=".28" stopColor="#d9a520" />
					<stop offset=".45" stopColor="#ffe9a0" />
					<stop offset=".62" stopColor="#c48d16" />
					<stop offset="1" stopColor="#6b4a0c" />
				</linearGradient>
				<linearGradient id="jt-gold-v" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#fff0b8" />
					<stop offset=".35" stopColor="#e2b232" />
					<stop offset="1" stopColor="#7a5410" />
				</linearGradient>
				<radialGradient id="jt-gold-r" cx=".38" cy=".3" r=".8">
					<stop offset="0" stopColor="#fff3c4" />
					<stop offset=".35" stopColor="#e4b030" />
					<stop offset=".8" stopColor="#8e6412" />
					<stop offset="1" stopColor="#5a3d08" />
				</radialGradient>
				<linearGradient id="jt-leaf" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="#3f7536" />
					<stop offset=".55" stopColor="#24502a" />
					<stop offset="1" stopColor="#10301a" />
				</linearGradient>
				<linearGradient id="jt-leaf-dark" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="#1d3d22" />
					<stop offset="1" stopColor="#081a0e" />
				</linearGradient>
				<linearGradient id="jt-vine" x1="0" y1="0" x2="1" y2="0">
					<stop offset="0" stopColor="#2a3d1d" />
					<stop offset=".5" stopColor="#4c5f2c" />
					<stop offset="1" stopColor="#1f2e16" />
				</linearGradient>
				<radialGradient id="jt-stone-ball" cx=".35" cy=".3" r=".75">
					<stop offset="0" stopColor="#b9b29b" />
					<stop offset=".5" stopColor="#7d7764" />
					<stop offset="1" stopColor="#2e2b23" />
				</radialGradient>
				<linearGradient id="jt-slab" x1="0" y1="0" x2="1" y2="0">
					<stop offset="0" stopColor="#5d594b" />
					<stop offset=".5" stopColor="#7c7663" />
					<stop offset="1" stopColor="#4f4b3f" />
				</linearGradient>
				<radialGradient id="jt-chamber" cx=".5" cy=".72" r=".7">
					<stop offset="0" stopColor="#8a5c12" />
					<stop offset=".35" stopColor="#3a2608" />
					<stop offset="1" stopColor="#0b0905" />
				</radialGradient>
				<linearGradient id="jt-jade" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="#a9f0cb" />
					<stop offset=".5" stopColor="#3fa27c" />
					<stop offset="1" stopColor="#14533b" />
				</linearGradient>
				<pattern id="jt-grain" width="7" height="7" patternUnits="userSpaceOnUse">
					<path d="M0 7L7 0" stroke="#000" strokeOpacity=".09" strokeWidth=".8" />
				</pattern>
			</defs>
		</svg>
	);
}

/* ------------------------------------------------------------------ Glyphs */

/** Eight invented glyphs (original, unreadable), drawn on a 40×40 box. */
export const GLYPHS = [
	'M6 6h28v28H6z M12 12h16v16h-10v-8h6',
	'M4 34V24h8v-8h8V8h8V4h8',
	'M4 20c8-11 24-11 32 0c-8 11-24 11-32 0z M20 15.5a4.5 4.5 0 1 0 .1 0',
	'M7 31h26 M12 19a2.5 2.5 0 1 0 .1 0 M20 13a2.5 2.5 0 1 0 .1 0 M28 19a2.5 2.5 0 1 0 .1 0 M10 25h20',
	'M4 27l6-11 6 11 6-11 6 11 6-11',
	'M20 12a8 8 0 1 0 .1 0 M20 2v5 M20 33v5 M2 20h5 M33 20h5 M7 7l4 4 M29 29l4 4 M33 7l-4 4 M7 33l4-4',
	'M4 35L20 6l16 29z M14 35v-9h12v9',
	'M4 14c5-5 9 5 16 0s11 5 16 0 M4 24c5-5 9 5 16 0s11 5 16 0 M4 34c5-5 9 5 16 0s11 5 16 0',
];

/** A carved glyph: shadow stroke + highlight stroke for an incised look. */
export function Carved({ i, x, y, size = 40, tone = 'stone' }: { i: number; x: number; y: number; size?: number; tone?: 'stone' | 'gold' }) {
	const d = GLYPHS[i % GLYPHS.length];
	const k = size / 40;
	return (
		<g transform={`translate(${x} ${y}) scale(${k})`} fill="none" strokeLinecap="square" strokeLinejoin="miter">
			<path d={d} stroke="#000" strokeOpacity=".55" strokeWidth="3.4" transform="translate(0 1.4)" />
			<path d={d} stroke={tone === 'gold' ? 'url(#jt-gold)' : '#bcb59d'} strokeOpacity={tone === 'gold' ? 1 : 0.55} strokeWidth="2.4" />
		</g>
	);
}

/* ------------------------------------------------------------------ Liana */

const HEART = 'M0 0C-6-4-13 2-11 10C-9 17-3 21 0 28C3 21 9 17 11 10C13 2 6-4 0 0Z';

function liana(len: number, seed: number) {
	const rand = rng(seed);
	const pts: Array<[number, number]> = [[40, -10]];
	let y = -10;
	let side = rand() > 0.5 ? 1 : -1;
	while (y < len) {
		y += 90 + rand() * 60;
		side *= -1;
		pts.push([40 + side * (6 + rand() * 14), Math.min(y, len)]);
	}
	let d = `M${pts[0]![0]} ${pts[0]![1]}`;
	for (let i = 1; i < pts.length; i++) {
		const [px, py] = pts[i - 1]!;
		const [x, yy] = pts[i]!;
		const my = (py + yy) / 2;
		d += ` C${r1(px)} ${r1(my)} ${r1(x)} ${r1(my)} ${r1(x)} ${r1(yy)}`;
	}
	const leaves: Array<{ x: number; y: number; r: number; k: number; dark: boolean }> = [];
	for (let ly = 30; ly < len - 10; ly += 26 + rand() * 30) {
		const seg = pts.findIndex((p) => p[1] >= ly);
		const a = pts[Math.max(0, seg - 1)]!;
		const b = pts[Math.max(0, seg)]!;
		const t = b[1] === a[1] ? 0 : (ly - a[1]) / (b[1] - a[1]);
		const x = a[0] + (b[0] - a[0]) * (t * t * (3 - 2 * t));
		const left = leaves.length % 2 === 0;
		leaves.push({ x: r1(x), y: r1(ly), r: Math.round((left ? 50 : -50) + (rand() - 0.5) * 40), k: r1(0.65 + rand() * 0.6), dark: rand() > 0.6 });
	}
	return { d, leaves, end: pts[pts.length - 1]! };
}

/** A hanging vine with heart leaves. Height in px; the vine hangs from the top edge. */
export function Liana({ len, seed, coil = false }: { len: number; seed: number; coil?: boolean }) {
	const { d, leaves, end } = liana(len, seed);
	return (
		<svg viewBox={`0 0 80 ${len + 30}`} width="80" height={len + 30} aria-hidden focusable="false" className={s.lianaSvg}>
			<path d={d} fill="none" stroke="#0d1a0c" strokeWidth="7" strokeLinecap="round" opacity=".5" transform="translate(2 3)" />
			<path d={d} fill="none" stroke="url(#jt-vine)" strokeWidth="5" strokeLinecap="round" />
			<path d={d} fill="none" stroke="#8aa055" strokeOpacity=".35" strokeWidth="1.2" strokeDasharray="2 9" />
			{leaves.map((l, i) => (
				<g key={i} transform={`translate(${l.x} ${l.y}) rotate(${l.r}) scale(${l.k})`}>
					<path d={HEART} fill={l.dark ? 'url(#jt-leaf-dark)' : 'url(#jt-leaf)'} />
					<path d="M0 2V25" stroke="#8fbf6a" strokeOpacity=".45" strokeWidth="1" />
				</g>
			))}
			{coil ? <path d={`M${end[0]} ${end[1]}c10 6 10 20-2 22s-14-12-4-16`} fill="none" stroke="url(#jt-vine)" strokeWidth="4" strokeLinecap="round" /> : null}
		</svg>
	);
}

/* ------------------------------------------------------------------ Monstera, fern */

/** Monstera leaf: outline with slits and fenestrations (evenodd), midrib and veins. */
export function Monstera({ className, style, dark = false }: { className?: string; style?: CSSProperties; dark?: boolean }) {
	const outline = 'M100 234C56 228 12 194 10 132C8 84 36 38 100 4C164 38 192 84 190 132C188 194 144 228 100 234Z';
	const slitsL = 'M9 92L84 112L11 104Z M14 150L86 142L22 164Z M40 202L90 170L54 212Z M24 52L86 88L32 44Z';
	const slitsR = 'M191 92L116 112L189 104Z M186 150L114 142L178 164Z M160 202L110 170L146 212Z M176 52L114 88L168 44Z';
	const holes = 'M70 128a6 10 -20 1 0 .1 0Z M130 128a6 10 20 1 0 .1 0Z M74 70a5 8 -25 1 0 .1 0Z M126 70a5 8 25 1 0 .1 0Z M78 182a5 7 0 1 0 .1 0Z M122 182a5 7 0 1 0 .1 0Z';
	return (
		<svg viewBox="0 0 200 300" className={className} style={style} aria-hidden focusable="false">
			<path d="M100 232C100 260 96 280 92 300" stroke={dark ? '#0b1f10' : '#2c5a2a'} strokeWidth="7" fill="none" strokeLinecap="round" />
			<path d={`${outline} ${slitsL} ${slitsR} ${holes}`} fillRule="evenodd" fill={dark ? 'url(#jt-leaf-dark)' : 'url(#jt-leaf)'} />
			<path d={`${outline} ${slitsL} ${slitsR} ${holes}`} fillRule="evenodd" fill="url(#jt-grain)" />
			<path d="M100 232C99 160 100 80 100 14" stroke={dark ? '#24452a' : '#7fb46a'} strokeOpacity=".7" strokeWidth="2.6" fill="none" />
			<path d="M100 196L46 182M100 160L30 132M100 122L28 84M100 86L48 40M100 196L154 182M100 160L170 132M100 122L172 84M100 86L152 40" stroke={dark ? '#24452a' : '#86bd72'} strokeOpacity=".35" strokeWidth="1.3" fill="none" />
			{dark ? null : <path d="M100 14C60 18 22 56 18 110" stroke="#c4e6a0" strokeOpacity=".22" strokeWidth="3" fill="none" />}
		</svg>
	);
}

function fern(seed: number) {
	const rand = rng(seed);
	const parts: string[] = [];
	const n = 18;
	for (let i = 1; i <= n; i++) {
		const t = i / n;
		const x = 20 + t * 220;
		const y = 240 - Math.sin(t * Math.PI * 0.85) * 170 - t * 30;
		const len = (1 - t) * 52 + 10 + rand() * 6;
		const a = -1.1 - t * 0.4;
		const b = 1.1 + t * 0.4;
		for (const ang of [a, b]) {
			const ex = x + Math.cos(ang - 0.4) * len;
			const ey = y + Math.sin(ang - 0.4) * len;
			parts.push(`M${r1(x)} ${r1(y)}Q${r1((x + ex) / 2 + 6)} ${r1((y + ey) / 2 - 6)} ${r1(ex)} ${r1(ey)}Q${r1((x + ex) / 2 - 2)} ${r1((y + ey) / 2 + 4)} ${r1(x)} ${r1(y)}Z`);
		}
	}
	return parts.join(' ');
}

const FERN_A = fern(7);
const FERN_B = fern(19);

export function Fern({ className, style, variant = 0, dark = false }: { className?: string; style?: CSSProperties; variant?: 0 | 1; dark?: boolean }) {
	return (
		<svg viewBox="0 0 280 260" className={className} style={style} aria-hidden focusable="false">
			<path d="M20 250Q120 40 250 40" stroke={dark ? '#0d2414' : '#305f2c'} strokeWidth="3" fill="none" />
			<path d={variant ? FERN_B : FERN_A} fill={dark ? 'url(#jt-leaf-dark)' : 'url(#jt-leaf)'} />
		</svg>
	);
}

/* ------------------------------------------------------------------ Canopy and temple (hero backdrop) */

export function HeroBackdrop() {
	const rand = rng(41);
	const trees = Array.from({ length: 9 }, (_, i) => {
		const x = i < 4 ? 40 + i * 92 + rand() * 40 : 1400 - (i - 4) * 84 - rand() * 40;
		const w = 16 + rand() * 30;
		const c = r1(x);
		const d = `M${r1(c - w * 1.1)} 900C${r1(c - w * 0.45)} 830 ${r1(c - w * 0.55)} 720 ${r1(c - w * 0.5)} 620L${r1(c - w * 0.36)} 0H${r1(c + w * 0.36)}L${r1(c + w * 0.5)} 620C${r1(c + w * 0.55)} 720 ${r1(c + w * 0.45)} 830 ${r1(c + w * 1.1)} 900Z`;
		return { x: c, w: r1(w), d, y: r1(180 + rand() * 260) };
	});
	return (
		<svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" className={s.backdrop} aria-hidden focusable="false">
			<defs>
				<linearGradient id="jt-sky" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#0a160d" />
					<stop offset=".45" stopColor="#1d3a22" />
					<stop offset=".7" stopColor="#3c5a2c" />
					<stop offset="1" stopColor="#14261a" />
				</linearGradient>
				<radialGradient id="jt-sun" cx=".52" cy=".38" r=".42">
					<stop offset="0" stopColor="#f6d77a" stopOpacity=".9" />
					<stop offset=".25" stopColor="#c9a23a" stopOpacity=".45" />
					<stop offset="1" stopColor="#c9a23a" stopOpacity="0" />
				</radialGradient>
				<linearGradient id="jt-temple" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#4d6644" />
					<stop offset="1" stopColor="#24382a" />
				</linearGradient>
			</defs>
			<rect width="1440" height="900" fill="url(#jt-sky)" />
			<rect width="1440" height="900" fill="url(#jt-sun)" />
			{/* far ridge */}
			<path d="M0 600C140 560 260 590 380 560S640 520 760 548 1000 590 1140 552 1360 540 1440 560V900H0Z" fill="#2c4a2c" opacity=".7" />
			{/* temple */}
			<g transform="translate(304 214) scale(1.3)">
				{[0, 1, 2, 3, 4, 5].map((t) => (
					<rect key={t} x={-150 + t * 22 + 160} y={330 - t * 46} width={300 - t * 44} height="48" fill="url(#jt-temple)" stroke="#16261a" strokeOpacity=".5" />
				))}
				<rect x="275" y="40" width="90" height="62" fill="#2f4532" />
				<path d="M268 40h104l-10-24H278Z" fill="#3b5538" />
				<rect x="306" y="62" width="28" height="40" fill="#0b130c" />
				<path d="M300 378h40l26-338h-92Z" fill="#1d2d20" opacity=".55" />
				{Array.from({ length: 14 }, (_, i) => (
					<rect key={i} x={300 - i * 0.5} y={372 - i * 24} width={40 + i} height="3" fill="#5f7a52" opacity=".5" />
				))}
				<circle cx="320" cy="80" r="3" fill="#ffe08a" className={s.templeGlint} />
				{/* overgrowth */}
				<path d="M150 380c20-40 10-80 40-110 10 30-4 70 6 110Z M490 380c-12-50 0-90-30-120-6 40 10 80 4 120Z M240 120c-20 10-30 40-24 70 20-16 22-40 24-70Z" fill="#2a4a2a" />
			</g>
			{/* mid canopy */}
			<path d="M0 640C80 600 120 640 200 610S330 600 380 640 520 620 560 660 700 700 760 680 900 640 980 670 1120 640 1200 660 1340 620 1440 650V900H0Z" fill="#1b3420" />
			{trees.map((t, i) => (
				<g key={i} opacity={0.72 + (i % 3) * 0.1}>
					<path d={t.d} fill="#0a170c" />
					<path d={`M${t.x} 0V900`} stroke="#3c5a30" strokeOpacity=".25" strokeWidth={r1(t.w * 0.12)} transform={`translate(${r1(-t.w * 0.18)} 0)`} />
					<path d={`M${t.x} ${t.y}c${i < 4 ? 50 : -50}-24 ${i < 4 ? 110 : -110}-14 ${i < 4 ? 150 : -150} 26`} stroke="#0a170c" strokeWidth="7" fill="none" strokeLinecap="round" />
				</g>
			))}
			<path d="M0 0H1440V90C1340 150 1240 70 1120 120S900 60 780 110 560 50 440 104 200 60 0 120Z" fill="#081309" />
		</svg>
	);
}

/* ------------------------------------------------------------------ The door scene */

function wallBlocks() {
	const rand = rng(1936);
	const tones = ['#6c6858', '#76715e', '#686454', '#7e7864', '#615d4f', '#736e5b'];
	const out: Array<{ x: number; y: number; w: number; h: number; f: string }> = [];
	for (let y = 0; y < 820; y += 54) {
		let x = -340 - ((y / 54) % 2) * 40;
		while (x < 1540) {
			const w = 70 + Math.round(rand() * 70);
			out.push({ x, y, w, h: 54, f: tones[Math.floor(rand() * tones.length)]! });
			x += w;
		}
	}
	return out;
}

const BLOCKS = wallBlocks();

/** The jaguar mask carved on the lintel: original, geometric. */
function JaguarMask() {
	return (
		<g transform="translate(600 150)">
			<path d="M-150-58h300v116h-300z" fill="#5b5747" />
			<path d="M-150-58h300v116h-300z" fill="url(#jt-grain)" />
			<path d="M-138-46h276v92h-276z" fill="none" stroke="#2c2a22" strokeWidth="3" />
			{/* ears */}
			<path d="M-118-46l18-30 22 30Z M118-46l-18-30-22 30Z" fill="#6b6655" stroke="#2c2a22" strokeWidth="2" />
			{/* brow */}
			<path d="M-96-26h70l14 12h24l14-12h70" fill="none" stroke="#2a281f" strokeWidth="5" />
			{/* eyes */}
			<path d="M-84-6h52v20h-52z M32-6h52v20H32z" fill="#1b1a14" />
			<path d="M-70-2h24v12h-24z M46-2h24v12H46z" fill="url(#jt-jade)" className={s.maskEye} />
			{/* nose and fangs */}
			<path d="M-16 6h32l-8 18h-16z" fill="#2a281f" />
			<path d="M-62 28h124v18h-124z" fill="#2a281f" />
			<path d="M-50 28l10 16 10-16 M30 28l10 16 10-16" fill="#d8d1b8" />
			{/* rosettes */}
			{[-120, -104, 104, 120].map((x) => (
				<circle key={x} cx={x} cy="20" r="6" fill="none" stroke="#2a281f" strokeWidth="2.4" />
			))}
			<path d="M-150 58h300" stroke="#bfb79c" strokeOpacity=".35" strokeWidth="2" />
		</g>
	);
}

/** The golden jaguar idol, seated on a stepped plinth. Centre x=600. */
export function Idol() {
	const spots: Array<[number, number, number]> = [
		[548, 610, 7], [566, 640, 6], [540, 650, 5], [652, 610, 7], [634, 640, 6], [660, 650, 5], [600, 600, 5], [586, 630, 4], [614, 630, 4], [576, 450, 3.5], [624, 450, 3.5],
	];
	return (
		<g>
			<ellipse cx="600" cy="770" rx="210" ry="22" fill="#000" opacity=".5" />
			{/* plinth */}
			<path d="M440 756h320v14H440z" fill="#4a463a" />
			<path d="M466 702h268v56H466z" fill="url(#jt-slab)" />
			<path d="M492 682h216v22H492z" fill="#6c6756" />
			{[0, 1, 2, 3, 4, 5].map((i) => (
				<Carved key={i} i={i + 1} x={478 + i * 42} y={712} size={34} tone={i % 2 ? 'stone' : 'gold'} />
			))}
			{/* tail */}
			<path d="M676 676C716 668 732 626 716 596C706 578 686 584 692 600" fill="none" stroke="url(#jt-gold)" strokeWidth="13" strokeLinecap="round" />
			{/* haunches */}
			<path d="M518 682C504 616 522 556 562 528H638C678 556 696 616 682 682Z" fill="url(#jt-gold-r)" />
			{/* chest */}
			<ellipse cx="600" cy="566" rx="50" ry="64" fill="url(#jt-gold-v)" />
			{/* legs + paws */}
			<path d="M566 562L556 682H590L592 572Z M634 562L644 682H610L608 572Z" fill="url(#jt-gold)" />
			<ellipse cx="572" cy="683" rx="22" ry="9" fill="#e6b53a" />
			<ellipse cx="628" cy="683" rx="22" ry="9" fill="#e6b53a" />
			<path d="M560 682v-6M570 683v-7M580 682v-6M620 682v-6M630 683v-7M640 682v-6" stroke="#6b4a0c" strokeWidth="1.6" />
			{spots.map(([x, y, rr], i) => (
				<g key={i}>
					<circle cx={x} cy={y} r={rr} fill="none" stroke="#7a5410" strokeWidth="2" />
					<circle cx={x} cy={y} r={rr * 0.35} fill="#7a5410" />
				</g>
			))}
			{/* collar */}
			<path d="M552 522C580 540 620 540 648 522L652 534C622 554 578 554 548 534Z" fill="#8a6512" />
			{[560, 580, 600, 620, 640].map((x) => (
				<circle key={x} cx={x} cy={x === 600 ? 546 : 540} r={x === 600 ? 9 : 6} fill="url(#jt-jade)" stroke="#0c3a28" strokeWidth="1.5" />
			))}
			{/* head */}
			<circle cx="562" cy="418" r="15" fill="url(#jt-gold)" />
			<circle cx="638" cy="418" r="15" fill="url(#jt-gold)" />
			<circle cx="562" cy="420" r="7" fill="#6b4a0c" />
			<circle cx="638" cy="420" r="7" fill="#6b4a0c" />
			<path d="M553 470C550 430 574 404 600 404S650 430 647 470C644 506 624 522 600 522S556 506 553 470Z" fill="url(#jt-gold-r)" />
			<path d="M578 432c10-6 34-6 44 0" stroke="#7a5410" strokeWidth="2.4" fill="none" />
			<path d="M568 456l16-6 12 8-14 6Z M632 456l-16-6-12 8 14 6Z" fill="#1a1206" />
			<path d="M571 457l12-4 9 5-10 4Z M629 457l-12-4-9 5 10 4Z" fill="url(#jt-jade)" className={s.idolEye} />
			<ellipse cx="600" cy="494" rx="21" ry="15" fill="#f1c95a" />
			<path d="M591 480h18l-9 10Z" fill="#5a3d08" />
			<path d="M600 490v10M600 500c-6 6-12 6-16 2M600 500c6 6 12 6 16 2" stroke="#5a3d08" strokeWidth="2" fill="none" />
			<path d="M580 494l-26-4M580 499l-24 4M620 494l26-4M620 499l24 4" stroke="#fff3c4" strokeOpacity=".6" strokeWidth="1" />
			{/* rim light */}
			<path d="M556 466C556 432 578 408 600 406" stroke="#fff6d2" strokeOpacity=".75" strokeWidth="3" fill="none" />
			<path d="M524 676C512 618 528 566 562 534" stroke="#fff6d2" strokeOpacity=".4" strokeWidth="3" fill="none" />
		</g>
	);
}

/** Four-point glint star. */
function Glint({ x, y, k = 1, delay = 0 }: { x: number; y: number; k?: number; delay?: number }) {
	return (
		<g transform={`translate(${x} ${y}) scale(${k})`}>
			<path d="M0-16L3-3 16 0 3 3 0 16-3 3-16 0-3-3Z" fill="#fffbe6" className={s.glint} style={{ animationDelay: `${delay}s` }} />
		</g>
	);
}

/**
 * The doorway, as one SVG so the slabs slide behind the wall into their pockets.
 * The CSS var --p (0 closed → 1 open) drives the slabs, the light and the dust.
 */
export function DoorScene() {
	const hole = 'M420 232H780V760H420Z';
	return (
		<svg viewBox="-300 0 1800 800" preserveAspectRatio="xMidYMid slice" className={s.doorSvg} aria-hidden focusable="false">
			<defs>
				<clipPath id="jt-door-hole">
					<path d={hole} />
				</clipPath>
				<clipPath id="jt-idol-clip">
					<path d="M518 682C504 616 522 556 562 528H638C678 556 696 616 682 682Z M553 470C550 430 574 404 600 404S650 430 647 470C644 506 624 522 600 522S556 506 553 470Z M547 418a15 15 0 1 0 30 0a15 15 0 1 0-30 0Z M623 418a15 15 0 1 0 30 0a15 15 0 1 0-30 0Z" />
				</clipPath>
				<radialGradient id="jt-spill" cx=".5" cy="0" r="1">
					<stop offset="0" stopColor="#ffd56a" stopOpacity=".55" />
					<stop offset="1" stopColor="#ffd56a" stopOpacity="0" />
				</radialGradient>
			</defs>
			{/* chamber behind the door */}
			<g clipPath="url(#jt-door-hole)">
				<rect x="420" y="232" width="360" height="528" fill="url(#jt-chamber)" />
				<g className={s.chamberLight}>
					<path d="M540 232H660L770 760H430Z" fill="#ffcc55" opacity=".13" />
					<path d="M575 232H625L680 760H520Z" fill="#fff0b0" opacity=".12" />
					<ellipse cx="600" cy="560" rx="150" ry="190" fill="#ffd36a" opacity=".12" />
				</g>
				<Idol />
				<g clipPath="url(#jt-idol-clip)">
					<rect x="440" y="380" width="70" height="420" fill="#fffbe6" opacity=".55" className={s.idolSheen} />
				</g>
				<Glint x={584} y={456} k={0.9} />
				<Glint x={640} y={420} k={0.6} delay={1.3} />
				<Glint x={600} y={546} k={0.7} delay={2.1} />
			</g>
			{/* slabs (slide into the wall) */}
			<g clipPath="url(#jt-door-hole)">
				<g className={s.slabL}>
					<rect x="420" y="232" width="181" height="528" fill="url(#jt-slab)" />
					<rect x="420" y="232" width="181" height="528" fill="url(#jt-grain)" />
					<path d="M440 260h141v472H440z" fill="none" stroke="#2c2a22" strokeWidth="3" />
					{[0, 1, 2, 3, 4].map((i) => (
						<Carved key={i} i={i * 2} x={480} y={290 + i * 88} size={62} />
					))}
					<path d="M598 232v528" stroke="#25231c" strokeWidth="5" />
				</g>
				<g className={s.slabR}>
					<rect x="599" y="232" width="181" height="528" fill="url(#jt-slab)" />
					<rect x="599" y="232" width="181" height="528" fill="url(#jt-grain)" />
					<path d="M619 260h141v472H619z" fill="none" stroke="#2c2a22" strokeWidth="3" />
					{[0, 1, 2, 3, 4].map((i) => (
						<Carved key={i} i={i * 2 + 1} x={659} y={290 + i * 88} size={62} />
					))}
					<path d="M602 232v528" stroke="#8b8570" strokeOpacity=".5" strokeWidth="2" />
				</g>
			</g>
			{/* the wall, with the doorway cut out */}
			<g>
				<path d={`M-300 0H1500V800H-300Z ${hole}`} fillRule="evenodd" fill="#6a6656" />
				<g clipPath="url(#jt-wall-clip)">
					<clipPath id="jt-wall-clip">
						<path d={`M-300 0H1500V800H-300Z ${hole}`} clipRule="evenodd" fillRule="evenodd" />
					</clipPath>
					{BLOCKS.map((b, i) => (
						<rect key={i} x={b.x} y={b.y} width={b.w - 3} height={b.h - 3} fill={b.f} />
					))}
					<rect x="-300" width="1800" height="800" fill="url(#jt-grain)" />
				</g>
				{/* columns with glyph blocks */}
				{[300, 800].map((x) => (
					<g key={x}>
						<rect x={x} y="232" width="100" height="528" fill="#5e5a4b" stroke="#2c2a22" strokeWidth="3" />
						{[0, 1, 2, 3, 4, 5].map((i) => (
							<Carved key={i} i={(i + x / 100) % 8} x={x + 24} y={250 + i * 84} size={52} tone={i === 2 ? 'gold' : 'stone'} />
						))}
					</g>
				))}
				<JaguarMask />
				{/* frieze of stepped frets */}
				<g>
					{Array.from({ length: 23 }, (_, i) => (
						<path key={i} d={`M${i * 80 - 320} 60h40v-20h20v20h20v20H${i * 80 - 320}Z`} fill="#4f4c3f" opacity=".85" />
					))}
					<path d="M-300 82H1500M-300 36H1500" stroke="#2a281f" strokeWidth="4" />
				</g>
				{/* threshold */}
				<path d="M380 760h440v40H380z" fill="#4d493c" />
				<path d="M380 760h440" stroke="#a49d83" strokeOpacity=".5" strokeWidth="2" />
				{/* moss and roots */}
				{[-1200, 0, 1200].map((dx) => (
					<path key={dx} transform={`translate(${dx} 0)`} d="M0 0H1200V24C1120 40 1080 18 1010 34S880 22 820 40 700 16 640 30 520 14 450 34 320 18 260 36 120 20 0 40Z" fill="#2d4a28" />
				))}
				{[0, 1100].map((x) => (
					<g key={x}>
						<rect x={x} y="232" width="100" height="528" fill="#5e5a4b" stroke="#2c2a22" strokeWidth="3" />
						{[0, 1, 2, 3, 4, 5].map((i) => (
							<Carved key={i} i={(i + 3 + x / 100) % 8} x={x + 24} y={250 + i * 84} size={52} />
						))}
					</g>
				))}
				<path d="M286 0c6 60-10 120 4 190 4 20 0 40-8 60M902 0c-4 50 14 110 0 170-6 24-2 44 6 66M640 0c4 30-6 60 2 90" stroke="#3c2e1c" strokeWidth="5" fill="none" strokeLinecap="round" />
				<path d="M296 120c18 0 30 10 36 24M906 110c-18 2-28 12-32 26" stroke="#3c2e1c" strokeWidth="3" fill="none" />
				<path d="M300 760c-20-30-60-40-90-30 30 6 50 20 60 40Z M900 760c20-30 60-40 90-30-30 6-50 20-60 40Z" fill="#2d4a28" />
			</g>
			{/* light spilling out on the floor */}
			<path d="M420 760L60 800H1140L780 760Z" fill="url(#jt-spill)" className={s.floorSpill} />
		</svg>
	);
}

/* ------------------------------------------------------------------ The boulder */

export function Boulder({ className }: { className?: string }) {
	return (
		<svg viewBox="-110 -110 220 220" className={className} aria-hidden focusable="false">
			<ellipse cx="0" cy="104" rx="90" ry="10" fill="#000" opacity=".45" />
			<g className={s.boulderSpin}>
				<circle r="100" fill="#6f6a58" />
				<circle r="100" fill="url(#jt-grain)" />
				<path d="M-100 0C-60 24 60 24 100 0M-100 0C-60-24 60-24 100 0" stroke="#2f2c24" strokeWidth="5" fill="none" />
				<path d="M0-100C24-60 24 60 0 100M0-100C-24-60-24 60 0 100" stroke="#2f2c24" strokeWidth="3" fill="none" opacity=".7" />
				<Carved i={5} x={-60} y={-70} size={44} />
				<Carved i={2} x={18} y={22} size={46} />
				<Carved i={6} x={-58} y={24} size={40} />
				<Carved i={1} x={22} y={-66} size={40} />
				<path d="M40 60l18 6 6 16M-70 -10l-16 10" stroke="#25221b" strokeWidth="2" fill="none" />
			</g>
			<circle r="100" fill="url(#jt-stone-ball)" opacity=".75" style={{ mixBlendMode: 'multiply' }} />
			<path d="M-70-60A100 100 0 0 1 30-96" stroke="#e8e1c6" strokeOpacity=".35" strokeWidth="5" fill="none" strokeLinecap="round" />
		</svg>
	);
}

/* ------------------------------------------------------------------ Tablet glyph icons */

export function TabletIcon({ kind }: { kind: 'read' | 'balance' | 'map' | 'run' }) {
	const paths: Record<typeof kind, string> = {
		read: 'M10 14h44v36H10z M18 22h12v12H18z M36 22h10 M36 28h10 M18 40h28',
		balance: 'M32 10v40 M12 18h40 M12 18l-6 14h12z M52 18l-6 14h12z M22 52h20',
		map: 'M8 14l14-6 20 6 14-6v42l-14 6-20-6-14 6z M22 8v42 M42 14v42 M28 26l6 6 8-10',
		run: 'M32 32m-20 0a20 20 0 1 0 40 0a20 20 0 1 0-40 0 M14 26c10 6 26 6 36 0 M24 14c6 10 6 26 0 36',
	};
	return (
		<svg viewBox="0 0 64 64" className={s.tabletIcon} aria-hidden focusable="false">
			<path d={paths[kind]} fill="none" stroke="#000" strokeOpacity=".45" strokeWidth="4.5" transform="translate(0 1.5)" />
			<path d={paths[kind]} fill="none" stroke="url(#jt-gold)" strokeWidth="3" strokeLinejoin="round" />
		</svg>
	);
}

/* ------------------------------------------------------------------ Interior illustration (photo fallback) */

export function InteriorArt({ variant = 0 }: { variant?: 0 | 1 | 2 }) {
	const rand = rng(77 + variant * 13);
	const roots = Array.from({ length: 7 }, (_, i) => {
		const x = 60 + i * 110 + rand() * 40;
		const len = 80 + rand() * 160;
		return `M${r1(x)} 0c${r1(-10 + rand() * 20)} ${r1(len / 3)} ${r1(-16 + rand() * 32)} ${r1(len / 2)} ${r1(-6 + rand() * 12)} ${r1(len)}`;
	});
	return (
		<svg viewBox="0 0 900 600" preserveAspectRatio="xMidYMid slice" className={s.interiorSvg} aria-hidden focusable="false">
			<rect width="900" height="600" fill="#1d1a12" />
			{BLOCKS.slice(0, 160).map((b, i) => (
				<rect key={i} x={b.x * 0.78} y={b.y * 0.74} width={(b.w - 3) * 0.78} height={(b.h - 3) * 0.74} fill={b.f} opacity=".55" />
			))}
			<path d="M330 600V300C330 210 390 160 450 160S570 210 570 300V600Z" fill="#0d0b07" />
			<path d="M350 600V306C350 228 400 184 450 184S550 228 550 306V600" fill="none" stroke="#a89e7e" strokeOpacity=".35" strokeWidth="6" />
			<rect x="380" y="430" width="140" height="70" fill="#4b4637" />
			<g transform={`translate(${variant === 1 ? -150 : 0} ${variant === 2 ? -60 : 0}) scale(${variant === 2 ? 1.1 : 1})`}>
				<g transform="translate(450 470) scale(.32) translate(-600 -700)">
					<Idol />
				</g>
			</g>
			{roots.map((d, i) => (
				<path key={i} d={d} stroke="#3a2c1a" strokeWidth={3 + (i % 3)} fill="none" strokeLinecap="round" />
			))}
			{[160, 740].map((x, i) => (
				<g key={x} className={s.lantern} style={{ animationDelay: `${i * 0.7}s` }}>
					<circle cx={x} cy="260" r="120" fill="#ffb84d" opacity=".16" />
					<circle cx={x} cy="260" r="46" fill="#ffd27a" opacity=".3" />
					<path d={`M${x - 14} 244h28v34h-28z`} fill="#ffe2a0" />
					<path d={`M${x - 18} 240h36M${x - 18} 282h36M${x} 240v-30`} stroke="#3a2c1a" strokeWidth="4" />
				</g>
			))}
			<rect width="900" height="600" fill="url(#jt-grain)" />
			<path d="M0 520C120 500 260 540 450 524S760 500 900 530V600H0Z" fill="#1b2a16" />
		</svg>
	);
}

/* ------------------------------------------------------------------ Fireflies */

const FLIES = (() => {
	const rand = rng(9);
	return Array.from({ length: 26 }, () => ({
		x: r1(rand() * 100),
		y: r1(18 + rand() * 76),
		d: r1(5 + rand() * 7),
		b: r1(1.8 + rand() * 2.6),
		o: r1(rand() * 6),
		k: r1(0.6 + rand() * 0.9),
	}));
})();

export function Fireflies({ count = 26 }: { count?: number }) {
	return (
		<div className={s.flies} aria-hidden>
			{FLIES.slice(0, count).map((f, i) => (
				<span
					key={i}
					className={s.fly}
					style={{ left: `${f.x}%`, top: `${f.y}%`, '--d': `${f.d}s`, '--b': `${f.b}s`, '--o': `-${f.o}s`, '--k': f.k } as CSSProperties}
				/>
			))}
		</div>
	);
}
