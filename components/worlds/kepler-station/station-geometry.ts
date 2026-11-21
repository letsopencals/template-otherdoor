import { RING_SEGMENTS } from './mission';

/**
 * The ring station as geometry: 32 hull segments on a torus-like ring, four
 * truss spokes and a central spindle, projected with a fixed tilt and a touch of
 * perspective. `frame(rot)` returns everything the SVG needs for one rotation
 * angle, already painter-sorted and split into the parts behind and in front of
 * the hub. All numbers are rounded to one decimal (hydration and DOM churn).
 */

export const VB_W = 800;
export const VB_H = 620;
export const CX = 400;
export const CY = 318;
const RO = 322;
const RI = 290;
const H = 32;
const TILT = 1.04;
const CT = Math.cos(TILT);
const ST = Math.sin(TILT);
const F = 2400;
const GAP = 0.011;
const SEG = (Math.PI * 2) / RING_SEGMENTS;

const r1 = (n: number) => Math.round(n * 10) / 10;

type V = [number, number, number];

function proj(r: number, phi: number, z: number): V {
	const x = r * Math.cos(phi);
	const y = r * Math.sin(phi);
	const d = y * ST + z * CT;
	const k = F / (F - d);
	return [CX + x * k, CY + (y * CT - z * ST) * k, d];
}

/** Hub parts don't rotate in shape (they're cylinders); their screen y for a height z. */
export function hubY(z: number): number {
	return r1(CY - z * ST);
}
export const HUB_RY = (r: number) => r1(r * CT);

const LX = -0.5;
const LY = -0.58;
const LD = 0.64;

function shade(nx: number, ny: number, nd: number, tint: 'hull' | 'inner' | 'top'): string {
	const lam = Math.max(0, nx * LX + ny * LY + nd * LD);
	const b = Math.min(1, 0.1 + lam * 0.95);
	const dark = tint === 'inner' ? [8, 14, 30] : [7, 10, 24];
	const lit = tint === 'top' ? [178, 188, 204] : tint === 'inner' ? [96, 128, 150] : [150, 160, 178];
	const c = dark.map((v, i) => Math.round(v + ((lit[i] ?? v) - v) * b));
	return `rgb(${c[0]},${c[1]},${c[2]})`;
}

const pt = (v: V) => `${r1(v[0])} ${r1(v[1])}`;

export interface Face {
	d: string;
	fill: string;
	seg: number;
	light: string;
	lightColor: string;
	depth: number;
}

export interface Frame {
	back: Face[];
	front: Face[];
	spokesBack: string;
	spokesFront: string;
	shuttle: { d: string; cap: string; front: boolean };
	dots: Array<{ x: number; y: number; o: number }>;
	debris: string;
	hot: Record<number, { x: number; y: number; back: boolean }>;
}

/** Window light colour for a lit segment, or '' if dark. */
function windowColor(i: number): string {
	if (i === 0 || i === 1 || i === 31) return '#ffb257';
	if (i >= 6 && i <= 10) return '#7dffb1';
	if (i >= 19 && i <= 23) return '#ffd59a';
	if (i % 5 === 2) return '#6fe7ef';
	return '';
}

export const BREACH = 13;
export const HOT_SEGMENTS = [0, 8, 13, 21];

export function frame(rot: number, debrisT = 0): Frame {
	const faces: Face[] = [];
	for (let i = 0; i < RING_SEGMENTS; i++) {
		if (i === BREACH) continue;
		const a0 = rot + i * SEG + GAP;
		const a1 = rot + (i + 1) * SEG - GAP;
		const am = (a0 + a1) / 2;
		const sm = Math.sin(am);
		const cm = Math.cos(am);
		const wc = windowColor(i);
		// outer wall (faces outwards: visible on the near half)
		if (sm > -0.06) {
			const p = [proj(RO, a0, -H / 2), proj(RO, a1, -H / 2), proj(RO, a1, H / 2), proj(RO, a0, H / 2)];
			const seam = [proj(RO, a0, -H / 2 + 9), proj(RO, a1, -H / 2 + 9)];
			faces.push({
				d: `M${pt(p[0]!)}L${pt(p[1]!)}L${pt(p[2]!)}L${pt(p[3]!)}ZM${pt(seam[0]!)}L${pt(seam[1]!)}`,
				fill: shade(cm, sm * CT, sm * ST, 'hull'),
				seg: i,
				light: wc ? `M${pt(proj(RO + 0.6, a0 + 0.028, 6))}L${pt(proj(RO + 0.6, a1 - 0.028, 6))}` : '',
				lightColor: wc,
				depth: (p[0]![2] + p[1]![2] + p[2]![2] + p[3]![2]) / 4,
			});
		}
		// inner wall (faces the hub: visible on the far half, seen across the ring)
		if (sm < 0.06) {
			const p = [proj(RI, a0, -H / 2), proj(RI, a1, -H / 2), proj(RI, a1, H / 2), proj(RI, a0, H / 2)];
			faces.push({
				d: `M${pt(p[0]!)}L${pt(p[1]!)}L${pt(p[2]!)}L${pt(p[3]!)}Z`,
				fill: shade(-cm, -sm * CT, -sm * ST, 'inner'),
				seg: i,
				light: wc && i % 2 === 0 ? `M${pt(proj(RI - 0.6, a0 + 0.05, 2))}L${pt(proj(RI - 0.6, a1 - 0.05, 2))}` : '',
				lightColor: wc,
				depth: (p[0]![2] + p[1]![2] + p[2]![2] + p[3]![2]) / 4 - 2,
			});
		}
		// top face, always visible from this tilt
		{
			const p = [proj(RI, a0, H / 2), proj(RO, a0, H / 2), proj(RO, a1, H / 2), proj(RI, a1, H / 2)];
			const mid = (RO + RI) / 2;
			const seam = [proj(mid, a0, H / 2), proj(mid, a1, H / 2)];
			faces.push({
				d: `M${pt(p[0]!)}L${pt(p[1]!)}L${pt(p[2]!)}L${pt(p[3]!)}ZM${pt(seam[0]!)}L${pt(seam[1]!)}`,
				fill: shade(0, -ST, CT, 'top'),
				seg: i,
				light: '',
				lightColor: '',
				depth: (p[0]![2] + p[1]![2] + p[2]![2] + p[3]![2]) / 4 + 1,
			});
		}
	}
	faces.sort((a, b) => a.depth - b.depth);
	const back = faces.filter((f) => f.depth < 0);
	const front = faces.filter((f) => f.depth >= 0);

	// spokes: two rails and a zigzag brace
	let sb = '';
	let sf = '';
	for (let k = 0; k < 4; k++) {
		const a = rot + k * (Math.PI / 2) + Math.PI / 4;
		const from = 30;
		const to = RI - 2;
		let d = `M${pt(proj(from, a, 6))}L${pt(proj(to, a, 6))}M${pt(proj(from, a, -6))}L${pt(proj(to, a, -6))}M${pt(proj(from, a, 6))}`;
		const steps = 12;
		for (let j = 1; j <= steps; j++) {
			const r = from + ((to - from) * j) / steps;
			d += `L${pt(proj(r, a, j % 2 ? -6 : 6))}`;
		}
		if (Math.sin(a) < 0) sb += d;
		else sf += d;
	}

	// the docked shuttle on segment 0
	const as = rot + 0.5 * SEG;
	const s0 = proj(RO + 2, as, 4);
	const s1 = proj(RO + 62, as, 4);
	const shuttle = { d: `M${pt(s0)}L${pt(s1)}`, cap: pt(proj(RO + 66, as, 4)), front: Math.sin(as) >= -0.02 };

	// lit windows on the command drum
	const dots = Array.from({ length: 12 }, (_, j) => {
		const a = rot + (j / 12) * Math.PI * 2;
		const v = proj(54, a, 47);
		const s = Math.sin(a);
		return { x: r1(v[0]), y: r1(v[1]), o: s > 0 ? r1(0.35 + 0.65 * s) : 0 };
	});

	// debris trailing out of the breach
	const ab = rot + (BREACH + 0.5) * SEG;
	let debris = '';
	for (let j = 0; j < 9; j++) {
		const t = (debrisT * 0.06 + j / 9) % 1;
		const spread = ((j * 37) % 11) / 11 - 0.5;
		const v = proj(RO - 10 + t * 160, ab + spread * 0.12 - t * 0.08, spread * 40 + t * 20);
		const sz = (1 - t) * 4 + 1.2;
		debris += `M${r1(v[0])} ${r1(v[1] - sz)}l${r1(sz)} ${r1(sz * 1.4)}l${r1(-sz * 1.8)} ${r1(-sz * 0.3)}Z`;
	}

	const hot: Frame['hot'] = {};
	for (const seg of HOT_SEGMENTS) {
		const a = rot + (seg + 0.5) * SEG;
		const v = proj(RO + 18, a, H / 2 + 10);
		hot[seg] = { x: r1(v[0]), y: r1(v[1]), back: Math.sin(a) < -0.12 };
	}

	return { back, front, spokesBack: sb, spokesFront: sf, shuttle, dots, debris, hot };
}

/** The rotation that brings a segment to the front (nearest the viewer), closest to `from`. */
export function rotationFor(seg: number, from: number): number {
	const base = Math.PI / 2 - (seg + 0.5) * SEG;
	const turns = Math.round((from - base) / (Math.PI * 2));
	return base + turns * Math.PI * 2;
}
