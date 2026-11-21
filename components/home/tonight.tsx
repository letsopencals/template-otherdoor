'use client';

import Link from 'next/link';
import { useMemo, type CSSProperties } from 'react';
import useSWR from 'swr';
import type { FreeRange } from '@/lib/sessions';
import { roomSessions } from '@/lib/sessions';
import { fetcher } from '@/lib/fetcher';
import { today, addDays } from '@/lib/tz';
import { localDateParts } from '@/lib/when';
import { setDoorLight } from '@/lib/door-light';
import { useNow } from '@/hooks/use-now';
import { DoorArt } from "@/components/doors/door-art";
import s from './home.module.css';

export interface TonightRoom {
	slug: string;
	number: number;
	title: string;
	venueShort: string;
	durationMin: number;
	glow: string;
	fromPrice: string;
	art: Array<string | null | undefined>;
}

/** Tonight: the next free sessions per room, from live availability, as plain buttons into the room's booking panel. */
export function Tonight({ rooms, initialRanges, renderedAt }: { rooms: TonightRoom[]; initialRanges: Record<string, FreeRange[]>; renderedAt: number }) {
	const { data } = useSWR<Record<string, FreeRange[]>>('/api/rooms/availability', fetcher, { fallbackData: initialRanges, revalidateOnFocus: false });
	const now = useNow(60_000)?.getTime() ?? renderedAt;
	const day = today(now);
	const rows = useMemo(
		() =>
			rooms.map((r) => {
				const all = roomSessions(data?.[r.slug] ?? [], { durationMin: r.durationMin, now });
				const todays = all.filter((x) => x.date === day);
				const list = todays.length ? todays.slice(0, 5) : all.filter((x) => x.date === all[0]?.date).slice(0, 5);
				return { r, list, when: list[0] ? (list[0].date === day ? 'Tonight' : list[0].date === addDays(day, 1) ? 'Tomorrow' : localDateParts(list[0].date).long) : null };
			}),
		[rooms, data, now, day],
	);
	if (!rooms.length) return <p className="text-ink-3">Sessions appear here once the store’s rooms are set up.</p>;
	return (
		<ol className={s.tonight}>
			{rows.map(({ r, list, when }) => (
				<li key={r.slug} className={s.tonightRow} style={{ '--slit': r.glow } as CSSProperties} onMouseEnter={() => setDoorLight(r.glow)} onMouseLeave={() => setDoorLight(null)}>
					<span className={s.tonightThumb} aria-hidden>
						<DoorArt sources={r.art} alt="" glow={r.glow} />
						<b>{String(r.number).padStart(2, "0")}</b>
					</span>
					<div className="min-w-0">
						<Link href={`/rooms/${r.slug}`} className={s.tonightTitle}>
							{r.title}
						</Link>
						<span className={s.tonightMeta}>
							{r.venueShort} · from {r.fromPrice}
						</span>
					</div>
					<span className={s.tonightWhen}>{when ?? 'Fully booked'}</span>
					<div className={s.tonightTimes}>
						{list.length ? (
							list.map((x) => (
								<Link key={x.start} href={`/rooms/${r.slug}?date=${x.date}&time=${x.time}#book`} className={s.slot}>
									{x.time}
								</Link>
							))
						) : (
							<Link href={`/rooms/${r.slug}#book`} className="link text-sm">
								See later dates
							</Link>
						)}
					</div>
				</li>
			))}
		</ol>
	);
}
