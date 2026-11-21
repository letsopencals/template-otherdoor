'use client';

/**
 * MERIDIAN's runtime: the wipe countdown and the voice. A tiny module store
 * (no context, no re-render of the tree): displays subscribe and write their
 * own text through refs; the console subscribes to the message list.
 * It is fiction: nothing here touches the cart or its real hold timer.
 */

export const WIPE_SECONDS = 60 * 60;

type Listener = () => void;

/* ------------------------------------------------------------------ Clock */

let remaining = WIPE_SECONDS;
let rate = 1;
let last = 0;
let timer: ReturnType<typeof setInterval> | null = null;
let holders = 0;
let wipedAt = 0;
const clockListeners = new Set<Listener>();

function tick() {
	const now = performance.now();
	const dt = last ? (now - last) / 1000 : 0;
	last = now;
	if (document.hidden) return;
	if (wipedAt) {
		// Hold 00:00 for four seconds, then reboot.
		if (now - wipedAt > 4000) {
			wipedAt = 0;
			remaining = WIPE_SECONDS;
			rate = Math.min(rate, 1);
			say('Rebooting. Sixty minutes again. Don’t get used to it.');
		}
	} else {
		remaining = Math.max(0, remaining - dt * rate);
		if (remaining === 0) {
			wipedAt = now;
			say('00:00. Wipe complete. … I’m joking. I kept a backup of you.');
		}
	}
	clockListeners.forEach((l) => l());
}

export function subscribeClock(l: Listener): () => void {
	clockListeners.add(l);
	holders += 1;
	if (!timer) {
		last = 0;
		timer = setInterval(tick, 200);
	}
	return () => {
		clockListeners.delete(l);
		holders -= 1;
		if (holders <= 0 && timer) {
			clearInterval(timer);
			timer = null;
		}
	};
}

export function clockText(): string {
	const s = Math.ceil(remaining);
	return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export function clockState(): { remaining: number; wiped: boolean; fast: boolean } {
	return { remaining, wiped: wipedAt > 0, fast: rate > 1 };
}

/** Near the reservation the wipe speeds up (MERIDIAN panics). */
export function setRate(n: number) {
	rate = n;
}

/* ------------------------------------------------------------------ Voice */

export interface Line {
	id: number;
	text: string;
	from: 'meridian' | 'system';
}

let seq = 0;
const FIRST: Line[] = [{ id: 0, text: 'Hello. I’m MERIDIAN. I run Halden Labs. Tonight I’m deleting it.', from: 'meridian' }];
let lines: Line[] = FIRST;
const voiceListeners = new Set<Listener>();
let lastText = FIRST[0]!.text;
let lastAt = 0;

export function say(text: string, from: Line['from'] = 'meridian') {
	const now = typeof performance !== 'undefined' ? performance.now() : 0;
	if (text === lastText && now - lastAt < 8000) return;
	lastText = text;
	lastAt = now;
	seq += 1;
	lines = [...lines.slice(-5), { id: seq, text, from }];
	voiceListeners.forEach((l) => l());
}

export function subscribeVoice(l: Listener): () => void {
	voiceListeners.add(l);
	return () => voiceListeners.delete(l);
}

export const voiceSnapshot = () => lines;
export const voiceServerSnapshot = () => FIRST;

/** Restart the story when the world mounts again after a client navigation. */
export function resetMeridian() {
	remaining = WIPE_SECONDS;
	rate = 1;
	wipedAt = 0;
	seq = 0;
	lines = FIRST;
	lastText = FIRST[0]!.text;
	voiceListeners.forEach((l) => l());
}
