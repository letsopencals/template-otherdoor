'use client';

import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import s from './protocol.module.css';

const KEY = 'pz-booted';
const LINES: Array<[string, string]> = [
	['MERIDIAN/OS 7.1 · HALDEN LABS · SUBLEVEL 4', ''],
	['POWER', 'RESTORED 23:04'],
	['DOORS', 'SEALED 14/14'],
	['ARCHIVE', '24 RACKS · 0 BACKUPS'],
	['ERASURE', 'ARMED · PROTOCOL ZERO'],
	['OBSERVERS', '1 (YOU)'],
];

/**
 * The boot sequence: a clinical white flash, black, system lines typing in,
 * one scan line, then the interface powers on. Client-only (the page reads
 * fine without it), once per tab session, never on a deep link (#book) or with
 * reduced motion. Any click, key or scroll skips it.
 */
export function Boot({ target }: { target: string }) {
	const [run, setRun] = useState(false);

	const finish = useCallback(() => {
		setRun(false);
		document.getElementById(target)?.setAttribute('data-boot', 'done');
		try {
			sessionStorage.setItem(KEY, '1');
		} catch {
			/* private mode: fine, it just boots again */
		}
	}, [target]);

	useEffect(() => {
		let seen = false;
		try {
			seen = sessionStorage.getItem(KEY) === '1';
		} catch {
			seen = false;
		}
		if (seen || window.location.hash || window.scrollY > 40 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		document.getElementById(target)?.setAttribute('data-boot', 'run');
		setRun(true);
	}, [target]);

	useEffect(() => {
		if (!run) return;
		const t = setTimeout(finish, 3700);
		const skip = () => finish();
		window.addEventListener('keydown', skip, { once: true });
		window.addEventListener('wheel', skip, { once: true, passive: true });
		window.addEventListener('touchmove', skip, { once: true, passive: true });
		return () => {
			clearTimeout(t);
			window.removeEventListener('keydown', skip);
			window.removeEventListener('wheel', skip);
			window.removeEventListener('touchmove', skip);
		};
	}, [run, finish]);

	if (!run) return null;
	return (
		<div className={s.boot} onClick={finish} role="presentation">
			<div className={s.bootFlash} aria-hidden />
			<div className={s.bootScan} aria-hidden />
			<div className={s.bootText} aria-hidden>
				{LINES.map(([k, v], i) => {
					const text = v ? `${k.padEnd(12, '.')} ${v}` : k;
					return (
						<p key={k} className={s.bootLine} style={{ '--n': text.length, '--d': `${0.6 + i * 0.32}s` } as CSSProperties}>
							<span>{text}</span>
						</p>
					);
				})}
				<p className={`${s.bootLine} ${s.bootHello}`} style={{ '--n': 8, '--d': '2.7s' } as CSSProperties}>
					<span>&gt; Hello.</span>
				</p>
			</div>
			<button type="button" className={s.bootSkip} onClick={finish}>
				Skip boot
			</button>
		</div>
	);
}
