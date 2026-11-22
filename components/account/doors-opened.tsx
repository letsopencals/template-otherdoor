'use client';

import Link from 'next/link';
import { useMemo, type CSSProperties } from 'react';
import useSWR from 'swr';
import { signOut, useSession } from 'next-auth/react';
import { visitOf, partyLabel, type AppointmentShape } from '@/lib/visit';
import { splitLog, openedDoors, type LogEntry } from '@/lib/history';
import { changeWindow, policyLine } from '@/lib/change-window';
import { fetcher } from '@/lib/fetcher';
import { useNow } from '@/hooks/use-now';
import { dayLabel } from '@/lib/when';
import { DoorCard } from '@/components/cart/door-card';
import { DoorArt } from '@/components/doors/door-art';
import s from './doors-opened.module.css';

export interface SigilRoom {
	slug: string;
	title: string;
	genre: string;
	year: string;
	glow: string;
	keyArt: string | null;
	art?: string | null;
	poster?: string | null;
}

type Appt = AppointmentShape & { status?: string | null; product?: AppointmentShape['product'] & { cancelGap?: number; rescheduleGap?: number; allowCustomerCancel?: boolean; allowCustomerReschedule?: boolean } };

/**
 * "Doors opened": upcoming bookings (move or cancel within the 24 h rule), the
 * collection of every room's door (played ones open and lit in their world's
 * colour with the date, the rest still closed), and the past list.
 */
export function DoorsOpened({ rooms, fixture }: { rooms: SigilRoom[]; fixture?: Appt[] }) {
	const { data: session } = useSession();
	const { data, error, isLoading } = useSWR<{ data: Appt[] }>(fixture ? null : '/api/account/appointments?take=50&orderBy=from&order=DESC', fetcher, { revalidateOnFocus: false });
	const list = useMemo(() => fixture ?? data?.data ?? [], [fixture, data]);
	const now = useNow(60_000)?.getTime() ?? 0;
	const entries = useMemo<Array<LogEntry & { a: Appt }>>(() => list.map((a) => ({ a, e: visitOf(a), status: a.status === 'scheduled' && Date.parse(a.to) < now ? 'completed' : (a.status ?? 'scheduled') })), [list, now]);
	const { upcoming, past } = useMemo(() => splitLog(entries, now), [entries, now]);
	const opened = useMemo(() => openedDoors(entries, now), [entries, now]);
	const left = rooms.filter((r) => opened[r.slug] === undefined).length;
	const name = fixture ? "Ada" : (session?.customer?.firstName ?? null);

	return (
		<section className="pool wrap pb-24 pt-[calc(var(--header-h)+48px)]">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<p className="label">Your account</p>
					<h1 className="font-display mt-4 text-[clamp(2.6rem,6vw,5rem)] leading-[0.95] tracking-[-0.045em]">{name ? `Welcome back, ${name}.` : 'Welcome back.'}</h1>
				</div>
				{fixture ? null : (
					<button type="button" className="link text-sm text-ink-2" onClick={() => void signOut({ callbackUrl: '/' })}>
						Sign out
					</button>
				)}
			</div>

			<div className={s.collection}>
				<div className={s.collectionHead}>
					<h2 className={s.h2}>Doors opened</h2>
					<p className="mono text-[0.85rem] text-ink-2">
						{rooms.length - left} of {rooms.length}
						{rooms.length ? (left ? ` · ${left} ${left === 1 ? 'door' : 'doors'} left` : ' · every door opened') : ''}
					</p>
				</div>
				<div className={s.doors}>
					{rooms.map((r) => {
						const at = opened[r.slug];
						const isOpen = at !== undefined;
						return (
							<Link key={r.slug} href={`/rooms/${r.slug}`} className={s.door} data-open={isOpen} style={{ '--slit': r.glow } as CSSProperties}>
								<span className={s.frame}>
									<DoorArt sources={[r.keyArt, r.art, r.poster]} alt="" glow={r.glow} className={s.art} />
									<span className={s.leaf} />
								</span>
								<span className={`slit ${s.sill}`} aria-hidden />
								<span className={s.name}>{r.title}</span>
								<span className={s.when}>{isOpen ? `Opened ${new Date(at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/London' })}` : `${r.genre} · ${r.year}`}</span>
							</Link>
						);
					})}
				</div>
			</div>

			<div className={s.grid}>
				<div>
					<h2 className={s.h2}>Coming up</h2>
					{isLoading ? <p className="mt-6 text-ink-3">Opening your bookings…</p> : null}
					{error ? <p className="mt-6 text-ink-2">Your bookings didn’t load. Refresh to try again.</p> : null}
					{!isLoading && !upcoming.length ? (
						<p className="mt-6 text-ink-2">
							Nothing booked.{' '}
							<Link href="/book" className="link">
								Pick a door
							</Link>
						</p>
					) : null}
					<div className="mt-6 grid gap-4">
						{upcoming.map(({ e, a }) => {
							const w = changeWindow({ from: a.from, status: (a.status as never) ?? 'scheduled', product: a.product as never }, now);
							return (
								<div key={e.id}>
									<DoorCard
										v={e}
										actions={
											fixture ? (
												<span className="text-ink-3">Move · Cancel · Details</span>
											) : (
												<>
													{w.reschedule.allowed ? <Link href={`/account/appointments/${e.id}?do=move`}>Move</Link> : null}
													{w.cancel.allowed ? <Link href={`/account/appointments/${e.id}?do=cancel`}>Cancel</Link> : null}
													<Link href={`/account/appointments/${e.id}`}>Details</Link>
												</>
											)
										}
									/>
									{/* No clock on the server or while hydrating (now = 0): the policy line arrives after mount. */}
									{now ? <p className="mt-2 pl-3 text-[0.8rem] text-ink-3">{policyLine(w)}</p> : null}
								</div>
							);
						})}
					</div>
				</div>
				<div>
					<h2 className={s.h2}>Past visits</h2>
					{past.length ? (
						<ol className={s.past}>
							{past.slice(0, 14).map(({ e, status }) => (
								<li key={e.id} style={{ '--slit': e.palette.glow } as CSSProperties}>
									<span className="min-w-0">
										<span className={s.pastTitle}>{e.title}</span>
										<span className="text-ink-3"> · {partyLabel(e)}</span>
									</span>
									<span className="mono whitespace-nowrap text-[0.8rem] text-ink-3">{status === 'canceled' ? 'cancelled' : dayLabel(e.start)}</span>
								</li>
							))}
						</ol>
					) : (
						<p className="mt-6 text-ink-3">Your first door is still ahead of you.</p>
					)}
				</div>
			</div>
		</section>
	);
}
