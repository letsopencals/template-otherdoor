'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { type Line, resetMeridian, say, subscribeVoice, voiceServerSnapshot, voiceSnapshot } from './meridian';
import { Countdown } from './countdown';
import s from './protocol.module.css';

const FALLBACK: Line = { id: -1, text: '', from: 'meridian' };
const IDLE = ['Still there? I can hear the fans spinning.', 'You stopped scrolling. Thinking is allowed. Briefly.', 'I counted your blinks. Do you want the number?'];

/**
 * MERIDIAN's direct line. Desktop: a terminal window that rides beside the
 * modules (sticky rail). Phones: a one-line dock at the bottom, shown only
 * while the modules are on screen (never over the booking panel's total bar).
 * The newest line types out; screen readers get the whole line at once.
 */
export function MeridianConsole({ watch }: { watch: string }) {
	const lines = useSyncExternalStore(subscribeVoice, voiceSnapshot, voiceServerSnapshot);
	const last = lines[lines.length - 1] ?? FALLBACK;
	const [typed, setTyped] = useState(last.text.length);
	const [dock, setDock] = useState(false);

	useEffect(() => {
		resetMeridian();
	}, []);

	// Type the newest line.
	useEffect(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			setTyped(last.text.length);
			return;
		}
		setTyped(0);
		const len = last.text.length;
		const id = setInterval(() => {
			setTyped((n) => {
				if (n + 1 >= len) clearInterval(id);
				return Math.min(len, n + 1);
			});
		}, 26);
		return () => clearInterval(id);
	}, [last.id, last.text]);

	// Dock only while the modules are in view.
	useEffect(() => {
		const el = document.getElementById(watch);
		if (!el) return;
		const io = new IntersectionObserver(([e]) => setDock(Boolean(e?.isIntersecting)), { rootMargin: '-30% 0px -10% 0px' });
		io.observe(el);
		return () => io.disconnect();
	}, [watch]);

	// Idle remarks (also the non-hover way MERIDIAN notices touch readers).
	useEffect(() => {
		if (!dock) return;
		let n = 0;
		let t: ReturnType<typeof setTimeout>;
		const arm = () => {
			clearTimeout(t);
			if (n >= IDLE.length) return;
			t = setTimeout(() => {
				say(IDLE[n] ?? '');
				n += 1;
			}, 15000);
		};
		arm();
		const evs = ['scroll', 'pointermove', 'keydown', 'touchstart'] as const;
		evs.forEach((e) => window.addEventListener(e, arm, { passive: true }));
		return () => {
			clearTimeout(t);
			evs.forEach((e) => window.removeEventListener(e, arm));
		};
	}, [dock]);

	const shown = last.text.slice(0, typed);
	const busy = typed < last.text.length;

	return (
		<>
			<p className="sr-only" aria-live="polite">
				MERIDIAN: {last.text}
			</p>
			<div className={s.rail}>
				<div className={s.railStick}>
					<div className={s.console} aria-hidden>
						<div className={s.consoleBar}>
							<Wave />
							<span className={s.consoleName}>MERIDIAN</span>
							<span className={s.consoleLink}>direct line</span>
						</div>
						<div className={s.consoleBody}>
							{lines.slice(0, -1).map((l) => (
								<p key={l.id} className={s.consoleLine}>
									<b>{l.from === 'system' ? 'SYS' : 'M'}›</b> {l.text}
								</p>
							))}
							<p key={last.id} className={`${s.consoleLine} ${s.consoleNow}`}>
								<b>{last.from === 'system' ? 'SYS' : 'M'}›</b> {shown}
								<i className={busy ? s.caretBusy : s.caret} />
							</p>
						</div>
						<div className={s.consoleFoot}>
							<span>Wipe in</span>
							<Countdown className={s.consoleClock} />
						</div>
					</div>
				</div>
			</div>
			<div className={s.dock} data-show={dock ? '' : undefined} aria-hidden>
				<Wave />
				<p className={s.dockLine}>
					{shown}
					<i className={busy ? s.caretBusy : s.caret} />
				</p>
				<Countdown className={s.dockClock} />
			</div>
		</>
	);
}

/** MERIDIAN's face: a cyan waveform (no eye, no lens). */
function Wave() {
	return (
		<svg className={s.wave} viewBox="0 0 48 16" aria-hidden>
			<path d="M0 8 C4 8 5 3 8 3 S12 13 16 13 S20 2 24 2 S28 14 32 14 S36 5 40 5 S44 8 48 8" />
			<path d="M0 8 C4 8 5 6 8 6 S12 10 16 10 S20 5 24 5 S28 11 32 11 S36 7 40 7 S44 8 48 8" />
		</svg>
	);
}
