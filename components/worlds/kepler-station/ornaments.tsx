import s from './kepler.module.css';

/**
 * A hull seam between mission phases: a riveted titanium plate with panel lines,
 * a stencilled phase number, a hazard patch and the mission clock time. It
 * carries the anchor-free label for the phase that follows (the section below
 * holds the id).
 */
export function HullSeam({ n, label, t }: { n: string; label: string; t: string }) {
	return (
		<div className={s.seam} aria-hidden>
			<svg className={s.seamPlate} viewBox="0 0 1440 72" preserveAspectRatio="none">
				<defs>
					<linearGradient id={`kSeam${n}`} x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#3c4660" />
						<stop offset=".18" stopColor="#252d43" />
						<stop offset=".82" stopColor="#141a2b" />
						<stop offset="1" stopColor="#0a0e1b" />
					</linearGradient>
				</defs>
				<rect width="1440" height="72" fill={`url(#kSeam${n})`} />
				<path d="M0 1.5H1440M0 70.5H1440" stroke="#8792a8" strokeOpacity=".35" />
				{[180, 520, 900, 1260].map((x) => (
					<path key={x} d={`M${x} 0V72`} stroke="#05080f" strokeOpacity=".7" strokeWidth="2" />
				))}
				{[180, 520, 900, 1260].map((x) => (
					<path key={`h${x}`} d={`M${x + 2} 0V72`} stroke="#8792a8" strokeOpacity=".18" />
				))}
			</svg>
			<span className={s.rivets} />
			<span className={s.seamLabel}>
				<b>{n}</b>
				<span>{label}</span>
			</span>
			<span className={s.seamHazard} />
			<span className={s.seamT}>{t}</span>
		</div>
	);
}

/**
 * The hero's overlay: the shuttle's approach arc (a dashed trajectory with a
 * moving marker and range ticks) and a few pieces of debris drifting across the
 * frame. Pure SVG + CSS; static under reduced motion.
 */
export function HeroOrbit({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden>
			<defs>
				<linearGradient id="kTraj" x1="0" x2="1">
					<stop offset="0" stopColor="#3ed2d6" stopOpacity="0" />
					<stop offset=".5" stopColor="#3ed2d6" stopOpacity=".6" />
					<stop offset="1" stopColor="#f2a33a" stopOpacity=".9" />
				</linearGradient>
			</defs>
			<path id="kTrajPath" d="M1620 840C1390 790 1160 680 1020 590S860 470 812 438" className={s.traj} stroke="url(#kTraj)" />
			{[0.15, 0.35, 0.55, 0.75].map((t, i) => (
				<text key={t} className={s.trajTick}>
					<textPath href="#kTrajPath" startOffset={`${Math.round(t * 100)}%`}>
						{`· ${[12, 8, 4, 1][i]} KM`}
					</textPath>
				</text>
			))}
			<g className={s.shuttleMark}>
				<circle r="5" />
				<circle r="12" className={s.shuttleHalo} />
			</g>
			<circle cx="790" cy="430" r="26" className={s.target} />
			<path d="M790 392v14M790 454v14M752 430h14M814 430h14" className={s.targetCross} />
			<g className={s.debrisField}>
				<path d="M0 0l9 3-4 7-8-2z" className={s.deb1} />
				<path d="M0 0l5 1-2 4-4-1z" className={s.deb2} />
				<path d="M0 0l14 4-6 9-11-4z" className={s.deb3} />
				<path d="M0 0l4 2-2 3z" className={s.deb4} />
			</g>
		</svg>
	);
}
