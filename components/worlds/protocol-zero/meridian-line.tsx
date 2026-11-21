'use client';

import { useSyncExternalStore } from 'react';
import { subscribeVoice, voiceServerSnapshot, voiceSnapshot } from './meridian';
import s from './protocol.module.css';

/**
 * MERIDIAN's latest line, inline where the console isn't on screen (the hero,
 * the access prompt, beside the reservation). Fades in on each new line;
 * screen readers already get it from the console's live region.
 */
export function MeridianLine({ tone = 'dark', className }: { tone?: 'dark' | 'light'; className?: string }) {
	const lines = useSyncExternalStore(subscribeVoice, voiceSnapshot, voiceServerSnapshot);
	const last = lines[lines.length - 1];
	if (!last) return null;
	return (
		<p className={`${s.mLine} ${className ?? ''}`} data-tone={tone} aria-hidden>
			<span className={s.mLineWho}>MERIDIAN</span>
			<span key={last.id} className={s.mLineText}>
				{last.text}
			</span>
		</p>
	);
}
