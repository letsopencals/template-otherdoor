'use client';

import { useState } from 'react';
import { SafeImg } from '@/components/ui/safe-img';
import { say } from './meridian';
import s from './protocol.module.css';

export interface Zone {
	key: string;
	code: string;
	name: string;
	still: string;
	alt: string;
	status: string;
	title: string;
	body: string;
	line: string;
}

/** 24 racks in two rows, wiped one after another (the animation delay is the rack number). */
const RACKS = Array.from({ length: 24 }, (_, i) => ({ i, x: 214 + (i % 12) * 30, y: i < 12 ? 268 : 352 }));
/** Sealed doors (14), as small ticks on the walls. */
const DOORS: Array<[number, number, number, number]> = [
	[170, 218, 170, 242], [200, 128, 200, 152], [200, 306, 200, 330], [300, 220, 324, 220], [420, 92, 420, 116], [420, 168, 420, 192],
	[580, 300, 580, 324], [588, 160, 604, 160], [96, 170, 120, 170], [96, 290, 120, 290], [480, 400, 504, 400], [250, 400, 274, 400], [360, 60, 384, 60], [520, 220, 544, 220],
];

/**
 * CONTAINMENT MAP: a hand-drawn plan of sublevel 4. Racks go red in sequence
 * (the wipe), a camera cone sweeps (MERIDIAN watching), "you" pulse at the
 * airlock. Each zone is a real button (list + plan) that opens its feed: the
 * still, its story beat, its status.
 */
export function ContainmentMap({ zones }: { zones: Zone[] }) {
	const [active, setActive] = useState(zones[0]?.key ?? '');
	const z = zones.find((x) => x.key === active) ?? zones[0];
	const pick = (k: string) => {
		setActive(k);
		const hit = zones.find((x) => x.key === k);
		if (hit) say(hit.line);
	};
	if (!z) return null;

	return (
		<div className={s.mapGrid}>
			<div className={s.mapPlanWrap}>
				<svg className={s.mapPlan} viewBox="0 0 800 460" role="img" aria-label="Plan of sublevel 4: decontamination airlock, control room, server aisle with 24 racks, and the core chamber" data-active={active}>
					<defs>
						<pattern id="pz-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
							<line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" strokeWidth="1" opacity=".35" />
						</pattern>
						<pattern id="pz-grid" width="20" height="20" patternUnits="userSpaceOnUse">
							<path d="M20 0H0V20" fill="none" stroke="currentColor" strokeWidth=".5" opacity=".18" />
						</pattern>
						<radialGradient id="pz-core-glow" cx="50%" cy="50%" r="50%">
							<stop offset="0" stopColor="#31D7E8" stopOpacity=".55" />
							<stop offset=".6" stopColor="#31D7E8" stopOpacity=".12" />
							<stop offset="1" stopColor="#31D7E8" stopOpacity="0" />
						</radialGradient>
						<linearGradient id="pz-cone" x1="0" y1="0" x2="1" y2="0">
							<stop offset="0" stopColor="#E5243B" stopOpacity=".45" />
							<stop offset="1" stopColor="#E5243B" stopOpacity="0" />
						</linearGradient>
					</defs>
					<rect width="800" height="460" fill="url(#pz-grid)" />
					{/* Outer shell with hatched wall thickness */}
					<path d="M30 40H780V430H30Z M44 54V416H766V54Z" fill="url(#pz-hatch)" fillRule="evenodd" />
					<path d="M30 40H780V430H30Z" className={s.mapWall} />
					{/* Corridors */}
					<path d="M170 230H200 M420 140H588 M580 312H620V240 M310 220V250" className={s.mapCorridor} />

					{/* 01 Decon airlock */}
					<g className={s.zone} data-zone="airlock" onClick={() => pick('airlock')}>
						<rect x="60" y="170" width="110" height="120" rx="2" className={s.zoneShape} />
						<path d="M60 230H170" className={s.mapThin} strokeDasharray="4 4" />
						<text x="72" y="190" className={s.mapLabel}>01 DECON</text>
						<g className={s.you}>
							<circle cx="115" cy="258" r="12" className={s.youRing} />
							<circle cx="115" cy="258" r="4" className={s.youDot} />
						</g>
						<text x="98" y="282" className={s.mapTiny}>YOU</text>
					</g>

					{/* 02 Control room */}
					<g className={s.zone} data-zone="control" onClick={() => pick('control')}>
						<rect x="200" y="60" width="220" height="160" rx="2" className={s.zoneShape} />
						<path d="M232 180 Q310 140 388 180" className={s.mapThin} />
						<rect x="282" y="120" width="56" height="28" rx="3" className={s.mapThin} />
						<text x="212" y="80" className={s.mapLabel}>02 CONTROL</text>
					</g>

					{/* 03 Server aisle */}
					<g className={s.zone} data-zone="aisle" onClick={() => pick('aisle')}>
						<rect x="200" y="250" width="380" height="150" rx="2" className={s.zoneShape} />
						<text x="212" y="262" className={s.mapLabel} dy="-4">03 SERVER AISLE</text>
						{RACKS.map((r) => (
							<rect key={r.i} x={r.x} y={r.y} width="22" height="34" rx="1.5" className={s.rack} data-w={r.i < 9 ? '' : undefined} style={{ animationDelay: `${r.i * 0.9}s` }} />
						))}
						<path d="M206 325H574" className={s.mapThin} strokeDasharray="2 5" />
					</g>

					{/* 04 Core */}
					<g className={s.zone} data-zone="core" onClick={() => pick('core')}>
						<circle cx="672" cy="160" r="96" fill="url(#pz-core-glow)" />
						<circle cx="672" cy="160" r="88" className={s.zoneShape} />
						<circle cx="672" cy="160" r="30" className={s.coreRing} />
						<circle cx="672" cy="160" r="16" className={s.coreRing2} />
						<text x="628" y="272" className={s.mapLabel}>04 CORE</text>
					</g>

					{/* Sealed doors */}
					{DOORS.map(([x1, y1, x2, y2], i) => (
						<line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className={s.door} />
					))}

					{/* Camera + sweeping cone */}
					<g transform="translate(420 236)">
						<g className={s.cone}>
							<path d="M0 0 L150 -42 A156 156 0 0 1 150 42 Z" fill="url(#pz-cone)" />
						</g>
						<rect x="-7" y="-5" width="14" height="10" rx="2" className={s.cam} />
					</g>
					<g transform="translate(560 72)">
						<g className={`${s.cone} ${s.coneB}`}>
							<path d="M0 0 L120 -34 A125 125 0 0 1 120 34 Z" fill="url(#pz-cone)" />
						</g>
						<rect x="-7" y="-5" width="14" height="10" rx="2" className={s.cam} />
					</g>

					<text x="44" y="452" className={s.mapTiny}>HALDEN LABS · SUBLEVEL 4 · 40 M BELOW COWGATE · NOT TO SCALE</text>
				</svg>
				<ul className={s.mapLegend} aria-hidden>
					<li><i className={s.lgRack} /> Rack online</li>
					<li><i className={s.lgWiped} /> Rack wiped</li>
					<li><i className={s.lgDoor} /> Sealed door</li>
					<li><i className={s.lgCam} /> MERIDIAN camera</li>
				</ul>
			</div>

			<div className={s.mapSide}>
				<div className={s.zoneTabs} role="tablist" aria-label="Zones">
					{zones.map((x) => (
						<button key={x.key} type="button" role="tab" aria-selected={x.key === active} aria-controls="pz-zone-feed" className={s.zoneTab} onClick={() => pick(x.key)}>
							<span>{x.code}</span>
							{x.name}
						</button>
					))}
				</div>
				<div id="pz-zone-feed" role="tabpanel" className={s.feedCard} key={z.key}>
					<div className={s.feedImg}>
						<SafeImg src={z.still} alt={z.alt} fallback={<span className={s.imgFallback} />} />
						<span className={s.feedTag}>FEED {z.code} · {z.status}</span>
					</div>
					<div className={s.feedText}>
						<h3>{z.title}</h3>
						<p>{z.body}</p>
					</div>
				</div>
			</div>
		</div>
	);
}
