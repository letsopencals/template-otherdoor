'use client';

import { memo } from 'react';
import { localDateParts } from '@/lib/when';
import s from './booking.module.css';

/** Plain date buttons, directly above the session times. Days without sessions are disabled. */
export const DateStrip = memo(function DateStrip({ dates, selected, counts, onSelect, label = 'Date' }: { dates: string[]; selected: string | null; counts: Record<string, number>; onSelect: (date: string) => void; label?: string }) {
	return (
		<div className={s.strip} role="group" aria-label={label}>
			{dates.map((d) => {
				const p = localDateParts(d);
				const n = counts[d] ?? 0;
				return (
					<button key={d} type="button" className={s.day} aria-pressed={selected === d} disabled={n === 0} onClick={() => onSelect(d)} aria-label={`${p.long}${n ? `, ${n} sessions` : ', fully booked'}`}>
						<span className={s.dayWd}>{p.weekday}</span>
						<span className={s.dayNum}>{p.day}</span>
						<span className={s.dayMo}>{p.month}</span>
					</button>
				);
			})}
		</div>
	);
});
