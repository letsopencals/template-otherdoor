import s from './kepler.module.css';

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Four corner brackets framing a HUD panel or the viewport. */
export function Brackets({ className = '' }: { className?: string }) {
	return (
		<span className={`${s.brackets} ${className}`} aria-hidden>
			<i />
			<i />
			<i />
			<i />
		</span>
	);
}

/** A ring gauge (life support). `value` 0–100. Coordinates rounded for hydration. */
export function RingGauge({ value, label, size = 160 }: { value: number; label: string; size?: number }) {
	const c = 80;
	const rad = 64;
	const circ = r2(2 * Math.PI * rad);
	const ticks = Array.from({ length: 40 }, (_, i) => {
		const a = (i / 40) * Math.PI * 2 - Math.PI / 2;
		const inner = i % 5 === 0 ? 70 : 73;
		return { x1: r2(c + Math.cos(a) * inner), y1: r2(c + Math.sin(a) * inner), x2: r2(c + Math.cos(a) * 77), y2: r2(c + Math.sin(a) * 77), major: i % 5 === 0 };
	});
	return (
		<svg width={size} height={size} viewBox="0 0 160 160" className={s.gauge} role="img" aria-label={`${label}: ${value}%`}>
			{ticks.map((t, i) => (
				<line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="currentColor" strokeOpacity={t.major ? 0.6 : 0.25} strokeWidth={t.major ? 1.4 : 1} />
			))}
			<circle cx={c} cy={c} r={rad} fill="none" stroke="currentColor" strokeOpacity=".12" strokeWidth="6" />
			<circle cx={c} cy={c} r={rad} fill="none" stroke="var(--k-warn)" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${r2((circ * value) / 100)} ${circ}`} transform="rotate(-90 80 80)" className={s.gaugeArc} />
			<text x="80" y="78" textAnchor="middle" className={s.gaugeValue}>
				{value.toFixed(1)}%
			</text>
			<text x="80" y="98" textAnchor="middle" className={s.gaugeLabel}>
				{label}
			</text>
		</svg>
	);
}

/** The station plan: two decks joined by a ladder, crew markers blinking. */
export function DeckMap() {
	return (
		<svg viewBox="0 0 360 230" className={s.deckMap} role="img" aria-label="Deck map: Deck one (command, comms, airlock) above Deck two (reactor, life support, docking ring), joined by a ladder">
			<g fill="none" stroke="currentColor" strokeWidth="1.2">
				<text x="8" y="16" className={s.mapLabel}>DECK 1</text>
				<path d="M20 28h300l20 20v50H20z" strokeOpacity=".7" />
				<path d="M120 28v70M220 28v70" strokeOpacity=".35" />
				<text x="34" y="68" className={s.mapRoom}>COMMAND</text>
				<text x="136" y="68" className={s.mapRoom}>COMMS</text>
				<text x="236" y="68" className={s.mapRoom}>AIRLOCK</text>
				<text x="8" y="132" className={s.mapLabel}>DECK 2</text>
				<path d="M20 144h320v60l-20 20H20z" strokeOpacity=".7" />
				<path d="M130 144v80M240 144v80" strokeOpacity=".35" />
				<text x="34" y="190" className={s.mapRoom}>REACTOR</text>
				<text x="146" y="190" className={s.mapRoom}>LIFE SUPPORT</text>
				<text x="256" y="190" className={s.mapRoom}>DOCKING</text>
				<path d="M178 98v46M186 98v46" strokeOpacity=".8" />
				<path d="M178 106h8M178 114h8M178 122h8M178 130h8M178 138h8" strokeOpacity=".5" />
				<path d="M340 48v176" strokeDasharray="2 4" strokeOpacity=".3" />
			</g>
			<g className={s.crew}>
				<circle cx="72" cy="82" r="3.5" />
				<circle cx="90" cy="84" r="3.5" />
				<circle cx="170" cy="82" r="3.5" />
				<circle cx="200" cy="208" r="3.5" />
				<circle cx="286" cy="206" r="3.5" />
			</g>
			<circle cx="196" cy="168" r="9" className={s.alarm} />
			<text x="210" y="166" className={s.mapWarn}>O₂ FAULT</text>
		</svg>
	);
}

/** Docking reticle (centre cross, rings, ticks). */
export function Reticle() {
	const ticks = Array.from({ length: 24 }, (_, i) => {
		const a = (i / 24) * Math.PI * 2;
		return { x1: r2(200 + Math.cos(a) * 150), y1: r2(200 + Math.sin(a) * 150), x2: r2(200 + Math.cos(a) * (i % 6 === 0 ? 132 : 142)), y2: r2(200 + Math.sin(a) * (i % 6 === 0 ? 132 : 142)) };
	});
	return (
		<svg viewBox="0 0 400 400" className={s.reticleSvg} aria-hidden>
			<g fill="none" stroke="currentColor">
				<circle cx="200" cy="200" r="150" strokeOpacity=".5" />
				<circle cx="200" cy="200" r="96" strokeOpacity=".3" strokeDasharray="4 6" />
				{ticks.map((t, i) => (
					<line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} strokeOpacity=".7" />
				))}
				<path d="M200 168v-22M200 232v22M168 200h-22M232 200h22" strokeWidth="1.5" />
				<path d="M188 200h24M200 188v24" strokeOpacity=".9" />
			</g>
		</svg>
	);
}
