'use client';

import { useRef, type ReactNode } from 'react';
import { TinBird, TinMouse, TinRobot } from './art';
import { HiddenKey } from './keys';
import s from './clockmaker.module.css';

interface Toy {
	id: string;
	name: string;
	what: string;
	art: ReactNode;
	gait: 'roll' | 'hop' | 'march';
	speed: number;
}

const TOYS: Toy[] = [
	{ id: 'pip', name: 'Pip', what: 'the tin mouse', art: <TinMouse />, gait: 'roll', speed: 1.25 },
	{ id: 'tansy', name: 'Tansy', what: 'the tin songbird', art: <TinBird />, gait: 'hop', speed: 0.95 },
	{ id: 'bolt', name: 'Bolt', what: 'the copper robot', art: <TinRobot />, gait: 'march', speed: 0.7 },
];

/**
 * The toy shelf: tap a toy and it winds itself up, walks the length of the
 * shelf in its own gait (Pip rolls, Tansy hops, Bolt marches), turns round and
 * comes home. Web Animations on the toy's wrapper; the legs, wheels and key are
 * CSS while `data-walking` is set. Reduced motion: a little wiggle on the spot.
 */
export function ToyShelf() {
	const shelf = useRef<HTMLDivElement>(null);
	return (
		<div className={s.shelfWrap}>
			<div ref={shelf} className={s.shelf}>
				{TOYS.map((t) => (
					<ToyButton key={t.id} toy={t} shelf={shelf} />
				))}
				<HiddenKey n={3} className={s.key3} tilt={12} />
			</div>
			<div className={s.shelfBoard} aria-hidden />
			<p className={s.shelfNote}>Tap a toy to wind it up.</p>
		</div>
	);
}

function ToyButton({ toy, shelf }: { toy: Toy; shelf: React.RefObject<HTMLDivElement | null> }) {
	const ref = useRef<HTMLButtonElement>(null);
	const inner = useRef<HTMLSpanElement>(null);
	const busy = useRef(false);

	const go = async () => {
		const el = ref.current;
		const body = inner.current;
		const sh = shelf.current;
		if (!el || !body || !sh || busy.current) return;
		busy.current = true;
		el.dataset.walking = 'true';
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		try {
			if (reduced) {
				await body.animate([{ rotate: '0deg' }, { rotate: '-4deg' }, { rotate: '4deg' }, { rotate: '0deg' }], { duration: 500 }).finished;
				return;
			}
			const sr = sh.getBoundingClientRect();
			const r = el.getBoundingClientRect();
			const right = sr.right - r.right - 4;
			const left = r.left - sr.left - 4;
			const dist = right >= left ? right : -left;
			const dur = Math.max(1100, (Math.abs(dist) / toy.speed) * 6);
			const face = dist >= 0 ? 1 : -1;
			// Wind-up shiver first, then off it goes.
			await body.animate([{ translate: '0 0' }, { translate: '0 -3px' }, { translate: '0 0' }], { duration: 260, iterations: 2 }).finished;
			body.style.scale = `${face} 1`;
			await el.animate([{ translate: '0 0' }, { translate: `${Math.round(dist)}px 0` }], { duration: dur, easing: 'cubic-bezier(.45,.05,.4,1)', fill: 'forwards' }).finished;
			body.style.scale = `${-face} 1`;
			await el.animate([{ translate: `${Math.round(dist)}px 0` }, { translate: '0 0' }], { duration: dur * 0.9, easing: 'cubic-bezier(.45,.05,.4,1)', fill: 'forwards' }).finished;
			body.style.scale = '';
			el.getAnimations().forEach((a) => a.cancel());
		} finally {
			delete el.dataset.walking;
			busy.current = false;
		}
	};

	return (
		<button ref={ref} type="button" className={s.toy} data-gait={toy.gait} onClick={go} aria-label={`Wind up ${toy.name}, ${toy.what}`}>
			<span ref={inner} className={s.toyBody}>
				{toy.art}
			</span>
			<span className={s.toyTag}>
				<b>{toy.name}</b> <span>{toy.what}</span>
			</span>
		</button>
	);
}
