'use client';

import { useEffect, useRef, useSyncExternalStore, type RefObject } from 'react';

/**
 * THE MAINSPRING. One module-level store drives every moving part of the
 * workshop: a master angle (degrees) that every gear, hand and drum reads.
 *
 * - The escapement ticks: a small eased step once a second, so the page always
 *   breathes a little, like a clock.
 * - Scrolling and turning the hero key add velocity (scroll down winds
 *   forward, up runs it back); friction settles it.
 * - `wound` (0–1) fills as you wind and slowly runs down; at full the hero
 *   cuckoo announces it.
 *
 * One rAF loop runs only while at least one subscriber is on screen (each
 * subscriber reports its own visibility with an IntersectionObserver) and the
 * tab is visible. Reduced motion: no loop, no listeners; everything rests.
 */

type Listener = (angle: number) => void;

const listeners = new Set<Listener>();
const visible = new Set<Listener>();
let angle = 0;
let vel = 0;
let wound = 0;
let raf = 0;
let lastT = 0;
let lastScroll = 0;
let tickClock = 0;
let installed = false;
const woundSubs = new Set<() => void>();
let woundShown = 0;

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Add winding from a key turn (degrees of key rotation, either sign). */
export function windBy(deg: number) {
	if (reduced()) {
		wound = Math.min(1, wound + Math.abs(deg) / 1080);
		notifyWound();
		return;
	}
	vel += deg * 0.09;
	wound = Math.min(1, wound + Math.abs(deg) / 1080);
	notifyWound();
	start();
}

function notifyWound() {
	const q = Math.round(wound * 100);
	if (q !== woundShown) {
		woundShown = q;
		woundSubs.forEach((f) => f());
	}
}

function onScroll() {
	const y = window.scrollY;
	const d = y - lastScroll;
	lastScroll = y;
	if (Math.abs(d) > 400) return; // jumps (anchors, restores) aren't winding
	vel += d * 0.05;
	wound = Math.min(1, wound + Math.abs(d) / 9000);
	notifyWound();
	start();
}

function install() {
	if (installed || typeof window === 'undefined' || reduced()) return;
	installed = true;
	lastScroll = window.scrollY;
	window.addEventListener('scroll', onScroll, { passive: true });
	document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
}

function frame(t: number) {
	const dt = lastT ? Math.min(64, t - lastT) : 16;
	lastT = t;
	// Escapement: a 6° step every second, eased over the first 180 ms.
	const before = tickClock % 1000;
	tickClock += dt;
	const after = tickClock % 1000;
	const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, x / 180), 3);
	const step = after < before ? ease(after) + (1 - ease(before)) : ease(after) - ease(before);
	angle += step * (5 + wound * 7) + vel * (dt / 16);
	vel *= Math.pow(0.92, dt / 16);
	if (Math.abs(vel) < 0.002) vel = 0;
	vel = Math.max(-40, Math.min(40, vel));
	wound = Math.max(0, wound - dt / 90000);
	notifyWound();
	listeners.forEach((f) => f(angle));
	raf = visible.size && !document.hidden ? requestAnimationFrame(frame) : 0;
	if (!raf) lastT = 0;
}

function start() {
	if (!raf && visible.size && typeof document !== 'undefined' && !document.hidden) raf = requestAnimationFrame(frame);
}

function stop() {
	cancelAnimationFrame(raf);
	raf = 0;
	lastT = 0;
}

/**
 * Subscribe a callback to the master angle while `ref` is on screen. The
 * callback writes styles directly (no React state per frame).
 */
export function useMainspring(ref: RefObject<HTMLElement | SVGElement | null>, fn: Listener) {
	const fnRef = useRef(fn);
	fnRef.current = fn;
	useEffect(() => {
		const el = ref.current;
		if (!el || reduced()) return;
		install();
		const l: Listener = (a) => fnRef.current(a);
		listeners.add(l);
		l(angle);
		const io = new IntersectionObserver(
			([e]) => {
				if (e?.isIntersecting) {
					visible.add(l);
					start();
				} else visible.delete(l);
			},
			{ rootMargin: '120px 0px' },
		);
		io.observe(el);
		return () => {
			io.disconnect();
			listeners.delete(l);
			visible.delete(l);
		};
	}, [ref]);
}

function subscribeWound(f: () => void) {
	woundSubs.add(f);
	return () => woundSubs.delete(f);
}

/** How wound the page is, 0–100 (re-renders only when the whole percent changes). */
export function useWound() {
	return useSyncExternalStore(
		subscribeWound,
		() => woundShown,
		() => 0,
	);
}
