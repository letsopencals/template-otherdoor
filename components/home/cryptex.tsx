'use client';

import { useCallback, useRef, useState } from 'react';
import s from './cryptex.module.css';

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * The Cryptex: six letter rings. The word is hidden around the page (the gilt
 * letters at the foot of each spine, a note under the lantern, a footnote).
 * The right word opens it and reveals the store's discount code from site-config.
 */
export function Cryptex({ word, code, offer, clues }: { word: string; code: string; offer: string; clues: readonly string[] }) {
	const size = word.length;
	const [rings, setRings] = useState<number[]>(() => Array.from({ length: size }, (_, i) => (i * 7 + 3) % 26));
	const [dir, setDir] = useState<number[]>(() => Array.from({ length: size }, () => 0));
	const [copied, setCopied] = useState(false);
	const open = rings.map((n) => ALPHA[n]).join('') === word.toUpperCase();
	const drag = useRef<{ i: number; y: number } | null>(null);

	const turn = useCallback((i: number, d: number) => {
		setRings((r) => r.map((n, k) => (k === i ? (n + d + 26) % 26 : n)));
		setDir((x) => x.map((v, k) => (k === i ? d : v)));
	}, []);

	return (
		<div className={s.wrap}>
			<div className={`${s.body} ${open ? s.open : ''}`} role="group" aria-label="Cryptex: six letter rings">
				<span className={`${s.cap} ${s.capL}`} aria-hidden />
				<div className={s.rings}>
					{rings.map((n, i) => (
						<div key={i} className={s.ring}>
							<button type="button" onClick={() => turn(i, -1)} aria-label={`Ring ${i + 1}: previous letter`} disabled={open}>
								▲
							</button>
							<div
								className={s.window}
								tabIndex={open ? -1 : 0}
								role="spinbutton"
								aria-label={`Ring ${i + 1}`}
								aria-valuetext={ALPHA[n]}
								aria-valuenow={n}
								aria-valuemin={0}
								aria-valuemax={25}
								onKeyDown={(e) => {
									if (e.key === 'ArrowUp') { e.preventDefault(); turn(i, -1); }
									if (e.key === 'ArrowDown') { e.preventDefault(); turn(i, 1); }
									if (/^[a-z]$/i.test(e.key)) { const t = ALPHA.indexOf(e.key.toUpperCase()); setRings((r) => r.map((v, k) => (k === i ? t : v))); }
								}}
								onWheel={(e) => turn(i, e.deltaY > 0 ? 1 : -1)}
								onPointerDown={(e) => { drag.current = { i, y: e.clientY }; e.currentTarget.setPointerCapture(e.pointerId); }}
								onPointerMove={(e) => {
									const d = drag.current;
									if (!d || d.i !== i) return;
									if (Math.abs(e.clientY - d.y) > 22) { turn(i, e.clientY > d.y ? 1 : -1); d.y = e.clientY; }
								}}
								onPointerUp={() => { drag.current = null; }}
							>
								<span key={`${n}-${dir[i]}`} className={s.letter} style={{ ['--from' as string]: dir[i]! > 0 ? '60%' : '-60%' }}>
									{ALPHA[n]}
								</span>
							</div>
							<button type="button" onClick={() => turn(i, 1)} aria-label={`Ring ${i + 1}: next letter`} disabled={open}>
								▼
							</button>
						</div>
					))}
				</div>
				<span className={`${s.cap} ${s.capR}`} aria-hidden />
			</div>
			<div aria-live="polite">
				{open ? (
					<div className={s.scroll}>
						<p className="engraved text-sepia">The cryptex opens</p>
						<p className="font-display mt-2 text-2xl">A scroll from the society: {offer}.</p>
						<span className={s.code}>{code}</span>
						<p className="text-sm">Enter it in your satchel. Once per explorer; the Matinee offer may beat it on weekday afternoons.</p>
						<button
							type="button"
							className="plate plate-sm mt-4"
							onClick={async () => {
								try {
									await navigator.clipboard.writeText(code);
									setCopied(true);
								} catch {
									setCopied(false);
								}
							}}
						>
							{copied ? 'Copied' : 'Copy the code'}
						</button>
					</div>
				) : (
					<ul className="max-w-lg space-y-1 text-center text-[0.95rem] opacity-85">
						{clues.map((c) => (
							<li key={c} className="typed">
								{c}
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
}
