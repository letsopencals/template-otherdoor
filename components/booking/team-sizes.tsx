'use client';

import { memo } from 'react';
import type { TeamOption } from '@/lib/rooms';
import { formatWholePrice } from '@/lib/format';
import s from './booking.module.css';

/** One button per team size: players, the group price and the price per head. */
export const TeamSizes = memo(function TeamSizes({ options, selected, onSelect }: { options: TeamOption[]; selected: number | null; onSelect: (size: number) => void }) {
	return (
		<div className={s.teams} role="group" aria-label="Team size">
			{options.map((o) => (
				<button key={o.productId} type="button" className={s.team} aria-pressed={selected === o.size} onClick={() => onSelect(o.size)}>
					<span className={s.teamN}>{o.size} players</span>
					<span className={s.teamPrice}>{formatWholePrice(o.price)}</span>
					<span className={s.teamPp}>{formatWholePrice(o.perHead)} pp</span>
				</button>
			))}
		</div>
	);
});
