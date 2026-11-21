/**
 * Hôtel Lumière: the hand-inked SVG library. Everything here is drawn for this
 * world (no stock shapes): Ben-Day dot screens, the CMYK mis-registration filter,
 * the cover illustration, the Étoile Bleue, palms, the getaway coupé, the
 * crew's portraits. Ink is #141414; every coordinate is a literal or rounded.
 */

export const INK = '#141414';
export const PAPER = '#FFFBEF';
export const RED = '#E63022';
export const CYAN = '#22B8D6';
export const YELLOW = '#F7D230';
export const BLUE = '#1C5FA8';
export const PINK = '#FF5FA2';
export const ORANGE = '#F28A2E';

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Shared dot screens + filters, rendered once at the world root (0×0, not display:none). */
export function LumiereDefs() {
	const dots: Array<[string, string, number, number]> = [
		// id, colour, pitch, radius
		['red-xs', RED, 9, 1.3],
		['red-s', RED, 9, 2.1],
		['red-m', RED, 9, 3],
		['red-l', RED, 9, 3.9],
		['cyan', CYAN, 8, 2.2],
		['cyan-l', CYAN, 8, 3],
		['blue', BLUE, 8, 2.2],
		['yellow', YELLOW, 8, 2.4],
		['pink', PINK, 8, 2.2],
		['ink-s', INK, 7, 1.2],
		['ink-m', INK, 7, 1.9],
		['paper', PAPER, 8, 1.6],
	];
	return (
		<svg width="0" height="0" aria-hidden focusable="false" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
			<defs>
				{dots.map(([id, c, p, r]) => (
					<pattern key={id} id={`lm-dots-${id}`} width={p} height={p} patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
						<circle cx={r2(p / 4)} cy={r2(p / 4)} r={r} fill={c} />
						<circle cx={r2((p * 3) / 4)} cy={r2((p * 3) / 4)} r={r} fill={c} />
					</pattern>
				))}
				<pattern id="lm-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
					<rect width="7" height="2.2" fill={INK} />
				</pattern>
				<pattern id="lm-windows" width="44" height="38" patternUnits="userSpaceOnUse" x="6" y="4">
					<rect x="12" y="6" width="16" height="20" fill={BLUE} stroke={INK} strokeWidth="2" />
					<line x1="20" y1="6" x2="20" y2="26" stroke={INK} strokeWidth="1.5" />
					<rect x="8" y="27" width="24" height="5" fill={PAPER} stroke={INK} strokeWidth="2" />
				</pattern>
				<linearGradient id="lm-gem" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="#FFFFFF" />
					<stop offset=".4" stopColor="#A9D8FF" />
					<stop offset="1" stopColor="#2F7FE0" />
				</linearGradient>
				<radialGradient id="lm-spot" cx=".5" cy=".5" r=".5">
					<stop offset="0" stopColor="#FFF6C9" stopOpacity=".95" />
					<stop offset="1" stopColor="#FFF6C9" stopOpacity="0" />
				</radialGradient>
				{/* Cyan and magenta plates printed a hair off the black: the 1963 press. */}
				<filter id="lm-misreg" x="-6%" y="-6%" width="112%" height="112%">
					<feOffset in="SourceAlpha" dx="4" dy="1.5" result="a" />
					<feFlood floodColor={CYAN} floodOpacity=".75" />
					<feComposite in2="a" operator="in" result="c" />
					<feOffset in="SourceAlpha" dx="-3" dy="2.5" result="b" />
					<feFlood floodColor={PINK} floodOpacity=".6" />
					<feComposite in2="b" operator="in" result="m" />
					<feMerge>
						<feMergeNode in="c" />
						<feMergeNode in="m" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
				<filter id="lm-glow" x="-20%" y="-50%" width="140%" height="200%">
					<feGaussianBlur stdDeviation="5" />
				</filter>
			</defs>
		</svg>
	);
}

/* ------------------------------------------------------------------ small parts */

/** A four-point sparkle centred on 0,0. */
export function Sparkle({ x, y, s = 1, className }: { x: number; y: number; s?: number; className?: string }) {
	return (
		<g transform={`translate(${x} ${y}) scale(${s})`}>
			<path className={className} d="M0 -22 C2 -6 6 -2 22 0 C6 2 2 6 0 22 C-2 6 -6 2 -22 0 C-6 -2 -2 -6 0 -22 Z" fill="#FFFFFF" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
		</g>
	);
}

/** The Étoile Bleue, the Comtesse's star-cut jewel, centred on 0,0 (≈ 64 × 56). */
export function Diamond({ x = 0, y = 0, s = 1 }: { x?: number; y?: number; s?: number }) {
	return (
		<g transform={`translate(${x} ${y}) scale(${s})`}>
			<path d="M-32 -8 L-18 -26 L18 -26 L32 -8 L0 30 Z" fill="url(#lm-gem)" stroke={INK} strokeWidth="3.2" strokeLinejoin="round" />
			<path d="M-32 -8 L32 -8 M-18 -26 L-10 -8 L0 -26 L10 -8 L18 -26 M-10 -8 L0 30 L10 -8 M-32 -8 L-6 12 M32 -8 L6 12" fill="none" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
			<path d="M-14 -22 L-8 -12 L-20 -12 Z" fill="#FFFFFF" />
			<path d="M4 -4 L14 -4 L6 10 Z" fill="#FFFFFF" opacity=".85" />
		</g>
	);
}

/** A black-ink palm (trunk + seven fronds), crown at 0,0, trunk going down-left. */
export function Palm({ x, y, s = 1, flip = false }: { x: number; y: number; s?: number; flip?: boolean }) {
	const fronds = [
		'M0 0 C-40 -40 -110 -40 -160 -6 C-120 -26 -70 -20 -40 -2 C-80 -10 -120 0 -150 30 C-100 4 -50 4 0 0 Z',
		'M0 0 C-20 -60 -70 -100 -120 -110 C-80 -84 -60 -60 -50 -40 C-70 -70 -110 -80 -130 -78 C-80 -60 -30 -30 0 0 Z',
		'M0 0 C10 -60 0 -110 -30 -150 C-14 -110 -16 -80 -18 -60 C-30 -90 -40 -110 -60 -124 C-30 -80 -10 -40 0 0 Z',
		'M0 0 C40 -50 90 -80 150 -80 C110 -66 90 -50 76 -36 C100 -50 130 -50 160 -40 C110 -30 50 -16 0 0 Z',
		'M0 0 C50 -10 110 0 160 40 C120 22 90 18 70 18 C100 30 120 50 130 76 C90 40 40 14 0 0 Z',
		'M0 0 C-30 20 -60 60 -70 110 C-54 76 -40 60 -26 48 C-40 70 -44 96 -40 120 C-26 70 -12 30 0 0 Z',
		'M0 0 C30 20 54 56 60 100 C46 72 36 60 26 50 C36 70 38 90 34 112 C24 64 12 30 0 0 Z',
	];
	return (
		<g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} filter="url(#lm-misreg)">
			<path d="M-6 4 C-14 120 -40 260 -96 430 L-60 430 C-12 270 10 130 8 4 Z" fill={INK} />
			{[40, 90, 140, 190, 240, 290, 340].map((t, i) => (
				<path key={t} d={`M${r2(-4 - i * 7.6)} ${t} q 10 -8 22 -2`} stroke={PAPER} strokeWidth="2" fill="none" opacity=".55" />
			))}
			{fronds.map((d, i) => (
				<path key={i} d={d} fill={INK} />
			))}
			<circle cx="-6" cy="6" r="9" fill={INK} />
			<circle cx="8" cy="10" r="8" fill={INK} />
		</g>
	);
}

/** A gloved hand pinching something at its fingertips; wrist off to the right. Local box ≈ 0..200 × 0..110. */
export function GlovedHand({ x, y, s = 1, rot = 0 }: { x: number; y: number; s?: number; rot?: number }) {
	return (
		<g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
			<path d="M200 0 C150 0 110 8 86 18 L36 12 C20 10 12 18 18 26 C24 32 40 32 60 34 C70 42 66 52 50 56 L26 58 C14 60 12 72 24 74 C50 78 90 82 120 88 C150 94 180 100 200 102 Z" fill={BLUE} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
			<path d="M92 20 C110 26 128 30 150 30 M62 36 C80 42 100 44 124 44 M30 64 C60 66 90 68 120 72" fill="none" stroke={CYAN} strokeWidth="3" strokeLinecap="round" opacity=".8" />
			<path d="M36 14 C26 14 22 20 26 24" fill="none" stroke={YELLOW} strokeWidth="3" strokeLinecap="round" />
			<path d="M176 -2 L200 -4 L200 106 L172 104 Z" fill="#FFFFFF" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
		</g>
	);
}

/** The getaway coupé: an original low two-door, side view, nose to the left (0..400 × 0..150). */
export function Coupe({ className, color = RED }: { className?: string; color?: string }) {
	return (
		<svg viewBox="0 0 400 160" className={className} aria-hidden focusable="false">
			{[30, 52, 74, 96].map((y, i) => (
				<line key={y} x1={r2(330 + i * 6)} y1={y + 20} x2={r2(392)} y2={y + 20} stroke={INK} strokeWidth="3" strokeLinecap="round" opacity={r2(0.9 - i * 0.15)} />
			))}
			<ellipse cx="190" cy="140" rx="170" ry="9" fill={INK} opacity=".18" />
			<g filter="url(#lm-misreg)">
				<path d="M18 104 C16 88 26 80 46 76 L110 68 C130 44 160 30 200 28 C236 26 262 36 282 60 L330 70 C354 74 366 86 366 104 L364 120 L22 120 Z" fill={color} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
				<path d="M124 68 C140 48 162 38 196 37 L198 68 Z" fill={CYAN} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
				<path d="M210 37 C238 37 256 46 270 66 L210 68 Z" fill={CYAN} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
				<path d="M134 62 L150 46 M220 60 L232 46" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
				<path d="M24 98 L362 98" stroke={PAPER} strokeWidth="4" />
				<path d="M24 98 L362 98" stroke={INK} strokeWidth="1.5" />
				<path d="M14 112 L52 112 M330 112 L370 112" stroke="#D9DEE6" strokeWidth="7" strokeLinecap="round" />
				<path d="M14 112 L52 112 M330 112 L370 112" stroke={INK} strokeWidth="1.5" strokeLinecap="round" />
				<circle cx="30" cy="88" r="7" fill={YELLOW} stroke={INK} strokeWidth="3" />
				<path d="M196 72 L196 116" stroke={INK} strokeWidth="2.5" />
				<path d="M178 82 L188 82" stroke={INK} strokeWidth="3" strokeLinecap="round" />
			</g>
			{[96, 296].map((cx) => (
				<g key={cx}>
					<circle cx={cx} cy="120" r="24" fill={INK} />
					<circle cx={cx} cy="120" r="14" fill="#FFFFFF" stroke={INK} strokeWidth="2" />
					<circle cx={cx} cy="120" r="6" fill="#C9CED6" stroke={INK} strokeWidth="2" />
				</g>
			))}
		</svg>
	);
}

/** A starburst path (n points) around 0,0. Rounded coordinates, hydration-safe. */
export function burstPath(n: number, outer: number, inner: number, wobble = 0): string {
	const pts: string[] = [];
	for (let i = 0; i < n * 2; i++) {
		const a = (Math.PI * i) / n - Math.PI / 2;
		const w = wobble ? 1 + wobble * Math.sin(i * 2.3) : 1;
		const r = (i % 2 === 0 ? outer : inner) * w;
		pts.push(`${r2(Math.cos(a) * r)} ${r2(Math.sin(a) * r)}`);
	}
	return `M${pts.join(' L')} Z`;
}

/** Radiating speed lines from a centre (cx, cy) to beyond the box edge. */
export function SpeedLines({ cx, cy, n = 36, r0 = 120, r1 = 900, color = INK, width = 3, opacity = 0.9 }: { cx: number; cy: number; n?: number; r0?: number; r1?: number; color?: string; width?: number; opacity?: number }) {
	const lines: string[] = [];
	for (let i = 0; i < n; i++) {
		const a = (Math.PI * 2 * i) / n + (i % 3) * 0.03;
		const s0 = r0 + (i % 4) * 22;
		lines.push(`M${r2(cx + Math.cos(a) * s0)} ${r2(cy + Math.sin(a) * s0)} L${r2(cx + Math.cos(a) * r1)} ${r2(cy + Math.sin(a) * r1)}`);
	}
	return <path d={lines.join(' ')} stroke={color} strokeWidth={width} strokeLinecap="round" opacity={opacity} fill="none" />;
}

/* ------------------------------------------------------------------ the cover */

/**
 * The cover of issue No. 9: a Riviera sunset in Ben-Day bands, the striped sun,
 * crossing searchlights, the Hôtel Lumière on the bay, a palm in black ink, the
 * balcony rail and a gloved hand lifting the jewel into the last of the light.
 */
export function CoverArt({ className }: { className?: string }) {
	const balusters = Array.from({ length: 14 }, (_, i) => 660 + i * 40);
	const lit = [
		[392, 352], [568, 390], [744, 314], [876, 428], [964, 352], [480, 466], [1008, 466], [656, 466], [920, 314],
	];
	return (
		<svg viewBox="0 0 1200 760" preserveAspectRatio="xMidYMax slice" className={className} role="img" aria-label="Cover illustration: the Hôtel Lumière on the bay at sunset, searchlights crossing the sky, a palm in silhouette and a gloved hand lifting the jewel over the balcony rail">
			{/* sky: yellow ground, red dot screens getting finer towards the horizon */}
			<rect width="1200" height="760" fill={YELLOW} />
			<rect width="1200" height="130" fill="url(#lm-dots-red-l)" />
			<rect y="128" width="1200" height="100" fill="url(#lm-dots-red-m)" />
			<rect y="226" width="1200" height="96" fill="url(#lm-dots-red-s)" />
			<rect y="320" width="1200" height="90" fill="url(#lm-dots-red-xs)" />
			{/* the sun with its 1963 stripes */}
			<mask id="lm-sunstripes">
				<rect width="1200" height="760" fill="#fff" />
				{[392, 414, 434, 452, 468].map((y, i) => (
					<rect key={y} x="0" y={y} width="1200" height={r2(5 + i * 2.2)} fill="#000" />
				))}
			</mask>
			<circle cx="760" cy="400" r="176" fill="#FFF3C4" stroke={INK} strokeWidth="4" mask="url(#lm-sunstripes)" />
			{/* searchlights */}
			<g className="lm-beams" opacity=".62">
				<path className="lm-beam-a" d="M560 430 L890 -10 L990 -10 Z" fill="#FFFDF0" />
				<path className="lm-beam-b" d="M990 430 L360 -10 L450 -10 Z" fill="#FFFDF0" />
			</g>
			{/* hills */}
			<path d="M0 470 C120 420 220 410 330 440 C420 400 520 396 600 430 C700 380 860 380 960 420 C1060 400 1140 404 1200 420 L1200 560 L0 560 Z" fill={BLUE} stroke={INK} strokeWidth="4" />
			<path d="M0 470 C120 420 220 410 330 440 C420 400 520 396 600 430 C700 380 860 380 960 420 C1060 400 1140 404 1200 420 L1200 560 L0 560 Z" fill="url(#lm-dots-cyan)" opacity=".9" />
			{/* the hotel */}
			<g>
				<rect x="300" y="300" width="800" height="262" fill={PAPER} stroke={INK} strokeWidth="4" />
				<rect x="300" y="300" width="800" height="262" fill="url(#lm-windows)" />
				<rect x="620" y="246" width="160" height="56" fill={PAPER} stroke={INK} strokeWidth="4" />
				<path d="M640 246 C640 196 760 196 760 246 Z" fill={CYAN} stroke={INK} strokeWidth="4" />
				<path d="M640 246 C640 196 760 196 760 246 Z" fill="url(#lm-dots-blue)" opacity=".6" />
				<line x1="700" y1="200" x2="700" y2="160" stroke={INK} strokeWidth="4" />
				<path d="M700 160 L738 170 L700 182 Z" fill={RED} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
				{[648, 680, 712, 744].map((x) => (
					<rect key={x} x={x} y="258" width="14" height="30" fill={YELLOW} stroke={INK} strokeWidth="2.5" />
				))}
				<rect x="292" y="292" width="816" height="14" fill={PAPER} stroke={INK} strokeWidth="4" />
				{lit.map(([x, y]) => (
					<rect key={`${x}-${y}`} x={x} y={y} width="16" height="20" fill={YELLOW} stroke={INK} strokeWidth="2" />
				))}
				{/* ground-floor awnings, scalloped */}
				<rect x="300" y="520" width="800" height="42" fill={PAPER} stroke={INK} strokeWidth="4" />
				{[330, 470, 610, 850, 990].map((x) => (
					<g key={x}>
						<path d={`M${x} 500 L${x + 80} 500 L${x + 90} 524 Q${x + 75} 534 ${x + 60} 524 Q${x + 45} 534 ${x + 30} 524 Q${x + 15} 534 ${x} 524 Q${x - 10} 528 ${x - 10} 524 Z`} fill={RED} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
						{[18, 42, 66].map((d) => (
							<line key={d} x1={x + d} y1="500" x2={x + d + 3} y2="524" stroke={PAPER} strokeWidth="6" />
						))}
					</g>
				))}
				<path d="M690 562 L690 526 C690 506 710 506 710 526 L710 562" fill={INK} />
			</g>
			{/* sea */}
			<rect y="560" width="1200" height="200" fill={BLUE} />
			<rect y="560" width="1200" height="200" fill="url(#lm-dots-cyan)" opacity=".55" />
			<line x1="0" y1="561" x2="1200" y2="561" stroke={INK} strokeWidth="4" />
			{[600, 630, 664, 700].map((y, i) => (
				<path key={y} d={`M${-20 + i * 30} ${y} q 30 -10 60 0 t 60 0 t 60 0 M${380 + i * 40} ${y + 8} q 30 -10 60 0 t 60 0 M${1000 - i * 60} ${y - 4} q 30 -10 60 0 t 60 0`} stroke={CYAN} strokeWidth="4" fill="none" strokeLinecap="round" />
			))}
			{[586, 604, 622, 640, 658].map((y, i) => (
				<rect key={y} x={r2(760 - (70 - i * 12))} y={y} width={r2((70 - i * 12) * 2)} height="6" rx="3" fill="#FFF3C4" />
			))}
			{/* a yacht */}
			<g transform="translate(410 596)">
				<path d="M0 22 L120 22 L104 40 L12 40 Z" fill={PAPER} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
				<path d="M6 30 L114 30" stroke={RED} strokeWidth="4" />
				<path d="M30 22 L42 6 L92 6 L100 22" fill={PAPER} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
				<rect x="50" y="10" width="32" height="8" fill={CYAN} stroke={INK} strokeWidth="2" />
			</g>
			{/* the palm in front */}
			<Palm x={214} y={330} s={1.05} />
			{/* the balcony */}
			<g>
				<rect x="636" y="672" width="600" height="22" fill={PAPER} stroke={INK} strokeWidth="4" />
				{balusters.map((x) => (
					<path key={x} d={`M${x} 694 C${x - 12} 706 ${x - 10} 724 ${x} 730 C${x - 12} 740 ${x - 10} 756 ${x} 762 L${x + 20} 762 C${x + 30} 756 ${x + 32} 740 ${x + 20} 730 C${x + 30} 724 ${x + 32} 706 ${x + 20} 694 Z`} fill={PAPER} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
				))}
				<rect x="636" y="672" width="600" height="8" fill="url(#lm-dots-ink-s)" />
			</g>
			{/* the hand and the diamond */}
			<g className="lm-gemglow">
				<circle cx="996" cy="596" r="96" fill="url(#lm-spot)" />
			</g>
			<Diamond x={994} y={598} s={1.05} />
			<GlovedHand x={1008} y={560} s={1} />
			<Sparkle x={958} y={560} s={0.9} className="lm-twinkle" />
			<Sparkle x={1040} y={548} s={0.55} className="lm-twinkle lm-twinkle-2" />
			<Sparkle x={968} y={640} s={0.45} className="lm-twinkle lm-twinkle-3" />
		</svg>
	);
}

/* ------------------------------------------------------------------ panel vignettes */

/** The ballroom clock at 21:45, the detective's quarter-hour round. */
export function ClockFace({ className }: { className?: string }) {
	const ticks = Array.from({ length: 12 }, (_, i) => {
		const a = (Math.PI * 2 * i) / 12;
		return `M${r2(100 + Math.sin(a) * 70)} ${r2(100 - Math.cos(a) * 70)} L${r2(100 + Math.sin(a) * (i % 3 === 0 ? 54 : 62))} ${r2(100 - Math.cos(a) * (i % 3 === 0 ? 54 : 62))}`;
	}).join(' ');
	return (
		<svg viewBox="0 0 200 200" className={className} aria-hidden focusable="false">
			<circle cx="100" cy="100" r="92" fill={YELLOW} stroke={INK} strokeWidth="5" />
			<circle cx="100" cy="100" r="80" fill={PAPER} stroke={INK} strokeWidth="3" />
			<path d={ticks} stroke={INK} strokeWidth="5" strokeLinecap="round" />
			<path d="M100 100 L52 100" stroke={INK} strokeWidth="9" strokeLinecap="round" />
			<path d="M100 100 L100 32" stroke={RED} strokeWidth="6" strokeLinecap="round" className="lm-minute" />
			<circle cx="100" cy="100" r="8" fill={INK} />
		</svg>
	);
}

/** The house detective's shadow on the corridor wall, torch beam cutting across. */
export function DetectiveShadow({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden focusable="false">
			<rect width="400" height="260" fill={BLUE} />
			<rect width="400" height="260" fill="url(#lm-dots-ink-m)" opacity=".5" />
			{[0, 1, 2, 3].map((i) => (
				<rect key={i} x={20 + i * 96} y="30" width="70" height="150" fill="none" stroke={INK} strokeWidth="3" opacity=".55" />
			))}
			<path d="M0 214 L400 200 L400 260 L0 260 Z" fill="#7A1A12" stroke={INK} strokeWidth="3" />
			<path d="M0 214 L400 200 L400 260 L0 260 Z" fill="url(#lm-hatch)" opacity=".35" />
			<path d="M118 120 L400 40 L400 210 Z" fill={YELLOW} opacity=".92" />
			<path d="M118 120 L400 40 L400 210 Z" fill="url(#lm-dots-paper)" opacity=".5" />
			<g fill={INK}>
				<ellipse cx="74" cy="44" rx="24" ry="28" />
				<path d="M36 86 C40 70 58 64 74 64 C92 64 108 70 112 88 L122 112 L112 120 L104 104 L104 210 L86 210 L80 150 L70 150 L64 210 L46 210 L46 104 L36 120 L26 112 Z" />
				<rect x="108" y="108" width="20" height="12" rx="3" />
			</g>
		</svg>
	);
}

/** A gloved hand closing on the penthouse door's brass knob. */
export function DoorKnob({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 300 260" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden focusable="false">
			<rect width="300" height="260" fill={RED} />
			<rect width="300" height="260" fill="url(#lm-dots-yellow)" opacity=".35" />
			<rect x="-10" y="20" width="200" height="260" fill={PAPER} stroke={INK} strokeWidth="5" />
			<rect x="20" y="50" width="140" height="80" fill="none" stroke={INK} strokeWidth="3" />
			<rect x="20" y="150" width="140" height="120" fill="none" stroke={INK} strokeWidth="3" />
			<rect x="160" y="132" width="22" height="60" rx="4" fill={YELLOW} stroke={INK} strokeWidth="3" />
			<circle cx="150" cy="150" r="22" fill={YELLOW} stroke={INK} strokeWidth="4" />
			<path d="M140 140 a 12 12 0 0 1 14 -4" stroke="#FFFFFF" strokeWidth="4" fill="none" strokeLinecap="round" />
			<GlovedHand x={140} y={118} s={0.95} rot={-8} />
		</svg>
	);
}

/** A close-up of the penthouse safe dial (static vignette for the 3-tier page). */
export function DialVignette({ className }: { className?: string }) {
	const ticks = Array.from({ length: 40 }, (_, i) => {
		const a = (Math.PI * 2 * i) / 40;
		const r1 = i % 5 === 0 ? 64 : 72;
		return `M${r2(150 + Math.sin(a) * 80)} ${r2(130 - Math.cos(a) * 80)} L${r2(150 + Math.sin(a) * r1)} ${r2(130 - Math.cos(a) * r1)}`;
	}).join(' ');
	return (
		<svg viewBox="0 0 300 260" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden focusable="false">
			<rect width="300" height="260" fill={CYAN} />
			<SpeedLines cx={150} cy={130} n={28} r0={110} r1={260} width={3} opacity={0.5} />
			<circle cx="150" cy="130" r="100" fill="#8FA3B8" stroke={INK} strokeWidth="5" />
			<circle cx="150" cy="130" r="88" fill={PAPER} stroke={INK} strokeWidth="4" />
			<path d={ticks} stroke={INK} strokeWidth="3" strokeLinecap="round" />
			<circle cx="150" cy="130" r="40" fill={INK} />
			<circle cx="150" cy="130" r="30" fill="#C9D3DD" stroke={INK} strokeWidth="3" />
			<path d="M150 22 L142 8 L158 8 Z" fill={RED} stroke={INK} strokeWidth="3" />
		</svg>
	);
}

/** Three beams across a dark corridor (static vignette for the 3-tier page). */
export function BeamsVignette({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 300 260" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden focusable="false">
			<rect width="300" height="260" fill="#101A3A" />
			<rect width="300" height="260" fill="url(#lm-dots-blue)" opacity=".6" />
			<path d="M0 220 L300 200 L300 260 L0 260 Z" fill="#0A1028" stroke={INK} strokeWidth="3" />
			{['M-10 60 L310 150', 'M-10 190 L310 70', 'M80 -10 L200 270'].map((d) => (
				<g key={d}>
					<path d={d} stroke={RED} strokeWidth="12" opacity=".45" filter="url(#lm-glow)" />
					<path d={d} stroke="#FF6A55" strokeWidth="4" />
					<path d={d} stroke="#FFE3DC" strokeWidth="1.4" />
				</g>
			))}
			<g transform="translate(150 150) rotate(-12)">
				<path d="M-60 0 C-30 -40 30 -40 60 0" stroke={PAPER} strokeWidth="3" fill="none" strokeDasharray="6 8" />
			</g>
		</svg>
	);
}

/** The jewel on its cushion in a spotlight (splash inset). */
export function DiamondVignette({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 240 240" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden focusable="false">
			<rect width="240" height="240" fill={INK} />
			<path d="M90 0 L150 0 L210 240 L30 240 Z" fill={YELLOW} opacity=".9" />
			<path d="M90 0 L150 0 L210 240 L30 240 Z" fill="url(#lm-dots-paper)" opacity=".55" />
			<path d="M44 190 C44 160 196 160 196 190 L196 214 C196 226 44 226 44 214 Z" fill="#8E1B3F" stroke={INK} strokeWidth="4" />
			<path d="M60 182 C90 170 150 170 180 182" stroke="#D84B78" strokeWidth="4" fill="none" strokeLinecap="round" />
			<Diamond x={120} y={140} s={1.25} />
			<Sparkle x={160} y={104} s={0.8} className="lm-twinkle" />
			<Sparkle x={82} y={124} s={0.5} className="lm-twinkle lm-twinkle-2" />
		</svg>
	);
}

/* ------------------------------------------------------------------ the crew */

export type CrewKey = 'safecracker' | 'face' | 'driver' | 'inside' | 'planner';

const SKIN: Record<CrewKey, string> = { safecracker: '#E9B48A', face: '#F3CFAE', driver: '#8D5A3B', inside: '#C68B5E', planner: '#F1C9A5' };

/** One crew portrait, a bust in a 200 × 220 box, drawn for this issue. */
export function CrewPortrait({ who, className }: { who: CrewKey; className?: string }) {
	const skin = SKIN[who];
	return (
		<svg viewBox="0 0 200 220" className={className} aria-hidden focusable="false">
			<g filter="url(#lm-misreg)">
				{who === 'face' ? <path d="M40 120 C20 60 50 14 100 14 C150 14 180 60 160 120 C170 150 150 166 128 160 L72 160 C50 166 30 150 40 120 Z" fill="#B3261E" stroke={INK} strokeWidth="4" /> : null}
				{who === 'planner' ? <path d="M52 112 C44 60 64 30 100 30 C136 30 156 60 148 112 L148 132 L52 132 Z" fill="#2B1A12" stroke={INK} strokeWidth="4" /> : null}
				{/* shoulders */}
				<path d="M14 222 C18 172 56 150 100 150 C144 150 182 172 186 222 Z" fill={who === 'safecracker' ? INK : who === 'face' ? PINK : who === 'driver' ? '#7A4A26' : who === 'inside' ? RED : BLUE} stroke={INK} strokeWidth="4" />
				<rect x="86" y="126" width="28" height="30" fill={skin} stroke={INK} strokeWidth="4" />
				<ellipse cx="100" cy="94" rx="40" ry="47" fill={skin} stroke={INK} strokeWidth="4" />
				<path d="M64 112 C76 132 124 132 136 112" fill="none" stroke={INK} strokeWidth="1.5" opacity=".35" />
			</g>
			{who === 'safecracker' ? (
				<g>
					<path d="M58 84 C56 44 76 30 100 30 C124 30 144 44 142 84 C130 76 70 76 58 84 Z" fill="#2A2F3A" stroke={INK} strokeWidth="4" />
					<path d="M62 74 C80 66 120 66 138 74" stroke={PAPER} strokeWidth="2" fill="none" opacity=".4" />
					<path d="M60 92 C76 84 124 84 140 92 L138 108 C124 102 76 102 62 108 Z" fill={INK} />
					<ellipse cx="82" cy="97" rx="8" ry="5" fill={PAPER} />
					<ellipse cx="118" cy="97" rx="8" ry="5" fill={PAPER} />
					<circle cx="83" cy="97" r="2.6" fill={INK} />
					<circle cx="119" cy="97" r="2.6" fill={INK} />
					<path d="M90 122 C96 126 106 126 112 122" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
					<path d="M62 164 C60 200 92 206 100 186 C108 206 140 200 138 164" stroke="#C9CED6" strokeWidth="6" fill="none" />
					<path d="M62 164 C60 200 92 206 100 186 C108 206 140 200 138 164" stroke={INK} strokeWidth="1.5" fill="none" />
					<circle cx="100" cy="194" r="10" fill="#C9CED6" stroke={INK} strokeWidth="3" />
				</g>
			) : null}
			{who === 'face' ? (
				<g>
					<path d="M60 70 C66 34 134 34 140 70 C120 52 80 52 60 70 Z" fill="#B3261E" stroke={INK} strokeWidth="4" />
					<path d="M60 92 L92 88 L94 106 C84 112 66 110 62 102 Z M140 92 L108 88 L106 106 C116 112 134 110 138 102 Z" fill={INK} />
					<path d="M92 94 L108 94" stroke={INK} strokeWidth="4" />
					<path d="M68 96 L80 94 M114 94 L126 96" stroke={CYAN} strokeWidth="3" strokeLinecap="round" />
					<path d="M86 122 C94 116 106 116 114 122 C106 130 94 130 86 122 Z" fill={RED} stroke={INK} strokeWidth="2.5" />
					{[64, 76, 88, 100, 112, 124, 136].map((x, i) => (
						<circle key={x} cx={x} cy={r2(164 + Math.abs(3 - i) * -2.2 + 8)} r="5.5" fill="#FFFFFF" stroke={INK} strokeWidth="2" />
					))}
				</g>
			) : null}
			{who === 'driver' ? (
				<g>
					<path d="M58 78 C52 46 74 32 100 32 C128 32 150 46 142 78 C136 70 124 66 112 68 C104 58 86 58 80 68 C72 66 64 70 58 78 Z" fill="#1E1410" stroke={INK} strokeWidth="4" />
					<path d="M60 60 L140 60" stroke="#6B4B2E" strokeWidth="10" />
					<circle cx="82" cy="58" r="13" fill={CYAN} stroke={INK} strokeWidth="4" />
					<circle cx="118" cy="58" r="13" fill={CYAN} stroke={INK} strokeWidth="4" />
					<path d="M76 54 L82 50 M112 54 L118 50" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
					<path d="M76 92 C80 88 88 88 90 92 M110 92 C112 88 120 88 124 92" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
					<circle cx="84" cy="100" r="3.4" fill={INK} />
					<circle cx="117" cy="100" r="3.4" fill={INK} />
					<path d="M86 120 C96 128 108 128 116 118" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
					<path d="M70 156 C90 170 112 170 132 156 L170 176 C150 178 130 186 118 198 L100 172 Z" fill="#FFFFFF" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
					<path d="M150 180 L196 170 M152 190 L194 196" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
				</g>
			) : null}
			{who === 'inside' ? (
				<g>
					<path d="M62 74 C60 54 140 54 138 74 C120 70 80 70 62 74 Z" fill="#1E1410" stroke={INK} strokeWidth="3" />
					<path d="M70 58 L74 30 L126 30 L130 58 Z" fill={RED} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
					<path d="M72 50 L128 50" stroke={YELLOW} strokeWidth="5" />
					<path d="M64 70 C60 110 76 132 86 138 M136 70 C140 110 124 132 114 138" stroke={INK} strokeWidth="2" fill="none" />
					<circle cx="84" cy="98" r="3.4" fill={INK} />
					<path d="M110 98 C114 94 120 94 124 98" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
					<path d="M90 120 C98 126 108 124 114 116" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
					<path d="M80 152 L100 162 L80 172 Z M120 152 L100 162 L120 172 Z" fill={INK} />
					{[182, 202].map((y) => (
						<g key={y}>
							<circle cx="78" cy={y} r="5" fill={YELLOW} stroke={INK} strokeWidth="2" />
							<circle cx="122" cy={y} r="5" fill={YELLOW} stroke={INK} strokeWidth="2" />
						</g>
					))}
				</g>
			) : null}
			{who === 'planner' ? (
				<g>
					<path d="M60 92 C58 50 84 40 104 44 C126 48 142 62 140 96 C126 84 110 66 100 58 C92 72 76 86 60 92 Z" fill="#2B1A12" stroke={INK} strokeWidth="4" />
					<circle cx="84" cy="100" r="3.4" fill={INK} />
					<circle cx="116" cy="100" r="3.4" fill={INK} />
					<path d="M76 90 C80 86 88 86 92 90 M108 88 C112 84 120 84 124 88" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
					<path d="M88 120 C96 126 106 126 114 118" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
					{[-24, -8, 8, 24].map((a, i) => (
						<g key={a} transform={`translate(100 206) rotate(${a})`}>
							<rect x="-16" y="-56" width="32" height="46" rx="3" fill="#FFFFFF" stroke={INK} strokeWidth="3" />
							<text x="0" y="-26" textAnchor="middle" fontSize="18" fontWeight="800" fill={i % 2 ? INK : RED} fontFamily="var(--lm-letter), sans-serif">
								{['A', 'K', 'Q', '9'][i]}
							</text>
						</g>
					))}
				</g>
			) : null}
		</svg>
	);
}
