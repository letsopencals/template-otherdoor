'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { useCase, type ClueId } from './case-notes';
import s from './gaslight.module.css';

export interface LensClue {
	id: ClueId;
	/** Centre, as fractions of the document's width and height. */
	x: number;
	y: number;
	/** Button label, e.g. "Examine the margin". */
	label: string;
}

/**
 * A reading glass over a document. The document renders twice: the page itself, and a
 * copy inside the glass (aria-hidden, inert) in which the hidden ink, the monogram and the
 * scratched hour are visible. The glass follows a fine pointer (rAF, eased); a tap or click
 * moves it there; dragging the glass itself pans it on touch. Holding the glass over a clue
 * for a moment finds it; every clue is also a real button (click, tap, Enter), so nothing
 * depends on the pointer. Reduced motion: no easing, the glass jumps.
 */
export function Lens({ page, magnified, clues, rest, zoom = 2.4, label }: { page: ReactNode; magnified: ReactNode; clues: LensClue[]; rest: [number, number]; zoom?: number; label: string }) {
	const wrapRef = useRef<HTMLDivElement>(null);
	const lensRef = useRef<HTMLDivElement>(null);
	const { found, find } = useCase();
	const foundRef = useRef(found);
	foundRef.current = found;

	useEffect(() => {
		const wrap = wrapRef.current;
		const lens = lensRef.current;
		if (!wrap || !lens) return;
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		let w = 1;
		let h = 1;
		let x = 0;
		let y = 0;
		let tx = 0;
		let ty = 0;
		let raf = 0;
		let dragging = false;
		let dwellId: ClueId | null = null;
		let dwellAt = 0;

		const apply = () => {
			wrap.style.setProperty('--lx', `${x.toFixed(1)}px`);
			wrap.style.setProperty('--ly', `${y.toFixed(1)}px`);
		};
		const dwell = (now: number) => {
			const radius = lens.offsetWidth * 0.32;
			const hit = clues.find((c) => !foundRef.current.has(c.id) && Math.hypot(c.x * w - x, c.y * h - y) < radius);
			if (!hit) {
				dwellId = null;
				return false;
			}
			if (dwellId !== hit.id) {
				dwellId = hit.id;
				dwellAt = now;
			} else if (now - dwellAt > 420) {
				find(hit.id);
				dwellId = null;
				return false;
			}
			return true;
		};
		const tick = (now: number) => {
			raf = 0;
			x += (tx - x) * (reduce ? 1 : 0.2);
			y += (ty - y) * (reduce ? 1 : 0.2);
			apply();
			const moving = Math.abs(tx - x) > 0.4 || Math.abs(ty - y) > 0.4;
			if (dwell(now) || moving) raf = requestAnimationFrame(tick);
		};
		const kick = () => {
			if (!raf) raf = requestAnimationFrame(tick);
		};
		const measure = () => {
			const r = wrap.getBoundingClientRect();
			// Rotated documents report their rotated box; offset sizes are the real page.
			w = wrap.offsetWidth || r.width;
			h = wrap.offsetHeight || r.height;
			wrap.style.setProperty('--pw', `${w.toFixed(1)}px`);
			wrap.style.setProperty('--ph', `${h.toFixed(1)}px`);
			wrap.setAttribute('data-ready', '');
			if (!x && !y) {
				x = tx = w * rest[0];
				y = ty = h * rest[1];
			}
			apply();
		};
		const local = (e: PointerEvent) => {
			// Map the pointer into the page's own (unrotated) frame.
			const r = wrap.getBoundingClientRect();
			const cx = r.left + r.width / 2;
			const cy = r.top + r.height / 2;
			const doc = wrap.closest<HTMLElement>('[data-doc]');
			const t = doc ? getComputedStyle(doc).transform : 'none';
			const m = t && t !== 'none' ? new DOMMatrix(t) : null;
			const a = m ? -Math.atan2(m.b, m.a) : 0;
			const dx = e.clientX - cx;
			const dy = e.clientY - cy;
			const lx = dx * Math.cos(a) - dy * Math.sin(a) + w / 2;
			const ly = dx * Math.sin(a) + dy * Math.cos(a) + h / 2;
			tx = Math.min(w, Math.max(0, lx));
			ty = Math.min(h, Math.max(0, ly));
			kick();
		};
		const move = (e: PointerEvent) => {
			if (e.pointerType === 'mouse' || e.pointerType === 'pen' || dragging) local(e);
		};
		const down = (e: PointerEvent) => {
			if ((e.target as HTMLElement).closest('button')) return;
			local(e);
		};
		const grab = (e: PointerEvent) => {
			dragging = true;
			lens.setPointerCapture(e.pointerId);
			local(e);
		};
		const drop = () => {
			dragging = false;
		};
		const keys = (e: KeyboardEvent) => {
			const step = e.shiftKey ? 40 : 14;
			const m: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
			const d = m[e.key];
			if (!d) return;
			e.preventDefault();
			tx = Math.min(w, Math.max(0, tx + d[0]));
			ty = Math.min(h, Math.max(0, ty + d[1]));
			kick();
		};

		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(wrap);
		wrap.addEventListener('pointermove', move);
		wrap.addEventListener('pointerdown', down);
		lens.addEventListener('pointerdown', grab);
		lens.addEventListener('pointermove', move);
		lens.addEventListener('pointerup', drop);
		lens.addEventListener('pointercancel', drop);
		wrap.addEventListener('keydown', keys);
		return () => {
			ro.disconnect();
			wrap.removeEventListener('pointermove', move);
			wrap.removeEventListener('pointerdown', down);
			lens.removeEventListener('pointerdown', grab);
			lens.removeEventListener('pointermove', move);
			lens.removeEventListener('pointerup', drop);
			lens.removeEventListener('pointercancel', drop);
			wrap.removeEventListener('keydown', keys);
			if (raf) cancelAnimationFrame(raf);
		};
	}, [clues, rest, find]);

	return (
		<div ref={wrapRef} className={s.lensWrap} style={{ '--zoom': zoom } as CSSProperties} tabIndex={0} role="group" aria-label={`${label}. A reading glass: move it with the arrow keys, or press the clue buttons.`}>
			{page}
			{clues.map((c) => (
				<button key={c.id} type="button" className={s.clue} style={{ left: `${c.x * 100}%`, top: `${c.y * 100}%` }} data-found={found.has(c.id) || undefined} onClick={() => find(c.id)} aria-label={found.has(c.id) ? `${c.label}: found` : c.label}>
					<svg viewBox="0 0 60 60" aria-hidden>
						<path d="M30 6C45 5 55 16 54 30S43 55 29 54 5 44 6 29 17 8 33 7" />
					</svg>
				</button>
			))}
			<div ref={lensRef} className={s.lens} aria-hidden>
				<span className={s.lensClip}>
					<span className={s.lensInner} inert>
						{magnified}
					</span>
				</span>
				<span className={s.lensGlass} />
				<span className={s.lensHandle} />
			</div>
		</div>
	);
}
