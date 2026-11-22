'use client';

import Link from 'next/link';
import { useMemo, useState, type CSSProperties } from "react";
import useSWR from 'swr';
import type { TeamOption } from '@/lib/rooms';
import { roomSessions, byDate, type FreeRange, type Session } from '@/lib/sessions';
import { fetcher } from '@/lib/fetcher';
import { formatPrice, formatWholePrice } from '@/lib/format';
import { localDates, today } from '@/lib/tz';
import { localDateParts, minutesLabel } from '@/lib/when';
import { siteConfig } from '@/lib/site-config';
import { useNow } from '@/hooks/use-now';
import { useAddToCart } from '@/hooks/use-add-to-cart';
import { DateStrip } from './date-strip';
import { SessionButtons, offerNote } from './session-buttons';
import { TeamSizes } from './team-sizes';
import { Meter } from '@/components/ui/meters';
import { DoorArt } from "@/components/doors/door-art";
import s from './booking.module.css';

export interface BoardRoom {
	glow: string;
	art: Array<string | null | undefined>;
	slug: string;
	title: string;
	genre: string;
	durationMin: number;
	gameMinutes: number;
	options: TeamOption[];
	locationId: string | null;
	venueSlug: string | null;
	venueShort: string;
	difficulty: number;
	fear: number;
	players: string;
}

/**
 * "Book": venue filter and one date strip on top, then one row per
 * room with plain session buttons. Tapping a time opens team size + total +
 * "Add to your doors" right under that row.
 */
export function SessionBoard({ rooms, venues, initialRanges, renderedAt, initialVenue, initialDate = null }: { rooms: BoardRoom[]; venues: Array<{ slug: string; short: string }>; initialRanges: Record<string, FreeRange[]>; renderedAt: number; initialVenue: string | null; initialDate?: string | null }) {
	const { data } = useSWR<Record<string, FreeRange[]>>('/api/rooms/availability', fetcher, { fallbackData: initialRanges, revalidateOnFocus: false });
	const now = useNow(60_000)?.getTime() ?? renderedAt;
	const [venue, setVenue] = useState<string | null>(initialVenue && venues.some((v) => v.slug === initialVenue) ? initialVenue : null);
	const shown = rooms.filter((r) => !venue || r.venueSlug === venue);
	const sessions = useMemo(() => Object.fromEntries(rooms.map((r) => [r.slug, byDate(roomSessions(data?.[r.slug] ?? [], { durationMin: r.durationMin, now }))])), [rooms, data, now]);
	const dates = useMemo(() => localDates(today(now), siteConfig.horizonDays), [now]);
	const counts = useMemo(() => Object.fromEntries(dates.map((d) => [d, shown.reduce((n, r) => n + (sessions[r.slug]?.[d]?.length ?? 0), 0)])), [dates, shown, sessions]);
	// `?date=YYYY-MM-DD` deep link: kept while it is inside the horizon (a fully booked day still shows, row by row).
	const [date, setDate] = useState<string | null>(initialDate);
	const active = date && (counts[date] || (date === initialDate && dates.includes(date))) ? date : (dates.find((d) => counts[d]) ?? dates[0] ?? null);
	const [pick, setPick] = useState<{ slug: string; session: Session } | null>(null);
	const [team, setTeam] = useState<number | null>(null);
	const [added, setAdded] = useState<string | null>(null);
	const { add, pending, error, setError } = useAddToCart();

	const choose = (slug: string, x: Session) => {
		setPick({ slug, session: x });
		setTeam(null);
		setAdded(null);
		setError(null);
	};

	return (
		<div>
			<div className="flex flex-wrap items-center gap-2" role="group" aria-label="Venue">
				{[{ slug: null as string | null, short: "Both venues" }, ...venues].map((v) => (
					<button key={v.slug ?? 'all'} type="button" aria-pressed={venue === v.slug} onClick={() => { setVenue(v.slug); setPick(null); }} className={s.filter}>
						{v.short}
					</button>
				))}
			</div>

			<div className={`${s.panel} mt-6`}>
				<div className={s.section}>
					<p className={s.label}>
						<span>Date</span>
						{active ? <span className={s.labelNote}>{localDateParts(active).long}</span> : null}
					</p>
					<DateStrip dates={dates} selected={active} counts={counts} onSelect={(d) => { setDate(d); setPick(null); }} />
				</div>
				<ol>
					{shown.map((r) => {
						const list = active ? (sessions[r.slug]?.[active] ?? []) : [];
						const open = pick?.slug === r.slug;
						const option = open ? (r.options.find((o) => o.size === team) ?? null) : null;
						return (
							<li key={r.slug} className={s.section}>
								<div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] md:items-center">
									<div className="flex items-start gap-4">
										<span aria-hidden className={s.roomThumb} style={{ "--slit": r.glow } as CSSProperties}>
											<DoorArt sources={r.art} alt="" glow={r.glow} />
										</span>
										<div className="min-w-0">
											<Link href={`/rooms/${r.slug}`} className="font-display text-[1.45rem] leading-tight tracking-tight hover:text-white">
												{r.title}
											</Link>
											<p className="mt-1 text-[0.85rem] text-ink-3">
												{r.venueShort} · {r.players} players · {r.gameMinutes} min game · from {formatWholePrice(r.options[0]?.price ?? 0)}
											</p>
											<p className="mt-1 flex gap-4 text-[0.8rem]">
												<span className="inline-flex items-center gap-2 text-ink-3">Difficulty <Meter value={r.difficulty} label="Difficulty" tone={r.glow} /></span>
												<span className="inline-flex items-center gap-2 text-ink-3">Fear <Meter value={r.fear} label="Fear" tone={r.glow} /></span>
											</p>
										</div>
									</div>
									<div>{list.length ? <SessionButtons sessions={list} selected={open ? pick.session.start : null} onSelect={(x) => choose(r.slug, x)} note={offerNote} /> : <p className={s.empty}>Fully booked this day.</p>}</div>
								</div>
								{open ? (
									<div className="mt-4 border-t border-[rgba(232,222,255,0.1)] pt-4">
										<p className={s.label}>
											<span>
												Team size · {localDateParts(pick.session.date).weekday} {pick.session.time}
											</span>
											<span className={s.labelNote}>Price for the whole team</span>
										</p>
										<TeamSizes options={r.options} selected={team} onSelect={(n) => { setTeam(n); setAdded(null); }} />
										{error ? <p role="alert" className={`${s.error} !mx-0 mt-3`}>{error}</p> : null}
										{added ? <p role="status" className={`${s.ok} !mx-0 mt-3`}>Added to your doors: {added}</p> : null}
										<div className="mt-4 flex items-center gap-3">
											<div className={s.total}>
												<span className={s.totalAmount}>{option ? formatPrice(option.price) : 'Choose your team'}</span>
												<span className={s.totalNote}>
													{minutesLabel(r.durationMin)} visit · extras on the room page or at the venue
												</span>
											</div>
											<button
												type="button"
												className={s.cta}
												disabled={!option || pending}
												onClick={async () => {
													if (!option) return;
													const ok = await add({ productId: option.productId, locationId: r.locationId, start: pick.session.start, end: pick.session.end, numberOfAttendees: 1, people: option.size });
													if (ok) {
														setAdded(`${r.title}, ${localDateParts(pick.session.date).long} at ${pick.session.time}, ${option.size} players.`);
														setPick(null);
													}
												}}
											>
												{pending ? 'Adding…' : "Add to your doors"}
											</button>
										</div>
									</div>
								) : null}
							</li>
						);
					})}
				</ol>
				{added && !pick ? <p role="status" className={s.ok}>Added to your doors: {added}</p> : null}
			</div>
		</div>
	);
}
