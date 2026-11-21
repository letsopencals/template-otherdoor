'use client';

import { useMemo, useRef, type CSSProperties } from 'react';
import { placeTrain, trainBox, type GearSpec } from './gears';
import { GearBody } from './gear-art';
import { useMainspring } from './spring';
import s from './clockmaker.module.css';

const pct = (n: number) => `${Math.round(n * 10000) / 100}%`;

/**
 * A train of meshing gears, laid out responsively (percentages of the train's
 * box, so it scales with its container's width). Each gear rotates as its own
 * SVG from `--a`, which this component writes from the mainspring while the
 * train is on screen. `running={false}` holds the train still (a compartment
 * gear that has not engaged yet); when it starts again it continues from where
 * it stopped instead of jumping.
 */
export function GearTrain({ specs, m, className, running = true, speed = 1, style }: { specs: GearSpec[]; m: number; className?: string; running?: boolean; speed?: number; style?: CSSProperties }) {
	const ref = useRef<HTMLDivElement>(null);
	const gears = useMemo(() => placeTrain(specs, m), [specs, m]);
	const box = useMemo(() => trainBox(gears, m), [gears, m]);
	const state = useRef({ local: 0, offset: Number.NaN, running });
	state.current.running = running;

	useMainspring(ref, (a) => {
		const st = state.current;
		const master = a * speed;
		if (!st.running) {
			st.offset = Number.NaN;
			return;
		}
		if (Number.isNaN(st.offset)) st.offset = master - st.local;
		st.local = master - st.offset;
		ref.current?.style.setProperty('--a', st.local.toFixed(2));
	});

	return (
		<div ref={ref} className={`${s.train} ${className ?? ''}`} style={{ aspectRatio: `${box.w} / ${box.h}`, ...style }} aria-hidden>
			{gears.map((g) => {
				const size = (g.ro * 2 + 2) / box.w;
				return (
					<span
						key={g.id}
						className={s.gear}
						data-tone={g.tone}
						style={
							{
								left: pct((g.x - g.ro - 1 - box.x) / box.w),
								top: pct((g.y - g.ro - 1 - box.y) / box.h),
								width: pct(size),
								'--k': g.k,
								'--c': g.c,
							} as CSSProperties
						}
					>
						<i className={s.gearShadow} />
						<GearBody g={g} m={m} />
						<i className={s.gearSheen} />
						<i className={s.gearArbor} />
					</span>
				);
			})}
		</div>
	);
}
