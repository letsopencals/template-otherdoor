'use client';

import { RingGauge } from './hud';
import { useMission } from './mission-state';

/** Life support as a ring gauge, read from the mission state (falls, or climbs once power is back). */
export function LifeSupport({ size, label = 'LIFE SUPPORT' }: { size?: number; label?: string }) {
	const { o2 } = useMission();
	return <RingGauge value={o2} label={label} size={size} />;
}

/** Just the number, for inline readouts. */
export function O2Value() {
	const { o2 } = useMission();
	return <>{o2.toFixed(1)}%</>;
}
