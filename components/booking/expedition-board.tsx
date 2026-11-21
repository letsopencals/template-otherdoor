'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import useSWR from 'swr';
import type { TeamOption } from '@/lib/rooms';
import { roomSessions, byDate, type FreeRange, type Session } from '@/lib/sessions';
import { fetcher } from '@/lib/fetcher';
import { formatPrice, formatWholePrice } from '@/lib/format';
import { localDates, today } from '@/lib/tz';
import { localDateParts, minutesLabel } from '@/lib/when';
import { siteConfig } from '@/lib/site-config';
import { useNow } from '@/hooks/use-now';
import { useAddToSatchel } from '@/hooks/use-add-to-satchel';
import { DateStrip } from './date-strip';
import { SessionButtons, offerNote } from './session-buttons';
import { TeamSizes } from './team-sizes';
import { Meter } from '@/components/ui/meters';
import s from './booking.module.css';

export interface BoardRoom {
	slug: string;
	title: string;
	genre: string;
	durationMin: number;
	gameMinutes: number;
	options: TeamOption[];
	locationId: string | null;
	venueSlug: string | null;
	venueShort: string;
	spine: string;
	foil: string;
	difficulty: number;
	fear: number;
	players: string;
}

/**
 * "Plan an expedition": venue tabs and one date strip on top, then one row per
 * room with plain session buttons. Tapping a time opens team size + total +
 * "Add to satchel" right under that row.
 */
export function ExpeditionBoard({ rooms, venues, initialRanges, renderedAt, initialVenue }: { rooms: BoardRoom[]; venues: Array<{ slug: string; short: string }>; initialRanges: Record<string, FreeRange[]>; renderedAt: number; initialVenue: string | null }) {
	const { data } = useSWR<Record<string, FreeRange[]>>('/api/rooms/availability', fetcher, { fallbackData: initialRanges, revalidateOnFocus: false });
	const now = useNow(60_000)?.getTime() ?? renderedAt;
	const [venue, setVenue] = useState<string | null>(initialVenue && venues.some((v) => v.slug === initialVenue) ? initialVenue : null);
	const shown = rooms.filter((r) => !venue || r.venueSlug === venue);
	const sessions = useMemo(() => Object.fromEntries(rooms.map((r) => [r.slug, byDate(roomSessions(data?.[r.slug] ?? [], { durationMin: r.durationMin, now }))])), [rooms, data, now]);
	const dates = useMemo(() => localDates(today(now), siteConfig.horizonDays), [now]);
	const counts = useMemo(() => Object.fromEntries(dates.map((d) => [d, shown.reduce((n, r) => n + (sessions[r.slug]?.[d]?.length ?? 0), 0)])), [dates, shown, sessions]);
	const [date, setDate] = useState<string | null>(null);
	const active = date && counts[date] ? date : (dates.find((d) => counts[d]) ?? dates[0] ?? null);
	const [pick, setPick] = useState<{ slug: string; session: Session } | null>(null);
	const [team, setTeam] = useState<number | null>(null);
	const [added, setAdded] = useState<string | null>(null);
	const { add, pending, error, setError } = useAddToSatchel();

	const choose = (slug: string, x: Session) => {
		setPick({ slug, session: x });
		setTeam(null);
		setAdded(null);
		setError(null);
	};

	return (
		<div>
			<div className="flex flex-wrap items-center gap-2" role="group" aria-label="House">
				{[{ slug: null as string | null, short: 'Both houses' }, ...venues].map((v) => (
					<button key={v.slug ?? 'all'} type="button" aria-pressed={venue === v.slug} onClick={() => { setVenue(v.slug); setPick(null); }} className={`min-h-[44px] border px-4 font-bold transition ${venue === v.slug ? 'border-ink-green bg-ink-green text-vellum' : 'border-[#8a6a43]/50 bg-vellum hover:border-ink-green'}`}>
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
										<span aria-hidden className="mt-1 h-16 w-4 shrink-0 rounded-[2px]" style={{ background: `linear-gradient(90deg, rgba(0,0,0,.3), transparent 40%, rgba(0,0,0,.25)), ${r.spine}`, boxShadow: `inset 0 4px 0 ${r.foil}, inset 0 -4px 0 ${r.foil}` }} />
										<div className="min-w-0">
											<Link href={`/rooms/${r.slug}`} className="font-display text-[1.5rem] leading-tight hover:underline">
												{r.title}
											</Link>
											<p className="text-[0.85rem] text-[#6f5a3e]">
												{r.venueShort} · {r.players} players · {r.gameMinutes} min game · from {formatWholePrice(r.options[0]?.price ?? 0)}
											</p>
											<p className="mt-1 flex gap-4 text-[0.8rem]">
												<Meter kind="candle" value={r.difficulty} label="Difficulty" tone="#7a1e22" />
												<Meter kind="key" value={r.fear} label="Fear" tone="#1e3a30" />
											</p>
										</div>
									</div>
									<div>{list.length ? <SessionButtons sessions={list} selected={open ? pick.session.start : null} onSelect={(x) => choose(r.slug, x)} note={offerNote} /> : <p className={s.empty}>Fully booked this day.</p>}</div>
								</div>
								{open ? (
									<div className="mt-4 border-t border-dashed border-[#8a6a43]/50 pt-4">
										<p className={s.label}>
											<span>
												Team size · {localDateParts(pick.session.date).weekday} {pick.session.time}
											</span>
											<span className={s.labelNote}>Price for the whole team</span>
										</p>
										<TeamSizes options={r.options} selected={team} onSelect={(n) => { setTeam(n); setAdded(null); }} />
										{error ? <p className={`${s.error} !mx-0 mt-3`}>{error}</p> : null}
										{added ? <p className={`${s.ok} !mx-0 mt-3`}>In your satchel: {added}</p> : null}
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
												{pending ? 'Adding…' : 'Add to satchel'}
											</button>
										</div>
									</div>
								) : null}
							</li>
						);
					})}
				</ol>
				{added && !pick ? <p className={s.ok}>In your satchel: {added}</p> : null}
			</div>
		</div>
	);
}
