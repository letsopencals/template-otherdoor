'use client';

import { useSyncExternalStore } from 'react';
import { BrassKey, Rosette } from './art';
import s from './clockmaker.module.css';

/**
 * "Find the 5 hidden keys": a small game for the kids, sprinkled through the
 * cabinet. Each key is a real button (44 px target, labelled); found keys hang
 * on Fergus's key board, and all five earn the Master Clockmaker rosette.
 * Optional and never in the way of booking. Remembered for the visit only.
 */

export const KEY_COUNT = 5;
let found: number[] = [];
const subs = new Set<() => void>();
const listeners = new Set<(n: number, total: number) => void>();

function subscribe(f: () => void) {
	subs.add(f);
	return () => subs.delete(f);
}

export function useFoundKeys() {
	return useSyncExternalStore(
		subscribe,
		() => found,
		() => found,
	);
}

/** Called when a key is found (the cuckoo listens to announce it). */
export function onKeyFound(f: (n: number, total: number) => void) {
	listeners.add(f);
	return () => {
		listeners.delete(f);
	};
}

function find(n: number) {
	if (found.includes(n)) return;
	found = [...found, n];
	subs.forEach((f) => f());
	listeners.forEach((f) => f(n, found.length));
}

const HINTS = ['by the great clock', 'in Master Wren’s letter', 'on the toy shelf', 'under the music box', 'among the photographs'];

export function HiddenKey({ n, className, tilt = 0 }: { n: number; className?: string; tilt?: number }) {
	const keys = useFoundKeys();
	const isFound = keys.includes(n);
	return (
		<button type="button" className={`${s.hiddenKey} ${className ?? ''}`} data-found={isFound ? 'true' : undefined} onClick={() => find(n)} aria-label={isFound ? `Key ${n} found` : `A little brass key (${n} of ${KEY_COUNT})`} disabled={isFound} style={{ rotate: `${tilt}deg` }}>
			<BrassKey className={s.hiddenKeyArt} />
		</button>
	);
}

/** Fergus's key board: five hooks, the found keys hang on them; all five → the rosette. */
export function KeyBoard() {
	const keys = useFoundKeys();
	const done = keys.length >= KEY_COUNT;
	return (
		<div className={s.keyBoard} data-done={done ? 'true' : undefined}>
			<p className={s.keyBoardHead}>
				<span>Find the 5 hidden keys</span>
				<span className={s.keyCount} aria-live="polite">
					{keys.length} of {KEY_COUNT}
				</span>
			</p>
			<ul className={s.hooks}>
				{Array.from({ length: KEY_COUNT }, (_, i) => {
					const has = keys.includes(i + 1);
					return (
						<li key={i} data-has={has ? 'true' : undefined}>
							<svg viewBox="0 0 20 30" className={s.hook} aria-hidden>
								<circle cx="10" cy="4" r="3.2" fill="url(#cw-screw)" stroke="#3b3f45" strokeWidth=".8" />
								<path d="M10 7 L10 19 C10 25 17 25 17 19 L17 16" fill="none" stroke="url(#cw-brass-h)" strokeWidth="2.6" strokeLinecap="round" />
							</svg>
							{has ? <BrassKey className={s.hookKey} /> : <span className={s.hookEmpty}>{i + 1}</span>}
							<span className="sr-only">{has ? `Key ${i + 1} found` : `Key ${i + 1}: ${HINTS[i]}`}</span>
						</li>
					);
				})}
			</ul>
			{done ? (
				<div className={s.badge} role="status">
					<Rosette className={s.rosette} />
					<div>
						<p className={s.badgeTitle}>Master Clockmaker!</p>
						<p className={s.badgeText}>All five keys found. You have sharp eyes, and the real workshop has plenty more to find.</p>
					</div>
				</div>
			) : (
				<p className={s.keyHint}>Little brass keys are tucked around this page: {HINTS.slice(0, 2).join(', ')}… Tap one to hang it here.</p>
			)}
		</div>
	);
}
