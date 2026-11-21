'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import useSWR from 'swr';
import type { FreeRange } from '@/lib/sessions';
import { roomSessions } from '@/lib/sessions';
import { fetcher } from '@/lib/fetcher';
import { today, addDays } from '@/lib/tz';
import { localDateParts } from '@/lib/when';
import { useNow } from '@/hooks/use-now';

export interface TonightRoom {
	slug: string;
	title: string;
	venueShort: string;
	durationMin: number;
	spine: string;
	foil: string;
	fromPrice: string;
}

/** Tonight’s expeditions: the next free sessions per room, from live availability, as plain buttons. */
export function Tonight({ rooms, initialRanges, renderedAt }: { rooms: TonightRoom[]; initialRanges: Record<string, FreeRange[]>; renderedAt: number }) {
	const { data } = useSWR<Record<string, FreeRange[]>>('/api/rooms/availability', fetcher, { fallbackData: initialRanges, revalidateOnFocus: false });
	const now = useNow(60_000)?.getTime() ?? renderedAt;
	const day = today(now);
	const rows = useMemo(
		() =>
			rooms.map((r) => {
				const all = roomSessions(data?.[r.slug] ?? [], { durationMin: r.durationMin, now });
				const todays = all.filter((x) => x.date === day);
				const list = todays.length ? todays.slice(0, 4) : all.filter((x) => x.date === all[0]?.date).slice(0, 4);
				return { r, list, when: list[0] ? (list[0].date === day ? 'Tonight' : list[0].date === addDays(day, 1) ? 'Tomorrow' : localDateParts(list[0].date).long) : null };
			}),
		[rooms, data, now, day],
	);
	if (!rooms.length) return <p className="text-center">Sessions appear here once the store’s rooms are set up.</p>;
	return (
		<ol className="divide-y divide-[#c9b48f]/60 border-y border-[#c9b48f]">
			{rows.map(({ r, list, when }) => (
				<li key={r.slug} className="grid items-center gap-3 py-4 md:grid-cols-[minmax(0,1.1fr)_auto_minmax(0,1.6fr)] md:gap-6">
					<div className="flex items-center gap-4">
						<span aria-hidden className="h-12 w-3 shrink-0 rounded-[2px]" style={{ background: `linear-gradient(90deg, rgba(0,0,0,.3), transparent 40%, rgba(0,0,0,.25)), ${r.spine}`, boxShadow: `inset 0 3px 0 ${r.foil}, inset 0 -3px 0 ${r.foil}` }} />
						<div className="min-w-0">
							<Link href={`/rooms/${r.slug}`} className="font-display block truncate text-[1.45rem] leading-tight hover:underline">
								{r.title}
							</Link>
							<span className="text-[0.85rem] text-sepia">
								{r.venueShort} · from {r.fromPrice}
							</span>
						</div>
					</div>
					<span className="engraved text-[0.85rem] text-oxblood md:w-36">{when ?? 'Fully booked'}</span>
					<div className="flex flex-wrap gap-2">
						{list.length ? (
							list.map((x) => (
								<Link key={x.start} href={`/rooms/${r.slug}?date=${x.date}&time=${x.time}#book`} className="inline-flex min-h-[44px] min-w-[76px] items-center justify-center rounded-[3px] border border-[#8a6a43]/50 bg-vellum px-3 font-bold tabular-nums transition hover:border-ink-green hover:bg-ink-green hover:text-vellum">
									{x.time}
								</Link>
							))
						) : (
							<Link href={`/rooms/${r.slug}#book`} className="underline">
								See later dates
							</Link>
						)}
					</div>
				</li>
			))}
		</ol>
	);
}
