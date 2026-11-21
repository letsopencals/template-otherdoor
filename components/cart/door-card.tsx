import type { CSSProperties, ReactNode } from 'react';
import type { Visit } from '@/lib/visit';
import { partyLabel } from '@/lib/visit';
import { roomPresentation } from '@/lib/site-config';
import { dayLabel, timeLabel } from '@/lib/when';
import { formatPrice } from '@/lib/format';
import { DoorArt } from '@/components/doors/door-art';
import s from './door-card.module.css';

/**
 * One booking as a slim door: the room's key art in a door-shaped thumb, the
 * leading edge lit in its world's colour, then date, time, team, extras, price.
 */
export function DoorCard({ v, price, actions, compact = false }: { v: Visit; price?: number | null; actions?: ReactNode; compact?: boolean }) {
	const media = roomPresentation(v.key)?.media;
	return (
		<article className={`${s.card} ${compact ? s.compact : ''}`} style={{ '--slit': v.palette.glow } as CSSProperties}>
			<span className={s.thumb}>
				<DoorArt sources={[media?.key, media?.poster]} alt="" glow={v.palette.glow} className={s.img} />
			</span>
			<div className={s.body}>
				<div className={s.top}>
					<h3 className={s.title}>{v.title}</h3>
					{price !== undefined && price !== null ? <span className={s.price}>{formatPrice(price)}</span> : null}
				</div>
				<p className={s.when}>
					{dayLabel(v.start)} · {timeLabel(v.start)}
				</p>
				<p className={s.meta}>
					{partyLabel(v)}
					{v.venueName ? ` · ${v.venueName}` : ''}
				</p>
				{!compact && v.addOns.length ? <p className={s.extras}>+ {v.addOns.join(', ')}</p> : null}
				{actions ? <div className={s.actions}>{actions}</div> : null}
			</div>
		</article>
	);
}
