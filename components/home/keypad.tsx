'use client';

import { useCallback, useEffect, useState } from 'react';
import s from './keypad.module.css';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'enter'] as const;

/**
 * The keypad lock. The code hides on the page (the doors, the flashlight, the
 * questions); the right four digits unlock and show the store's discount code.
 * Works with the keyboard too (digits, Backspace, Enter).
 */
export function Keypad({ code, reward, offer, clues }: { code: string; reward: string; offer: string; clues: readonly string[] }) {
	const [entry, setEntry] = useState('');
	const [state, setState] = useState<'idle' | 'wrong' | 'open'>('idle');
	const [clue, setClue] = useState(-1);
	const [copied, setCopied] = useState(false);

	const press = useCallback(
		(k: string) => {
			if (state === 'open') return;
			if (k === 'clear') {
				setEntry('');
				setState('idle');
				return;
			}
			if (k === 'enter') {
				if (entry === code) setState('open');
				else {
					setState('wrong');
					window.setTimeout(() => {
						setEntry('');
						setState('idle');
					}, 900);
				}
				return;
			}
			setState('idle');
			setEntry((e) => (e.length >= code.length ? e : e + k));
		},
		[entry, code, state],
	);

	useEffect(() => {
		if (entry.length === code.length && state === 'idle') {
			const t = window.setTimeout(() => press('enter'), 260);
			return () => window.clearTimeout(t);
		}
	}, [entry, code.length, state, press]);

	return (
		<div className={s.wrap} data-state={state}>
			<div
				className={s.device}
				tabIndex={0}
				role="group"
				aria-label="Keypad lock: enter four digits"
				onKeyDown={(e) => {
					if (/^[0-9]$/.test(e.key)) press(e.key);
					else if (e.key === 'Backspace') setEntry((x) => x.slice(0, -1));
					else if (e.key === 'Enter') press('enter');
				}}
			>
				<div className={s.screen} aria-live="polite">
					<span className={s.led} aria-hidden />
					<span className={s.digits}>
						{Array.from({ length: code.length }, (_, i) => (
							<span key={i} className={s.digit} data-filled={i < entry.length}>
								{state === 'open' ? code[i] : i < entry.length ? '•' : ''}
							</span>
						))}
					</span>
					<span className={s.status}>{state === 'open' ? 'Unlocked' : state === 'wrong' ? 'Wrong code' : 'Locked'}</span>
				</div>
				<div className={s.keys}>
					{KEYS.map((k) => (
						<button key={k} type="button" className={s.key} data-kind={k.length > 1 ? 'fn' : 'digit'} onClick={() => press(k)} aria-label={k === 'clear' ? 'Clear' : k === 'enter' ? 'Enter' : k}>
							{k === 'clear' ? 'Clr' : k === 'enter' ? '↵' : k}
						</button>
					))}
				</div>
			</div>

			<div className={s.side}>
				{state === 'open' ? (
					<div className={s.prize}>
						<p className="label">The door opens</p>
						<p className={s.reward}>{reward}</p>
						<p className="text-ink-2">{offer}. Enter it in your doors before checkout.</p>
						<button
							type="button"
							className="btn btn-sm mt-5"
							onClick={() => {
								void navigator.clipboard?.writeText(reward).then(() => setCopied(true));
							}}
						>
							{copied ? 'Copied' : 'Copy the code'}
						</button>
					</div>
				) : (
					<div>
						<p className="text-[1.05rem] leading-relaxed text-ink-2">Four digits open this lock. Everything you need is somewhere on this page: look closely at the doors, sweep the dark with a torch, read the small print.</p>
						<button type="button" className="btn btn-glass btn-sm mt-6" onClick={() => setClue((c) => Math.min(c + 1, clues.length - 1))} disabled={clue >= clues.length - 1}>
							{clue < 0 ? 'I need a clue' : clue < clues.length - 1 ? 'Another clue' : 'No more clues'}
						</button>
						<ol className={s.clues}>
							{clues.slice(0, clue + 1).map((c, i) => (
								<li key={c}>
									<span className="mono text-ink-3">{String(i + 1).padStart(2, '0')}</span> {c}
								</li>
							))}
						</ol>
					</div>
				)}
			</div>
		</div>
	);
}
