'use client';

import { useCallback, useRef, useState } from 'react';
import { DECK_LOW, DECK_TOP, FAIL_ORDER, ROOMS, type DeckRoom } from './mission';
import { useScrollProgress } from './use-scroll-progress';
import { useMission } from './mission-state';
import { Crew, RoomArt } from './cutaway-art';
import s from './cutaway.module.css';

const VB_X = 10;
const VB_Y = 30;
const VB_W = 1180;
const VB_H = 560;
const SHAFT_X = 585;
const SHAFT_W = 50;

/** Crew walking their rooms: x range (absolute), deck, duration, delay. */
const WALKERS = [
	{ from: 360, to: 520, deck: 1, dur: 14, delay: -3 },
	{ from: 660, to: 800, deck: 1, dur: 11, delay: -7 },
	{ from: 150, to: 330, deck: 2, dur: 16, delay: -2 },
	{ from: 870, to: 1040, deck: 2, dur: 12, delay: -9 },
	{ from: 400, to: 540, deck: 2, dur: 13, delay: -5 },
] as const;

/**
 * CUTAWAY OF THE TWO DECKS. A side elevation through Kepler's spindle: Deck 1
 * (habitation) over Deck 2 (command), the ladder shaft between them, conduits in
 * the floor slab and crew moving about. As you scroll past, the lights fail room
 * by room (unless you have already restored power). Tap a room to see what you
 * do there.
 */
export function Cutaway() {
	const ref = useRef<HTMLDivElement>(null);
	const { power } = useMission();
	const [dark, setDark] = useState(0);
	const [open, setOpen] = useState<string>('airlock');
	const onP = useCallback((p: number) => {
		const n = Math.max(0, Math.min(FAIL_ORDER.length - 2, Math.floor(((p - 0.3) / 0.45) * (FAIL_ORDER.length - 1))));
		setDark((d) => (d === n ? d : n));
	}, []);
	useScrollProgress(ref, 'pass', onP);
	const darkSet = new Set(power ? [] : FAIL_ORDER.slice(0, dark));
	const room = ROOMS.find((r) => r.id === open) ?? ROOMS[0]!;

	return (
		<div className={s.wrap} ref={ref}>
			<div className={s.plan}>
				<svg viewBox={`${VB_X} ${VB_Y} ${VB_W} ${VB_H}`} className={s.svg} role="img" aria-label="Cutaway of Kepler Station: Deck 1, habitation (airlock, crew quarters, galley, comms booth) above Deck 2, command (reactor, life support, navigation, bridge), joined by a ladder shaft.">
					<defs>
						<linearGradient id="kcHull" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor="#3a4560" />
							<stop offset=".5" stopColor="#151c30" />
							<stop offset="1" stopColor="#2a3349" />
						</linearGradient>
						<linearGradient id="kcLit" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor="#2c587a" />
							<stop offset="1" stopColor="#0f1d36" />
						</linearGradient>
						<linearGradient id="kcCone" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor="#d8fbff" stopOpacity=".42" />
							<stop offset="1" stopColor="#3ed2d6" stopOpacity="0" />
						</linearGradient>
						<pattern id="kcRivets" width="24" height="12" patternUnits="userSpaceOnUse">
							<circle cx="6" cy="6" r="1.1" fill="#8e9ab0" fillOpacity=".45" />
						</pattern>
						<pattern id="kcGrate" width="8" height="8" patternUnits="userSpaceOnUse">
							<path d="M0 8L8 0" stroke="#0a0f1d" strokeWidth="1.4" />
						</pattern>
					</defs>

					{/* the hull: a cut through the spindle */}
					<path d="M110 96H1090Q1170 96 1170 176V494Q1170 574 1090 574H110Q30 574 30 494V176Q30 96 110 96Z" fill="url(#kcHull)" className={s.hull} />
					<path d="M110 96H1090Q1170 96 1170 176V494Q1170 574 1090 574H110Q30 574 30 494V176Q30 96 110 96Z" fill="url(#kcRivets)" />
					{/* frame ribs */}
					{[200, 420, 760, 980].map((x) => (
						<rect key={x} x={x - 3} y="96" width="6" height="478" className={s.rib} />
					))}
					{/* external antenna and docking collar */}
					<path d="M960 96V44M944 70h32M952 56h16" className={s.antenna} />
					<circle cx="960" cy="42" r="3" className={s.redBlink} />
					<path d="M30 300h-22v70h22" className={s.collar} />

					{/* deck labels */}
					<text x="62" y="138" className={s.deckLabel}>
						DECK 1 · HABITATION
					</text>
					<text x="62" y="338" className={s.deckLabel}>
						DECK 2 · COMMAND
					</text>

					{/* rooms */}
					{ROOMS.map((r) => (
						<RoomCell key={r.id} r={r} dark={darkSet.has(r.id)} active={open === r.id} />
					))}

					{/* floor slab with conduits between the decks */}
					<rect x="60" y={DECK_TOP.y + DECK_TOP.h} width="1080" height={DECK_LOW.y - DECK_TOP.y - DECK_TOP.h} className={s.slab} />
					<rect x="60" y={DECK_TOP.y + DECK_TOP.h} width="1080" height={DECK_LOW.y - DECK_TOP.y - DECK_TOP.h} fill="url(#kcGrate)" opacity=".5" />
					{[330, 338].map((y, i) => (
						<path key={y} d={`M90 ${y}H${SHAFT_X - 10}M${SHAFT_X + SHAFT_W + 10} ${y}H1120`} className={s.conduit} style={{ animationDelay: `${i * -0.6}s` }} />
					))}
					<path d={`M90 ${DECK_LOW.y + DECK_LOW.h + 14}H1120`} className={s.conduit} />

					{/* ladder shaft */}
					<rect x={SHAFT_X} y={DECK_TOP.y} width={SHAFT_W} height={DECK_LOW.y + DECK_LOW.h - DECK_TOP.y} className={s.shaft} />
					<path d={`M${SHAFT_X + 12} ${DECK_TOP.y}V${DECK_LOW.y + DECK_LOW.h}M${SHAFT_X + SHAFT_W - 12} ${DECK_TOP.y}V${DECK_LOW.y + DECK_LOW.h}`} className={s.rail} />
					{Array.from({ length: 17 }, (_, i) => (
						<line key={i} x1={SHAFT_X + 12} x2={SHAFT_X + SHAFT_W - 12} y1={DECK_TOP.y + 12 + i * 21} y2={DECK_TOP.y + 12 + i * 21} className={s.rung} />
					))}
					<g className={s.climber} transform={`translate(${SHAFT_X + SHAFT_W / 2} 0)`}>
						<g className={s.climb}>
							<Crew />
						</g>
					</g>

					{/* crew on the decks */}
					{WALKERS.map((w, i) => {
						const floor = w.deck === 1 ? DECK_TOP.y + DECK_TOP.h : DECK_LOW.y + DECK_LOW.h;
						return (
							<g key={i} transform={`translate(${w.from} ${floor - 14})`}>
								<g className={s.walker} style={{ ['--run' as string]: `${w.to - w.from}px`, animationDuration: `${w.dur}s`, animationDelay: `${w.delay}s` }}>
									<Crew />
								</g>
							</g>
						);
					})}
				</svg>

				{/* tap targets over each room */}
				<div className={s.targets}>
					{ROOMS.map((r, i) => {
						const deck = r.deck === 1 ? DECK_TOP : DECK_LOW;
						return (
							<button
								key={r.id}
								type="button"
								className={s.target}
								style={{ left: `${((r.x - VB_X) / VB_W) * 100}%`, top: `${((deck.y - VB_Y) / VB_H) * 100}%`, width: `${(r.w / VB_W) * 100}%`, height: `${(deck.h / VB_H) * 100}%` }}
								aria-pressed={open === r.id}
								onClick={() => setOpen(r.id)}
							>
								<span className={s.targetTag}>
									<b>{String(i + 1).padStart(2, '0')}</b>
									<span className={s.targetName}>{r.short}</span>
								</span>
							</button>
						);
					})}
				</div>
			</div>

			<article className={s.detail} aria-live="polite" key={room.id}>
				<p className={s.detailDeck}>
					DECK {room.deck} · {room.deck === 1 ? 'HABITATION' : 'COMMAND'}
					<span data-dark={darkSet.has(room.id)}>{darkSet.has(room.id) ? 'LIGHTS FAILED' : 'LIT'}</span>
				</p>
				<h3 className={s.detailTitle}>{room.name}</h3>
				<p className={s.detailBody}>{room.does}</p>
				<ul className={s.puzzles}>
					{room.puzzles.map((p) => (
						<li key={p}>{p}</li>
					))}
				</ul>
				<p className={s.crewNote}>
					<span>Crew here</span> {room.crew}
				</p>
			</article>
		</div>
	);
}

function RoomCell({ r, dark, active }: { r: DeckRoom; dark: boolean; active: boolean }) {
	const deck = r.deck === 1 ? DECK_TOP : DECK_LOW;
	return (
		<g transform={`translate(${r.x} ${deck.y})`} className={s.room} data-dark={dark} data-active={active}>
			<rect width={r.w} height={deck.h} className={s.roomBg} />
			<rect width={r.w} height={deck.h} fill="url(#kcLit)" className={s.roomLit} />
			<polygon points={`${r.w / 2 - 22},6 ${r.w / 2 + 22},6 ${r.w / 2 + r.w * 0.42},${deck.h} ${r.w / 2 - r.w * 0.42},${deck.h}`} fill="url(#kcCone)" className={s.cone} />
			<RoomArt id={r.id} w={r.w} />
			<rect x={r.w / 2 - 24} y="2" width="48" height="4" rx="2" className={s.lamp} />
			<circle cx={r.w - 12} cy="14" r="3.2" className={s.emergency} />
			<rect width={r.w} height={deck.h} className={s.redWash} />
			<rect width={r.w} height={deck.h} className={s.roomEdge} />
		</g>
	);
}
