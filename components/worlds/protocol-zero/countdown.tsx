'use client';

import { useEffect, useRef } from 'react';
import { clockState, clockText, subscribeClock } from './meridian';
import s from './protocol.module.css';

/**
 * The wipe countdown (fiction). Writes its own digits through refs, so a tick
 * never re-renders React. `data-state` drives the styling: calm, fast (near the
 * reservation, it accelerates), low (under five minutes) and wiped (00:00 hold).
 * The colon is a separate glyph in the mono face (Doto's colon reads as a dagger).
 * The markup is the same fixed 60:00 on the server and on the first client
 * render (no clock read in render); the live digits only arrive after mount.
 */
export function Countdown({ className }: { className?: string }) {
	const box = useRef<HTMLSpanElement>(null);
	const mm = useRef<HTMLSpanElement>(null);
	const ss = useRef<HTMLSpanElement>(null);
	useEffect(() => {
		const el = box.current;
		if (!el || !mm.current || !ss.current) return;
		const m = mm.current;
		const sec = ss.current;
		let prev = '';
		let prevState = '';
		const paint = () => {
			const t = clockText();
			if (t !== prev) {
				m.textContent = t.slice(0, 2);
				sec.textContent = t.slice(3, 5);
				el.setAttribute('aria-label', `${t.slice(0, 2)} minutes ${t.slice(3, 5)} seconds`);
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
		<span ref={box} className={className} data-state="calm" role="timer" aria-label="60 minutes 00 seconds">
			<span ref={mm} aria-hidden>
				60
			</span>
			<i className={s.colon} aria-hidden>
				:
			</i>
			<span ref={ss} aria-hidden>
				00
			</span>
		</span>
	);
}
