import type { ReactNode } from 'react';
import s from './cutaway.module.css';

/**
 * Hand-drawn interiors for each room of the cutaway, in the room's local
 * coordinates (0,0 = the room's top-left inside the deck; w × 170). Static SVG:
 * the cutaway lights and animates them with CSS.
 */
export function RoomArt({ id, w }: { id: string; w: number }): ReactNode {
	switch (id) {
		case 'airlock':
			return (
				<g>
					{/* outer hatch in the hull wall, half open */}
					<g transform="translate(26 92)">
						<circle r="46" className={s.metalDark} />
						<circle r="38" className={s.metal} />
						<path d="M-38 0a38 38 0 0 1 38-38v76a38 38 0 0 1-38-38z" className={s.hatchOpen} />
						{[0, 60, 120, 180, 240, 300].map((a) => (
							<line key={a} x1="0" y1="0" x2="0" y2="-34" transform={`rotate(${a})`} className={s.bolt} />
						))}
						<circle r="8" className={s.metalDark} />
					</g>
					{/* hazard frame */}
					<rect x="82" y="22" width="10" height="148" className={s.hazard} />
					{/* two suits on the rack */}
					{[118, 160].map((x) => (
						<g key={x} transform={`translate(${x} 40)`} className={s.suit}>
							<circle cx="0" cy="10" r="10" />
							<path d="M-14 22h28l4 42h-8l-2 30h-7l-1-24h-2l-1 24h-7l-2-30h-8z" />
							<rect x="-6" y="6" width="12" height="7" rx="3" className={s.visor} />
						</g>
					))}
					<rect x={w - 18} y="40" width="6" height="40" className={s.panelLight} />
				</g>
			);
		case 'quarters':
			return (
				<g>
					{[0, 1, 2].map((c) => (
						<g key={c} transform={`translate(${14 + c * 62} 50)`}>
							<rect width="54" height="16" className={s.bunk} />
							<rect y="16" width="54" height="3" className={s.metalDark} />
							<rect y="58" width="54" height="16" className={s.bunk} />
							<rect y="74" width="54" height="3" className={s.metalDark} />
							<rect x="4" y="6" width="14" height="8" rx="3" className={s.pillow} />
							<rect x="4" y="64" width="14" height="8" rx="3" className={s.pillow} />
							<line x1="0" y1="0" x2="0" y2="120" className={s.frame} />
						</g>
					))}
					<g transform={`translate(${w - 40} 40)`}>
						{[0, 1, 2].map((r) => (
							<rect key={r} y={r * 42} width="30" height="38" className={s.locker} />
						))}
						<circle cx="24" cy="18" r="2" className={s.ledAmber} />
					</g>
					{/* the log still recording */}
					<rect x="22" y="132" width="16" height="10" className={s.screen} />
				</g>
			);
		case 'galley':
			return (
				<g>
					<rect x="20" y="30" width="46" height="96" className={s.metal} />
					<rect x="28" y="40" width="30" height="20" className={s.screen} />
					<text x="43" y="54" className={s.screenText}>
						9
					</text>
					<rect x="30" y="78" width="26" height="22" className={s.metalDark} />
					<rect x="90" y="110" width="90" height="6" className={s.metal} />
					<rect x="130" y="116" width="8" height="54" className={s.metalDark} />
					{[100, 160].map((x) => (
						<rect key={x} x={x} y="128" width="16" height="6" className={s.metalDark} />
					))}
					<path d="M112 100h10v10h-10z" className={s.mug} />
					<path d="M122 102c4 0 4 6 0 6" className={s.frame} />
				</g>
			);
		case 'comms':
			return (
				<g>
					<rect x="22" y="78" width={w - 70} height="40" className={s.console} />
					<rect x="34" y="40" width="80" height="34" className={s.screen} />
					<path d="M38 58q6-14 12 0t12 0 12 0 12 0 12 0 12 0" className={s.wave} />
					<rect x="124" y="46" width="44" height="28" className={s.screen} />
					<g transform={`translate(${w - 34} 30)`}>
						<rect x="-6" width="12" height="130" className={s.metalDark} />
						{[0, 1, 2, 3, 4].map((r) => (
							<rect key={r} x="-10" y={12 + r * 22} width="20" height="12" className={s.rack} />
						))}
						{[0, 1, 2, 3, 4].map((r) => (
							<circle key={r} cx="5" cy={18 + r * 22} r="1.8" className={s.ledTeal} />
						))}
					</g>
					<path d="M70 118v20M60 138h20" className={s.frame} />
					<path d="M88 72a10 10 0 0 1 20 0" className={s.headset} />
				</g>
			);
		case 'reactor':
			return (
				<g>
					<g transform="translate(92 22)">
						<rect x="-34" width="68" height="148" rx="6" className={s.metalDark} />
						<rect x="-24" y="10" width="48" height="128" rx="20" className={s.coreGlass} />
						<rect x="-14" y="20" width="28" height="108" rx="14" className={s.core} />
						{[30, 60, 90, 120].map((y) => (
							<rect key={y} x="-38" y={y} width="76" height="6" className={s.metal} />
						))}
					</g>
					<path d={`M126 60h40v70h${w - 186}`} className={s.pipe} />
					<path d={`M126 90h20v60h${w - 166}`} className={s.pipe} />
					<rect x={w - 50} y="40" width="34" height="50" className={s.console} />
					<circle cx={w - 33} cy="64" r="11" className={s.gaugeFace} />
				</g>
			);
		case 'life':
			return (
				<g>
					{[0, 1].map((i) => (
						<g key={i} transform={`translate(${46 + i * 82} 62)`}>
							<circle r="32" className={s.metalDark} />
							<circle r="26" className={s.fanWell} />
							<g className={s.fan}>
								{[0, 72, 144, 216, 288].map((a) => (
									<path key={a} d="M0 0c6-4 14-14 12-22-6 0-12 10-12 22z" transform={`rotate(${a})`} />
								))}
							</g>
							<circle r="5" className={s.metal} />
						</g>
					))}
					{[0, 1, 2, 3].map((i) => (
						<rect key={i} x={24 + i * 40} y="112" width="26" height="50" rx="5" className={s.canister} />
					))}
					<rect x={w - 34} y="34" width="20" height="80" className={s.o2Track} />
					<rect x={w - 31} y="84" width="14" height="27" className={s.o2Fill} />
					<text x={w - 24} y="128" className={s.tinyText}>
						O₂
					</text>
				</g>
			);
		case 'nav':
			return (
				<g>
					<rect x="20" y="22" width={w - 40} height="56" className={s.screen} />
					{[[40, 40], [70, 58], [110, 36], [140, 64], [160, 44]].map(([x, y], i) => (
						<circle key={i} cx={x} cy={y} r="1.6" className={s.star} />
					))}
					<path d="M40 40L70 58L110 36L140 64" className={s.route} />
					<rect x="40" y="108" width="100" height="10" className={s.chartTable} />
					<rect x="84" y="118" width="12" height="52" className={s.metalDark} />
					<g transform="translate(150 98)" className={s.chair}>
						<path d="M0 0h16v34h12v8H-4v-8h4z" />
						<rect x="6" y="42" width="6" height="28" />
					</g>
				</g>
			);
		case 'bridge':
			return (
				<g>
					{/* the curved viewport onto space */}
					<path d={`M${w - 8} 18q-56 70 0 140v0h-60q-30-70 0-140z`} className={s.viewport} />
					{[[w - 40, 40], [w - 28, 80], [w - 46, 110], [w - 22, 132], [w - 52, 70]].map(([x, y], i) => (
						<circle key={i} cx={x} cy={y} r="1.3" className={s.star} />
					))}
					<rect x="20" y="28" width="92" height="44" className={s.screen} />
					<text x="66" y="56" className={s.screenText}>
						00:47
					</text>
					{[40, 104].map((x) => (
						<g key={x} transform={`translate(${x} 104)`} className={s.chair}>
							<path d="M0 0h18v34h12v8H-4v-8h4z" />
							<rect x="7" y="42" width="6" height="24" />
						</g>
					))}
					<rect x="18" y="128" width="130" height="12" className={s.console} />
				</g>
			);
		default:
			return null;
	}
}

/** A tiny crew silhouette (24 user units tall). */
export function Crew() {
	return (
		<g className={s.crewBody}>
			<circle cx="0" cy="-21" r="4.6" />
			<path d="M-5 -15h10l2 14h-3l-1 15h-3l-0.6-12h-0.8l-0.6 12h-3l-1-15h-3z" />
		</g>
	);
}
