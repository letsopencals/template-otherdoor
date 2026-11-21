'use client';

import Link from 'next/link';
import { useMemo, type CSSProperties } from 'react';
import useSWR from 'swr';
import { signOut, useSession } from 'next-auth/react';
import { expeditionOf, partyLabel, type AppointmentShape } from '@/lib/expedition';
import { splitLog, stamps, type LogEntry } from '@/lib/logbook';
import { changeWindow, policyLine } from '@/lib/change-window';
import { fetcher } from '@/lib/fetcher';
import { useNow } from '@/hooks/use-now';
import { dayLabel, localDateParts, timeLabel } from '@/lib/when';
import { PassportStamp } from './passport-stamp';
import s from './logbook.module.css';

export interface PassportRoom {
	slug: string;
	title: string;
	ink: string;
}

type Appt = AppointmentShape & { status?: string | null; product?: AppointmentShape['product'] & { cancelGap?: number; rescheduleGap?: number; allowCustomerCancel?: boolean; allowCustomerReschedule?: boolean } };

/**
 * The Explorer’s Logbook: a two-page spread. Left: upcoming expeditions (move or
 * cancel within the 24 h rule) and past ones. Right: the passport, one stamp slot
 * per room in the store; played rooms are inked with the date.
 */
export function LogbookView({ rooms, fixture }: { rooms: PassportRoom[]; fixture?: Appt[] }) {
	const { data: session } = useSession();
	const { data, error, isLoading } = useSWR<{ data: Appt[] }>(fixture ? null : '/api/account/appointments?take=50&orderBy=from&order=DESC', fetcher, { revalidateOnFocus: false });
	const list = useMemo(() => fixture ?? data?.data ?? [], [fixture, data]);
	const now = useNow(60_000)?.getTime() ?? 0;
	const entries = useMemo<Array<LogEntry & { a: Appt }>>(() => list.map((a) => ({ a, e: expeditionOf(a), status: a.status === 'scheduled' && Date.parse(a.to) < now ? 'completed' : (a.status ?? 'scheduled') })), [list, now]);
	const { upcoming, past } = useMemo(() => splitLog(entries, now), [entries, now]);
	const stamped = useMemo(() => stamps(entries, now), [entries, now]);
	const left = rooms.filter((r) => stamped[r.slug] === undefined).length;
	const name = session?.customer?.firstName ?? 'explorer';

	return (
		<section className="wrap pb-24 pt-[calc(var(--header-h)+32px)]">
			<div className="mb-8 flex flex-wrap items-end justify-between gap-4">
				<div>
					<p className="folio folio-left">The Explorer’s Logbook</p>
					<h1 className="font-display mt-3 text-[clamp(2.4rem,5vw,3.8rem)] leading-none">Welcome back, {name}.</h1>
				</div>
				{fixture ? null : (
					<button type="button" className="text-sm underline underline-offset-4" onClick={() => void signOut({ callbackUrl: '/' })}>
						Sign out
					</button>
				)}
			</div>
			<div className={s.book}>
				<div className={s.page}>
					<h2 className={s.pageHead}>
						<span>Expeditions ahead</span>
						<span className="typed text-xs normal-case tracking-normal text-sepia">{upcoming.length}</span>
					</h2>
					{isLoading ? <p className="font-display text-xl">Turning the pages…</p> : null}
					{error ? <p>Your logbook didn’t load. Refresh to try again.</p> : null}
					{!isLoading && !upcoming.length ? (
						<p className="font-display text-xl italic">
							No expeditions planned.{' '}
							<Link href="/book" className="not-italic underline">
								Plan one
							</Link>
						</p>
					) : null}
					{upcoming.map(({ e, a }) => {
						const w = changeWindow({ from: a.from, status: (a.status as never) ?? 'scheduled', product: a.product as never }, now || Date.now());
						const p = localDateParts(new Date(e.start).toISOString().slice(0, 10));
						return (
							<article key={e.id} className={s.entry}>
								<div className={s.date} style={{ borderTop: `4px solid ${e.palette.spine}` }}>
									<span className="text-xs uppercase">{dayLabel(e.start).split(' ')[0]}</span>
									<b>{p.day}</b>
									<span className="text-xs uppercase">{p.month}</span>
								</div>
								<div>
									<p className={s.entryTitle}>{e.title}</p>
									<p className={s.entryMeta}>
										Call {timeLabel(e.call)} · start {timeLabel(e.start)} · {partyLabel(e)}
										{e.venueName ? ` · ${e.venueName}` : ''}
									</p>
									{e.addOns.length ? <p className={s.entryMeta}>+ {e.addOns.join(', ')}</p> : null}
									<p className="mt-1 text-[0.82rem] text-sepia">{policyLine(w)}</p>
									<div className={s.actions}>
										{fixture ? null : (
											<>
												{w.reschedule.allowed ? <Link href={`/account/appointments/${e.id}?do=move`}>Move</Link> : null}
												{w.cancel.allowed ? <Link href={`/account/appointments/${e.id}?do=cancel`}>Cancel</Link> : null}
												<Link href={`/account/appointments/${e.id}`}>Details</Link>
											</>
										)}
									</div>
								</div>
							</article>
						);
					})}
					{past.length ? (
						<div className={s.past}>
							<h3 className={s.pageHead}>
								<span>Expeditions past</span>
							</h3>
							{past.slice(0, 12).map(({ e, status }) => (
								<div key={e.id} className={s.pastRow}>
									<span>
										{e.title} <span className="text-sepia">· {partyLabel(e)}</span>
									</span>
									<span className="typed whitespace-nowrap">{status === 'canceled' ? 'cancelled' : dayLabel(e.start)}</span>
								</div>
							))}
						</div>
					) : null}
				</div>
				<div className={s.page}>
					<h2 className={s.pageHead}>
						<span>Passport of the society</span>
						<span className="typed text-xs normal-case tracking-normal text-sepia">
							{rooms.length - left}/{rooms.length}
						</span>
					</h2>
					<div className={s.passport}>
						{rooms.map((r, i) => {
							const at = stamped[r.slug];
							const inked = at !== undefined;
							return (
								<Link key={r.slug} href={`/rooms/${r.slug}`} className={s.slot}>
									<span className={`${s.stamp} ${inked ? s.inked : s.outline}`} style={{ '--rot': `${[-9, 6, -4, 11, -12, 3][i % 6]}deg`, '--ink': inked ? r.ink : '#6f5a3e', '--delay': `${i * 0.12}s` } as CSSProperties}>
										<PassportStamp name={r.title} inked={inked} date={inked ? new Date(at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit', timeZone: 'Europe/London' }).toUpperCase() : null} shape={i} />
									</span>
									<span className={s.slotName}>{r.title}</span>
								</Link>
							);
						})}
					</div>
					<p className={s.left}>{rooms.length ? (left ? `${left} ${left === 1 ? 'volume' : 'volumes'} left to stamp.` : 'Every volume stamped. The society salutes you.') : ''}</p>
				</div>
			</div>
		</section>
	);
}
