'use client';

import { useState } from 'react';
import s from './clockmaker.module.css';

const HINTS = [
	'Big gears turn slowly and little gears turn fast. Which one is stuck?',
	'Count the cuckoos. Numbers love to hide in plain sight.',
	'If a toy won’t move, look at its back. Toys need their keys.',
	'Hum the tune out loud. Your ears can solve puzzles too.',
];

/** "Ask for a hint": a brass lever that drops one of the game master's gentle sample hints. */
export function HintLever({ name }: { name: string }) {
	const [i, setI] = useState(-1);
	return (
		<div className={s.hint}>
			<button type="button" className={s.hintBtn} data-pulled={i >= 0 ? 'true' : undefined} onClick={() => setI((n) => (n + 1) % HINTS.length)}>
				<span className={s.hintLever} aria-hidden />
				{i < 0 ? `Ask ${name} for a hint` : 'Another hint'}
			</button>
			<p className={s.hintCard} aria-live="polite" data-show={i >= 0 ? 'true' : undefined}>
				{i >= 0 ? <>“{HINTS[i]}”</> : `${name} has a gentle hint ready for every age. Try one.`}
			</p>
		</div>
	);
}
