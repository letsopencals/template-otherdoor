'use client';

import { useEffect, useRef, useState } from 'react';
import { Bird } from './art';
import { KEY_COUNT, onKeyFound, useFoundKeys } from './keys';
import { playCuckoo, setSound, useSound } from './sound';
import s from './clockmaker.module.css';

/**
 * The little carved cuckoo clock in the corner. Every time a new compartment
 * reaches the middle of the screen, its door opens and the bird pops out to
 * call the compartment's name. It also cheers each hidden key. It steps aside
 * over the hero (the great clock has its own cuckoo) and while the booking
 * compartment is on screen, so it never covers the panel.
 */
export function CuckooCorner() {
	const [say, setSay] = useState<string | null>(null);
	const [text, setText] = useState('');
	const [hidden, setHidden] = useState(true);
	const sound = useSound();
	const keys = useFoundKeys();
	const timer = useRef(0);
	const current = useRef<string | null>(null);

	useEffect(() => {
		const root = document.querySelector('[data-cw-root]');
		if (!root) return;
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const pop = (text: string) => {
			setSay(text);
			setText(text);
			if (!reduced) playCuckoo();
			window.clearTimeout(timer.current);
			timer.current = window.setTimeout(() => setSay(null), 2400);
		};
		const sections = [...root.querySelectorAll<HTMLElement>('[data-cw-section]')];
		const quiet = new Set<Element>();
		const mid = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (!e.isIntersecting) continue;
					const name = (e.target as HTMLElement).dataset.cwSection ?? '';
					if (name === current.current) continue;
					const first = current.current === null;
					current.current = name;
					if (!first && !(e.target as HTMLElement).hasAttribute('data-cw-quiet')) pop(`Cuck-oo! ${name}`);
				}
			},
			{ rootMargin: '-48% 0px -48% 0px' },
		);
		const away = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (e.isIntersecting) quiet.add(e.target);
					else quiet.delete(e.target);
				}
				setHidden(quiet.size > 0);
			},
			{ threshold: 0, rootMargin: '-65% 0px 0px 0px' },
		);
		sections.forEach((el) => mid.observe(el));
		root.querySelectorAll('[data-cw-quiet]').forEach((el) => away.observe(el));
		const off = onKeyFound((_, total) => pop(total >= KEY_COUNT ? 'Master Clockmaker! All five keys!' : `A key! ${total} of ${KEY_COUNT}`));
		return () => {
			mid.disconnect();
			away.disconnect();
			off();
			window.clearTimeout(timer.current);
		};
	}, []);

	return (
		<aside className={s.corner} data-hidden={hidden ? 'true' : undefined} data-cuckoo={say ? 'on' : undefined} aria-label="The cuckoo clock">
			<p className={s.cornerBalloon} data-show={say ? 'true' : undefined} aria-live="polite">
				{text}
			</p>
			<div className={s.cornerClock} aria-hidden>
				<svg viewBox="0 0 120 150" className={s.cornerCase}>
					<path d="M8 52 L60 6 L112 52 Z" fill="url(#cw-walnut-v)" stroke="#2a160a" strokeWidth="2" />
					<path d="M20 50 L60 16 L100 50" fill="none" stroke="#b47f50" strokeOpacity=".5" strokeWidth="1.4" />
					<path d="M44 34 C50 26 70 26 76 34 C70 30 50 30 44 34 Z" fill="#2a160a" />
					<rect x="14" y="50" width="92" height="92" rx="4" fill="url(#cw-walnut)" stroke="#2a160a" strokeWidth="2" />
					<rect x="38" y="56" width="44" height="34" rx="3" fill="#120904" />
					<rect x="36" y="54" width="48" height="38" rx="4" fill="none" stroke="url(#cw-brass-lin)" strokeWidth="2.4" />
					<circle cx="60" cy="116" r="19" fill="url(#cw-face)" stroke="url(#cw-brass-h)" strokeWidth="4" />
					{[0, 90, 180, 270].map((d) => (
						<rect key={d} x="59" y="100" width="2" height="4" fill="#3b2414" transform={`rotate(${d} 60 116)`} />
					))}
					<path d="M60 116 L60 104 M60 116 L67 119" stroke="#24150b" strokeWidth="2" strokeLinecap="round" />
				</svg>
				<span className={s.cornerBird}>
					<Bird />
				</span>
				<span className={`${s.cornerDoor} ${s.cornerDoorL}`} />
				<span className={`${s.cornerDoor} ${s.cornerDoorR}`} />
			</div>
			<div className={s.cornerTools}>
				<span className={s.cornerKeys} title="Hidden keys found">
					<svg viewBox="0 0 24 24" aria-hidden>
						<circle cx="7" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="2" />
						<path d="M11 12 L22 12 M18 12 L18 16 M21 12 L21 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
					</svg>
					<span className="sr-only">Hidden keys found:</span> {keys.length}/{KEY_COUNT}
				</span>
				<button type="button" className={s.cornerSound} aria-pressed={sound} onClick={() => setSound(!sound)} aria-label={sound ? 'Cuckoo sound on (switch off)' : 'Cuckoo sound off (switch on)'}>
					<svg viewBox="0 0 24 24" aria-hidden>
						<path d="M4 9 L8 9 L13 5 L13 19 L8 15 L4 15 Z" fill="currentColor" />
						{sound ? <path d="M16 8 C18 10 18 14 16 16 M18.5 5.5 C22 9 22 15 18.5 18.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /> : <path d="M16 9 L21 15 M21 9 L16 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />}
					</svg>
				</button>
			</div>
		</aside>
	);
}
