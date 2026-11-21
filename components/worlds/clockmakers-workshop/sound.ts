'use client';

import { useSyncExternalStore } from 'react';

/**
 * The cuckoo's voice: off by default, never autoplays. The AudioContext is
 * created only when someone switches sound on (a user gesture), and the
 * "cuck-oo" is synthesised (two soft falling notes), so there is no file.
 */

let on = false;
let ctx: AudioContext | null = null;
const subs = new Set<() => void>();

export function setSound(next: boolean) {
	on = next;
	if (on && !ctx) {
		const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
		ctx = AC ? new AC() : null;
	}
	if (on) void ctx?.resume();
	subs.forEach((f) => f());
	if (on) playCuckoo();
}

export function useSound() {
	return useSyncExternalStore(
		(f) => {
			subs.add(f);
			return () => subs.delete(f);
		},
		() => on,
		() => false,
	);
}

function note(freq: number, at: number, len: number) {
	if (!ctx) return;
	const t = ctx.currentTime + at;
	const o = ctx.createOscillator();
	const o2 = ctx.createOscillator();
	const g = ctx.createGain();
	o.type = 'sine';
	o2.type = 'triangle';
	o.frequency.setValueAtTime(freq, t);
	o2.frequency.setValueAtTime(freq * 2, t);
	o.frequency.exponentialRampToValueAtTime(freq * 0.97, t + len);
	g.gain.setValueAtTime(0.0001, t);
	g.gain.exponentialRampToValueAtTime(0.16, t + 0.03);
	g.gain.exponentialRampToValueAtTime(0.0001, t + len);
	const g2 = ctx.createGain();
	g2.gain.value = 0.12;
	o.connect(g);
	o2.connect(g2);
	g2.connect(g);
	g.connect(ctx.destination);
	o.start(t);
	o2.start(t);
	o.stop(t + len + 0.05);
	o2.stop(t + len + 0.05);
}

/** "Cuck-oo": a falling major third. Silent unless sound is on. */
export function playCuckoo() {
	if (!on || !ctx) return;
	note(659.25, 0, 0.32);
	note(523.25, 0.36, 0.5);
}

/** A music-box pluck (for the drum), silent unless sound is on. */
export function playPluck(freq: number) {
	if (!on || !ctx) return;
	note(freq, 0, 0.6);
}
