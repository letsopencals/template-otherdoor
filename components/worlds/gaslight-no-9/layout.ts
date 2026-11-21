/**
 * The evidence wall as a fixed scene in em units (the wall's font-size scales with the
 * viewport height, so the whole wall scales as one picture). Every document has an
 * authored box and a pin; documents hang from their pin (it is their transform-origin),
 * so the pins never move and the red string is static geometry computed here, on the
 * server, with rounded coordinates (hydration-safe). The browser only draws it in.
 */

export const WALL_H = 54;
const PAD_L = 7;
const PAD_R = 12;
const GAP = 5.5;

export type DocKey = 'intro' | 'paper' | 'telegram' | 'window' | 'plan' | 'desk' | 'ticket' | 'card' | 'note' | 'ex0' | 'ex1' | 'ex2' | 'register' | 'end';

export interface DocBox {
	key: DocKey;
	x: number;
	y: number;
	w: number;
	h: number;
	/** Resting tilt in degrees. */
	r: number;
	/** The pin it hangs from (where the string arrives): x as a fraction of the width, y in em from the top. */
	px: number;
	py: number;
	/** Where the string leaves for the next document (a second pin; often a corner, so the string skirts the text). */
	ox: number;
	oy: number;
}

interface Item {
	key: DocKey;
	dx?: number;
	w: number;
	y: number;
	h: number;
	r: number;
	px?: number;
	py?: number;
	/** Out pin; `oy` negative counts up from the bottom edge. */
	ox?: number;
	oy?: number;
}

interface Column {
	w: number;
	items: Item[];
}

export interface WallScene {
	width: number;
	docs: Record<string, DocBox>;
	order: DocBox[];
	/** One path per string segment, in pin order, with the x-span that draws it. */
	strings: Array<{ d: string; from: number; to: number }>;
	knots: Array<{ x: number; y: number }>;
}

const round = (n: number) => Math.round(n * 100) / 100;

/** Builds the scene for the documents this room actually has (photos may be 0–3; the game master may be missing). */
export function buildWall({ photos, gameMaster, records }: { photos: number; gameMaster: boolean; records: boolean }): WallScene {
	const exhibitSpots: Item[] = [
		{ key: 'ex0', w: 18, y: 5, h: 14, r: -3, px: 0.15, ox: 0.88, oy: -1.4 },
		{ key: 'ex1', dx: 8, w: 18, y: 21.5, h: 14, r: 2.6, px: 0.8, ox: 0.14, oy: -1.4 },
		{ key: 'ex2', dx: 1.5, w: 18, y: 38, h: 14, r: -1.6, px: 0.4, ox: 0.9 },
	];
	const columns: Column[] = [
		{ w: 25, items: [{ key: 'intro', w: 25, y: 15, h: 17.5, r: -1.4, px: 0.5, ox: 0.9 }] },
		{ w: 40, items: [{ key: 'paper', w: 40, y: 6, h: 41, r: -0.8, px: 0.035, py: 0.9, ox: 0.965 }] },
		{
			w: 30,
			items: [
				{ key: 'telegram', w: 30, y: 6, h: 18, r: 1.7, px: 0.035, py: 0.9, ox: 0.82, oy: -1.1 },
				{ key: 'window', dx: 5, w: 21, y: 27.5, h: 23.5, r: -2.2, px: 0.5, ox: 0.9 },
			],
		},
		{ w: 40, items: [{ key: 'plan', w: 40, y: 7, h: 36.5, r: 0.6, px: 0.035, py: 0.9, ox: 0.965 }] },
		{ w: 42, items: [{ key: 'desk', w: 42, y: 10, h: 32, r: -1.2, px: 0.035, py: 0.9, ox: 0.965 }] },
		{ w: 19, items: [{ key: 'ticket', w: 19, y: 5.5, h: 41.5, r: 2.4, py: 1, px: 0.5, ox: 0.5 }] },
	];
	if (gameMaster) {
		columns.push({
			w: 31,
			items: [
				{ key: 'card', w: 29, y: 7, h: 10.5, r: -2, px: 0.04, py: 0.9, ox: 0.93, oy: -0.9 },
				{ key: 'note', dx: 2.5, w: 28.5, y: 23, h: 17, r: 1.3, px: 0.78, ox: 0.93 },
			],
		});
	}
	if (photos > 0) columns.push({ w: 27, items: exhibitSpots.slice(0, Math.min(3, photos)) });
	if (records) columns.push({ w: 23, items: [{ key: 'register', w: 23, y: 14, h: 15.5, r: -1, px: 0.05, py: 0.9, ox: 0.95 }] });
	columns.push({ w: 17, items: [{ key: 'end', w: 17, y: 22, h: 8, r: 2.2, px: 0.15, ox: 0.5, oy: -1.2 }] });

	const docs: Record<string, DocBox> = {};
	const order: DocBox[] = [];
	let cursor = PAD_L;
	for (const col of columns) {
		for (const it of col.items) {
			const py = it.py ?? 1.4;
			const oy = it.oy === undefined ? py : it.oy < 0 ? it.h + it.oy : it.oy;
			const box: DocBox = { key: it.key, x: round(cursor + (it.dx ?? 0)), y: it.y, w: it.w, h: it.h, r: it.r, px: it.px ?? 0.5, py, ox: it.ox ?? it.px ?? 0.5, oy };
			docs[it.key] = box;
			order.push(box);
		}
		cursor += col.w + GAP;
	}
	const width = round(cursor - GAP + PAD_R);

	const ins = order.map((b) => ({ x: round(b.x + b.w * b.px), y: round(b.y + b.py) }));
	// Out pins sit on the tilted document: rotate them about the in pin by the document's tilt.
	const outs = order.map((b, i) => {
		const a = (b.r * Math.PI) / 180;
		const dx = b.w * (b.ox - b.px);
		const dy = b.oy - b.py;
		return { x: round(ins[i]!.x + dx * Math.cos(a) - dy * Math.sin(a)), y: round(ins[i]!.y + dx * Math.sin(a) + dy * Math.cos(a)) };
	});
	const last = outs[outs.length - 1]!;
	// The string runs on past the last pin and drops off the bottom of the wall, towards the warrant.
	const tail = { x: round(last.x + 3), y: WALL_H + 6 };
	const strings: WallScene['strings'] = [];
	const segment = (a: { x: number; y: number }, b: { x: number; y: number }) => {
		const len = Math.hypot(b.x - a.x, b.y - a.y);
		const sag = round(0.5 + len * 0.035);
		const cx = round((a.x + b.x) / 2);
		const cy = round((a.y + b.y) / 2 + sag);
		strings.push({ d: `M${a.x} ${a.y}Q${cx} ${cy} ${b.x} ${b.y}`, from: Math.min(a.x, b.x), to: Math.max(Math.max(a.x, b.x), Math.min(a.x, b.x) + 4) });
	};
	for (let i = 0; i < order.length - 1; i++) segment(outs[i]!, ins[i + 1]!);
	segment(last, tail);
	// Knots: every in pin, plus the out pins that are separate pins.
	const knots: WallScene['knots'] = [];
	const seen = new Set<string>();
	for (let i = 0; i < order.length; i++) {
		for (const k of [ins[i]!, outs[i]!]) {
			const id = `${k.x},${k.y}`;
			if (!seen.has(id)) {
				seen.add(id);
				knots.push(k);
			}
		}
	}
	return { width, docs, order, strings, knots };
}
