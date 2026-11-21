/*
 * Seeded, hydration-safe geometry for the Jaguar Temple's hand-made foliage.
 * Every coordinate is rounded to one decimal so the server and the browser print the
 * same path strings (raw Math.sin/cos differ in the last digit between engines).
 */

export type Pt = [number, number];

export function rng(seed: number) {
	let x = (seed * 9301 + 49297) % 2147483647;
	if (x <= 0) x += 2147483646;
	const next = () => (x = (x * 16807) % 2147483647) / 2147483647;
	for (let i = 0; i < 6; i++) next();
	return next;
}

export const r1 = (n: number) => Math.round(n * 10) / 10;
const fmt = (p: Pt) => `${r1(p[0])} ${r1(p[1])}`;

function quad(a: Pt, b: Pt, c: Pt, t: number): Pt {
	const u = 1 - t;
	return [u * u * a[0] + 2 * u * t * b[0] + t * t * c[0], u * u * a[1] + 2 * u * t * b[1] + t * t * c[1]];
}
function quadD(a: Pt, b: Pt, c: Pt, t: number): Pt {
	return [2 * (1 - t) * (b[0] - a[0]) + 2 * t * (c[0] - b[0]), 2 * (1 - t) * (b[1] - a[1]) + 2 * t * (c[1] - b[1])];
}
function cubic(a: Pt, b: Pt, c: Pt, d: Pt, t: number): Pt {
	const u = 1 - t;
	return [u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]];
}
function cubicD(a: Pt, b: Pt, c: Pt, d: Pt, t: number): Pt {
	const u = 1 - t;
	return [3 * u * u * (b[0] - a[0]) + 6 * u * t * (c[0] - b[0]) + 3 * t * t * (d[0] - c[0]), 3 * u * u * (b[1] - a[1]) + 6 * u * t * (c[1] - b[1]) + 3 * t * t * (d[1] - c[1])];
}
function unit(v: Pt): Pt {
	const l = Math.hypot(v[0], v[1]) || 1;
	return [v[0] / l, v[1] / l];
}
const add = (a: Pt, b: Pt, k = 1): Pt => [a[0] + b[0] * k, a[1] + b[1] * k];

/** A closed outline through points, smoothed with midpoint quadratics. */
function smoothClosed(pts: Pt[]): string {
	if (pts.length < 3) return '';
	const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
	let d = `M${fmt(mid(pts[pts.length - 1]!, pts[0]!))}`;
	for (let i = 0; i < pts.length; i++) {
		const p = pts[i]!;
		const n = pts[(i + 1) % pts.length]!;
		d += `Q${fmt(p)} ${fmt(mid(p, n))}`;
	}
	return `${d}Z`;
}

function ellipse(c: Pt, rx: number, ry: number, deg: number): string {
	const a = (deg * Math.PI) / 180;
	const u: Pt = [Math.cos(a), Math.sin(a)];
	const p1 = add(c, u, -rx);
	const p2 = add(c, u, rx);
	const rot = Math.round(deg);
	return `M${fmt(p1)}A${r1(rx)} ${r1(ry)} ${rot} 1 0 ${fmt(p2)}A${r1(rx)} ${r1(ry)} ${rot} 1 0 ${fmt(p1)}Z`;
}

export interface LeafGeo {
	viewBox: string;
	/** Blade (evenodd: holes and slits cut through). */
	blade: string;
	/** Midrib + petiole. */
	rib: string;
	/** Side veins. */
	veins: string;
	/** Stem point as a fraction of the box (transform-origin for sway). */
	origin: string;
}

/* ------------------------------------------------------------------ Monstera */

/** An asymmetric split-leaf: curved midrib, uneven halves, slits that run along the veins, a few windows. */
export function monstera(seed: number): LeafGeo {
	const rand = rng(seed);
	const bend = (rand() - 0.5) * 70;
	const B: Pt = [120, 288];
	const T: Pt = [120 + bend, 22];
	const C: Pt = [120 + bend * 0.85, 150];
	const W = 100 + rand() * 10;
	const side = { 1: 0.86 + rand() * 0.18, [-1]: 0.86 + rand() * 0.18 } as Record<number, number>;
	const width = (t: number) => W * Math.pow(Math.sin(Math.PI * Math.min(1, (t + 0.1) / 1.1)), 0.8) * (1.08 - 0.32 * t);
	const mid = (t: number) => quad(B, C, T, t);
	const nrm = (t: number): Pt => {
		const d = unit(quadD(B, C, T, t));
		return [-d[1], d[0]];
	};
	const at = (t: number, s: number, f = 1): Pt => add(mid(t), nrm(t), s * width(t) * side[s]! * f);

	const slitsFor = (s: number) => {
		const k = 5 + Math.floor(rand() * 2);
		return Array.from({ length: k }, (_, i) => ({ t: 0.13 + ((i + 0.5) / k) * 0.74 + (rand() - 0.5) * 0.04, depth: 0.5 + rand() * 0.28, s }));
	};
	const R = slitsFor(1);
	const L = slitsFor(-1);

	const edge = (s: number, slits: Array<{ t: number; depth: number }>) => {
		const events: Array<[number, Pt[]]> = [];
		for (let t = 0.02; t <= 0.985; t += 0.022) {
			if (slits.some((sl) => t > sl.t - 0.026 && t < sl.t + 0.018)) continue;
			events.push([t, [at(t, s)]]);
		}
		// Each slit runs inward and down toward the midrib, along its vein.
		for (const sl of slits) events.push([sl.t - 0.02, [at(sl.t - 0.02, s), at(sl.t - 0.056, s, 1 - sl.depth), at(sl.t - 0.047, s, 1 - sl.depth), at(sl.t + 0.012, s)]]);
		events.sort((a, b) => a[0] - b[0]);
		return events.flatMap((e) => e[1]);
	};
	const right = edge(1, R);
	const left = edge(-1, L).reverse();
	const lobeR = add(at(0, 1), [0, 16]);
	const lobeL = add(at(0, -1), [0, 16]);
	const pts: Pt[] = [B, add(B, [side[1]! * 18, 14]), lobeR, ...right, add(T, [0, -4]), ...left, lobeL, add(B, [-side[-1]! * 18, 14])];
	let blade = smoothClosed(pts);

	const holes: string[] = [];
	for (const set of [R, L]) {
		for (let i = 0; i < set.length - 1; i++) {
			if (rand() < 0.4) continue;
			const a = set[i]!;
			const b = set[i + 1]!;
			const t = (a.t + b.t) / 2 - 0.02;
			const c = at(t, a.s, 0.5 + rand() * 0.12);
			const d = quadD(B, C, T, t);
			const deg = (Math.atan2(d[1], d[0]) * 180) / Math.PI + a.s * 55;
			holes.push(ellipse(c, 3.5 + rand() * 3, 7 + rand() * 4, deg));
		}
	}
	blade += holes.join('');

	const veins: string[] = [];
	for (const set of [R, L]) {
		const ts = [0.05, ...set.map((x) => x.t), 0.97];
		for (let i = 0; i < ts.length - 1; i++) {
			const t = (ts[i]! + ts[i + 1]!) / 2;
			const s = set[0]!.s;
			const from = mid(t - 0.05);
			const ctl = at(t - 0.02, s, 0.45);
			const to = at(t + 0.01, s, 0.93);
			veins.push(`M${fmt(from)}Q${fmt(ctl)} ${fmt(to)}`);
		}
	}
	const ribPts = Array.from({ length: 11 }, (_, i) => mid(i / 10));
	const rib = `M${fmt([120, 320])}Q${fmt([120 + bend * 0.05, 304])} ${fmt(B)}` + ribPts.map((p) => `L${fmt(p)}`).join('');
	return { viewBox: '0 0 240 320', blade, rib, veins: veins.join(''), origin: '50% 100%' };
}

/* ------------------------------------------------------------------ Palm frond */

/** A drooping palm frond: arched rachis, strap leaflets that fall away under their own weight. */
export function palm(seed: number): LeafGeo {
	const rand = rng(seed);
	const S: Pt = [14, 306];
	const c1: Pt = [70, 170 + rand() * 30];
	const c2: Pt = [170 + rand() * 30, 60 + rand() * 20];
	const E: Pt = [306, 110 + rand() * 40];
	const blades: string[] = [];
	const veins: string[] = [];
	const n = 24;
	for (let i = 0; i < n; i++) {
		const t = 0.07 + (i / (n - 1)) * 0.9;
		const P = cubic(S, c1, c2, E, t);
		const d = unit(cubicD(S, c1, c2, E, t));
		const base = Math.atan2(d[1], d[0]);
		for (const s of [1, -1]) {
			const ang = base + s * (0.62 + rand() * 0.2) + 0.22 * t;
			const len = 128 * Math.pow(Math.sin(Math.PI * (0.18 + 0.8 * t)), 0.55) * (0.85 + rand() * 0.3) * (s === 1 ? 1 : 0.92);
			const dir: Pt = [Math.cos(ang), Math.sin(ang)];
			const perp: Pt = [-dir[1], dir[0]];
			const droop = len * (0.18 + 0.3 * t);
			const tip: Pt = add(add(P, dir, len), [0, droop]);
			const m: Pt = add(add(P, dir, len * 0.46), [0, droop * 0.22]);
			const w = 3 + len * 0.055;
			blades.push(`M${fmt(P)}Q${fmt(add(m, perp, w))} ${fmt(tip)}Q${fmt(add(m, perp, -w * 0.7))} ${fmt(P)}Z`);
			veins.push(`M${fmt(P)}Q${fmt(m)} ${fmt(tip)}`);
		}
	}
	const rib = `M${fmt(S)}C${fmt(c1)} ${fmt(c2)} ${fmt(E)}`;
	return { viewBox: '0 0 320 320', blade: blades.join(''), rib, veins: veins.join(''), origin: '4% 96%' };
}

/* ------------------------------------------------------------------ Fern */

/** A fern frond: pinnae that are themselves made of rounded lobes, shrinking to a curled tip. */
export function fern(seed: number): LeafGeo {
	const rand = rng(seed);
	const S: Pt = [18, 300];
	const c1: Pt = [60, 150];
	const c2: Pt = [160 + rand() * 30, 40 + rand() * 20];
	const E: Pt = [290, 66 + rand() * 30];
	const blades: string[] = [];
	const veins: string[] = [];
	const n = 20;
	for (let i = 0; i < n; i++) {
		const t = 0.06 + (i / (n - 1)) * 0.9;
		const P = cubic(S, c1, c2, E, t);
		const d = unit(cubicD(S, c1, c2, E, t));
		const base = Math.atan2(d[1], d[0]);
		for (const s of [1, -1]) {
			const ang = base + s * (1.05 - 0.25 * t) + 0.1;
			const len = (1 - t) * 64 + 12;
			const dir: Pt = [Math.cos(ang), Math.sin(ang)];
			const perp: Pt = [-dir[1], dir[0]];
			const lobes = Math.max(3, Math.round(len / 8));
			const pw = len * 0.17 + 2.5;
			const sideA: Pt[] = [];
			const sideB: Pt[] = [];
			for (let j = 0; j <= lobes; j++) {
				const k = j / lobes;
				const w = pw * Math.pow(1 - k, 0.7) * (j % 2 ? 0.62 : 1);
				const q = add(P, dir, len * k);
				sideA.push(add(q, perp, w));
				sideB.push(add(q, perp, -w));
			}
			blades.push(smoothClosed([P, ...sideA.slice(1), add(P, dir, len * 1.04), ...sideB.slice(1).reverse()]));
			veins.push(`M${fmt(P)}L${fmt(add(P, dir, len))}`);
		}
	}
	const rib = `M${fmt(S)}C${fmt(c1)} ${fmt(c2)} ${fmt(E)}`;
	return { viewBox: '0 0 320 320', blade: blades.join(''), rib, veins: veins.join(''), origin: '5% 94%' };
}

/* ------------------------------------------------------------------ Liana */

export interface LianaGeo {
	vine: string;
	leaves: Array<{ x: number; y: number; r: number; k: number; tone: 0 | 1 | 2 }>;
	tendrils: string;
	height: number;
}

/** A hanging vine with heart leaves on short stalks and a few curled tendrils. */
export function liana(len: number, seed: number): LianaGeo {
	const rand = rng(seed);
	const pts: Pt[] = [[40, -12]];
	let y = -12;
	let s = rand() > 0.5 ? 1 : -1;
	while (y < len) {
		y = Math.min(len, y + 80 + rand() * 70);
		s *= -1;
		pts.push([40 + s * (5 + rand() * 13), y]);
	}
	let vine = `M${fmt(pts[0]!)}`;
	for (let i = 1; i < pts.length; i++) {
		const a = pts[i - 1]!;
		const b = pts[i]!;
		const my = (a[1] + b[1]) / 2;
		vine += `C${fmt([a[0], my])} ${fmt([b[0], my])} ${fmt(b)}`;
	}
	const xAt = (yy: number) => {
		const i = Math.max(1, pts.findIndex((p) => p[1] >= yy));
		const a = pts[i - 1]!;
		const b = pts[i] ?? a;
		const t = b[1] === a[1] ? 0 : (yy - a[1]) / (b[1] - a[1]);
		return a[0] + (b[0] - a[0]) * (t * t * (3 - 2 * t));
	};
	const leaves: LianaGeo['leaves'] = [];
	const tendrils: string[] = [];
	let i = 0;
	for (let ly = 26; ly < len - 6; ly += 22 + rand() * 30) {
		const x = xAt(ly);
		const left = i++ % 2 === 0;
		leaves.push({ x: r1(x), y: r1(ly), r: Math.round((left ? 58 : -58) + (rand() - 0.5) * 46), k: r1(0.5 + rand() * 0.55 + (ly / len) * 0.25), tone: rand() > 0.66 ? 2 : rand() > 0.5 ? 1 : 0 });
		if (rand() > 0.82) {
			const dx = left ? -1 : 1;
			tendrils.push(`M${fmt([x, ly])}c${r1(dx * 10)} 4 ${r1(dx * 14)} 16 ${r1(dx * 6)} 20s${r1(-dx * 10)} -6 ${r1(-dx * 4)} -10`);
		}
	}
	return { vine, leaves, tendrils: tendrils.join(''), height: len + 24 };
}

/* ------------------------------------------------------------------ Canopy silhouette */

/** The canopy seen from below: leaf masses heavy at the sides, thin in the middle (the sky slivers). */
export function canopy(seed: number): { mass: string; rim: string } {
	const rand = rng(seed);
	const parts: string[] = [];
	const rims: string[] = [];
	for (let x = -60; x <= 1500; x += 12 + rand() * 18) {
		const edge = Math.min(1, Math.abs(x - 720) / 720); // 0 centre → 1 sides
		const depth = 40 + Math.pow(edge, 1.5) * 200 + rand() * 40;
		// Dense clumps of foliage in the upper band, so the sky only shows through slivers.
		const blobR = 26 + rand() * 30 + edge * 30;
		parts.push(ellipse([x, rand() * depth * 0.35], blobR, blobR * (0.55 + rand() * 0.3), Math.round((rand() - 0.5) * 40)));
		const count = 3 + Math.floor(rand() * 3 + edge * 6);
		for (let j = 0; j < count; j++) {
			const cx = x + (rand() - 0.5) * 50;
			const cy = Math.pow(rand(), 1.4) * depth;
			const L = 30 + rand() * 50 * (0.6 + edge);
			const ang = Math.PI / 2 + (rand() - 0.5) * 1.6;
			const dir: Pt = [Math.cos(ang), Math.sin(ang)];
			const perp: Pt = [-dir[1], dir[0]];
			const w = L * (0.22 + rand() * 0.12);
			const p: Pt = [cx, cy];
			const tip = add(p, dir, L);
			const m = add(p, dir, L * 0.45);
			const leaf = `M${fmt(p)}Q${fmt(add(m, perp, w))} ${fmt(tip)}Q${fmt(add(m, perp, -w))} ${fmt(p)}Z`;
			parts.push(leaf);
			if (rand() > 0.55) rims.push(`M${fmt(add(m, perp, -w * 0.6))}Q${fmt(add(add(m, dir, L * 0.3), perp, -w * 0.5))} ${fmt(tip)}`);
		}
	}
	parts.push('M-60 -10H1500V26C1200 50 900 14 720 22S220 56 -60 30Z');
	return { mass: parts.join(''), rim: rims.join('') };
}

/* ------------------------------------------------------------------ Fireflies */

export function fireflies(count: number, seed: number) {
	const rand = rng(seed);
	return Array.from({ length: count }, () => ({
		x: r1(rand() * 100),
		y: r1(rand() * 100),
		d: r1(5 + rand() * 7),
		o: r1(-rand() * 9),
		s: r1(2 + rand() * 2.6),
		dx: Math.round((rand() - 0.5) * 70),
		dy: Math.round(-20 - rand() * 60),
	}));
}
