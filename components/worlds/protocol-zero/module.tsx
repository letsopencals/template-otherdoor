'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { say, setRate } from './meridian';
import s from './protocol.module.css';

/**
 * One MERIDIAN module (a system window). On first entry it glitches in
 * (`data-in`, CSS on its chrome only, never on the booking column) and
 * MERIDIAN comments. `phase` (0 clean → 4 corrupt) is mirrored on the world
 * root so the console decays with the page. `fast` makes the wipe accelerate
 * while the module is on screen (the reservation).
 */
export function Module({ id, phase, line, fast, className, label, children }: { id: string; phase: number; line?: string; fast?: boolean; className?: string; label: string; children: ReactNode }) {
	const ref = useRef<HTMLElement>(null);
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		let said = false;
		const io = new IntersectionObserver(
			([e]) => {
				if (!e) return;
				if (e.isIntersecting) {
					el.dataset.in = '';
					document.getElementById('pz-world')?.setAttribute('data-phase', String(phase));
					if (line && !said) {
						said = true;
						say(line);
					}
				}
				if (fast) setRate(e.isIntersecting ? 14 : 1);
			},
			{ rootMargin: '-35% 0px -35% 0px' },
		);
		io.observe(el);
		// Pause the module's ambient loops while it is off screen.
		const live = new IntersectionObserver(([e]) => {
			if (!e) return;
			if (e.isIntersecting) delete el.dataset.idle;
			else el.dataset.idle = '';
		});
		live.observe(el);
		return () => {
			io.disconnect();
			live.disconnect();
			if (fast) setRate(1);
		};
	}, [phase, line, fast]);
	return (
		<section ref={ref} id={id} aria-label={label} className={`${s.module} ${className ?? ''}`} data-phase={phase}>
			{children}
		</section>
	);
}

/** "I see you hesitating.": hovering or focusing inside for a while makes MERIDIAN notice. */
export function Hesitate({ line, after = 1600, className, children }: { line: string; after?: number; className?: string; children: ReactNode }) {
	const t = useRef<ReturnType<typeof setTimeout> | null>(null);
	const fired = useRef(false);
	const arm = () => {
		if (fired.current) return;
		if (t.current) clearTimeout(t.current);
		t.current = setTimeout(() => {
			fired.current = true;
			say(line);
		}, after);
	};
	const clear = () => {
		if (t.current) clearTimeout(t.current);
		t.current = null;
	};
	useEffect(() => clear, []);
	return (
		<div className={className} onPointerEnter={arm} onPointerLeave={clear} onPointerDown={clear} onFocus={arm} onBlur={clear}>
			{children}
		</div>
	);
}
