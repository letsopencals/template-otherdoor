'use client';

import { useEffect, useRef } from 'react';
import { clockState, clockText, subscribeClock } from './meridian';

/**
 * The wipe countdown (fiction). Writes its own text through a ref, so a tick
 * never re-renders React. `data-state` drives the styling: calm, fast (near the
 * reservation, it accelerates), low (under five minutes) and wiped (00:00 hold).
 */
export function Countdown({ className }: { className?: string }) {
	const ref = useRef<HTMLSpanElement>(null);
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		let prev = '';
		let prevState = '';
		const paint = () => {
			const t = clockText();
			if (t !== prev) {
				el.textContent = t;
				prev = t;
			}
			const c = clockState();
			const st = c.wiped ? 'wiped' : c.remaining < 300 ? 'low' : c.fast ? 'fast' : 'calm';
			if (st !== prevState) {
				el.dataset.state = st;
				prevState = st;
			}
		};
		paint();
		return subscribeClock(paint);
	}, []);
	return (
		<span ref={ref} className={className} data-state="calm" suppressHydrationWarning>
			60:00
		</span>
	);
}
