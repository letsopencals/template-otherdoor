import s from './gaslight.module.css';

const NOTES = [
	{ id: 'door', x: 55, y: 25, label: 'The study door', note: 'Bolted on the inside. The key still in the lock, turned. Nobody left this way.' },
	{ id: 'window', x: 77.5, y: 91.5, label: 'The window', note: 'Painted shut in 1889. The paint has not cracked.' },
	{ id: 'hearth', x: 94.5, y: 47.7, label: 'The fireplace', note: 'Swept on Monday, though the sweep came in October. Who sent for him?' },
	{ id: 'desk', x: 75, y: 50.8, label: 'The desk', note: 'A stopped watch, a sealed letter and a gas bill three times what it should be.' },
];

/**
 * No. 9 Heriot Row, first floor, drawn in ink on tracing paper by the constable on the door.
 * Four marked places open a note on hover, tap or focus (plain buttons; CSS only).
 */
export function FloorPlan() {
	return (
		<div className={s.plan}>
			<svg viewBox="0 0 400 262" className={s.planSvg} role="img" aria-label="Floor plan of the first floor of No. 9: a landing with the stair, the drawing room at the front, and the professor's study on the right with its door, window, fireplace and desk.">
				{/* rooms, lightly washed */}
				<rect x="12" y="12" width="206" height="96" className={s.planWash} />
				<rect x="222" y="12" width="166" height="226" className={s.planWashStudy} />
				{/* stair treads */}
				{[24, 34, 44, 54, 64, 74, 84, 94].map((y) => (
					<line key={y} x1="30" x2="112" y1={y} y2={y} className={s.planThin} />
				))}
				<path d="M71 98V30M64 38l7-9 7 9" className={s.planThin} />
				<text x="122" y="64" className={s.planSmall}>up</text>
				{/* bookcases */}
				<rect x="236" y="16" width="136" height="10" className={s.planFurn} />
				{[248, 262, 276, 290, 304, 318, 332, 346, 360].map((x) => (
					<line key={x} x1={x} x2={x} y1="16" y2="26" className={s.planThin} />
				))}
				{/* desk + chair */}
				<rect x="272" y="118" width="58" height="30" rx="1.5" className={s.planFurn} />
				<circle cx="301" cy="160" r="8" className={s.planFurn} />
				{/* armchair in the drawing room, piano */}
				<rect x="40" y="160" width="26" height="24" rx="5" className={s.planFurn} />
				<rect x="150" y="190" width="50" height="28" rx="2" className={s.planFurn} />
				{/* fireplaces */}
				<rect x="368" y="100" width="20" height="50" className={s.planHearth} />
				<rect x="12" y="150" width="14" height="40" className={s.planHearth} />
				{/* walls: outer, partitions (with door gaps) */}
				<path d="M10 10H390V240H362M318 240H302M258 240H10V10" className={s.planWall} />
				<path d="M220 10V48M220 84V240" className={s.planWall} />
				<path d="M10 110H118M154 110H220" className={s.planWall} />
				{/* windows to the street */}
				{[
					[46, 92],
					[138, 184],
					[258, 302],
					[318, 362],
				].map(([a, b]) => (
					<g key={a}>
						<line x1={a} x2={b} y1="237" y2="237" className={s.planThin} />
						<line x1={a} x2={b} y1="243" y2="243" className={s.planThin} />
					</g>
				))}
				{/* door leaves */}
				<path d="M220 84L250 66M250 66A36 36 0 0 0 220 48" className={s.planThin} />
				<path d="M154 110L136 140M136 140A36 36 0 0 1 118 110" className={s.planThin} />
				{/* the bolt */}
				<rect x="223" y="50" width="6" height="3" className={s.planBolt} />
				{/* labels */}
				<text x="305" y="196" textAnchor="middle" className={s.planLabel}>Study</text>
				<text x="116" y="178" textAnchor="middle" className={s.planLabel}>Drawing room</text>
				<text x="160" y="34" textAnchor="middle" className={s.planLabel}>Landing</text>
				<text x="200" y="258" textAnchor="middle" className={s.planSmall}>Heriot Row · Queen Street Gardens beyond</text>
				{/* red pencil: the constable's doubt */}
				<path d="M362 92c14-6 30 0 32 22s0 44-14 48-30-6-32-26 2-38 14-44z" className={s.planRed} />
				<text x="350" y="182" className={s.planRedText}>?</text>
			</svg>
			{NOTES.map((n) => (
				<button key={n.id} type="button" className={s.planSpot} style={{ left: `${n.x}%`, top: `${n.y}%` }} data-side={n.x > 60 ? 'r' : 'l'} aria-describedby={`gl-plan-${n.id}`}>
					<span className={s.srOnly}>{n.label}</span>
					<span className={s.planNote} id={`gl-plan-${n.id}`} role="tooltip">
						<b>{n.label}</b> {n.note}
					</span>
				</button>
			))}
		</div>
	);
}
