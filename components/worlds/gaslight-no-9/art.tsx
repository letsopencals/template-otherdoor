import s from './gaslight.module.css';

/*
 * Hand-made SVG for The Gaslight Affair at No. 9 (original artwork). Ids are prefixed `gl-`.
 * Generated coordinates are rounded (hydration-safe).
 */

function rng(seed: number) {
	let x = seed % 2147483647;
	if (x <= 0) x += 2147483646;
	return () => (x = (x * 16807) % 2147483647) / 2147483647;
}
const r1 = (n: number) => Math.round(n * 10) / 10;

export function GaslightDefs() {
	return (
		<svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden focusable="false">
			<defs>
				<linearGradient id="gl-brass" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="#6e4a14" />
					<stop offset=".35" stopColor="#d9a54a" />
					<stop offset=".5" stopColor="#ffe3a0" />
					<stop offset=".7" stopColor="#b07a26" />
					<stop offset="1" stopColor="#5a3a0e" />
				</linearGradient>
				<radialGradient id="gl-flame" cx=".5" cy=".55" r=".5">
					<stop offset="0" stopColor="#fff6d8" />
					<stop offset=".4" stopColor="#ffd27a" />
					<stop offset="1" stopColor="#d69a3c" stopOpacity="0" />
				</radialGradient>
				<linearGradient id="gl-window-lit" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#ffd98a" />
					<stop offset="1" stopColor="#c47a22" />
				</linearGradient>
				<pattern id="gl-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
					<path d="M0 0V5" stroke="#1a1712" strokeOpacity=".45" strokeWidth="1" />
				</pattern>
				<pattern id="gl-hatch-fine" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
					<path d="M0 0V3" stroke="#1a1712" strokeOpacity=".35" strokeWidth=".6" />
				</pattern>
			</defs>
		</svg>
	);
}

/* ------------------------------------------------------------------ The street (hero) */

const WINDOWS = (() => {
	const rand = rng(1891);
	const out: Array<{ x: number; y: number; lit: boolean; w: number; h: number; curtain: number }> = [];
	const cols = [620, 720, 940, 1040, 1160, 1260, 1360];
	const rows: Array<[number, number]> = [[250, 120], [430, 140]];
	for (const [y, h] of rows) {
		for (const x of cols) out.push({ x, y, h, w: 62, lit: rand() > 0.55, curtain: r1(rand()) });
	}
	for (const x of cols) out.push({ x, y: 140, h: 70, w: 62, lit: rand() > 0.75, curtain: r1(rand()) });
	return out;
})();

const COBBLES = (() => {
	const rand = rng(9);
	const out: Array<{ x: number; y: number; rx: number; ry: number; o: number }> = [];
	for (let row = 0; row < 9; row++) {
		const y = 790 + row * 14;
		const ry = 4 + row * 0.8;
		const rx = 14 + row * 3;
		for (let x = (row % 2) * rx; x < 1460; x += rx * 2.1) out.push({ x: r1(x), y, rx: r1(rx), ry: r1(ry), o: r1(0.25 + rand() * 0.5) });
	}
	return out;
})();

export function StreetScene() {
	return (
		<svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" className={s.street} aria-hidden focusable="false">
			<defs>
				<linearGradient id="gl-sky" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#060b09" />
					<stop offset=".55" stopColor="#14211c" />
					<stop offset="1" stopColor="#24342c" />
				</linearGradient>
				<radialGradient id="gl-moon" cx=".22" cy=".16" r=".35">
					<stop offset="0" stopColor="#dfe6d2" stopOpacity=".55" />
					<stop offset=".2" stopColor="#9fb0a0" stopOpacity=".2" />
					<stop offset="1" stopColor="#9fb0a0" stopOpacity="0" />
				</radialGradient>
				<linearGradient id="gl-stone" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#2b2e28" />
					<stop offset="1" stopColor="#1a1d19" />
				</linearGradient>
				<linearGradient id="gl-wet" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#1b2420" />
					<stop offset="1" stopColor="#0a0e0c" />
				</linearGradient>
				<linearGradient id="gl-reflect" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#ffcf7a" stopOpacity=".55" />
					<stop offset="1" stopColor="#ffcf7a" stopOpacity="0" />
				</linearGradient>
			</defs>
			<rect width="1440" height="900" fill="url(#gl-sky)" />
			<rect width="1440" height="900" fill="url(#gl-moon)" />
			<circle cx="318" cy="142" r="34" fill="#e8ecd9" opacity=".55" />
			{/* distant rooftops and chimneys (the Old Town) */}
			<path d="M0 520L40 470H120V430H150V470H230L270 440L320 470H380V420H400V400H420V470H500L540 450V520Z" fill="#111a16" />
			<path d="M60 430h14v-40h-14zM190 420h10v-30h-10zM450 400h12v-36h-12z" fill="#111a16" />
			<path d="M120 300h8v130h-8zM118 296h12v6h-12z" fill="#16201b" opacity=".8" />
			{/* the terrace */}
			<path d="M560 90H1440V780H560Z" fill="url(#gl-stone)" />
			<path d="M560 90H1440V780H560Z" fill="url(#gl-hatch)" opacity=".35" />
			<path d="M548 82H1440V98H548Z" fill="#33372f" />
			<path d="M548 228H1440V236H548ZM548 408H1440V416H548Z" fill="#33372f" />
			{/* stone courses */}
			{Array.from({ length: 22 }, (_, i) => (
				<path key={i} d={`M560 ${120 + i * 30}H1440`} stroke="#000" strokeOpacity=".22" strokeWidth="1.5" />
			))}
			{WINDOWS.map((w, i) => (
				<g key={i}>
					<rect x={w.x - 6} y={w.y - 6} width={w.w + 12} height={w.h + 12} fill="#3a3d35" />
					<rect x={w.x} y={w.y} width={w.w} height={w.h} fill={w.lit ? 'url(#gl-window-lit)' : '#0d1311'} className={w.lit ? s.windowLit : undefined} style={w.lit ? { animationDelay: `${(i % 5) * -1.3}s` } : undefined} />
					{w.lit ? <rect x={w.x} y={w.y} width={r1(w.w * (0.25 + w.curtain * 0.25))} height={w.h} fill="#5a1e1a" opacity=".85" /> : null}
					<path d={`M${w.x + w.w / 2} ${w.y}V${w.y + w.h}M${w.x} ${r1(w.y + w.h / 2)}H${w.x + w.w}M${w.x} ${r1(w.y + w.h / 4)}H${w.x + w.w}M${w.x} ${r1(w.y + (w.h * 3) / 4)}H${w.x + w.w}`} stroke="#22261f" strokeWidth="3" />
					<rect x={w.x - 10} y={w.y + w.h + 6} width={w.w + 20} height="7" fill="#3f4339" />
				</g>
			))}
			{/* No. 9: the door */}
			<g>
				<path d="M800 780V560A60 60 0 0 1 920 560V780Z" fill="#3a3d35" />
				<path d="M812 560A48 48 0 0 1 908 560Z" fill="url(#gl-window-lit)" className={s.fanlight} />
				<path d="M812 560A48 48 0 0 1 908 560M860 512V560M826 526L860 560M894 526L860 560" stroke="#22261f" strokeWidth="3" fill="none" />
				<rect x="814" y="566" width="92" height="214" fill="#14301f" />
				<rect x="822" y="576" width="34" height="80" fill="none" stroke="#0a1a10" strokeWidth="3" />
				<rect x="864" y="576" width="34" height="80" fill="none" stroke="#0a1a10" strokeWidth="3" />
				<rect x="822" y="670" width="34" height="96" fill="none" stroke="#0a1a10" strokeWidth="3" />
				<rect x="864" y="670" width="34" height="96" fill="none" stroke="#0a1a10" strokeWidth="3" />
				<circle cx="860" cy="664" r="6" fill="url(#gl-brass)" />
				<text x="860" y="551" textAnchor="middle" fontSize="26" fill="#2a1a08" fontFamily="Georgia, serif" fontWeight="700">9</text>
				{/* steps + railings */}
				<path d="M780 780H940V792H780ZM770 792H950V806H770Z" fill="#41453b" />
				{Array.from({ length: 26 }, (_, i) => (
					<path key={i} d={`M${580 + i * 8} 780V700M${952 + i * 8} 780V700`} stroke="#0b0f0d" strokeWidth="2" />
				))}
				<path d="M576 702H788M948 702H1160" stroke="#0b0f0d" strokeWidth="4" />
			</g>
			{/* street */}
			<path d="M0 780H1440V900H0Z" fill="url(#gl-wet)" />
			{COBBLES.map((c, i) => (
				<ellipse key={i} cx={c.x} cy={c.y} rx={c.rx} ry={c.ry} fill="#2a332e" opacity={c.o} />
			))}
			{/* reflections of the lamp and the fanlight on wet stone */}
			<path d="M845 800h30l14 100h-58z" fill="url(#gl-reflect)" opacity=".5" className={s.reflection} />
			<path d="M1150 800h26l18 100h-62z" fill="url(#gl-reflect)" className={s.reflection} />
		</svg>
	);
}

/** The gas lamp (HTML-positioned so it sits right on desktop and phone). */
export function GasLamp() {
	return (
		<svg viewBox="0 0 120 640" className={s.lampSvg} aria-hidden focusable="false">
			<path d="M52 640V170h16v470Z" fill="#0b0f0d" />
			<path d="M44 640h32l-4-30H48Z M46 300h28v10H46Z M48 240h24v8H48Z" fill="#141a17" />
			<path d="M40 170h40l-6-14H46Z" fill="#141a17" />
			<path d="M60 152 30 120H90Z" fill="#141a17" />
			{/* lantern */}
			<path d="M34 120 42 60H78L86 120Z" fill="rgba(255, 214, 140, .22)" stroke="#141a17" strokeWidth="4" />
			<path d="M60 60V120M38 90H82" stroke="#141a17" strokeWidth="2" />
			<ellipse cx="60" cy="94" rx="12" ry="16" fill="url(#gl-flame)" className={s.flame} />
			<path d="M36 60h48l-12-18H48Z" fill="#141a17" />
			<path d="M56 42h8v-12h-8z" fill="#141a17" />
			<path d="M60 230c-26 0-30 16-42 18" stroke="#141a17" strokeWidth="5" fill="none" />
		</svg>
	);
}

/* ------------------------------------------------------------------ Evidence */

/** An ink sketch of the professor: spectacles, side whiskers, cravat. Original, no hat. */
export function ProfessorSketch() {
	return (
		<svg viewBox="0 0 160 190" className={s.sketch} aria-hidden focusable="false">
			<rect width="160" height="190" fill="#e9dfc6" />
			<path d="M20 190C24 150 46 136 80 132C114 136 136 150 140 190Z" fill="#2a2620" />
			<path d="M20 190C24 150 46 136 80 132C114 136 136 150 140 190Z" fill="url(#gl-hatch)" />
			<path d="M64 132L80 168L96 132Z" fill="#f2ead6" />
			<path d="M70 140L80 152L90 140L84 162H76Z" fill="#6e1d1a" />
			<path d="M56 74C56 46 68 34 80 34S104 46 104 74C104 104 94 122 80 122S56 104 56 74Z" fill="#efe4c8" stroke="#2a2620" strokeWidth="2" />
			<path d="M56 74C56 46 68 34 80 34S104 46 104 74" fill="url(#gl-hatch-fine)" opacity=".5" />
			<path d="M58 60C60 40 70 30 82 30C96 30 104 42 104 58C98 46 90 42 80 42C70 42 62 48 58 60Z" fill="#3a332a" />
			<path d="M56 80C54 100 60 112 68 116L64 92Z M104 80C106 100 100 112 92 116L96 92Z" fill="#3a332a" />
			<circle cx="70" cy="76" r="8" fill="none" stroke="#2a2620" strokeWidth="2" />
			<circle cx="90" cy="76" r="8" fill="none" stroke="#2a2620" strokeWidth="2" />
			<path d="M78 76h4M62 74l-6-2M98 74l6-2" stroke="#2a2620" strokeWidth="2" />
			<circle cx="70" cy="77" r="1.8" fill="#2a2620" />
			<circle cx="90" cy="77" r="1.8" fill="#2a2620" />
			<path d="M80 82v12l-4 2M72 104c5 3 11 3 16 0" stroke="#2a2620" strokeWidth="1.6" fill="none" />
		</svg>
	);
}

export function KeySketch() {
	return (
		<svg viewBox="0 0 160 80" className={s.sketchWide} aria-hidden focusable="false">
			<circle cx="34" cy="40" r="22" fill="none" stroke="url(#gl-brass)" strokeWidth="8" />
			<circle cx="34" cy="40" r="8" fill="none" stroke="url(#gl-brass)" strokeWidth="4" />
			<path d="M56 36h88v8H56Z M116 44v16h8V44Z M132 44v12h8V44Z" fill="url(#gl-brass)" />
			<path d="M60 37h80" stroke="#fff3c8" strokeOpacity=".6" strokeWidth="1.5" />
		</svg>
	);
}

export function WatchSketch() {
	return (
		<svg viewBox="0 0 120 140" className={s.sketch} aria-hidden focusable="false">
			<path d="M60 4a8 8 0 1 0 .1 0" fill="none" stroke="url(#gl-brass)" strokeWidth="4" />
			<rect x="52" y="18" width="16" height="10" rx="2" fill="url(#gl-brass)" />
			<circle cx="60" cy="80" r="50" fill="url(#gl-brass)" />
			<circle cx="60" cy="80" r="42" fill="#f4ecd4" />
			{Array.from({ length: 12 }, (_, i) => {
				const a = (i / 12) * Math.PI * 2;
				return <path key={i} d={`M${r1(60 + Math.sin(a) * 34)} ${r1(80 - Math.cos(a) * 34)}L${r1(60 + Math.sin(a) * 39)} ${r1(80 - Math.cos(a) * 39)}`} stroke="#2a2620" strokeWidth={i % 3 ? 1.5 : 3} />;
			})}
			{/* stopped at 11:49 */}
			<path d="M60 80L56.3 59.5" stroke="#2a2620" strokeWidth="3.4" strokeLinecap="round" />
			<path d="M60 80L35.4 70" stroke="#2a2620" strokeWidth="2.2" strokeLinecap="round" />
			<circle cx="60" cy="80" r="3" fill="#2a2620" />
			<path d="M36 64l46 40" stroke="#fff" strokeOpacity=".5" strokeWidth="1" />
		</svg>
	);
}

export function MagnifierPip({ on }: { on: boolean }) {
	return (
		<svg viewBox="0 0 24 24" className={s.pip} data-on={on} aria-hidden focusable="false">
			<circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.4" />
			<path d="M15 15l6 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
		</svg>
	);
}

/** Small engraving of the terrace for the newspaper. */
export function Engraving() {
	return (
		<svg viewBox="0 0 300 180" className={s.engraving} aria-hidden focusable="false">
			<rect width="300" height="180" fill="#efe6cf" />
			<rect width="300" height="180" fill="url(#gl-hatch-fine)" opacity=".5" />
			<path d="M20 30H280V160H20Z" fill="#d9ceb2" stroke="#2a2620" strokeWidth="1.5" />
			<path d="M20 30H280V160H20Z" fill="url(#gl-hatch)" opacity=".7" />
			{[40, 80, 180, 220, 255].map((x) => (
				<g key={x}>
					<rect x={x} y="46" width="20" height="30" fill="#2a2620" />
					<rect x={x} y="94" width="20" height="34" fill="#2a2620" />
				</g>
			))}
			<path d="M132 160V112A18 18 0 0 1 168 112V160Z" fill="#efe6cf" stroke="#2a2620" strokeWidth="1.5" />
			<rect x="137" y="114" width="26" height="46" fill="#2a2620" />
			<text x="150" y="108" textAnchor="middle" fontSize="11" fill="#2a2620" fontFamily="Georgia, serif">9</text>
			<path d="M0 160H300" stroke="#2a2620" strokeWidth="2" />
			<path d="M96 160V100M100 100h-8l4-12z" stroke="#2a2620" strokeWidth="2" fill="#2a2620" />
		</svg>
	);
}

/* ------------------------------------------------------------------ The study (photo fallback) */

export function StudyArt({ variant = 0 }: { variant?: number }) {
	const rand = rng(31 + variant * 7);
	const books = Array.from({ length: 34 }, (_, i) => ({ x: 40 + i * 9 + (i > 16 ? 14 : 0), h: r1(40 + rand() * 26), c: ['#5a1e1a', '#1f3b2d', '#6e4a14', '#2a2620', '#40311f'][i % 5]! }));
	return (
		<svg viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" className={s.studySvg} aria-hidden focusable="false">
			<rect width="600" height="400" fill="#1c2420" />
			<rect width="600" height="400" fill="url(#gl-hatch)" opacity=".25" />
			{/* shelves */}
			{[110, 190].map((y) => (
				<g key={y}>
					{books.map((b, i) => (
						<rect key={i} x={b.x} y={y - b.h} width="8" height={b.h} fill={b.c} />
					))}
					<rect x="30" y={y} width="340" height="8" fill="#3a2a18" />
				</g>
			))}
			{/* window with rain-dark glass */}
			<rect x="420" y="40" width="140" height="200" fill="#0b1210" stroke="#3a2a18" strokeWidth="10" />
			<path d="M490 40V240M420 140H560" stroke="#3a2a18" strokeWidth="6" />
			{/* desk + lamp */}
			<path d="M60 300H420V316H60Z" fill="#4a3220" />
			<path d="M80 316h20v84H80zM380 316h20v84h-20z" fill="#3a2718" />
			<g className={s.studyLamp}>
				<circle cx="330" cy="270" r="90" fill="#ffb84d" opacity=".18" />
				<path d="M310 300h40l-6-10h-28zM326 290v-30" stroke="#6e4a14" strokeWidth="4" fill="#6e4a14" />
				<path d="M306 262h48l-10-26h-28z" fill="#2f5a3a" />
				<ellipse cx="330" cy="262" rx="24" ry="5" fill="#ffd98a" />
			</g>
			<rect x="150" y="286" width="90" height="14" fill="#e9dfc6" transform="rotate(-4 195 293)" />
			{/* clock + fireplace */}
			<circle cx="500" cy="300" r="26" fill="#e9dfc6" stroke="url(#gl-brass)" strokeWidth="6" />
			<path d="M500 300v-16M500 300l10 6" stroke="#2a2620" strokeWidth="2.5" />
			<path d="M440 330h120v70H440z" fill="#2a2620" />
			<path d="M462 400v-44a38 26 0 0 1 76 0v44z" fill="#0b0d0c" />
			<ellipse cx="500" cy="392" rx="28" ry="8" fill="#e2611c" opacity=".7" className={s.studyLamp} />
			<rect width="600" height="400" fill="url(#gl-hatch-fine)" opacity=".18" />
		</svg>
	);
}
