/**
 * The society's chart, hand-drawn in SVG (no bitmap needed). Two renderings of
 * the same geometry: `night` (faint gilt lines on ink green, what you see in the
 * dark) and `lit` (parchment and sepia ink, what the lantern shows), plus the
 * `ink` layer of invisible-ink routes and notes that only the lantern reveals.
 */

/** Rounded so the server and the browser print identical attributes (hydration). */
const r2 = (n: number) => Math.round(n * 100) / 100;

const COAST_A = 'M-40 520 C 60 470 110 380 210 360 S 330 300 380 230 S 470 120 560 140 S 700 200 760 170 S 860 60 980 90 S 1120 180 1180 150 S 1300 70 1380 110 S 1500 220 1640 200 L 1640 -40 L -40 -40 Z';
const ISLE_B = 'M240 640 C 300 590 390 600 430 640 S 520 700 470 750 S 330 800 280 760 S 200 690 240 640 Z';
const ISLE_C = 'M900 560 C 960 500 1080 520 1130 580 S 1190 700 1100 730 S 940 720 900 660 S 860 600 900 560 Z';
const ISLE_D = 'M1280 420 C 1330 380 1420 400 1440 450 S 1420 540 1360 540 S 1250 470 1280 420 Z';

const SITES: Array<{ x: number; y: number; label: string; glyph: string }> = [
	{ x: 330, y: 680, label: 'Temple of the Jaguar', glyph: 'M-14 10h28l-4-8h-20zM-10 2h20l-4-8h-12zM-6-6h12l-3-7h-6z' },
	{ x: 640, y: 250, label: 'No. 9, Heriot Row', glyph: 'M-2 12v-14M-8-2h16l-3-12h-10z' },
	{ x: 1010, y: 620, label: 'The Cartographer’s Tomb', glyph: 'M0-14l16 26h-32z' },
	{ x: 760, y: 470, label: 'The Trench', glyph: 'M-14 0a14 14 0 1 0 28 0a14 14 0 1 0-28 0M-7 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0' },
	{ x: 1360, y: 470, label: 'Hôtel Lumière', glyph: 'M0-14l12 9-12 19-12-19z' },
	{ x: 1180, y: 300, label: 'Wren & Sons, Clockmakers', glyph: 'M0-13v4M0 9v4M-13 0h4M9 0h4M-9-9l3 3M6 6l3 3M-9 9l3-3M6-6l3-3M-6 0a6 6 0 1 0 12 0a6 6 0 1 0-12 0' },
];

function Rose({ x, y, r, stroke, fill }: { x: number; y: number; r: number; stroke: string; fill: string }) {
	const pts = Array.from({ length: 16 }, (_, i) => {
		const a = (i * Math.PI) / 8;
		const len = i % 4 === 0 ? r : i % 2 === 0 ? r * 0.62 : r * 0.38;
		return `${r2(x + Math.sin(a) * len)},${r2(y - Math.cos(a) * len)}`;
	});
	return (
		<g stroke={stroke} fill="none" strokeWidth="1.2">
			<circle cx={x} cy={y} r={r * 1.08} />
			<circle cx={x} cy={y} r={r * 1.15} strokeDasharray="2 5" />
			{pts.map((p, i) => {
				const [px, py] = p.split(',').map(Number);
				const a2 = ((i + 0.5) * Math.PI) / 8;
				const a3 = ((i - 0.5) * Math.PI) / 8;
				const w = r * 0.1;
				return <path key={i} d={`M${r2(x + Math.sin(a3) * w)} ${r2(y - Math.cos(a3) * w)} L${px} ${py} L${r2(x + Math.sin(a2) * w)} ${r2(y - Math.cos(a2) * w)}Z`} fill={i % 2 ? 'none' : fill} />;
			})}
			<text x={x} y={y - r * 1.28} textAnchor="middle" fill={stroke} stroke="none" style={{ font: `${r * 0.28}px var(--font-display)` }}>
				N
			</text>
		</g>
	);
}

export function HeroMap({ variant }: { variant: 'night' | 'lit' }) {
	const lit = variant === 'lit';
	const sea = lit ? '#efe0bd' : 'transparent';
	const land = lit ? '#e2c98f' : 'rgba(216, 190, 120, 0.05)';
	const ink = lit ? '#5a3f1e' : 'rgba(216, 190, 120, 0.28)';
	const fine = lit ? 'rgba(90, 63, 30, 0.35)' : 'rgba(216, 190, 120, 0.12)';
	return (
		<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
			<defs>
				<pattern id={`hatch-${variant}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
					<path d="M0 0v8" stroke={fine} strokeWidth="1" />
				</pattern>
				<radialGradient id="vign" cx="50%" cy="50%" r="70%">
					<stop offset="60%" stopColor="#000" stopOpacity="0" />
					<stop offset="100%" stopColor="#3b250c" stopOpacity=".35" />
				</radialGradient>
			</defs>
			<rect width="1600" height="900" fill={sea} />
			{/* Graticule and rhumb lines. */}
			<g stroke={fine} strokeWidth="1">
				{Array.from({ length: 9 }, (_, i) => (
					<line key={`v${i}`} x1={i * 200} y1="0" x2={i * 200} y2="900" />
				))}
				{Array.from({ length: 6 }, (_, i) => (
					<line key={`h${i}`} x1="0" y1={i * 180} x2="1600" y2={i * 180} />
				))}
				{Array.from({ length: 16 }, (_, i) => {
					const a = (i * Math.PI) / 8;
					return <line key={`r${i}`} x1="800" y1="430" x2={r2(800 + Math.cos(a) * 1200)} y2={r2(430 + Math.sin(a) * 1200)} strokeDasharray="1 6" />;
				})}
			</g>
			{/* Coastlines with hatched shallows. */}
			<g stroke={ink} strokeWidth="1.6">
				{[COAST_A, ISLE_B, ISLE_C, ISLE_D].map((d) => (
					<g key={d}>
						<path d={d} fill={land} />
						<path d={d} fill={`url(#hatch-${variant})`} stroke="none" opacity=".7" />
						<path d={d} fill="none" strokeWidth="5" opacity=".18" transform="translate(0 4)" />
					</g>
				))}
			</g>
			{/* Mountains along the northern coast. */}
			<g stroke={ink} strokeWidth="1.3" fill="none">
				{[120, 200, 290, 520, 600, 900, 980, 1460, 1540].map((x, i) => (
					<path key={x} d={`M${x - 22} ${70 + (i % 3) * 18} l22 -30 l22 30 M${x - 6} ${50 + (i % 3) * 18} l6 -10 l6 10`} />
				))}
			</g>
			{/* Sites. */}
			<g stroke={ink} strokeWidth="1.5" fill="none">
				{SITES.map((s) => (
					<g key={s.label} transform={`translate(${s.x} ${s.y})`}>
						<path d={s.glyph} />
						<text y="34" textAnchor="middle" fill={ink} stroke="none" style={{ font: '15px var(--font-display)', fontStyle: 'italic' }}>
							{s.label}
						</text>
					</g>
				))}
			</g>
			{/* Sea serpent and ship, for the cartographer’s pride. */}
			<g stroke={ink} strokeWidth="1.4" fill="none">
				<path d="M520 820 q20 -30 40 0 q20 30 40 0 q20 -30 40 0 q12 18 30 6" />
				<path d="M635 812 l14 -6 l-4 10" />
				<path d="M1240 760 h60 l-8 14 h-44 z M1270 760 v-46 M1270 716 q22 14 0 30 M1270 720 q-18 12 0 24" />
			</g>
			<Rose x={1420} y={760} r={80} stroke={ink} fill={lit ? '#7a1e22' : 'rgba(216,190,120,.25)'} />
			<g fill={ink} style={{ font: '22px var(--font-engraved)', letterSpacing: '0.3em' }}>
				<text x="150" y="860">mare incognitum</text>
				<text x="980" y="420" style={{ fontSize: 16 }}>the shallows</text>
			</g>
			{lit ? <rect width="1600" height="900" fill="url(#vign)" /> : null}
		</svg>
	);
}

/** Invisible-ink routes and notes (only visible under the lantern). Same frame as the 1800×771 chart image. */
export function InkLayer({ clue }: { clue: string }) {
	const ink = '#8f2a1c';
	return (
		<svg viewBox="0 0 1800 771" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
			<g stroke={ink} strokeWidth="2.6" fill="none" strokeDasharray="10 9" strokeLinecap="round" opacity=".85">
				<path d="M470 520 C 560 470 600 420 660 330" />
				<path d="M1110 300 C 1160 380 1150 420 1110 450" />
				<path d="M1500 310 C 1460 380 1440 420 1470 470" />
			</g>
			<g fill={ink} style={{ font: '22px var(--font-type)' }}>
				<text x="500" y="455" transform="rotate(-42 500 455)">72 paces past the idol</text>
				<text x="1125" y="470" transform="rotate(8 1125 470)">the study door is false</text>
				<text x="1440" y="525" transform="rotate(-8 1440 525)">wind it at midnight</text>
				<text x="700" y="420" style={{ fontSize: 26, fontWeight: 700 }}>{clue}</text>
				<text x="700" y="452" style={{ fontSize: 18 }}>— A.V., 1936</text>
				<text x="300" y="380" transform="rotate(-10 300 380)">dive at low tide</text>
			</g>
			<g stroke={ink} strokeWidth="4" strokeLinecap="round">
				<path d="M1086 588 l26 26 M1112 588 l-26 26" />
			</g>
		</svg>
	);
}
