import { gearOutline, spokeWindows, type PlacedGear } from './gears';
import s from './clockmaker.module.css';

const r2 = (n: number) => Math.round(n * 100) / 100;

const EDGE: Record<PlacedGear['tone'], string> = { brass: '#6b4512', copper: '#5a2610', steel: '#3d434b' };
const LINE: Record<PlacedGear['tone'], string> = { brass: 'rgba(255,238,190,.55)', copper: 'rgba(255,214,184,.5)', steel: 'rgba(255,255,255,.55)' };

/**
 * The shared paint for every gear, screw and brass plate on the page, in one
 * zero-size SVG with fixed ids (render once, at the world root).
 */
export function WorkshopDefs() {
	return (
		<svg width="0" height="0" className={s.defs} aria-hidden focusable="false">
			<defs>
				<radialGradient id="cw-brass" cx="50%" cy="50%" r="50%">
					<stop offset="0" stopColor="#f6dd93" />
					<stop offset=".42" stopColor="#e4bb5e" />
					<stop offset=".72" stopColor="#c8953b" />
					<stop offset=".9" stopColor="#a9762a" />
					<stop offset="1" stopColor="#7c531b" />
				</radialGradient>
				<radialGradient id="cw-copper" cx="50%" cy="50%" r="50%">
					<stop offset="0" stopColor="#f7c39c" />
					<stop offset=".45" stopColor="#d9804f" />
					<stop offset=".75" stopColor="#b85e31" />
					<stop offset="1" stopColor="#6f3013" />
				</radialGradient>
				<radialGradient id="cw-steel" cx="50%" cy="50%" r="50%">
					<stop offset="0" stopColor="#f4f5f6" />
					<stop offset=".5" stopColor="#c3c8ce" />
					<stop offset=".8" stopColor="#959ca5" />
					<stop offset="1" stopColor="#5b626b" />
				</radialGradient>
				<radialGradient id="cw-hub" cx="42%" cy="38%" r="65%">
					<stop offset="0" stopColor="#fff4cf" />
					<stop offset=".35" stopColor="#e9c46c" />
					<stop offset="1" stopColor="#8f6420" />
				</radialGradient>
				<radialGradient id="cw-screw" cx="38%" cy="34%" r="70%">
					<stop offset="0" stopColor="#ffffff" />
					<stop offset=".3" stopColor="#d9dde2" />
					<stop offset="1" stopColor="#5d646d" />
				</radialGradient>
				<linearGradient id="cw-sheen" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="#fff" stopOpacity=".75" />
					<stop offset=".45" stopColor="#fff" stopOpacity=".05" />
					<stop offset=".6" stopColor="#000" stopOpacity=".05" />
					<stop offset="1" stopColor="#000" stopOpacity=".45" />
				</linearGradient>
				<linearGradient id="cw-walnut" x1="0" y1="0" x2="1" y2="0">
					<stop offset="0" stopColor="#3a2112" />
					<stop offset=".18" stopColor="#5a341c" />
					<stop offset=".5" stopColor="#6b3f22" />
					<stop offset=".82" stopColor="#552f19" />
					<stop offset="1" stopColor="#331d10" />
				</linearGradient>
				<linearGradient id="cw-walnut-v" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#6e4224" />
					<stop offset=".5" stopColor="#56321b" />
					<stop offset="1" stopColor="#3b2112" />
				</linearGradient>
				<linearGradient id="cw-brass-lin" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#fbe7a6" />
					<stop offset=".35" stopColor="#e0b35a" />
					<stop offset=".7" stopColor="#b8862f" />
					<stop offset="1" stopColor="#7d5318" />
				</linearGradient>
				<linearGradient id="cw-brass-h" x1="0" y1="0" x2="1" y2="0">
					<stop offset="0" stopColor="#8a5d1c" />
					<stop offset=".3" stopColor="#e7c06a" />
					<stop offset=".5" stopColor="#fff0bd" />
					<stop offset=".7" stopColor="#d7a84e" />
					<stop offset="1" stopColor="#7d5318" />
				</linearGradient>
				<linearGradient id="cw-copper-lin" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#f6b98f" />
					<stop offset=".45" stopColor="#c86a3a" />
					<stop offset="1" stopColor="#7a3516" />
				</linearGradient>
				<radialGradient id="cw-face" cx="50%" cy="45%" r="55%">
					<stop offset="0" stopColor="#fffaf0" />
					<stop offset=".75" stopColor="#f6ead2" />
					<stop offset="1" stopColor="#dcc7a0" />
				</radialGradient>
				<filter id="cw-grain" x="0" y="0" width="100%" height="100%">
					<feTurbulence type="fractalNoise" baseFrequency=".9 .035" numOctaves="3" seed="7" result="n" />
					<feColorMatrix in="n" type="matrix" values="0 0 0 0 .2  0 0 0 0 .1  0 0 0 0 .04  0 0 0 .55 0" />
					<feComposite in2="SourceGraphic" operator="in" />
				</filter>
				<filter id="cw-soft" x="-30%" y="-30%" width="160%" height="160%">
					<feGaussianBlur stdDeviation="6" />
				</filter>
			</defs>
		</svg>
	);
}

/** A slotted brass/steel screw head, centred on cx, cy. */
export function Screw({ cx, cy, r, turn = 30 }: { cx: number; cy: number; r: number; turn?: number }) {
	const a = (turn * Math.PI) / 180;
	const dx = r2(Math.cos(a) * r * 0.78);
	const dy = r2(Math.sin(a) * r * 0.78);
	return (
		<g>
			<circle cx={cx} cy={r2(cy + r * 0.18)} r={r} fill="rgba(0,0,0,.35)" />
			<circle cx={cx} cy={cy} r={r} fill="url(#cw-screw)" stroke="#3b3f45" strokeWidth={r2(r * 0.12)} />
			<line x1={r2(cx - dx)} y1={r2(cy - dy)} x2={r2(cx + dx)} y2={r2(cy + dy)} stroke="#2c3036" strokeWidth={r2(r * 0.32)} strokeLinecap="round" />
			<line x1={r2(cx - dx)} y1={r2(cy - dy + r * 0.12)} x2={r2(cx + dx)} y2={r2(cy + dy + r * 0.12)} stroke="rgba(255,255,255,.5)" strokeWidth={r2(r * 0.08)} strokeLinecap="round" />
		</g>
	);
}

/**
 * One gear, centred in its own viewBox. Only this SVG rotates; the drop shadow
 * and the directional sheen are siblings that stay still (see GearTrain).
 */
export function GearBody({ g, m }: { g: PlacedGear; m: number }) {
	const rr = g.r - 1.25 * m;
	const rimIn = rr - Math.max(3, m * 1.1);
	const hub = Math.max(g.r * 0.3, 7);
	const windows = spokeWindows(g.teeth, m, g.spokes);
	const screws = hub > 13 ? 3 : 0;
	const vb = r2(g.ro + 1);
	return (
		<svg viewBox={`${-vb} ${-vb} ${r2(vb * 2)} ${r2(vb * 2)}`} className={s.gearBody} aria-hidden focusable="false">
			<path d={gearOutline(g.teeth, m) + windows} fillRule="evenodd" fill={`url(#cw-${g.tone})`} stroke={EDGE[g.tone]} strokeWidth={r2(m * 0.16)} strokeLinejoin="round" />
			{/* turned rings on the rim and the web: concentric, so they read as machining */}
			<circle r={r2(rr - 0.9)} fill="none" stroke={LINE[g.tone]} strokeWidth={r2(m * 0.12)} />
			{windows ? <circle r={r2(rimIn + 0.6)} fill="none" stroke="rgba(0,0,0,.28)" strokeWidth={r2(m * 0.14)} /> : <circle r={r2(g.r * 0.62)} fill="none" stroke="rgba(0,0,0,.18)" strokeWidth={r2(m * 0.25)} />}
			{windows ? null : <circle r={r2(g.r * 0.62 - m * 0.25)} fill="none" stroke={LINE[g.tone]} strokeWidth={r2(m * 0.1)} />}
			<circle r={r2(hub)} fill="url(#cw-hub)" stroke={EDGE[g.tone]} strokeWidth={r2(m * 0.14)} />
			<circle r={r2(hub * 0.78)} fill="none" stroke="rgba(255,248,220,.6)" strokeWidth={r2(m * 0.08)} />
			{Array.from({ length: screws }, (_, i) => {
				const a = (i * 2 * Math.PI) / 3 - Math.PI / 2;
				return <Screw key={i} cx={r2(Math.cos(a) * hub * 0.58)} cy={r2(Math.sin(a) * hub * 0.58)} r={r2(Math.max(2, hub * 0.16))} turn={20 + i * 50} />;
			})}
		</svg>
	);
}
