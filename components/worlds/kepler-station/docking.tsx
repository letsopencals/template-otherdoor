'use client';

import { useCallback, useRef, useState } from 'react';
import { useScrollProgress } from './use-scroll-progress';
import { Brackets, Reticle } from './hud';
import s from './kepler.module.css';

/**
 * The docking approach: a tall scroll track with a sticky stage. Scroll brings
 * the station closer (it grows and settles into the reticle), the range and
 * closing speed count down, and the briefing arrives as HUD messages.
 */
export function Docking({ station, plate, beats }: { station: string; plate: string; beats: Array<{ title: string; body: string }> }) {
	const ref = useRef<HTMLDivElement>(null);
	const [p, setP] = useState(0);
	const onChange = useCallback((v: number) => setP((prev) => (Math.abs(prev - v) > 0.004 ? v : prev)), []);
	useScrollProgress(ref, 'track', onChange);
	const range = Math.round((1 - p) * 12400);
	const speed = (Math.max(0.2, (1 - p) * 38)).toFixed(1);
	const beat = p < 0.3 ? 0 : p < 0.62 ? 1 : 2;
	const docked = p > 0.92;
	return (
		<section ref={ref} className={s.dockTrack} aria-label="The docking approach">
			<div className={s.dockStage}>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={plate} alt="" className={s.dockPlate} aria-hidden />
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={station} alt="Kepler Station, a ring station, against a nebula" className={s.dockStation} />
				<div className={s.dockVignette} aria-hidden />
				<div className={s.dockReticle} data-docked={docked}>
					<Reticle />
				</div>
				<Brackets className={s.dockFrame} />
				<div className={s.readouts} aria-live="off">
					<div>
						<span>RANGE</span>
						<b>{range.toLocaleString('en-GB')} m</b>
					</div>
					<div>
						<span>CLOSING</span>
						<b>{speed} m/s</b>
					</div>
					<div>
						<span>ALIGN</span>
						<b>{docked ? 'LOCKED' : `${(Math.max(0, (1 - p) * 4.2)).toFixed(1)}°`}</b>
					</div>
				</div>
				<div className={s.beats}>
					{beats.slice(0, 3).map((b, i) => (
						<article key={b.title} className={s.beat} data-on={i === beat}>
							<p className={s.beatHead}>
								<span>MSG {String(i + 1).padStart(2, '0')}</span> {b.title}
							</p>
							<p>{b.body}</p>
						</article>
					))}
				</div>
				<p className={s.dockStatus} data-docked={docked}>
					{docked ? 'Docking clamps engaged' : 'Scroll to dock'}
				</p>
			</div>
		</section>
	);
}
