'use client';

import { memo } from 'react';
import type { Session } from '@/lib/sessions';
import { siteConfig } from '@/lib/site-config';
import { localParts } from '@/lib/tz';
import s from './booking.module.css';

/** The Matinee hint for a room session (the store's automatic discount does the maths). */
export function offerNote(session: Session): string | null {
	const m = siteConfig.offers.matinee;
	const wd = localParts(session.start).weekday;
	const [h = 0, min = 0] = session.time.split(':').map(Number);
	return (m.weekdays as readonly number[]).includes(wd) && h * 60 + min < m.beforeMinutes ? m.label : null;
}

/** Plain tappable session times. `note` adds a second line (offer hint, seats left). */
export const SessionButtons = memo(function SessionButtons({ sessions, selected, onSelect, note }: { sessions: Session[]; selected: number | null; onSelect: (s: Session) => void; note?: (s: Session) => string | null }) {
	return (
		<div className={s.times} role="group" aria-label="Session times">
			{sessions.map((x) => {
				const n = note?.(x) ?? null;
				return (
					<button key={x.start} type="button" className={s.time} aria-pressed={selected === x.start} onClick={() => onSelect(x)}>
						<span>{x.time}</span>
						{n ? <span className={s.timeNote}>{n}</span> : null}
					</button>
				);
			})}
		</div>
	);
});
