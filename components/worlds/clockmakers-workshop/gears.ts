/**
 * Gear geometry for the Clockmaker's Workshop. Pure functions, no React.
 *
 * Every gear in one train shares a module `m` (pitch radius = teeth × m / 2), so
 * any two gears placed at the sum of their pitch radii mesh. Rotation is a
 * linear function of the master angle `a` (degrees): `rotate(a × k + c)`.
 * Screen coordinates (y down), so a positive angle is clockwise, like CSS.
 *
 * Meshing a child onto a parent along direction φ (from the parent's centre):
 *   k_child = −(N_p / N_c) × k_p
 *   c_child = −(N_p / N_c) × c_p + φ + 180° + (N_p × φ − 180°) / N_c
 * which puts a gap of the child exactly where the parent's tooth sits on the
 * line of centres (gears/mesh-check.mjs in the scratchpad proved it numerically).
 */

const r2 = (n: number) => Math.round(n * 100) / 100;
const rad = (d: number) => (d * Math.PI) / 180;

export interface GearSpec {
	id: string;
	teeth: number;
	/** Root gear only: centre. */
	x?: number;
	y?: number;
	/** Root gear only: speed relative to the master angle (default 1). */
	k?: number;
	/** Mesh with this gear… */
	parent?: string;
	/** …along this direction from the parent's centre, in degrees (0 = right, 90 = down). */
	dir?: number;
	/** Or sit on the same axle as this gear (a compound gear: same speed, different size). */
	axle?: string;
	/** Visual style hint for the renderer. */
	tone?: 'brass' | 'copper' | 'steel';
	spokes?: number;
}

export interface PlacedGear {
	id: string;
	teeth: number;
	x: number;
	y: number;
	/** Pitch radius. */
	r: number;
	/** Outside (tip) radius. */
	ro: number;
	k: number;
	c: number;
	tone: 'brass' | 'copper' | 'steel';
	spokes: number;
}

/** Place a train. Specs must list parents before children. */
export function placeTrain(specs: GearSpec[], m: number): PlacedGear[] {
	const out = new Map<string, PlacedGear>();
	for (const g of specs) {
		const r = (g.teeth * m) / 2;
		const base = { id: g.id, teeth: g.teeth, r, ro: r + m, tone: g.tone ?? 'brass', spokes: g.spokes ?? defaultSpokes(g.teeth) };
		if (g.axle) {
			const a = out.get(g.axle);
			if (!a) throw new Error(`axle ${g.axle} not placed`);
			out.set(g.id, { ...base, x: a.x, y: a.y, k: a.k, c: a.c });
		} else if (g.parent) {
			const p = out.get(g.parent);
			if (!p) throw new Error(`parent ${g.parent} not placed`);
			const phi = g.dir ?? 0;
			const d = p.r + r;
			const ratio = p.teeth / g.teeth;
			const k = -ratio * p.k;
			const c = -ratio * p.c + phi + 180 + (p.teeth * phi - 180) / g.teeth;
			out.set(g.id, { ...base, x: p.x + d * Math.cos(rad(phi)), y: p.y + d * Math.sin(rad(phi)), k, c: ((c % 360) + 360) % 360 });
		} else {
			out.set(g.id, { ...base, x: g.x ?? 0, y: g.y ?? 0, k: g.k ?? 1, c: 0 });
		}
	}
	return [...out.values()].map((g) => ({ ...g, x: r2(g.x), y: r2(g.y), k: Math.round(g.k * 1e6) / 1e6, c: r2(g.c) }));
}

function defaultSpokes(teeth: number) {
	if (teeth < 14) return 0;
	if (teeth < 22) return 4;
	if (teeth < 40) return 5;
	return 6;
}

const pt = (rr: number, a: number) => `${r2(rr * Math.cos(a))} ${r2(rr * Math.sin(a))}`;

/**
 * The toothed outline, centred on 0,0, a tooth centred on angle 0. Tooth
 * thickness is half the circular pitch on the pitch circle; flanks are
 * quadratic curves through the pitch circle (a close, smooth stand-in for the
 * involute at these sizes); tips and roots are arcs.
 */
export function gearOutline(teeth: number, m: number): string {
	const r = (teeth * m) / 2;
	const ro = r + m;
	const rr = r - 1.25 * m;
	const step = (2 * Math.PI) / teeth;
	const halfPitch = step / 4; // half the tooth thickness, as an angle at the pitch circle
	const halfTip = halfPitch * 0.62 * (r / ro);
	const halfRoot = halfPitch * 1.22 * (r / rr);
	let d = '';
	for (let i = 0; i < teeth; i++) {
		const a = i * step;
		const start = a - step / 2;
		if (i === 0) d += `M${pt(rr, start)}`;
		d += `A${r2(rr)} ${r2(rr)} 0 0 1 ${pt(rr, a - halfRoot)}`;
		d += `Q${pt(r * 1.02, a - halfPitch * 1.02)} ${pt(ro, a - halfTip)}`;
		d += `A${r2(ro)} ${r2(ro)} 0 0 1 ${pt(ro, a + halfTip)}`;
		d += `Q${pt(r * 1.02, a + halfPitch * 1.02)} ${pt(rr, a + halfRoot)}`;
		d += `A${r2(rr)} ${r2(rr)} 0 0 1 ${pt(rr, a + step / 2)}`;
	}
	return `${d}Z`;
}

/** Rounded spoke windows (cut out of the web with evenodd), between the rim and the hub. */
export function spokeWindows(teeth: number, m: number, spokes: number): string {
	if (!spokes) return '';
	const r = (teeth * m) / 2;
	const rimIn = r - 1.25 * m - Math.max(3, m * 1.1);
	const hubOut = Math.max(r * 0.3, 7);
	if (rimIn - hubOut < 6) return '';
	const seg = (2 * Math.PI) / spokes;
	const spokeHalf = Math.min(seg * 0.18, (Math.max(3, r * 0.09) / ((rimIn + hubOut) / 2)));
	let d = '';
	for (let i = 0; i < spokes; i++) {
		const a0 = i * seg + spokeHalf + seg * 0.5;
		const a1 = (i + 1) * seg - spokeHalf + seg * 0.5;
		const outerA0 = a0 - spokeHalf * (1 - hubOut / rimIn) * 0.6;
		const outerA1 = a1 + spokeHalf * (1 - hubOut / rimIn) * 0.6;
		d += `M${pt(hubOut, a0)}`;
		d += `L${pt(rimIn, outerA0)}`;
		d += `A${r2(rimIn)} ${r2(rimIn)} 0 0 1 ${pt(rimIn, outerA1)}`;
		d += `L${pt(hubOut, a1)}`;
		d += `A${r2(hubOut)} ${r2(hubOut)} 0 0 0 ${pt(hubOut, a0)}Z`;
	}
	return d;
}

/** Bounding box of a placed train (tip circles), padded. */
export function trainBox(gears: PlacedGear[], pad = 6) {
	const xs = gears.flatMap((g) => [g.x - g.ro, g.x + g.ro]);
	const ys = gears.flatMap((g) => [g.y - g.ro, g.y + g.ro]);
	const x = Math.floor(Math.min(...xs) - pad);
	const y = Math.floor(Math.min(...ys) - pad);
	return { x, y, w: Math.ceil(Math.max(...xs) + pad) - x, h: Math.ceil(Math.max(...ys) + pad) - y };
}
