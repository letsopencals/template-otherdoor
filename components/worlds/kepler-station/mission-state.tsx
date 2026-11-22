'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import s from './kepler.module.css';

/**
 * The station's shared state: whether the crew has restored power (the restore-
 * power puzzle), tuned the commander's signal and cycled the airlock. The world
 * root carries it as data attributes so CSS anywhere on the page can react (the
 * lights come back across the page) without transforms or filters on the
 * booking panel's ancestors.
 */
interface MissionState {
	power: boolean;
	/** Life support, %: falls slowly from 31 while you read, climbs to 100 once power is restored. */
	o2: number;
	tuned: boolean;
	restore: () => void;
	markTuned: () => void;
}

const Ctx = createContext<MissionState>({ power: false, o2: 31, tuned: false, restore: () => undefined, markTuned: () => undefined });

export function useMission() {
	return useContext(Ctx);
}

export function MissionRoot({ className, style, children }: { className: string; style?: CSSProperties; children: ReactNode }) {
	const [power, setPower] = useState(false);
	const [tuned, setTuned] = useState(false);
	const [surge, setSurge] = useState(0);
	const restore = useCallback(() => {
		if (power) return;
		setPower(true);
		setSurge((n) => n + 1);
	}, [power]);
	const markTuned = useCallback(() => setTuned(true), []);
	const [o2, setO2] = useState(31);
	const full = o2 >= 100;
	useEffect(() => {
		const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (power) {
			if (full) return;
			if (still) {
				setO2(100);
				return;
			}
			const t = window.setInterval(() => setO2((v) => (v >= 100 ? 100 : Math.min(100, Math.round((v + 1.7) * 10) / 10))), 50);
			return () => window.clearInterval(t);
		}
		if (still) return;
		const t = window.setInterval(() => setO2((v) => (v > 12 ? Math.round((v - 0.1) * 10) / 10 : v)), 1600);
		return () => window.clearInterval(t);
	}, [power, full]);
	const rootRef = useRef<HTMLDivElement>(null);
	// Ambient CSS loops sleep in phases that are off screen.
	useEffect(() => {
		const root = rootRef.current;
		if (!root) return;
		const parts = Array.from(root.children).filter((el): el is HTMLElement => el instanceof HTMLElement);
		const io = new IntersectionObserver(
			(entries) => {
				for (const e of entries) (e.target as HTMLElement).dataset.asleep = e.isIntersecting ? 'false' : 'true';
			},
			{ rootMargin: '200px 0px' },
		);
		parts.forEach((el) => io.observe(el));
		return () => io.disconnect();
	}, []);
	const value = useMemo(() => ({ power, o2, tuned, restore, markTuned }), [power, o2, tuned, restore, markTuned]);
	return (
		<Ctx.Provider value={value}>
			<div ref={rootRef} className={className} style={style} data-power={power ? 'on' : 'off'} data-tuned={tuned ? 'yes' : 'no'}>
				{children}
				{surge ? <span key={surge} className={s.surge} aria-hidden /> : null}
			</div>
		</Ctx.Provider>
	);
}
