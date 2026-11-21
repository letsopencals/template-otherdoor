'use client';

import { useRef, type ReactNode } from 'react';
import { useScrollProgress } from './use-scroll-progress';
import s from './kepler.module.css';

/**
 * Between scenes: an airlock. The two pressure doors part as you scroll, onto
 * the next scene (children, with their own picture behind).
 */
export function Airlock({ label, children }: { label: string; children: ReactNode }) {
	const ref = useRef<HTMLDivElement>(null);
	useScrollProgress(ref, 'track');
	return (
		<section ref={ref} className={s.airTrack} aria-label={label}>
			<div className={s.airStage}>
				<div className={s.airScene}>{children}</div>
				<div className={s.airDoors} aria-hidden>
					<span className={`${s.airDoor} ${s.airLeft}`}>
						<i className={s.hazard} />
						<i className={s.airWindow} />
					</span>
					<span className={`${s.airDoor} ${s.airRight}`}>
						<i className={s.hazard} />
						<i className={s.airWindow} />
					</span>
					<span className={s.airSeam} />
					<span className={s.airPlate}>{label}</span>
				</div>
			</div>
		</section>
	);
}
