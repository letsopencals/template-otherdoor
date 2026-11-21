import type { CSSProperties } from 'react';
import { canopy, fern, liana, monstera, palm, type LeafGeo } from './geometry';
import s from './jaguar.module.css';

/*
 * Hand-made SVG for the Jaguar Temple: layered foliage (monstera, palm, fern), lianas,
 * the canopy seen from below, birds, the carved glyphs and the rolling stone. All ids are
 * prefixed `jt2-` (SVG ids are document-global). Geometry comes from ./geometry (seeded,
 * rounded, hydration-safe).
 */

/* ------------------------------------------------------------------ Shared defs */

/** Gradients shared by every piece. Rendered once at the top of the world. */
export function JungleDefs() {
	return (
		<svg width="0" height="0" className={s.defs} aria-hidden focusable="false">
			<defs>
				{/* Leaf bodies by depth: near (almost a silhouette), mid, lit (catches the torchlight). */}
				<linearGradient id="jt2-near" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="#12291b" />
					<stop offset=".55" stopColor="#08170e" />
					<stop offset="1" stopColor="#030905" />
				</linearGradient>
				<linearGradient id="jt2-mid" x1=".1" y1="0" x2=".9" y2="1">
					<stop offset="0" stopColor="#285c33" />
					<stop offset=".45" stopColor="#123520" />
					<stop offset="1" stopColor="#06170c" />
				</linearGradient>
				<linearGradient id="jt2-lit" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="#4f7330" />
					<stop offset=".45" stopColor="#24461f" />
					<stop offset="1" stopColor="#0b1d0d" />
				</linearGradient>
				<linearGradient id="jt2-gold" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="#5d5a22" />
					<stop offset=".5" stopColor="#2c3517" />
					<stop offset="1" stopColor="#101509" />
				</linearGradient>
				{/* Rim light: moonlight from the upper left in the canopy, torch gold further down. */}
				<linearGradient id="jt2-rim-moon" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="#c9f0d6" stopOpacity=".55" />
					<stop offset=".45" stopColor="#c9f0d6" stopOpacity=".08" />
					<stop offset="1" stopColor="#c9f0d6" stopOpacity="0" />
				</linearGradient>
				<linearGradient id="jt2-rim-gold" x1="1" y1="1" x2="0" y2="0">
					<stop offset="0" stopColor="#ffd36b" stopOpacity=".7" />
					<stop offset=".5" stopColor="#ffd36b" stopOpacity=".1" />
					<stop offset="1" stopColor="#ffd36b" stopOpacity="0" />
				</linearGradient>
				<radialGradient id="jt2-sheen" cx=".32" cy=".28" r=".7">
					<stop offset="0" stopColor="#e9ffd8" stopOpacity=".13" />
					<stop offset=".5" stopColor="#e9ffd8" stopOpacity=".03" />
					<stop offset="1" stopColor="#e9ffd8" stopOpacity="0" />
				</radialGradient>
				{/* One half of a blade turned away from the light. */}
				<linearGradient id="jt2-half" x1="0" y1=".5" x2="1" y2=".5">
					<stop offset="0" stopColor="#000" stopOpacity="0" />
					<stop offset=".48" stopColor="#000" stopOpacity="0" />
					<stop offset=".54" stopColor="#000" stopOpacity=".32" />
					<stop offset="1" stopColor="#000" stopOpacity=".5" />
				</linearGradient>
				<linearGradient id="jt2-vine" x1="0" y1="0" x2="1" y2="0">
					<stop offset="0" stopColor="#1e2c15" />
					<stop offset=".45" stopColor="#4f6230" />
					<stop offset="1" stopColor="#18240f" />
				</linearGradient>
				<linearGradient id="jt2-heart-a" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="#4b8446" />
					<stop offset="1" stopColor="#163b1f" />
				</linearGradient>
				<linearGradient id="jt2-heart-b" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="#2a5a33" />
					<stop offset="1" stopColor="#0b2113" />
				</linearGradient>
				<linearGradient id="jt2-heart-c" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="#7a9a46" />
					<stop offset="1" stopColor="#25461f" />
				</linearGradient>
				<linearGradient id="jt2-metal" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="#fff1b8" />
					<stop offset=".3" stopColor="#f0c94a" />
					<stop offset=".62" stopColor="#b07c12" />
					<stop offset="1" stopColor="#ffe08a" />
				</linearGradient>
				<radialGradient id="jt2-stone" cx=".5" cy=".5" r=".5">
					<stop offset="0" stopColor="#5e5845" />
					<stop offset=".7" stopColor="#433e31" />
					<stop offset="1" stopColor="#2c2922" />
				</radialGradient>
				<radialGradient id="jt2-stone-shade" cx=".34" cy=".3" r=".78">
					<stop offset="0" stopColor="#ffd890" stopOpacity=".32" />
					<stop offset=".34" stopColor="#ffd890" stopOpacity="0" />
					<stop offset=".66" stopColor="#000" stopOpacity=".45" />
					<stop offset="1" stopColor="#000" stopOpacity=".9" />
				</radialGradient>
				<linearGradient id="jt2-canopy" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#020604" />
					<stop offset=".7" stopColor="#06120b" />
					<stop offset="1" stopColor="#0a1a10" />
				</linearGradient>
			</defs>
		</svg>
	);
}

/* ------------------------------------------------------------------ Leaves */

export type LeafKind = 'monstera' | 'palm' | 'fern';
export type LeafTone = 'near' | 'mid' | 'lit' | 'gold';

const GEO = new Map<string, LeafGeo>();
function geo(kind: LeafKind, seed: number): LeafGeo {
	const key = `${kind}:${seed}`;
	let g = GEO.get(key);
	if (!g) {
		g = kind === 'monstera' ? monstera(seed) : kind === 'palm' ? palm(seed) : fern(seed);
		GEO.set(key, g);
	}
	return g;
}

const RIB: Record<LeafTone, string> = {
	near: '#1f3d28',
	mid: '#8fc27a',
	lit: '#c8d98a',
	gold: '#d9c27a',
};

/** One crafted leaf: gradient body, a sheen, a rim light on one edge, midrib and veins. Sways from its stem. */
export function Leaf({ kind, seed, tone = 'mid', rim = 'moon', className, style }: { kind: LeafKind; seed: number; tone?: LeafTone; rim?: 'moon' | 'gold' | 'none'; className?: string; style?: CSSProperties }) {
	const g = geo(kind, seed);
	const solid = kind === 'monstera';
	return (
		<svg viewBox={g.viewBox} className={className} style={{ transformOrigin: g.origin, ...style }} aria-hidden focusable="false">
			<path d={g.blade} fillRule="evenodd" fill={`url(#jt2-${tone})`} />
			{solid ? <path d={g.blade} fillRule="evenodd" fill="url(#jt2-half)" /> : null}
			{solid ? <path d={g.blade} fillRule="evenodd" fill="url(#jt2-sheen)" /> : null}
			{rim !== 'none' ? <path d={g.blade} fillRule="evenodd" fill="none" stroke={`url(#jt2-rim-${rim})`} strokeWidth={solid ? 2.2 : 1.1} /> : null}
			<path d={g.veins} fill="none" stroke={RIB[tone]} strokeOpacity={tone === 'near' ? 0.5 : 0.28} strokeWidth={solid ? 1.1 : 0.7} />
			<path d={g.rib} fill="none" stroke={RIB[tone]} strokeOpacity={tone === 'near' ? 0.7 : 0.55} strokeWidth={solid ? 2.6 : 1.8} strokeLinecap="round" />
		</svg>
	);
}

/* ------------------------------------------------------------------ Liana */

const HEART = 'M0 0C-7-5-15 2-12.5 11C-10 18.5-3.5 23 0 30C3.5 23 10 18.5 12.5 11C15 2 7-5 0 0Z';
const HEART_TONES = ['url(#jt2-heart-a)', 'url(#jt2-heart-b)', 'url(#jt2-heart-c)'];

/** A hanging vine (height in px) with heart leaves on short stalks and curled tendrils. */
export function Liana({ len, seed, className }: { len: number; seed: number; className?: string }) {
	const { vine, leaves, tendrils, height } = liana(len, seed);
	return (
		<svg viewBox={`0 0 80 ${height}`} width="80" height={height} className={className} aria-hidden focusable="false">
			<path d={vine} fill="none" stroke="#050b06" strokeOpacity=".5" strokeWidth="7" strokeLinecap="round" transform="translate(2 3)" />
			<path d={vine} fill="none" stroke="url(#jt2-vine)" strokeWidth="4.6" strokeLinecap="round" />
			<path d={vine} fill="none" stroke="#a9bf6c" strokeOpacity=".32" strokeWidth="1.1" strokeDasharray="3 11" />
			<path d={tendrils} fill="none" stroke="#5b6e33" strokeWidth="1.4" strokeLinecap="round" />
			{leaves.map((l, i) => (
				<g key={i} transform={`translate(${l.x} ${l.y}) rotate(${l.r}) scale(${l.k})`}>
					<path d="M0-6V2" stroke="#3b4f24" strokeWidth="1.6" />
					<path d={HEART} fill={HEART_TONES[l.tone]} />
					<path d="M0 2V27M0 9L-7 6M0 9L7 6M0 16L-8 14M0 16L8 14" stroke="#b5d98c" strokeOpacity=".35" strokeWidth=".8" fill="none" />
					<path d="M-12 10C-11 3-6-2 0 0" stroke="#d8f0b0" strokeOpacity=".25" strokeWidth="1.2" fill="none" />
				</g>
			))}
		</svg>
	);
}

/* ------------------------------------------------------------------ Canopy */

const CANOPY = canopy(17);

/** The canopy from below: black-green leaf masses with moonlit edges; the sky shows only in slivers. */
export function Canopy({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 1440 300" preserveAspectRatio="xMidYMin slice" className={className} aria-hidden focusable="false">
			<path d={CANOPY.mass} fill="url(#jt2-canopy)" />
			<path d={CANOPY.rim} fill="none" stroke="#bfe6cf" strokeOpacity=".22" strokeWidth="1.2" />
		</svg>
	);
}

/** A bird crossing a gap in the canopy (wings flap in CSS). */
export function Bird({ className, style }: { className?: string; style?: CSSProperties }) {
	return (
		<svg viewBox="0 0 40 16" className={className} style={style} aria-hidden focusable="false">
			<path className={s.wingL} d="M20 9C15 3 8 2 1 5C8 5 14 7 18 11Z" />
			<path className={s.wingR} d="M20 9C25 3 32 2 39 5C32 5 26 7 22 11Z" />
			<path d="M17 9.5C18.5 8 21.5 8 23 9.5C21.5 12 18.5 12 17 9.5Z" />
		</svg>
	);
}

/* ------------------------------------------------------------------ Glyphs */

/**
 * Six invented glyphs (original, unreadable), each on a 40×40 box. The sealed door wants
 * three of them in order: sun, serpent, eye (Vance sketched the order in her notebook).
 */
export const GLYPHS: Array<{ name: string; d: string }> = [
	{
		name: 'sun',
		d: 'M20 13a7 7 0 1 0 .1 0Z M20 3v5 M20 32v5 M3 20h5 M32 20h5 M8 8l3.5 3.5 M28.5 28.5L32 32 M32 8l-3.5 3.5 M8 32l3.5-3.5',
	},
	{
		name: 'serpent',
		d: 'M5 30c0-7 7-7 10-3s10 4 10-3-8-9-3-14c3-3 8-2 10 0 M30 6.5h.1',
	},
	{
		name: 'eye',
		d: 'M3 20c7-10 27-10 34 0c-7 10-27 10-34 0Z M20 15a5 5 0 1 0 .1 0Z M20 4v5',
	},
	{ name: 'steps', d: 'M4 34h32 M8 34v-7h24v7 M12 27v-7h16v7 M16 20v-7h8v7' },
	{
		name: 'rain',
		d: 'M5 9h30 M10 15v6 M20 15v10 M30 15v6 M10 27v4 M30 27v4 M20 30v4',
	},
	{
		name: 'paw',
		d: 'M20 22c-6 0-10 5-8 9 2 3 6 2 8 2s6 1 8-2c2-4-2-9-8-9Z M11 15a3 3.5 0 1 0 .1 0Z M17 9a3 3.5 0 1 0 .1 0Z M23 9a3 3.5 0 1 0 .1 0Z M29 15a3 3.5 0 1 0 .1 0Z',
	},
];

/** The answer to the door, as glyph indexes. */
export const DOOR_ORDER = [0, 1, 2] as const;

/** A carved glyph: a dark incision with a lit lower lip; `gold` inlays it. */
export function Glyph({ i, gold = false, className }: { i: number; gold?: boolean; className?: string }) {
	const d = GLYPHS[i % GLYPHS.length]!.d;
	return (
		<svg viewBox="0 0 40 40" className={className} aria-hidden focusable="false" fill="none" strokeLinecap="round" strokeLinejoin="round">
			<path d={d} stroke="#000" strokeOpacity=".6" strokeWidth="3.6" transform="translate(0 -0.8)" />
			<path d={d} stroke={gold ? 'url(#jt2-metal)' : '#d9cfae'} strokeOpacity={gold ? 1 : 0.6} strokeWidth="2.2" />
		</svg>
	);
}

/* ------------------------------------------------------------------ The rolling stone */

const CRACKS = 'M40 70l18 14 9 22-6 18 M120 40l-10 20 4 16 M150 118l-24 6-12 18 M70 160l20-8 22 4 M60 40l8 10';
const SPECKS = Array.from({ length: 70 }, (_, i) => {
	const a = i * 2.39996;
	const rad = 10 + ((i * 37) % 82);
	return {
		x: Math.round((100 + Math.cos(a) * rad) * 10) / 10,
		y: Math.round((100 + Math.sin(a) * rad) * 10) / 10,
		r: 0.7 + (i % 5) * 0.45,
	};
});
/** Weathered blotches (lichen, pits) that sell the scale of the stone. */
const BLOTCHES = Array.from({ length: 9 }, (_, i) => {
	const a = i * 1.9 + 0.4;
	const rad = 26 + ((i * 23) % 50);
	return {
		x: Math.round((100 + Math.cos(a) * rad) * 10) / 10,
		y: Math.round((100 + Math.sin(a) * rad) * 10) / 10,
		rx: 8 + (i % 4) * 5,
		ry: 5 + (i % 3) * 4,
		rot: (i * 47) % 180,
	};
});
/** An irregular, slightly lumpy outline (hand-cut, not a perfect sphere). */
const OUTLINE = (() => {
	const n = 28;
	const pts = Array.from({ length: n }, (_, i) => {
		const a = (i / n) * Math.PI * 2;
		const r = 94 + Math.sin(i * 2.7) * 2.2 + Math.cos(i * 1.3) * 1.6;
		return [Math.round((100 + Math.cos(a) * r) * 10) / 10, Math.round((100 + Math.sin(a) * r) * 10) / 10] as const;
	});
	const mid = (p: readonly [number, number], q: readonly [number, number]) => `${Math.round(((p[0] + q[0]) / 2) * 10) / 10} ${Math.round(((p[1] + q[1]) / 2) * 10) / 10}`;
	let d = `M${mid(pts[n - 1]!, pts[0]!)}`;
	for (let i = 0; i < n; i++) d += `Q${pts[i]![0]} ${pts[i]![1]} ${mid(pts[i]!, pts[(i + 1) % n]!)}`;
	return `${d}Z`;
})();

/** The stone: a carved, cracked surface that spins (`.spin`) under fixed light and shadow. */
export function Boulder({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 200 200" className={className} aria-hidden focusable="false">
			<defs>
				<clipPath id="jt2-boulder-clip">
					<path d={OUTLINE} />
				</clipPath>
			</defs>
			<g className={s.spin}>
				<path d={OUTLINE} fill="url(#jt2-stone)" />
				<g clipPath="url(#jt2-boulder-clip)">
					{BLOTCHES.map((b, i) => (
						<ellipse key={i} cx={b.x} cy={b.y} rx={b.rx} ry={b.ry} transform={`rotate(${b.rot} ${b.x} ${b.y})`} fill={i % 3 ? '#1f1c15' : '#4d5a2c'} fillOpacity={i % 3 ? 0.35 : 0.4} />
					))}
					<circle cx="100" cy="100" r="68" fill="none" stroke="#17150f" strokeOpacity=".7" strokeWidth="10" />
					<circle cx="100" cy="100" r="68" fill="none" stroke="#a89c78" strokeOpacity=".16" strokeWidth="1.6" transform="translate(0 -4)" />
					{[0, 60, 120, 180, 240, 300].map((deg, i) => (
						<g key={deg} transform={`rotate(${deg} 100 100) translate(87 20) scale(.66)`}>
							<path d={GLYPHS[i]!.d} fill="none" stroke="#14120d" strokeOpacity=".85" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
							<path d={GLYPHS[i]!.d} fill="none" stroke="#a89c78" strokeOpacity=".18" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" transform="translate(0 -1.6)" />
						</g>
					))}
					<path d={CRACKS} fill="none" stroke="#100e0a" strokeWidth="1.8" strokeLinecap="round" />
					{SPECKS.map((p, i) => (
						<circle key={i} cx={p.x} cy={p.y} r={p.r} fill={i % 3 ? '#221f18' : '#8d8366'} fillOpacity=".55" />
					))}
				</g>
			</g>
			<path d={OUTLINE} fill="url(#jt2-stone-shade)" />
			<path d={OUTLINE} fill="none" stroke="#000" strokeOpacity=".5" strokeWidth="2" />
		</svg>
	);
}
