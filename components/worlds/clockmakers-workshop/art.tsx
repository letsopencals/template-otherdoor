import { gearOutline } from './gears';
import { Screw } from './gear-art';
import s from './clockmaker.module.css';

/**
 * Hand-drawn SVG for the workshop: the carved long-case clock with its cuckoo,
 * the cuckoo bird, the wind-up key, three wind-up toys of our own design, the
 * engraved tool marks, a pocket watch and the Master Clockmaker rosette.
 * Paint comes from <WorkshopDefs/> (fixed ids). Computed coordinates rounded.
 */

const r2 = (n: number) => Math.round(n * 100) / 100;
const polar = (cx: number, cy: number, r: number, deg: number) => {
	const a = ((deg - 90) * Math.PI) / 180;
	return { x: r2(cx + r * Math.cos(a)), y: r2(cy + r * Math.sin(a)) };
};

const ROMAN = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];

/** A clock face (dial, chapter ring, numerals, ticks) at cx, cy, radius r. Hands are separate. */
export function Dial({ cx, cy, r, maker = true }: { cx: number; cy: number; r: number; maker?: boolean }) {
	return (
		<g>
			<circle cx={cx} cy={cy} r={r2(r + r * 0.12)} fill="url(#cw-brass-h)" stroke="#6b4512" strokeWidth={r2(r * 0.02)} />
			<circle cx={cx} cy={cy} r={r2(r + r * 0.05)} fill="none" stroke="#fff3c4" strokeOpacity=".55" strokeWidth={r2(r * 0.015)} />
			<circle cx={cx} cy={cy} r={r} fill="url(#cw-face)" stroke="#8a6326" strokeWidth={r2(r * 0.015)} />
			<circle cx={cx} cy={cy} r={r2(r * 0.93)} fill="none" stroke="#3b2414" strokeWidth={r2(r * 0.008)} />
			<circle cx={cx} cy={cy} r={r2(r * 0.84)} fill="none" stroke="#3b2414" strokeWidth={r2(r * 0.008)} />
			{Array.from({ length: 60 }, (_, i) => {
				const big = i % 5 === 0;
				const a = polar(cx, cy, r * 0.93, i * 6);
				const b = polar(cx, cy, r * (big ? 0.84 : 0.885), i * 6);
				return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#3b2414" strokeWidth={r2(r * (big ? 0.022 : 0.009))} />;
			})}
			{ROMAN.map((n, i) => {
				const p = polar(cx, cy, r * 0.69, i * 30);
				return (
					<text key={n} x={p.x} y={p.y} className={s.numeral} fontSize={r2(r * (n.length > 2 ? 0.13 : 0.16))} textAnchor="middle" dominantBaseline="central">
						{n}
					</text>
				);
			})}
			{maker ? (
				<text x={cx} y={r2(cy + r * 0.36)} className={s.maker} fontSize={r2(r * 0.085)} textAnchor="middle">
					T. WREN · LEITH
				</text>
			) : null}
		</g>
	);
}

/** Spade hands, drawn pointing at XII around cx, cy. Wrap in a rotating group. */
export function HourHand({ cx, cy, r }: { cx: number; cy: number; r: number }) {
	const L = r * 0.52;
	return (
		<path
			d={`M${cx} ${r2(cy + r * 0.12)} L${r2(cx - r * 0.025)} ${r2(cy - L * 0.55)} C${r2(cx - r * 0.11)} ${r2(cy - L * 0.62)} ${r2(cx - r * 0.09)} ${r2(cy - L * 0.88)} ${cx} ${r2(cy - L)} C${r2(cx + r * 0.09)} ${r2(cy - L * 0.88)} ${r2(cx + r * 0.11)} ${r2(cy - L * 0.62)} ${r2(cx + r * 0.025)} ${r2(cy - L * 0.55)} Z`}
			fill="#24150b"
		/>
	);
}
export function MinuteHand({ cx, cy, r }: { cx: number; cy: number; r: number }) {
	const L = r * 0.8;
	return (
		<g fill="#24150b">
			<path d={`M${r2(cx - r * 0.018)} ${r2(cy + r * 0.16)} L${r2(cx - r * 0.014)} ${r2(cy - L * 0.7)} L${cx} ${r2(cy - L)} L${r2(cx + r * 0.014)} ${r2(cy - L * 0.7)} L${r2(cx + r * 0.018)} ${r2(cy + r * 0.16)} Z`} />
			<circle cx={cx} cy={r2(cy - L * 0.68)} r={r2(r * 0.045)} fill="none" stroke="#24150b" strokeWidth={r2(r * 0.018)} />
		</g>
	);
}

/** The cuckoo: a round wooden bird with a copper breast and a carved wing. Beak opens via CSS (.beakTop/.beakLow). */
export function Bird({ className, x, y, width, height }: { className?: string; x?: number; y?: number; width?: number; height?: number }) {
	return (
		<svg viewBox="-4 0 100 72" x={x} y={y} width={width} height={height} className={className} aria-hidden focusable="false" overflow="visible">
			<defs>
				<radialGradient id="cw-bird-body" cx="45%" cy="35%" r="70%">
					<stop offset="0" stopColor="#9a5a32" />
					<stop offset=".6" stopColor="#6e3b1c" />
					<stop offset="1" stopColor="#3f1f0d" />
				</radialGradient>
				<radialGradient id="cw-bird-breast" cx="40%" cy="40%" r="70%">
					<stop offset="0" stopColor="#f0a072" />
					<stop offset="1" stopColor="#b5562b" />
				</radialGradient>
			</defs>
			{/* tail */}
			<path d="M10 40 L-2 34 L1 44 L-3 52 L12 47 Z" fill="#4a2612" />
			<path d="M2 38 L10 42 M0 46 L11 45" stroke="#7a4524" strokeWidth="1.2" />
			{/* body */}
			<ellipse cx="38" cy="42" rx="30" ry="21" fill="url(#cw-bird-body)" />
			<path d="M46 26 C64 26 70 44 62 56 C56 62 44 62 40 58 C50 50 52 38 46 26 Z" fill="url(#cw-bird-breast)" />
			<path d="M50 40 C55 42 57 47 56 52" fill="none" stroke="#fbe0c8" strokeOpacity=".55" strokeWidth="1.4" strokeLinecap="round" />
			{/* wing */}
			<path d="M16 36 C24 28 40 28 46 38 C42 48 30 54 18 50 C14 46 13 40 16 36 Z" fill="#5a2e14" stroke="#2c1407" strokeWidth="1" />
			<path d="M20 40 C27 37 35 38 41 41 M19 45 C26 43 33 44 38 47" fill="none" stroke="#b97a4a" strokeWidth="1.1" strokeLinecap="round" />
			{/* head */}
			<circle cx="62" cy="24" r="15" fill="url(#cw-bird-body)" />
			<path d="M54 10 C56 4 62 3 64 8 C62 7 59 8 58 11 Z" fill="#4a2612" />
			<circle cx="66" cy="21" r="4.6" fill="#fff8ec" />
			<circle cx="67" cy="21" r="2.6" fill="#1b0d05" />
			<circle cx="68" cy="20" r=".9" fill="#fff" />
			<path d="M58 29 C61 32 66 32 68 30" fill="none" stroke="#f0a072" strokeWidth="1.4" strokeLinecap="round" />
			{/* beak (two halves, the top one opens) */}
			<path className={s.beakTop} d="M75 21 L91 25 L76 27 Z" fill="#e0a43c" stroke="#8a5a14" strokeWidth=".8" />
			<path className={s.beakLow} d="M76 27 L89 27 L75 31 Z" fill="#c7861f" stroke="#8a5a14" strokeWidth=".8" />
			{/* perch */}
			<rect x="20" y="62" width="44" height="5" rx="2.5" fill="url(#cw-brass-lin)" />
			<path d="M34 60 L33 63 M42 60 L43 63" stroke="#c98a3a" strokeWidth="2" strokeLinecap="round" />
		</svg>
	);
}

/**
 * The great clock in the hero: a carved walnut long-case with a cuckoo door in
 * the crown, a dial stopped at midnight (hands turn with the mainspring) and a
 * pendulum behind glass that swings harder the more the page is wound.
 * The parent toggles `data-cuckoo` and writes `--a` (hands) and `--swing` (pendulum).
 */
export function GreatClock() {
	const cx = 200;
	const cy = 318;
	const R = 104;
	return (
		<svg viewBox="0 0 400 720" className={s.clockSvg} role="img" aria-label="A carved walnut clock, stopped at midnight, with a cuckoo door in its crown">
			<defs>
				<clipPath id="cw-pend-window">
					<path d="M140 470 L140 640 L260 640 L260 470 C260 440 140 440 140 470 Z" />
				</clipPath>
				<linearGradient id="cw-glass" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="#fff" stopOpacity=".22" />
					<stop offset=".35" stopColor="#fff" stopOpacity="0" />
					<stop offset=".62" stopColor="#fff" stopOpacity=".08" />
					<stop offset="1" stopColor="#fff" stopOpacity="0" />
				</linearGradient>
			</defs>
			{/* soft cast shadow on the wall */}
			<ellipse cx="214" cy="700" rx="190" ry="18" fill="#060a1c" opacity=".55" filter="url(#cw-soft)" />
			{/* finial */}
			<path d="M200 6 C210 16 212 26 206 34 L194 34 C188 26 190 16 200 6 Z" fill="url(#cw-brass-h)" stroke="#6b4512" />
			<rect x="188" y="34" width="24" height="8" rx="2" fill="url(#cw-brass-lin)" />
			{/* crown (arched pediment) */}
			<path d="M34 196 C34 96 118 44 200 44 C282 44 366 96 366 196 Z" fill="url(#cw-walnut-v)" />
			<path d="M34 196 C34 96 118 44 200 44 C282 44 366 96 366 196 Z" fill="#000" filter="url(#cw-grain)" opacity=".9" />
			<path d="M52 192 C54 108 126 62 200 62 C274 62 346 108 348 192" fill="none" stroke="#2a160a" strokeWidth="3" />
			<path d="M54 190 C56 110 127 65 200 65 C273 65 344 110 346 190" fill="none" stroke="#a8754a" strokeOpacity=".5" strokeWidth="1.2" />
			{/* carved acanthus scrolls */}
			{[1, -1].map((d) => (
				<g key={d} transform={d === -1 ? 'translate(400 0) scale(-1 1)' : undefined} fill="none" strokeLinecap="round">
					<path d="M78 180 C70 150 92 120 122 118 C142 117 152 134 140 146 C132 154 118 148 122 138" stroke="#2a160a" strokeWidth="5" />
					<path d="M78 180 C70 150 92 120 122 118 C142 117 152 134 140 146 C132 154 118 148 122 138" stroke="#b47f50" strokeOpacity=".55" strokeWidth="1.6" transform="translate(-1 -1.5)" />
					<path d="M96 176 C100 160 112 152 126 158 M106 182 C114 172 126 170 136 176" stroke="#2a160a" strokeWidth="3.5" />
					<path d="M146 98 C138 92 128 94 124 102" stroke="#2a160a" strokeWidth="3" />
				</g>
			))}
			{/* the cuckoo door */}
			<g>
				<path d="M168 168 L168 122 C168 100 232 100 232 122 L232 168 Z" fill="#120904" />
				<path d="M164 170 L164 120 C164 94 236 94 236 120 L236 170" fill="none" stroke="url(#cw-brass-lin)" strokeWidth="5" />
				<g className={s.clockBird}>
					<Bird x={160} y={106} width={84} height={60} />
				</g>
				<g className={s.clockDoorL}>
					<path d="M168 168 L168 122 C168 108 184 102 200 102 L200 168 Z" fill="url(#cw-walnut)" stroke="#2a160a" strokeWidth="1.5" />
					<path d="M174 160 L174 126 C174 116 186 110 196 110 L196 160 Z" fill="none" stroke="#a8754a" strokeOpacity=".45" />
					<circle cx="194" cy="140" r="2.4" fill="url(#cw-brass-lin)" />
				</g>
				<g className={s.clockDoorR}>
					<path d="M232 168 L232 122 C232 108 216 102 200 102 L200 168 Z" fill="url(#cw-walnut)" stroke="#2a160a" strokeWidth="1.5" />
					<path d="M226 160 L226 126 C226 116 214 110 204 110 L204 160 Z" fill="none" stroke="#a8754a" strokeOpacity=".45" />
					<circle cx="206" cy="140" r="2.4" fill="url(#cw-brass-lin)" />
				</g>
				<rect x="158" y="170" width="84" height="7" rx="2" fill="url(#cw-brass-lin)" />
			</g>
			{/* cornice */}
			<rect x="22" y="192" width="356" height="18" rx="3" fill="#2a160a" />
			<rect x="26" y="194" width="348" height="6" rx="2" fill="url(#cw-brass-h)" opacity=".9" />
			{/* case */}
			<rect x="48" y="210" width="304" height="450" fill="url(#cw-walnut)" />
			<rect x="48" y="210" width="304" height="450" fill="#000" filter="url(#cw-grain)" opacity=".85" />
			{/* fluted pilasters with brass capitals */}
			{[60, 318].map((x) => (
				<g key={x}>
					<rect x={x} y="226" width="22" height="420" rx="3" fill="#3d2211" />
					{[4, 10, 16].map((f) => (
						<rect key={f} x={x + f} y="240" width="2.4" height="392" rx="1.2" fill="#1d0f06" opacity=".85" />
					))}
					<rect x={x - 3} y="220" width="28" height="12" rx="2" fill="url(#cw-brass-lin)" />
					<rect x={x - 3} y="638" width="28" height="10" rx="2" fill="url(#cw-brass-lin)" />
				</g>
			))}
			{/* dial surround */}
			<rect x="94" y="212" width="212" height="212" rx="10" fill="#2a160a" />
			<rect x="98" y="216" width="204" height="204" rx="8" fill="#5c3419" />
			{(
				[
				[110, 228],
				[290, 228],
				[110, 408],
				[290, 408],
				] as Array<[number, number]>
			).map(([x, y]) => (
				<path key={`${x}${y}`} d={`M${x - 8} ${y} C${x - 4} ${y - 8} ${x + 4} ${y - 8} ${x + 8} ${y} C${x + 4} ${y + 8} ${x - 4} ${y + 8} ${x - 8} ${y} Z`} fill="url(#cw-brass-h)" opacity=".85" />
			))}
			<Dial cx={cx} cy={cy} r={R * 0.84} />
			<g className={s.clockHour}>
				<HourHand cx={cx} cy={cy} r={R * 0.84} />
			</g>
			<g className={s.clockMinute}>
				<MinuteHand cx={cx} cy={cy} r={R * 0.84} />
			</g>
			<circle cx={cx} cy={cy} r="6" fill="url(#cw-brass-h)" stroke="#3b2414" />
			<circle cx={cx} cy={cy} r="2" fill="#24150b" />
			{/* pendulum window */}
			<path d="M134 472 L134 646 L266 646 L266 472 C266 434 134 434 134 472 Z" fill="#2a160a" />
			<path d="M140 470 L140 640 L260 640 L260 470 C260 440 140 440 140 470 Z" fill="#160b05" />
			<g clipPath="url(#cw-pend-window)">
				<ellipse cx="200" cy="560" rx="70" ry="90" fill="#f2a55a" opacity=".12" />
				<g className={s.pendulum}>
					<rect x="198" y="426" width="4" height="150" fill="url(#cw-brass-h)" />
					<circle cx="200" cy="590" r="27" fill="url(#cw-brass)" stroke="#6b4512" strokeWidth="1.5" />
					<circle cx="200" cy="590" r="19" fill="none" stroke="#fff1bf" strokeOpacity=".6" />
					<circle cx="193" cy="582" r="6" fill="#fff" opacity=".35" />
				</g>
				{/* two brass weights on chains */}
				{[160, 240].map((x, i) => (
					<g key={x}>
						<line x1={x} y1="440" x2={x} y2={i ? 520 : 498} stroke="#a77a33" strokeWidth="1.6" strokeDasharray="3 2" />
						<rect x={x - 9} y={i ? 520 : 498} width="18" height="62" rx="4" fill="url(#cw-brass-h)" stroke="#6b4512" />
						<rect x={x - 9} y={i ? 528 : 506} width="18" height="3" fill="#6b4512" opacity=".5" />
					</g>
				))}
			</g>
			<path d="M140 470 L140 640 L260 640 L260 470 C260 440 140 440 140 470 Z" fill="url(#cw-glass)" />
			<path d="M134 472 L134 646 L266 646 L266 472 C266 434 134 434 134 472 Z" fill="none" stroke="url(#cw-brass-lin)" strokeWidth="3" />
			{/* plinth + bun feet */}
			<rect x="30" y="656" width="340" height="16" rx="3" fill="#2a160a" />
			<rect x="34" y="658" width="332" height="5" rx="2" fill="url(#cw-brass-h)" opacity=".8" />
			<rect x="40" y="672" width="320" height="26" fill="url(#cw-walnut)" />
			<ellipse cx="72" cy="704" rx="22" ry="10" fill="#2e190c" />
			<ellipse cx="328" cy="704" rx="22" ry="10" fill="#2e190c" />
			<Screw cx={84} cy={685} r={4} turn={30} />
			<Screw cx={316} cy={685} r={4} turn={110} />
		</svg>
	);
}

/** The wind-up key, seen from behind as it sits in the keyhole: rotate the whole SVG. */
export function WindKeyArt({ className }: { className?: string }) {
	return (
		<svg viewBox="-110 -110 220 220" className={className} aria-hidden focusable="false">
			<path
				d="M-14 -16 C-30 -40 -60 -64 -86 -54 C-108 -45 -108 -12 -96 0 C-108 12 -108 45 -86 54 C-60 64 -30 40 -14 16 Z M14 -16 C30 -40 60 -64 86 -54 C108 -45 108 -12 96 0 C108 12 108 45 86 54 C60 64 30 40 14 16 Z"
				fill="url(#cw-brass)"
				stroke="#6b4512"
				strokeWidth="3"
				strokeLinejoin="round"
			/>
			{/* pierced hearts in each lobe */}
			{[1, -1].map((d) => (
				<path key={d} transform={`translate(${d * 60} 0) rotate(${d * 90})`} d="M0 14 C-18 2 -20 -12 -10 -16 C-4 -18 0 -12 0 -9 C0 -12 4 -18 10 -16 C20 -12 18 2 0 14 Z" fill="#14204a" stroke="#6b4512" strokeWidth="2.5" />
			))}
			<path d="M-84 -44 C-66 -52 -44 -40 -26 -18" fill="none" stroke="#fff4cc" strokeOpacity=".7" strokeWidth="3" strokeLinecap="round" />
			<path d="M84 44 C66 52 44 40 26 18" fill="none" stroke="#5a3a10" strokeOpacity=".5" strokeWidth="3" strokeLinecap="round" />
			{/* boss + collar */}
			<circle r="30" fill="url(#cw-hub)" stroke="#6b4512" strokeWidth="3" />
			<circle r="21" fill="none" stroke="#fff1c0" strokeOpacity=".65" strokeWidth="2" />
			<circle r="12" fill="url(#cw-brass)" stroke="#6b4512" strokeWidth="2" />
			<rect x="-4" y="-4" width="8" height="8" fill="#3a2410" transform="rotate(45)" />
		</svg>
	);
}

/** A small wind-up key for the toys' backs (spins while the toy walks). */
function ToyKey({ x, y, size = 1 }: { x: number; y: number; size?: number }) {
	return (
		<g transform={`translate(${x} ${y}) scale(${size})`}>
			<rect x="-1.6" y="0" width="3.2" height="9" fill="#8a6326" />
			<g className={s.toyKey}>
				<path d="M0 0 C-4 -6 -12 -9 -14 -4 C-15 0 -12 3 -8 2 C-5 1 -2 -1 0 0 C2 -1 5 1 8 2 C12 3 15 0 14 -4 C12 -9 4 -6 0 0 Z" fill="url(#cw-brass-h)" stroke="#6b4512" strokeWidth=".9" />
			</g>
		</g>
	);
}

/** Pip: a tin mouse in pressed steel with a copper band, rivets and a curly wire tail. */
export function TinMouse() {
	return (
		<svg viewBox="0 0 130 78" className={s.toySvg} aria-hidden focusable="false">
			<ellipse cx="62" cy="72" rx="44" ry="4" fill="#3b2414" opacity=".25" />
			<path d="M14 54 C2 54 -2 40 8 36 C14 34 16 42 12 44" fill="none" stroke="#7a7f86" strokeWidth="2.4" strokeLinecap="round" className={s.mouseTail} />
			<path d="M16 58 C16 34 40 18 70 20 C92 22 110 36 116 52 C118 58 114 62 106 62 L22 62 C18 62 16 60 16 58 Z" fill="url(#cw-steel)" stroke="#4f5660" strokeWidth="1.4" />
			<path d="M44 21 C40 34 40 50 44 62 L56 62 C52 50 52 34 56 20 Z" fill="url(#cw-copper-lin)" />
			{[30, 38, 46].map((y) => (
				<circle key={y} cx="50" cy={y + 4} r="1.4" fill="#f5d2b8" />
			))}
			<path d="M24 50 C40 40 70 36 100 44" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="2" strokeLinecap="round" />
			<circle cx="84" cy="22" r="11" fill="url(#cw-steel)" stroke="#4f5660" strokeWidth="1.2" />
			<circle cx="84" cy="22" r="6.5" fill="#d98f73" />
			<circle cx="104" cy="40" r="3.4" fill="#1b1b1f" />
			<circle cx="105" cy="39" r="1" fill="#fff" />
			<circle cx="117" cy="53" r="3" fill="#c8613a" />
			<path d="M112 52 L126 47 M112 54 L127 54 M112 56 L125 60" stroke="#4f5660" strokeWidth=".9" />
			<g className={s.wheelA}>
				<circle cx="40" cy="64" r="7" fill="#3a3f46" />
				<path d="M33 64 L47 64 M40 57 L40 71" stroke="#9aa1aa" strokeWidth="1.2" />
			</g>
			<g className={s.wheelB}>
				<circle cx="92" cy="64" r="7" fill="#3a3f46" />
				<path d="M85 64 L99 64 M92 57 L92 71" stroke="#9aa1aa" strokeWidth="1.2" />
			</g>
			<ToyKey x={64} y={8} />
		</svg>
	);
}

/** Wren: a tin songbird in cobalt enamel with cream dots and brass legs. */
export function TinBird() {
	return (
		<svg viewBox="0 0 100 100" className={s.toySvg} aria-hidden focusable="false">
			<ellipse cx="50" cy="94" rx="26" ry="3.5" fill="#3b2414" opacity=".25" />
			<g className={s.birdLegs}>
				<path d="M42 70 L40 90 L34 92 M40 90 L44 92" fill="none" stroke="#b8862f" strokeWidth="2.6" strokeLinecap="round" />
				<path d="M56 70 L58 90 L52 92 M58 90 L63 92" fill="none" stroke="#b8862f" strokeWidth="2.6" strokeLinecap="round" />
			</g>
			<path d="M16 52 L2 42 L6 56 L0 64 L18 60 Z" fill="#1f3a7a" stroke="#14204a" strokeWidth="1" />
			<ellipse cx="46" cy="56" rx="32" ry="20" fill="#2c4f96" stroke="#14204a" strokeWidth="1.4" />
			<path d="M50 70 C62 70 74 62 76 52 C68 58 58 62 46 62 Z" fill="#f3e3c8" />
			{[
				[30, 50],
				[40, 46],
				[36, 58],
				[50, 52],
				[24, 58],
			].map(([x, y]) => (
				<circle key={`${x}${y}`} cx={x} cy={y} r="2.2" fill="#f3e3c8" />
			))}
			<g className={s.birdWing}>
				<path d="M26 48 C34 36 52 36 58 48 C50 56 36 58 26 48 Z" fill="#1f3a7a" stroke="#14204a" strokeWidth="1" />
				<path d="M32 48 C38 44 46 44 52 48" fill="none" stroke="#9fb6e6" strokeWidth="1" />
			</g>
			<circle cx="72" cy="38" r="14" fill="#2c4f96" stroke="#14204a" strokeWidth="1.4" />
			<path d="M64 28 C66 20 74 20 76 25" fill="none" stroke="#e0a43c" strokeWidth="2.4" strokeLinecap="round" />
			<circle cx="76" cy="35" r="4" fill="#fff8ec" />
			<circle cx="77" cy="35" r="2.2" fill="#14204a" />
			<path d="M84 38 L97 41 L84 44 Z" fill="url(#cw-brass-lin)" stroke="#6b4512" strokeWidth=".8" />
			<path d="M30 60 C46 66 62 64 72 56" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="1.6" />
			<ToyKey x={44} y={30} size={0.9} />
		</svg>
	);
}

/** Bolt: a copper wind-up robot with a porthole face, lamp eyes, chest dial and an antenna bulb. */
export function TinRobot() {
	return (
		<svg viewBox="0 0 100 130" className={s.toySvg} aria-hidden focusable="false">
			<ellipse cx="50" cy="125" rx="28" ry="3.5" fill="#3b2414" opacity=".25" />
			<g className={s.robotLegL}>
				<rect x="34" y="94" width="11" height="24" rx="3" fill="url(#cw-steel)" stroke="#4f5660" />
				<rect x="30" y="116" width="18" height="7" rx="3" fill="#3a3f46" />
			</g>
			<g className={s.robotLegR}>
				<rect x="55" y="94" width="11" height="24" rx="3" fill="url(#cw-steel)" stroke="#4f5660" />
				<rect x="52" y="116" width="18" height="7" rx="3" fill="#3a3f46" />
			</g>
			<g className={s.robotArmL}>
				<rect x="12" y="62" width="10" height="28" rx="5" fill="url(#cw-copper-lin)" stroke="#5a2610" />
				<circle cx="17" cy="92" r="5" fill="#3a3f46" />
			</g>
			<g className={s.robotArmR}>
				<rect x="78" y="62" width="10" height="28" rx="5" fill="url(#cw-copper-lin)" stroke="#5a2610" />
				<circle cx="83" cy="92" r="5" fill="#3a3f46" />
			</g>
			<rect x="22" y="56" width="56" height="42" rx="8" fill="url(#cw-copper-lin)" stroke="#5a2610" strokeWidth="1.4" />
			<path d="M26 62 L74 62" stroke="#f9c9a4" strokeOpacity=".6" strokeWidth="1.4" />
			<circle cx="50" cy="78" r="11" fill="url(#cw-face)" stroke="#6b4512" strokeWidth="2" />
			<path d="M50 78 L50 70 M50 78 L56 81" stroke="#3b2414" strokeWidth="1.6" strokeLinecap="round" className={s.robotDial} />
			{[28, 72].map((x) => (
				<circle key={x} cx={x} cy="90" r="1.6" fill="#f5d2b8" />
			))}
			<rect x="44" y="48" width="12" height="9" fill="url(#cw-steel)" />
			<rect x="24" y="16" width="52" height="34" rx="10" fill="url(#cw-brass-lin)" stroke="#6b4512" strokeWidth="1.4" />
			<circle cx="50" cy="33" r="14" fill="#1b2a52" stroke="#6b4512" strokeWidth="2.4" />
			<circle cx="44" cy="31" r="3.6" fill="#ffd27a" className={s.robotEye} />
			<circle cx="56" cy="31" r="3.6" fill="#ffd27a" className={s.robotEye} />
			<path d="M44 39 C47 41 53 41 56 39" fill="none" stroke="#ffd27a" strokeWidth="1.6" strokeLinecap="round" />
			<path d="M40 24 C44 21 50 20 54 21" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="1.4" />
			<line x1="50" y1="16" x2="50" y2="6" stroke="#6b4512" strokeWidth="2" />
			<circle cx="50" cy="5" r="4" fill="#f2a55a" className={s.robotBulb} />
			<rect x="18" y="26" width="6" height="12" rx="2" fill="#6b4512" />
			<rect x="76" y="26" width="6" height="12" rx="2" fill="#6b4512" />
			<ToyKey x={84} y={66} size={0.9} />
		</svg>
	);
}

/** Engraved tool marks for the four things you'll do. */
export function ToolMark({ kind }: { kind: 'gears' | 'music' | 'blueprint' | 'key' }) {
	const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
	return (
		<svg viewBox="0 0 64 64" className={s.toolMark} aria-hidden focusable="false">
			{kind === 'gears' ? (
				<>
					<path d={gearOutline(12, 3.4)} transform="translate(24 26)" {...common} />
					<circle cx="24" cy="26" r="5" {...common} />
					<path d={gearOutline(9, 3.4)} transform="translate(44 44) rotate(20)" {...common} />
					<circle cx="44" cy="44" r="3.5" {...common} />
				</>
			) : null}
			{kind === 'music' ? (
				<>
					<rect x="8" y="16" width="34" height="22" rx="11" {...common} />
					{[14, 22, 30].map((x) => (
						<circle key={x} cx={x} cy={x === 22 ? 24 : 30} r="1.6" fill="currentColor" />
					))}
					<path d="M8 44 L42 44 M12 44 L12 50 M18 44 L18 52 M24 44 L24 50 M30 44 L30 53 M36 44 L36 50" {...common} />
					<path d="M50 14 L50 34 M50 14 L58 18" {...common} />
					<ellipse cx="47" cy="35" rx="4" ry="3" fill="currentColor" />
				</>
			) : null}
			{kind === 'blueprint' ? (
				<>
					<path d="M10 14 L46 14 L46 50 L10 50 Z" {...common} />
					<path d="M46 14 C52 14 54 18 54 22 L54 54 C54 50 50 50 46 50" {...common} />
					<circle cx="28" cy="32" r="9" {...common} strokeDasharray="3 3" />
					<path d="M16 22 L40 22 M28 20 L28 44 M16 42 L24 42" {...common} />
				</>
			) : null}
			{kind === 'key' ? (
				<>
					<circle cx="20" cy="22" r="10" {...common} />
					<circle cx="20" cy="22" r="4" {...common} />
					<path d="M27 29 L50 52 M42 44 L48 38 M46 48 L50 44" {...common} />
				</>
			) : null}
		</svg>
	);
}

/** A small brass key: the hidden keys of the mini-game. */
export function BrassKey({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 48 20" className={className} aria-hidden focusable="false">
			<circle cx="9" cy="10" r="7" fill="url(#cw-brass-h)" stroke="#6b4512" strokeWidth="1.4" />
			<circle cx="9" cy="10" r="2.8" fill="#3b2414" />
			<rect x="15" y="8" width="29" height="4" rx="1.2" fill="url(#cw-brass-lin)" stroke="#6b4512" strokeWidth="1" />
			<path d="M36 12 L36 17 L40 17 L40 12 M30 12 L30 15 L33 15 L33 12" fill="url(#cw-brass-lin)" stroke="#6b4512" strokeWidth="1" />
		</svg>
	);
}

/** The Master Clockmaker rosette: a copper gear, cobalt ribbons, a brass centre. */
export function Rosette({ className }: { className?: string }) {
	return (
		<svg viewBox="-70 -70 140 170" className={className} aria-hidden focusable="false">
			<path d="M-22 20 L-40 92 L-24 82 L-14 98 L2 26 Z" fill="#1f3a7a" stroke="#14204a" strokeWidth="1.5" />
			<path d="M22 20 L40 92 L24 82 L14 98 L-2 26 Z" fill="#2c4f96" stroke="#14204a" strokeWidth="1.5" />
			<path d={gearOutline(24, 4.6)} fill="url(#cw-copper)" stroke="#5a2610" strokeWidth="1.2" />
			<circle r="40" fill="none" stroke="#ffd9bd" strokeOpacity=".5" strokeWidth="1.4" />
			<circle r="34" fill="url(#cw-face)" stroke="#8a6326" strokeWidth="2" />
			<circle r="28" fill="none" stroke="#b5562b" strokeWidth="1" strokeDasharray="2 3" />
			<text y="-6" textAnchor="middle" className={s.rosetteSmall} fontSize="8">MASTER</text>
			<text y="8" textAnchor="middle" className={s.rosetteBig} fontSize="12">Clock-</text>
			<text y="21" textAnchor="middle" className={s.rosetteBig} fontSize="12">maker</text>
		</svg>
	);
}

/** A pocket watch, stopped at midnight, for the story compartment. */
export function PocketWatch() {
	return (
		<svg viewBox="0 0 220 280" className={s.watchSvg} role="img" aria-label="Master Wren’s pocket watch, stopped at midnight">
			<path d="M110 10 C90 10 84 30 98 40" fill="none" stroke="url(#cw-brass-h)" strokeWidth="7" strokeLinecap="round" />
			<path d="M110 10 C130 10 136 30 122 40" fill="none" stroke="url(#cw-brass-h)" strokeWidth="7" strokeLinecap="round" />
			<rect x="98" y="36" width="24" height="22" rx="5" fill="url(#cw-brass-h)" stroke="#6b4512" />
			<rect x="102" y="54" width="16" height="10" rx="2" fill="url(#cw-brass-lin)" stroke="#6b4512" />
			<Dial cx={110} cy={160} r={78} maker={false} />
			<g>
				<HourHand cx={110} cy={160} r={78} />
				<MinuteHand cx={110} cy={160} r={78} />
			</g>
			<circle cx="110" cy="160" r="5" fill="url(#cw-brass-h)" stroke="#3b2414" />
			<circle cx="110" cy="196" r="15" fill="none" stroke="#3b2414" strokeWidth="1" />
			<line x1="110" y1="196" x2="110" y2="184" stroke="#b5562b" strokeWidth="1.4" />
			<path d="M60 112 C72 98 92 90 112 90" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="4" strokeLinecap="round" />
		</svg>
	);
}
