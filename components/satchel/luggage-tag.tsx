import type { CSSProperties, ReactNode } from 'react';
import type { Expedition } from '@/lib/expedition';
import { partyLabel } from '@/lib/expedition';
import { dayLabel, timeLabel } from '@/lib/when';
import { formatPrice } from '@/lib/format';
import s from './luggage-tag.module.css';

/** One booking as a luggage tag: room, date, session, team, extras, price. */
export function LuggageTag({ e, price, actions, compact = false, tilt = -0.6 }: { e: Expedition; price?: number | null; actions?: ReactNode; compact?: boolean; tilt?: number }) {
	return (
		<article className={`${s.tag} ${compact ? s.compact : ''}`} style={{ '--tag-accent': e.palette.spine, '--tilt': `${tilt}deg` } as CSSProperties}>
			<span className={s.hole} aria-hidden />
			<span className={s.band} aria-hidden />
			<h3 className={s.title}>{e.title}</h3>
			{price !== undefined && price !== null ? <span className={s.price}>{formatPrice(price)}</span> : null}
			<p className={s.typed}>
				<b>{dayLabel(e.start)}</b> · {timeLabel(e.start)}–{timeLabel(e.end)}
				<br />
				{partyLabel(e)}
				{e.venueName ? ` · ${e.venueName}` : ''}
				{!compact && e.addOns.length ? (
					<>
						<br />+ {e.addOns.join(', ')}
					</>
				) : null}
			</p>
			{actions ? <div className={s.actions}>{actions}</div> : null}
		</article>
	);
}
