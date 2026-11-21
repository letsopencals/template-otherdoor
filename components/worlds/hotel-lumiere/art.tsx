import type { CSSProperties } from 'react';
import s from './lumiere.module.css';

/* Hand-inked SVG for the Hôtel Lumière Job: an original 1963 pop-print look (flat colour, black
   line, Ben-Day dots). Coordinates are rounded so server and browser print the same strings. */

const r2 = (n: number) => Math.round(n * 100) / 100;
const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const INK = '#111111';
const RED = '#E63022';
const YEL = '#FFD23F';
const CYAN = '#3FC6E8';
const BLUE = '#1B9AD6';
const CREAM = '#FFF4D6';

/** Shared halftone patterns, declared once. */
export function InkDefs() {
	return (
		<svg width="0" height="0" className={s.defs} aria-hidden focusable="false">
			<defs>
				<pattern id="hl-dots-red" width="8" height="8" patternUnits="userSpaceOnUse">
					<rect width="8" height="8" fill={YEL} />
					<circle cx="4" cy="4" r="2.2" fill="#F07A2A" />
				</pattern>
				<pattern id="hl-dots-blue" width="7" height="7" patternUnits="userSpaceOnUse">
					<rect width="7" height="7" fill={BLUE} />
					<circle cx="3.5" cy="3.5" r="1.6" fill="#0D6FA6" />
				</pattern>
				<pattern id="hl-dots-pink" width="7" height="7" patternUnits="userSpaceOnUse">
					<rect width="7" height="7" fill="#FFB9A8" />
					<circle cx="3.5" cy="3.5" r="1.5" fill="#F07F6A" />
				</pattern>
				<pattern id="hl-dots-ink" width="6" height="6" patternUnits="userSpaceOnUse">
					<circle cx="3" cy="3" r="1.3" fill={INK} opacity="0.35" />
				</pattern>
				<pattern id="hl-stripes" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(90)">
					<rect width="12" height="12" fill={CREAM} />
					<rect width="6" height="12" fill={RED} />
				</pattern>
			</defs>
		</svg>
	);
}

/** A jagged sound-effect burst; the lettering sits on top in HTML. */
export function Burst({ points = 14, fill = YEL, className, style }: { points?: number; fill?: string; className?: string; style?: CSSProperties }) {
	const pts = range(points * 2)
		.map((i) => {
			const a = (i / (points * 2)) * Math.PI * 2;
			const rad = i % 2 ? 31 + ((i * 7) % 9) : 49;
			return `${r2(50 + Math.cos(a) * rad)},${r2(50 + Math.sin(a) * rad)}`;
		})
		.join(' ');
	return (
		<svg className={className} style={style} viewBox="0 0 100 100" aria-hidden focusable="false">
			<polygon points={pts} fill={fill} stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
		</svg>
	);
}

/** Cover fallback: the Riviera at sunset, the hotel lit up, palms, a sea of dots. */
export function RivieraScene({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 600 760" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustration: the Hôtel Lumière on the Riviera at sunset">
			<rect width="600" height="760" fill="#FF8A3D" />
			<rect width="600" height="380" fill="url(#hl-dots-red)" />
			{/* sun with rays */}
			<g>
				{range(18).map((i) => {
					const a = (i / 18) * Math.PI * 2;
					return <polygon key={i} points={`300,330 ${r2(300 + Math.cos(a) * 520)},${r2(330 + Math.sin(a) * 520)} ${r2(300 + Math.cos(a + 0.09) * 520)},${r2(330 + Math.sin(a + 0.09) * 520)}`} fill="#FFE27A" opacity="0.55" />;
				})}
			</g>
			<circle cx="300" cy="360" r="120" fill={YEL} stroke={INK} strokeWidth="5" />
			{/* sea */}
			<rect y="430" width="600" height="330" fill="url(#hl-dots-blue)" />
			{range(7).map((i) => (
				<path key={i} d={`M0,${452 + i * 40} q75,-12 150,0 t150,0 t150,0 t150,0`} fill="none" stroke={CREAM} strokeWidth="3" opacity="0.7" />
			))}
			<line x1="0" y1="430" x2="600" y2="430" stroke={INK} strokeWidth="5" />
			{/* the hotel */}
			<path d="M120,430 L120,170 L300,120 L480,170 L480,430Z" fill={CREAM} stroke={INK} strokeWidth="6" strokeLinejoin="round" />
			<path d="M120,170 L300,120 L480,170 L480,190 L120,190Z" fill={RED} stroke={INK} strokeWidth="5" />
			<text x="300" y="168" textAnchor="middle" className={s.svgSign}>
				HÔTEL LUMIÈRE
			</text>
			{range(5).map((row) =>
				range(6).map((col) => {
					const lit = (row * 3 + col * 5) % 4 !== 0;
					return (
						<g key={`${row}-${col}`}>
							<rect x={148 + col * 52} y={210 + row * 42} width="30" height="26" fill={lit ? YEL : '#2C4C7A'} stroke={INK} strokeWidth="3" />
							<line x1={142 + col * 52} y1={238 + row * 42} x2={184 + col * 52} y2={238 + row * 42} stroke={INK} strokeWidth="3" />
						</g>
					);
				}),
			)}
			{/* penthouse beacon */}
			<circle cx="300" cy="106" r="10" fill={YEL} stroke={INK} strokeWidth="3" className={s.beacon} />
			{/* palms */}
			{[60, 545].map((x, i) => (
				<g key={x} transform={`translate(${x} 0) scale(${i ? -1 : 1} 1)`}>
					<path d="M0,760 C10,640 -6,520 22,400" fill="none" stroke={INK} strokeWidth="14" strokeLinecap="round" />
					<path d="M0,760 C10,640 -6,520 22,400" fill="none" stroke="#8A4B2A" strokeWidth="8" strokeLinecap="round" />
					{[-60, -20, 20, 60, 110].map((a) => (
						<path key={a} d="M22,400 C60,370 110,380 140,420 C100,400 60,400 22,400Z" fill="#1E8C5A" stroke={INK} strokeWidth="4" strokeLinejoin="round" transform={`rotate(${a} 22 400)`} />
					))}
				</g>
			))}
			{/* a yacht */}
			<path d="M380,500 L470,500 L455,520 L392,520Z" fill={CREAM} stroke={INK} strokeWidth="4" />
			<path d="M424,500 L424,452 L452,498Z" fill={CREAM} stroke={INK} strokeWidth="4" />
			<rect x="0" y="0" width="600" height="760" fill="none" stroke={INK} strokeWidth="10" />
		</svg>
	);
}

/** The Étoile de Menton on its velvet cushion. */
export function Diamond({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 300 260" aria-hidden focusable="false">
			<ellipse cx="150" cy="210" rx="120" ry="34" fill="#A3122A" stroke={INK} strokeWidth="5" />
			<path d="M40,206 C40,170 260,170 260,206" fill="#C81E3A" stroke={INK} strokeWidth="5" />
			<path d="M150,60 L210,110 L150,196 L90,110Z" fill={CYAN} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
			<path d="M90,110 L210,110 M150,60 L130,110 L150,196 L170,110 L150,60" fill="none" stroke={INK} strokeWidth="3" />
			<path d="M118,84 L132,94" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
			{(
				[
					[60, 60],
					[236, 50],
					[250, 140],
					[42, 140],
				] as const
			).map(([x, y]) => (
				<path key={`${x}-${y}`} className={s.twinkle} d={`M${x},${y - 14} L${x + 4},${y - 4} L${x + 14},${y} L${x + 4},${y + 4} L${x},${y + 14} L${x - 4},${y + 4} L${x - 14},${y} L${x - 4},${y - 4}Z`} fill={YEL} stroke={INK} strokeWidth="2.5" />
			))}
		</svg>
	);
}

/** The house detective doing his quarter-hour round: a peaked hotel cap, a moustache, a torch beam. */
export function HouseDetective({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 320 300" aria-hidden focusable="false">
			<rect x="0" y="0" width="120" height="300" fill="#7A3E2A" stroke={INK} strokeWidth="5" />
			<rect x="18" y="20" width="84" height="110" fill="none" stroke={INK} strokeWidth="3" />
			<rect x="18" y="150" width="84" height="130" fill="none" stroke={INK} strokeWidth="3" />
			<circle cx="104" cy="160" r="7" fill={YEL} stroke={INK} strokeWidth="3" />
			<polygon points="200,150 320,90 320,240" fill={YEL} opacity="0.75" />
			<g>
				<path d="M110,300 L110,210 C110,180 130,170 160,170 C190,170 210,180 210,210 L210,300Z" fill="#2B3F6B" stroke={INK} strokeWidth="5" />
				<circle cx="160" cy="130" r="40" fill="url(#hl-dots-pink)" stroke={INK} strokeWidth="5" />
				<path d="M116,108 C120,78 200,78 204,108Z" fill="#2B3F6B" stroke={INK} strokeWidth="5" />
				<path d="M108,110 L214,110 L206,122 L114,122Z" fill={INK} />
				<rect x="146" y="96" width="28" height="9" fill={YEL} stroke={INK} strokeWidth="2" />
				<circle cx="174" cy="132" r="5" fill={INK} />
				<path d="M150,150 C160,142 186,142 194,152 C182,150 166,154 150,150Z" fill={INK} />
				<path d="M186,186 L214,168 L222,178 L196,196Z" fill="#999" stroke={INK} strokeWidth="4" />
			</g>
		</svg>
	);
}

/** The penthouse safe's dial; CSS spins it with the scroll. */
export function SafeDial({ className, style }: { className?: string; style?: CSSProperties }) {
	return (
		<svg className={className} style={style} viewBox="0 0 200 200" aria-hidden focusable="false">
			<circle cx="100" cy="100" r="96" fill="#C9CED6" stroke={INK} strokeWidth="5" />
			<circle cx="100" cy="100" r="80" fill="#E9ECEF" stroke={INK} strokeWidth="3" />
			{range(50).map((i) => {
				const a = (i / 50) * Math.PI * 2;
				const big = i % 5 === 0;
				return <line key={i} x1={r2(100 + Math.sin(a) * (big ? 64 : 70))} y1={r2(100 - Math.cos(a) * (big ? 64 : 70))} x2={r2(100 + Math.sin(a) * 78)} y2={r2(100 - Math.cos(a) * 78)} stroke={INK} strokeWidth={big ? 3 : 1.4} />;
			})}
			{range(10).map((i) => {
				const a = (i / 10) * Math.PI * 2;
				return (
					<text key={i} x={r2(100 + Math.sin(a) * 52)} y={r2(100 - Math.cos(a) * 52 + 5)} textAnchor="middle" className={s.dialNum}>
						{i * 10}
					</text>
				);
			})}
			<circle cx="100" cy="100" r="30" fill={RED} stroke={INK} strokeWidth="4" />
			<rect x="94" y="72" width="12" height="56" rx="4" fill={INK} />
		</svg>
	);
}

/** The safe door around the dial. */
export function SafeDoor({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 320 320" aria-hidden focusable="false">
			<rect x="6" y="6" width="308" height="308" rx="18" fill="#5E6B7E" stroke={INK} strokeWidth="6" />
			<rect x="26" y="26" width="268" height="268" rx="10" fill="#7D8BA0" stroke={INK} strokeWidth="4" />
			<rect x="26" y="26" width="268" height="268" rx="10" fill="url(#hl-dots-ink)" />
			{(
				[
					[46, 46],
					[274, 46],
					[46, 274],
					[274, 274],
				] as const
			).map(([x, y]) => (
				<circle key={`${x}${y}`} cx={x} cy={y} r="9" fill="#C9CED6" stroke={INK} strokeWidth="3" />
			))}
			<rect x="270" y="130" width="34" height="60" rx="6" fill="#C9CED6" stroke={INK} strokeWidth="4" />
		</svg>
	);
}

/** Inside the room fallback: the penthouse, primary colours. */
export function Penthouse({ className, variant = 0 }: { className?: string; variant?: number }) {
	const wall = [YEL, CYAN, '#FFB9A8'][variant % 3];
	return (
		<svg className={className} viewBox="0 0 480 320" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustration: the pop-art penthouse">
			<rect width="480" height="320" fill={wall} />
			<rect width="480" height="320" fill="url(#hl-dots-ink)" opacity="0.4" />
			<rect y="230" width="480" height="90" fill="url(#hl-stripes)" stroke={INK} strokeWidth="4" />
			<rect x="300" y="40" width="140" height="150" fill="url(#hl-dots-blue)" stroke={INK} strokeWidth="5" />
			<line x1="370" y1="40" x2="370" y2="190" stroke={INK} strokeWidth="4" />
			<circle cx="410" cy="80" r="18" fill={YEL} stroke={INK} strokeWidth="3" />
			<rect x="60" y="60" width="120" height="90" fill={CREAM} stroke={INK} strokeWidth="5" />
			<circle cx="120" cy="105" r="28" fill={RED} stroke={INK} strokeWidth="4" />
			<path d="M40,230 L40,186 C40,170 210,170 210,186 L210,230Z" fill={RED} stroke={INK} strokeWidth="5" />
			<rect x="30" y="200" width="20" height="40" rx="6" fill={RED} stroke={INK} strokeWidth="4" />
			<rect x="200" y="200" width="20" height="40" rx="6" fill={RED} stroke={INK} strokeWidth="4" />
			<path d="M250,230 L250,150 L264,150 L264,230 M232,150 L282,150 L274,120 L240,120Z" fill={CREAM} stroke={INK} strokeWidth="4" />
			<rect x="0" y="0" width="480" height="320" fill="none" stroke={INK} strokeWidth="8" />
		</svg>
	);
}

/** One crew bust: original characters built from flat shapes. */
export function CrewBust({ kind }: { kind: 0 | 1 | 2 | 3 }) {
	const skins = ['url(#hl-dots-pink)', '#C98B5E', '#8B5A3C', '#F2C9A0'];
	const bgs = [YEL, CYAN, '#FF8A3D', '#B6E3A8'];
	return (
		<svg viewBox="0 0 200 200" className={s.bust} aria-hidden focusable="false">
			<rect width="200" height="200" fill={bgs[kind]} />
			{range(9).map((i) => (
				<line key={i} x1="100" y1="110" x2={r2(100 + Math.cos((i / 9) * Math.PI * 2) * 200)} y2={r2(110 + Math.sin((i / 9) * Math.PI * 2) * 200)} stroke={INK} strokeWidth="1.2" opacity="0.18" />
			))}
			{/* shoulders */}
			<path d="M30,200 C34,160 60,148 100,148 C140,148 166,160 170,200Z" fill={[INK, RED, '#2B3F6B', CREAM][kind]} stroke={INK} strokeWidth="4" />
			{kind === 0 ? <path d="M84,150 L100,176 L116,150Z" fill={CREAM} stroke={INK} strokeWidth="3" /> : null}
			{kind === 0 ? <path d="M92,152 L100,160 L108,152 L100,146Z" fill={RED} stroke={INK} strokeWidth="2.5" /> : null}
			{/* neck + head */}
			<rect x="88" y="124" width="24" height="30" fill={skins[kind]} stroke={INK} strokeWidth="4" />
			<ellipse cx="100" cy="96" rx="38" ry="44" fill={skins[kind]} stroke={INK} strokeWidth="4" />
			{/* hair */}
			{kind === 0 ? <path d="M60,90 C58,48 142,44 140,90 C130,70 80,68 60,90Z" fill={INK} /> : null}
			{kind === 1 ? <path d="M56,120 C40,60 90,36 120,50 C160,58 164,110 146,132 C146,96 130,70 100,66 C78,70 64,92 66,128Z" fill="#E8B23A" stroke={INK} strokeWidth="4" /> : null}
			{kind === 2 ? <path d="M58,84 C62,52 138,52 142,84 L142,74 C130,42 70,42 58,74Z M54,84 L146,84 L142,70 L58,70Z" fill={RED} stroke={INK} strokeWidth="4" /> : null}
			{kind === 3 ? <circle cx="100" cy="62" r="40" fill="#5A2E1A" stroke={INK} strokeWidth="4" /> : null}
			{kind === 3 ? <ellipse cx="100" cy="100" rx="36" ry="40" fill={skins[3]} stroke={INK} strokeWidth="4" /> : null}
			{/* eyes */}
			{kind === 0 || kind === 2 ? (
				<g>
					<rect x="68" y="90" width="28" height="16" rx="5" fill={INK} />
					<rect x="104" y="90" width="28" height="16" rx="5" fill={INK} />
					<line x1="96" y1="96" x2="104" y2="96" stroke={INK} strokeWidth="3" />
					<path d="M74,94 L84,94" stroke="#fff" strokeWidth="2" />
				</g>
			) : (
				<g>
					<path d="M76,98 q8,-8 16,0" stroke={INK} strokeWidth="4" fill="none" />
					<path d="M108,98 q8,-8 16,0" stroke={INK} strokeWidth="4" fill="none" />
				</g>
			)}
			{/* mouth */}
			{kind === 1 ? <path d="M88,120 q12,8 24,0 q-12,-2 -24,0Z" fill={RED} stroke={INK} strokeWidth="2.5" /> : <path d={kind === 2 ? 'M86,122 L114,118' : 'M88,120 q12,8 24,0'} stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />}
			{kind === 3 ? <path d="M70,104 L130,104" stroke={INK} strokeWidth="0" /> : null}
			{kind === 3 ? (
				<g>
					<circle cx="100" cy="98" r="0" />
					<rect x="62" y="56" width="76" height="10" rx="5" fill={YEL} stroke={INK} strokeWidth="3" />
				</g>
			) : null}
		</svg>
	);
}

/** The game master's card: a top hat, a key and a deck. */
export function KeeperBust() {
	return (
		<svg viewBox="0 0 200 200" className={s.bust} aria-hidden focusable="false">
			<rect width="200" height="200" fill={RED} />
			<rect width="200" height="200" fill="url(#hl-dots-ink)" />
			<path d="M30,200 C34,160 60,148 100,148 C140,148 166,160 170,200Z" fill={INK} stroke={INK} strokeWidth="4" />
			<path d="M84,150 L100,176 L116,150Z" fill={CREAM} stroke={INK} strokeWidth="3" />
			<path d="M88,154 L100,162 L112,154 L112,166 L100,160 L88,166Z" fill={INK} />
			<rect x="88" y="124" width="24" height="30" fill="#F2C9A0" stroke={INK} strokeWidth="4" />
			<ellipse cx="100" cy="98" rx="36" ry="42" fill="#F2C9A0" stroke={INK} strokeWidth="4" />
			<path d="M62,92 C60,60 140,56 138,92 C150,120 150,140 140,150 C140,120 130,90 100,84 C70,90 60,120 60,150 C50,140 50,120 62,92Z" fill="#7A2E1A" stroke={INK} strokeWidth="4" />
			<path d="M78,100 q8,-6 14,0 M108,100 q8,-6 14,0" stroke={INK} strokeWidth="4" fill="none" />
			<path d="M88,120 q12,8 24,0" stroke={INK} strokeWidth="3.5" fill="none" />
			<g transform="rotate(-24 150 60)">
				<circle cx="150" cy="44" r="12" fill="none" stroke={YEL} strokeWidth="6" />
				<path d="M150,56 L150,96 M150,82 L160,82 M150,92 L162,92" stroke={YEL} strokeWidth="6" />
			</g>
		</svg>
	);
}
