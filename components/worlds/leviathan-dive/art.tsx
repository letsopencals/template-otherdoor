import s from './leviathan.module.css';

/* Hand-drawn SVG for the Leviathan Dive. Deterministic (no randomness), so server and client agree. */

const range = (n: number) => Array.from({ length: n }, (_, i) => i);
/** Round computed coordinates so server and browser print the same attribute strings. */
const r2 = (n: number) => Math.round(n * 100) / 100;

/** Shared brass gradients, declared once per world. */
export function BrassDefs() {
	return (
		<svg width="0" height="0" className={s.defs} aria-hidden focusable="false">
			<defs>
				<linearGradient id="lv-brass" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#5e4114" />
					<stop offset="0.18" stopColor="#d9b25a" />
					<stop offset="0.34" stopColor="#f6e2a2" />
					<stop offset="0.52" stopColor="#b8862f" />
					<stop offset="0.8" stopColor="#7a5418" />
					<stop offset="1" stopColor="#3d2a0c" />
				</linearGradient>
				<linearGradient id="lv-brass-h" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="#f3dc96" />
					<stop offset="0.35" stopColor="#c19137" />
					<stop offset="0.7" stopColor="#7c561a" />
					<stop offset="1" stopColor="#e6c676" />
				</linearGradient>
				<radialGradient id="lv-glass" cx="0.35" cy="0.3" r="0.8">
					<stop offset="0" stopColor="#bfeee4" stopOpacity="0.9" />
					<stop offset="0.4" stopColor="#2f8a85" />
					<stop offset="1" stopColor="#06262b" />
				</radialGradient>
				<radialGradient id="lv-lamp" cx="0.5" cy="0.5" r="0.5">
					<stop offset="0" stopColor="#fff2c4" />
					<stop offset="0.5" stopColor="#f2b950" />
					<stop offset="1" stopColor="#8a4e12" />
				</radialGradient>
				<linearGradient id="lv-verdigris" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#5fb3a1" stopOpacity="0" />
					<stop offset="1" stopColor="#4f9e8d" stopOpacity="0.55" />
				</linearGradient>
				<linearGradient id="lv-beam" x1="0" y1="0" x2="1" y2="0">
					<stop offset="0" stopColor="#fff3c9" stopOpacity="0.75" />
					<stop offset="1" stopColor="#fff3c9" stopOpacity="0" />
				</linearGradient>
			</defs>
		</svg>
	);
}

/** The brass submarine, side on. Propeller spins, portholes glow, a searchlight reaches ahead. */
export function Submarine({ className }: { className?: string }) {
	const hull = 'M110,190 C110,118 250,86 420,86 C590,86 690,126 722,190 C690,254 590,294 420,294 C250,294 110,262 110,190Z';
	const seams = [230, 330, 430, 530, 630];
	return (
		<svg className={className} viewBox="0 0 900 360" aria-hidden focusable="false">
			<defs>
				<clipPath id="lv-hull-clip">
					<path d={hull} />
				</clipPath>
			</defs>
			{/* searchlight */}
			<path className={s.beam} d="M748,176 L900,96 L900,300 L748,206Z" fill="url(#lv-beam)" />
			{/* tail fins */}
			<path d="M140,160 L60,92 L96,92 L176,150Z" fill="url(#lv-brass-h)" stroke="#3d2a0c" strokeWidth="3" />
			<path d="M140,220 L60,288 L96,288 L176,230Z" fill="url(#lv-brass-h)" stroke="#3d2a0c" strokeWidth="3" />
			{/* propeller */}
			<rect x="66" y="182" width="50" height="16" rx="4" fill="#6b4a1a" />
			<g className={s.prop}>
				<ellipse cx="62" cy="190" rx="10" ry="56" fill="url(#lv-brass-h)" stroke="#3d2a0c" strokeWidth="3" />
				<ellipse cx="62" cy="190" rx="10" ry="56" fill="url(#lv-brass-h)" stroke="#3d2a0c" strokeWidth="3" transform="rotate(60 62 190)" />
				<ellipse cx="62" cy="190" rx="10" ry="56" fill="url(#lv-brass-h)" stroke="#3d2a0c" strokeWidth="3" transform="rotate(120 62 190)" />
				<circle cx="62" cy="190" r="9" fill="#3d2a0c" />
			</g>
			{/* conning tower */}
			<path d="M360,96 L384,34 L478,34 L500,96Z" fill="url(#lv-brass)" stroke="#3d2a0c" strokeWidth="3" />
			<rect x="372" y="26" width="118" height="12" rx="3" fill="#7a5418" stroke="#3d2a0c" strokeWidth="2" />
			<path d="M456,26 L456,-4 L486,-4" fill="none" stroke="#8a6020" strokeWidth="9" strokeLinecap="round" />
			<circle cx="430" cy="64" r="15" fill="#2a1a06" />
			<circle cx="430" cy="64" r="11" fill="url(#lv-lamp)" className={s.portGlow} />
			{range(6).map((i) => (
				<circle key={`t${i}`} cx={392 + i * 16} cy={88} r="2.6" fill="#f3dc96" stroke="#5e4114" strokeWidth="1" />
			))}
			{/* hull */}
			<path d={hull} fill="url(#lv-brass)" stroke="#2f2008" strokeWidth="4" />
			<g clipPath="url(#lv-hull-clip)">
				<rect x="100" y="200" width="640" height="100" fill="url(#lv-verdigris)" />
				{seams.map((x) => (
					<g key={x}>
						<line x1={x} y1="70" x2={x} y2="310" stroke="#3d2a0c" strokeWidth="3" opacity="0.7" />
						<line x1={x + 3} y1="70" x2={x + 3} y2="310" stroke="#f6e2a2" strokeWidth="1.2" opacity="0.5" />
						{range(13).map((j) => (
							<circle key={j} cx={x - 9} cy={94 + j * 16} r="2.6" fill="#f3dc96" stroke="#4a3210" strokeWidth="1" />
						))}
					</g>
				))}
				<path d="M110,190 C300,174 560,174 722,190" fill="none" stroke="#3d2a0c" strokeWidth="3" opacity="0.55" />
				<path d="M110,236 C300,226 560,226 722,236" fill="none" stroke="#3d2a0c" strokeWidth="2" opacity="0.4" />
				<path d="M150,140 C320,112 560,112 700,150" fill="none" stroke="#fff4cc" strokeWidth="6" opacity="0.28" strokeLinecap="round" />
			</g>
			{/* side portholes, warm inside */}
			{[300, 410, 520].map((x) => (
				<g key={x}>
					<circle cx={x} cy="176" r="27" fill="url(#lv-brass-h)" stroke="#2f2008" strokeWidth="3" />
					<circle cx={x} cy="176" r="18" fill="url(#lv-lamp)" className={s.portGlow} />
					<path d={`M${x - 10},${168} a12,12 0 0 1 12,-8`} stroke="#fffbe8" strokeWidth="3" fill="none" opacity="0.8" strokeLinecap="round" />
					{range(8).map((j) => {
						const a = (j / 8) * Math.PI * 2;
						return <circle key={j} cx={r2(x + Math.cos(a) * 23)} cy={r2(176 + Math.sin(a) * 23)} r="2" fill="#3d2a0c" />;
					})}
				</g>
			))}
			{/* the bow eye */}
			<circle cx="684" cy="190" r="44" fill="url(#lv-brass-h)" stroke="#2f2008" strokeWidth="4" />
			<circle cx="684" cy="190" r="32" fill="url(#lv-glass)" stroke="#3d2a0c" strokeWidth="2" />
			<path d="M664,172 a26,26 0 0 1 22,-12" stroke="#e8fffa" strokeWidth="4" fill="none" opacity="0.7" strokeLinecap="round" />
			{/* lamp */}
			<rect x="726" y="180" width="24" height="22" rx="4" fill="#5e4114" />
			<circle cx="748" cy="191" r="10" fill="url(#lv-lamp)" />
			{/* keel pipes */}
			<path d="M220,292 C320,306 520,306 620,292" fill="none" stroke="#6b4a1a" strokeWidth="8" strokeLinecap="round" />
			<path d="M220,292 C320,306 520,306 620,292" fill="none" stroke="#e6c676" strokeWidth="2" opacity="0.6" />
		</svg>
	);
}

/** A curling tentacle with suckers, drawn to slide across the porthole glass. */
export function Tentacle({ className }: { className?: string }) {
	const suckers = range(11).map((i) => {
		const t = i / 10;
		return { x: r2(60 + t * 380 + Math.sin(t * 5) * 8), y: r2(200 - Math.sin(t * Math.PI * 1.3) * 70 + t * 30), r: r2(13 - t * 8) };
	});
	return (
		<svg className={className} viewBox="0 0 560 320" aria-hidden focusable="false">
			<defs>
				<linearGradient id="lv-tent" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="#6c2f4a" />
					<stop offset="0.6" stopColor="#3b1a33" />
					<stop offset="1" stopColor="#1c0d1d" />
				</linearGradient>
			</defs>
			<path
				d="M0,250 C80,230 120,130 230,120 C330,110 360,190 420,190 C470,190 500,150 500,120 C500,95 480,84 466,92 C452,100 458,120 472,118 C486,116 488,96 476,96 C500,110 500,150 470,170 C440,190 400,214 330,214 C260,214 220,170 170,190 C120,210 90,290 0,320Z"
				fill="url(#lv-tent)"
			/>
			<path d="M0,250 C80,230 120,130 230,120 C330,110 360,190 420,190" fill="none" stroke="#a45a74" strokeWidth="5" opacity="0.5" strokeLinecap="round" />
			{suckers.map((c, i) => (
				<g key={i}>
					<circle cx={c.x} cy={r2(c.y + 22)} r={c.r} fill="#d79aa8" stroke="#5a2440" strokeWidth="2" />
					<circle cx={c.x} cy={r2(c.y + 22)} r={r2(c.r * 0.45)} fill="#8e4a62" />
				</g>
			))}
		</svg>
	);
}

/** The view from inside the porthole when the store has no photo: the trench floor and its lights. */
export function TrenchView({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustration: the trench floor seen through the porthole">
			<defs>
				<radialGradient id="lv-trench" cx="0.5" cy="0.25" r="0.9">
					<stop offset="0" stopColor="#1f6e70" />
					<stop offset="0.5" stopColor="#0b3238" />
					<stop offset="1" stopColor="#020b0f" />
				</radialGradient>
				<radialGradient id="lv-glow" cx="0.5" cy="0.5" r="0.5">
					<stop offset="0" stopColor="#9ffff0" />
					<stop offset="1" stopColor="#9ffff0" stopOpacity="0" />
				</radialGradient>
			</defs>
			<rect width="400" height="400" fill="url(#lv-trench)" />
			<path d="M140,0 L80,400 L320,400 L250,0Z" fill="#bff6ea" opacity="0.06" />
			{/* ruined arches of a drowned harbour */}
			<path d="M40,330 L40,250 Q80,200 120,250 L120,330Z M150,330 L150,270 Q180,236 210,270 L210,330Z" fill="#0a2a2f" stroke="#164a4d" strokeWidth="3" />
			<path d="M0,340 C60,320 120,350 200,330 C280,310 340,340 400,325 L400,400 L0,400Z" fill="#05181c" />
			{/* kelp */}
			{[250, 280, 330, 360].map((x, i) => (
				<path key={x} className={s.kelp} style={{ animationDelay: `${i * -1.3}s` }} d={`M${x},400 C${x - 20},350 ${x + 20},310 ${x},260 C${x - 16},230 ${x + 10},200 ${x - 4},${170 + i * 10}`} fill="none" stroke="#2c6b4c" strokeWidth="7" strokeLinecap="round" />
			))}
			{/* jelly */}
			<g className={s.jellyBob}>
				<circle cx="290" cy="120" r="40" fill="url(#lv-glow)" opacity="0.6" />
				<path d="M262,124 Q290,74 318,124 Q304,118 290,124 Q276,118 262,124Z" fill="#8ff3e3" opacity="0.85" />
				{[268, 280, 292, 304, 314].map((x, i) => (
					<path key={x} d={`M${x},124 q${i % 2 ? 6 : -6},20 0,40 q${i % 2 ? -6 : 6},18 0,34`} stroke="#8ff3e3" strokeWidth="2" fill="none" opacity="0.7" />
				))}
			</g>
			{/* plankton */}
			{range(24).map((i) => (
				<circle key={i} className={s.twinkle} style={{ animationDelay: `${(i % 7) * -0.6}s` }} cx={(i * 97) % 400} cy={(i * 61) % 300} r={(i % 3) + 1} fill="#c9fff6" />
			))}
		</svg>
	);
}

/** A glowing jellyfish for the abyss layer. */
export function Jelly({ hue = '#8ff3e3', className, style }: { hue?: string; className?: string; style?: React.CSSProperties }) {
	return (
		<svg className={className} style={style} viewBox="0 0 120 220" aria-hidden focusable="false">
			<defs>
				<radialGradient id={`lv-jg-${hue.slice(1)}`} cx="0.5" cy="0.4" r="0.6">
					<stop offset="0" stopColor={hue} stopOpacity="0.9" />
					<stop offset="1" stopColor={hue} stopOpacity="0" />
				</radialGradient>
			</defs>
			<circle cx="60" cy="50" r="58" fill={`url(#lv-jg-${hue.slice(1)})`} opacity="0.55" />
			<path d="M18,58 Q60,-6 102,58 Q90,50 80,58 Q70,50 60,58 Q50,50 40,58 Q30,50 18,58Z" fill={hue} opacity="0.8" />
			<path d="M30,50 Q60,14 90,50" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.5" />
			{[28, 42, 56, 70, 84, 96].map((x, i) => (
				<path key={x} d={`M${x},58 q${i % 2 ? 8 : -8},30 0,60 q${i % 2 ? -8 : 8},30 0,60`} stroke={hue} strokeWidth="2" fill="none" opacity="0.6" />
			))}
		</svg>
	);
}

/** Anglerfish with a lure that breathes light. */
export function Angler({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 260 160" aria-hidden focusable="false">
			<path d="M40,90 C40,40 110,24 170,44 C200,54 220,74 226,92 C214,118 180,136 130,136 C80,136 40,124 40,90Z" fill="#0b1d22" stroke="#1d4448" strokeWidth="2" />
			<path d="M40,90 L4,60 L10,92 L4,124Z" fill="#0b1d22" stroke="#1d4448" strokeWidth="2" />
			<path d="M226,92 L170,102 L226,108" fill="#020a0c" />
			{[176, 188, 200, 212].map((x) => (
				<path key={x} d={`M${x},100 l5,8 l5,-8`} fill="#d9f2ea" />
			))}
			<circle cx="178" cy="70" r="7" fill="#d9f2ea" />
			<circle cx="180" cy="70" r="3" fill="#020a0c" />
			<path d="M160,44 C170,10 220,0 240,22" fill="none" stroke="#1d4448" strokeWidth="3" />
			<circle className={s.lure} cx="240" cy="26" r="9" fill="#f9ffd0" />
		</svg>
	);
}

/** A gauge face with ticks; the needle is drawn separately so CSS can turn it. */
export function GaugeFace({ ticks = 40, major = 5, label }: { ticks?: number; major?: number; label?: string }) {
	return (
		<svg viewBox="0 0 200 200" className={s.gaugeFace} aria-hidden focusable="false">
			<circle cx="100" cy="100" r="98" fill="url(#lv-brass-h)" />
			<circle cx="100" cy="100" r="88" fill="#2a1d08" />
			<circle cx="100" cy="100" r="84" fill="#f1e6c8" />
			<circle cx="100" cy="100" r="84" fill="none" stroke="#c9b27a" strokeWidth="1" />
			{range(ticks + 1).map((i) => {
				const a = ((-130 + (i / ticks) * 260) * Math.PI) / 180;
				const big = i % major === 0;
				const r1 = big ? 64 : 70;
				return <line key={i} x1={r2(100 + Math.sin(a) * r1)} y1={r2(100 - Math.cos(a) * r1)} x2={r2(100 + Math.sin(a) * 78)} y2={r2(100 - Math.cos(a) * 78)} stroke="#2a1d08" strokeWidth={big ? 2.4 : 1} />;
			})}
			<path d="M42,146 A76,76 0 0 0 66,166" stroke="#a8322a" strokeWidth="6" fill="none" />
			{label ? (
				<text x="100" y="138" textAnchor="middle" className={s.gaugeLabel}>
					{label}
				</text>
			) : null}
			{range(10).map((i) => {
				const a = (i / 10) * Math.PI * 2;
				return <circle key={i} cx={r2(100 + Math.cos(a) * 93)} cy={r2(100 + Math.sin(a) * 93)} r="2.4" fill="#4a3210" />;
			})}
		</svg>
	);
}

/** A loudspeaker grille for the game master's voice. */
export function Speaker({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 220 220" aria-hidden focusable="false">
			<circle cx="110" cy="110" r="106" fill="url(#lv-brass-h)" stroke="#2f2008" strokeWidth="3" />
			<circle cx="110" cy="110" r="84" fill="#1c1406" />
			{range(9).map((i) => {
				const y = 46 + i * 16;
				const half = r2(Math.sqrt(Math.max(0, 80 * 80 - (y - 110) * (y - 110))) - 8);
				return <rect key={i} x={110 - half} y={y - 4} width={half * 2} height="7" rx="3.5" fill="url(#lv-brass)" />;
			})}
			{range(12).map((i) => {
				const a = (i / 12) * Math.PI * 2;
				return <circle key={i} cx={r2(110 + Math.cos(a) * 96)} cy={r2(110 + Math.sin(a) * 96)} r="3.4" fill="#3d2a0c" />;
			})}
		</svg>
	);
}
