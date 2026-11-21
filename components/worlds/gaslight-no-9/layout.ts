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
	/** Pin, x as a fraction of the width, y in em from the top. */
	px: number;
	py: number;
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
		{ key: 'ex0', w: 18, y: 4, h: 15.5, r: -3 },
		{ key: 'ex1', dx: 8, w: 18, y: 20.5, h: 15.5, r: 2.6 },
		{ key: 'ex2', dx: 1.5, w: 18, y: 37, h: 15.5, r: -1.6 },
	];
	const columns: Column[] = [
		{ w: 25, items: [{ key: 'intro', w: 25, y: 13, h: 26, r: -1.4 }] },
		{ w: 40, items: [{ key: 'paper', w: 40, y: 3, h: 48, r: -0.8 }] },
		{
			w: 30,
			items: [
				{ key: 'telegram', w: 30, y: 4.5, h: 20, r: 1.7 },
				{ key: 'window', dx: 5, w: 21, y: 27.5, h: 25, r: -2.2 },
			],
		},
		{ w: 40, items: [{ key: 'plan', w: 40, y: 4, h: 46, r: 0.6 }] },
		{ w: 42, items: [{ key: 'desk', w: 42, y: 8, h: 35, r: -1.2 }] },
		{ w: 19, items: [{ key: 'ticket', w: 19, y: 4, h: 46, r: 2.4, py: 1.6 }] },
	];
	if (gameMaster) {
		columns.push({
			w: 31,
			items: [
				{ key: 'card', w: 29, y: 5, h: 16.5, r: -2 },
				{ key: 'note', dx: 2.5, w: 28.5, y: 25.5, h: 25, r: 1.3 },
			],
		});
	}
	if (photos > 0) columns.push({ w: 27, items: exhibitSpots.slice(0, Math.min(3, photos)) });
	if (records) columns.push({ w: 23, items: [{ key: 'register', w: 23, y: 11, h: 29, r: -1 }] });
	columns.push({ w: 17, items: [{ key: 'end', w: 17, y: 20, h: 13, r: 2.2 }] });

	const docs: Record<string, DocBox> = {};
	const order: DocBox[] = [];
	let cursor = PAD_L;
	for (const col of columns) {
		for (const it of col.items) {
			const box: DocBox = { key: it.key, x: round(cursor + (it.dx ?? 0)), y: it.y, w: it.w, h: it.h, r: it.r, px: it.px ?? 0.5, py: it.py ?? 1.4 };
			docs[it.key] = box;
			order.push(box);
		}
		cursor += col.w + GAP;
	}
	const width = round(cursor - GAP + PAD_R);

	const pins = order.map((b) => ({ x: round(b.x + b.w * b.px), y: round(b.y + b.py) }));
	const last = pins[pins.length - 1]!;
	// The string runs on past the last pin and drops off the bottom of the wall, towards the warrant.
	const tail = { x: round(last.x + 4), y: WALL_H + 6 };
	const points = [...pins, tail];
	const strings: WallScene['strings'] = [];
	for (let i = 0; i < points.length - 1; i++) {
		const a = points[i]!;
		const b = points[i + 1]!;
		const len = Math.hypot(b.x - a.x, b.y - a.y);
		const sag = round(1.2 + len * 0.07);
		const cx = round((a.x + b.x) / 2);
		const cy = round(Math.max(a.y, b.y) + sag);
		strings.push({ d: `M${a.x} ${a.y}Q${cx} ${cy} ${b.x} ${b.y}`, from: Math.min(a.x, b.x), to: Math.max(Math.max(a.x, b.x), Math.min(a.x, b.x) + 4) });
	}
	return { width, docs, order, strings, knots: pins };
}
