'use client';

import { useMemo, useState } from 'react';
import { E, GRID, GRID_SCRAMBLE, GRID_SOLVED, N, S, W } from './mission';
import { useMission } from './mission-state';
import { LifeSupport } from './life-support';
import s from './power.module.css';

const rotMask = (m: number, q: number) => {
	let v = m;
	for (let i = 0; i < ((q % 4) + 4) % 4; i++) v = ((v << 1) | (v >> 3)) & 15;
	return v;
};

const DIRS = [
	{ bit: N, dc: 0, dr: -1, opp: S },
	{ bit: E, dc: 1, dr: 0, opp: W },
	{ bit: S, dc: 0, dr: 1, opp: N },
	{ bit: W, dc: -1, dr: 0, opp: E },
];

/** Which tiles carry power from the reactor (west of the source tile), and whether it reaches life support. */
function flood(masks: number[][]) {
	const lit = new Set<string>();
	const { source, sink } = GRID;
	if (!(masks[source.row]![source.col]! & W)) return { lit, done: false };
	const q: Array<[number, number]> = [[source.col, source.row]];
	lit.add(`${source.col},${source.row}`);
	while (q.length) {
		const [c, r] = q.shift()!;
		const m = masks[r]![c]!;
		for (const d of DIRS) {
			if (!(m & d.bit)) continue;
			const nc = c + d.dc;
			const nr = r + d.dr;
			if (nc < 0 || nr < 0 || nc >= GRID.cols || nr >= GRID.rows) continue;
			if (!(masks[nr]![nc]! & d.opp)) continue;
			const k = `${nc},${nr}`;
			if (lit.has(k)) continue;
			lit.add(k);
			q.push([nc, nr]);
		}
	}
	const done = lit.has(`${sink.col},${sink.row}`) && Boolean(masks[sink.row]![sink.col]! & E);
	return { lit, done };
}

/** One conduit tile, drawn solved; the button rotates it by quarter turns. */
function Conduit({ mask }: { mask: number }) {
	const arms = [
		mask & N ? 'M50 50V0' : '',
		mask & E ? 'M50 50H100' : '',
		mask & S ? 'M50 50V100' : '',
		mask & W ? 'M50 50H0' : '',
	].join('');
	return (
		<svg viewBox="0 0 100 100" className={s.conduit} aria-hidden>
			<path d={arms} className={s.pipeOuter} />
			<path d={arms} className={s.pipeInner} />
			<path d={arms} className={s.pipeFlow} />
			<circle cx="50" cy="50" r="13" className={s.joint} />
			<circle cx="50" cy="50" r="5" className={s.jointCore} />
		</svg>
	);
}

/**
 * RESTORE POWER. Deck 2's junction board: turn the conduit tiles (tap or
 * Enter/Space; each turns a quarter) until the reactor's power reaches life
 * support, then throw the main bus lever. The life-support gauge climbs and the
 * lights come back across the whole page. Optional: "Bypass" does it for you,
 * and nothing here gates the booking panel.
 */
export function PowerGrid() {
	const { power, restore } = useMission();
	const [turns, setTurns] = useState<number[][]>(() => GRID_SCRAMBLE.map((row) => row.map(() => 0)));
	const masks = useMemo(() => GRID_SOLVED.map((row, r) => row.map((m, c) => rotMask(m, GRID_SCRAMBLE[r]![c]! + turns[r]![c]!))), [turns]);
	const { lit, done } = useMemo(() => flood(masks), [masks]);
	const routed = power || done;
	const moves = turns.flat().reduce((a, b) => a + b, 0);

	const turn = (r: number, c: number) => {
		if (power) return;
		setTurns((t) => t.map((row, ri) => row.map((v, ci) => (ri === r && ci === c ? v + 1 : v))));
	};
	const bypass = () => {
		setTurns(GRID_SCRAMBLE.map((row) => row.map((q) => (4 - q) % 4)));
		restore();
	};

	return (
		<div className={s.board} data-routed={routed} data-power={power}>
			<div className={s.boardHead}>
				<span>JUNCTION BOARD · DECK 2 · BUS A</span>
				<span className={s.status}>{power ? 'MAIN BUS LIVE' : routed ? 'ROUTE COMPLETE · THROW THE LEVER' : `ROUTING · ${moves} TURNS`}</span>
			</div>

			<div className={s.layout}>
				<div className={s.gridWrap}>
					<span className={s.source} aria-hidden>
						<i />
						<b>CORE</b>
					</span>
					<div className={s.grid} role="group" aria-label="Conduit tiles: turn them to carry power from the reactor core on the left to life support on the right">
						{masks.map((row, r) =>
							row.map((_m, c) => {
								const on = lit.has(`${c},${r}`);
								return (
									<button
										key={`${r}-${c}`}
										type="button"
										className={s.tile}
										data-on={on}
										onClick={() => turn(r, c)}
										disabled={power}
										aria-label={`Conduit ${r + 1}-${c + 1}${on ? ', powered' : ''}. Turn a quarter.`}
									>
										<span className={s.spin} style={{ transform: `rotate(${(GRID_SCRAMBLE[r]![c]! + turns[r]![c]!) * 90}deg)` }}>
											<Conduit mask={GRID_SOLVED[r]![c]!} />
										</span>
									</button>
								);
							}),
						)}
					</div>
					<span className={s.sink} data-on={routed} aria-hidden>
						<i />
						<b>O₂</b>
					</span>
				</div>

				<div className={s.side}>
					<div className={s.gauge}>
						<LifeSupport size={150} />
					</div>
					<button type="button" className={s.lever} disabled={!routed || power} data-thrown={power} onClick={restore} aria-label={power ? 'Main bus lever thrown' : 'Throw the main bus lever'}>
						<span className={s.leverSlot} aria-hidden>
							<span className={s.leverArm}>
								<i />
							</span>
						</span>
						<span className={s.leverText}>{power ? 'Main bus live' : routed ? 'Throw the main bus' : 'Main bus · route first'}</span>
					</button>
				</div>
			</div>

			<div className={s.foot}>
				<p>{power ? 'Life support is climbing. Every deck has its lights back. In the room this is a two-person job with someone upstairs reading the schematic.' : 'Tap a tile to turn it. Power flows from the core on the left; get it to life support on the right.'}</p>
				{power ? null : (
					<button type="button" className={s.bypass} onClick={bypass}>
						Bypass: do it for me
					</button>
				)}
			</div>
		</div>
	);
}
