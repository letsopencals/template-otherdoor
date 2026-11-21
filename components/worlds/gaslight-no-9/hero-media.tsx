'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import s from './gaslight.module.css';

/** Gas lamps and the lit window in the hero loop, as fractions of the 16:9 frame. */
const LAMPS = [
	{ x: 42.6, y: 25.2, size: 13, phase: 0 },
	{ x: 56.4, y: 39.2, size: 6, phase: 1.7 },
	{ x: 62.2, y: 44.4, size: 3.6, phase: 0.6 },
	{ x: 78.1, y: 28.3, size: 9, phase: 2.9 },
	{ x: 74, y: 40.6, size: 3.6, phase: 1.1 },
];

/**
 * The rain-soaked street: the hero loop over its poster inside a 16:9 frame sized to cover
 * the screen, so the gas-lamp glows stay on the lamps at any aspect ratio. The lamps flicker
 * out of step (CSS), the window glows, and two fog layers drift across. Everything pauses when
 * the hero is off screen; reduced motion keeps the poster and steady lamps.
 */
export function HeroMedia({ src, poster, fog }: { src?: string; poster?: string; fog: string }) {
	const ref = useRef<HTMLVideoElement>(null);
	const [on, setOn] = useState(false);
	const [posterOk, setPosterOk] = useState(Boolean(poster));
	useEffect(() => {
		if (!src || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		setOn(true);
	}, [src]);
	return (
		<Live className={s.heroMedia} onChange={(live) => {
			const v = ref.current;
			if (!v) return;
			if (live) {
				v.muted = true;
				v.play().catch(() => undefined);
			} else v.pause();
		}}>
			<div className={s.heroFrame}>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				{posterOk && poster ? <img src={poster} alt="" onError={() => setPosterOk(false)} /> : null}
				{on && src ? (
					<video
						ref={(v) => {
							ref.current = v;
							if (v) {
								v.muted = true;
								v.play().catch(() => undefined);
							}
						}}
						src={src}
						muted
						loop
						playsInline
						autoPlay
						preload="auto"
						onError={() => setOn(false)}
					/>
				) : null}
				{LAMPS.map((l, i) => (
					<i key={i} className={s.lampGlow} style={{ left: `${l.x}%`, top: `${l.y}%`, width: `${l.size}%`, animationDelay: `${-l.phase}s`, animationDuration: `${3.2 + (i % 3) * 1.1}s` }} />
				))}
				<i className={s.windowGlow} />
			</div>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img className={s.fogPlate} src={fog} alt="" loading="eager" decoding="async" onError={(e) => (e.currentTarget.style.display = 'none')} />
			<span className={s.fogWisp} />
			<span className={`${s.fogWisp} ${s.fogWisp2}`} />
		</Live>
	);
}

/** A wrapper that sets `data-live` while it is on screen (CSS pauses animations without it). */
export function Live({ className, children, onChange, as: Tag = 'div', id, label }: { className?: string; children: ReactNode; onChange?: (live: boolean) => void; as?: 'div' | 'section' | 'header'; id?: string; label?: string }) {
	const ref = useRef<HTMLElement>(null);
	const cb = useRef(onChange);
	cb.current = onChange;
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const io = new IntersectionObserver(([e]) => {
			const live = Boolean(e?.isIntersecting);
			el.toggleAttribute('data-live', live);
			cb.current?.(live);
		});
		io.observe(el);
		return () => io.disconnect();
	}, []);
	return (
		<Tag ref={ref as never} className={className} id={id} aria-label={label} aria-hidden={label ? undefined : Tag === 'div' ? true : undefined}>
			{children}
		</Tag>
	);
}
