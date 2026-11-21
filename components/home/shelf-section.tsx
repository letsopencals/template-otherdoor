'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { ShelfRoom } from '@/lib/shelf';
import { formatWholePrice } from '@/lib/format';
import { roman } from '@/lib/when';
import { Spine } from '@/components/shelf/spine';
import { Meter } from '@/components/ui/meters';
import s from './shelf.module.css';

/** The Shelf: rooms as leather spines. Hover or focus pulls one out; its catalogue card shows below. */
export function ShelfSection({ shelf, tall = 340 }: { shelf: ShelfRoom[]; tall?: number }) {
	const [active, setActive] = useState<string | null>(null);
	const room = shelf.find((r) => r.slug === active) ?? shelf[0];
	if (!shelf.length) return <p className="py-10 text-center">The shelf is being restocked. Check back shortly.</p>;
	return (
		<div>
			<div className={s.case}>
				<div className={s.row}>
					<span className={s.bookend} aria-hidden />
					{shelf.map((r, i) => (
						<Spine key={r.slug} room={r} width={i % 3 === 1 ? 96 : 86} height={tall - (i % 2) * 26 - (i % 3) * 10} out={active === r.slug} onFocus={() => setActive(r.slug)} />
					))}
					<span className={`${s.bookend} ${s.bookendR}`} aria-hidden />
				</div>
			</div>
			<div className={s.plank} />
			{room ? (
				<div className={s.card} aria-live="polite">
					<div>
						<p className="engraved text-sepia">
							Volume {roman(room.volume)} · {room.genre}
							{room.year ? `, ${room.year}` : ''}
						</p>
						<p className="font-display mt-1 text-[2rem] leading-tight">{room.title}</p>
					</div>
					<dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-[0.92rem]">
						<dt className="text-sepia">Difficulty</dt>
						<dd><Meter kind="candle" value={room.difficulty} label="Difficulty" tone="#7a1e22" /></dd>
						<dt className="text-sepia">Fear</dt>
						<dd><Meter kind="key" value={room.fear} label="Fear" tone="#1e3a30" /></dd>
						<dt className="text-sepia">Team</dt>
						<dd className="font-bold">{room.players} players · {room.venueShort}</dd>
					</dl>
					<div className="flex flex-col items-start gap-2 md:items-end">
						<span className="text-sm text-sepia">Whole team from <b className="text-deep-ink">{formatWholePrice(room.fromPrice)}</b></span>
						<Link href={`/rooms/${room.slug}`} className="plate">
							Open this volume
						</Link>
					</div>
				</div>
			) : null}
		</div>
	);
}
