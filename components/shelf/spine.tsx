'use client';

import Link from 'next/link';
import type { CSSProperties, PointerEvent } from 'react';
import type { ShelfRoom } from '@/lib/shelf';
import { roman } from '@/lib/when';
import s from './spine.module.css';

/** A room as a leather book spine (palette leather, foil title, gilt cryptex letter at the foot). */
export function Spine({ room, width = 64, height = 260, out, onFocus, onBlur, onClick, showLetter = true }: { room: ShelfRoom; width?: number; height?: number; out?: boolean; onFocus?: () => void; onBlur?: () => void; onClick?: () => void; showLetter?: boolean }) {
	const style = { '--spine-w': `${width}px`, '--spine-h': `${height}px`, '--leather': room.palette.spine, '--foil': room.palette.foil } as CSSProperties;
	const move = (e: PointerEvent<HTMLAnchorElement>) => {
		const r = e.currentTarget.getBoundingClientRect();
		e.currentTarget.style.setProperty('--sheen-y', `${Math.round(((e.clientY - r.top) / r.height) * 100)}%`);
	};
	return (
		<Link
			href={`/rooms/${room.slug}`}
			className={s.spine}
			style={style}
			data-out={out ? 'true' : undefined}
			onPointerMove={move}
			onPointerEnter={onFocus}
			onPointerLeave={onBlur}
			onFocus={onFocus}
			onBlur={onBlur}
			onClick={onClick}
			aria-label={`${room.title}: ${room.genre}${room.year ? `, ${room.year}` : ''}`}
		>
			<span className={s.bands} aria-hidden>
				<i />
				<i className={s.raised} />
				<i />
			</span>
			<span className={s.vol} aria-hidden>
				{roman(room.volume)}
			</span>
			{room.epic ? (
				<span className={s.epic} aria-hidden>
					epic
				</span>
			) : null}
			<span className={s.title} aria-hidden style={{ fontSize: `${Math.min(width * 0.32, (height - 130) / (room.short.length * 0.6)).toFixed(1)}px` }}>
				{room.short}
			</span>
			<span className={s.bands} aria-hidden>
				<i />
				<i className={s.raised} />
			</span>
			{showLetter && room.letter ? (
				<span className={s.letter} aria-hidden title="A gilt letter. Remember it.">
					{room.letter}
				</span>
			) : null}
		</Link>
	);
}
