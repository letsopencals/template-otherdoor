'use client';

import { useEffect, useState } from 'react';
import { RingGauge } from './hud';

/** Life support, falling slowly from 31% while you read. Reduced motion: holds. */
export function LifeSupport({ start = 31, size }: { start?: number; size?: number }) {
	const [v, setV] = useState(start);
	useEffect(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const t = window.setInterval(() => setV((x) => (x > 12 ? Math.round((x - 0.1) * 10) / 10 : x)), 1400);
		return () => window.clearInterval(t);
	}, []);
	return <RingGauge value={v} label="LIFE SUPPORT" size={size} />;
}

/** Mission clock: time since the beacon woke (counts up from a fixed offset). */
export function MissionClock() {
	const [s, setS] = useState(0);
	useEffect(() => {
		const t = window.setInterval(() => setS((x) => x + 1), 1000);
		return () => window.clearInterval(t);
	}, []);
	const total = 90 * 60 - s;
	const m = Math.max(0, Math.floor(total / 60));
	const sec = Math.max(0, total % 60);
	return (
		<span suppressHydrationWarning>
			T−{String(m).padStart(2, '0')}:{String(sec).padStart(2, '0')}
		</span>
	);
}
