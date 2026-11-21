'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import useSWR from 'swr';
import type { AppointmentDetailResponse } from '@opencals/storefront-sdk';
import { fetcher } from '@/lib/fetcher';
import { expeditionOf, mapHref, partyLabel } from '@/lib/expedition';
import { changeWindow, policyLine } from '@/lib/change-window';
import { byDate, roomSessions, workshopSessions, type FreeRange, type Session } from '@/lib/sessions';
import { localDates, today } from '@/lib/tz';
import { localDateParts, longDayLabel, timeLabel } from '@/lib/when';
import { siteConfig } from '@/lib/site-config';
import { onSessionExpired } from '@/lib/session-expired';
import { useNow } from '@/hooks/use-now';
import { LuggageTag } from '@/components/satchel/luggage-tag';
import { DateStrip } from '@/components/booking/date-strip';
import { SessionButtons } from '@/components/booking/session-buttons';
import b from '@/components/booking/booking.module.css';

const utc = (ms: number) => {
	const iso = new Date(ms).toISOString();
	return { date: iso.slice(0, 10), time: iso.slice(11, 19) };
};

/** One expedition in the logbook: details, move (same room and length, on the session grid) or cancel. */
export function ExpeditionDetail({ id, initialAction }: { id: string; initialAction: 'move' | 'cancel' | null }) {
	const router = useRouter();
	const { data: a, error, mutate } = useSWR<AppointmentDetailResponse>(`/api/account/appointments/${encodeURIComponent(id)}`, fetcher, { revalidateOnFocus: false });
	const [mode, setMode] = useState<'move' | 'cancel' | null>(initialAction);
	const [busy, setBusy] = useState(false);
	const [msg, setMsg] = useState<string | null>(null);
	const now = useNow(60_000)?.getTime() ?? null;

	if (error) return <p className="py-10">This expedition didn’t load. <Link href="/account" className="underline">Back to the logbook</Link></p>;
	if (!a || now === null) return <p className="font-display py-10 text-2xl">Finding the entry…</p>;
	const e = expeditionOf({ ...a, addOns: a.addOns } as never);
	const w = changeWindow({ from: a.from, status: a.status, product: a.product }, now);
	const map = mapHref(e.venueSlug, e.venueAddress);

	const call = async (url: string, body: unknown, ok: string) => {
		setBusy(true);
		setMsg(null);
		try {
			const res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
			if (res.status === 401) return onSessionExpired();
			const data = await res.json().catch(() => null);
			if (!res.ok) throw new Error(data?.error || data?.message || 'That didn’t go through.');
			setMsg(ok);
			setMode(null);
			await mutate();
			router.refresh();
		} catch (err) {
			setMsg(err instanceof Error ? err.message : 'That didn’t go through.');
		} finally {
			setBusy(false);
		}
	};

	return (
		<div className="grid gap-10 lg:grid-cols-[minmax(0,420px)_1fr]">
			<div>
				<LuggageTag e={e} />
				<dl className="mt-8 grid gap-3 text-[0.95rem]">
					<div><dt className="engraved text-sepia">When</dt><dd>{longDayLabel(e.start)}, start {timeLabel(e.start)} (call time {timeLabel(e.call)})</dd></div>
					<div><dt className="engraved text-sepia">Party</dt><dd>{partyLabel(e)}</dd></div>
					<div><dt className="engraved text-sepia">Where</dt><dd>{e.venueName}{e.venueAddress ? `, ${e.venueAddress}` : ''} {map ? <a href={map} target="_blank" rel="noreferrer" className="underline">map</a> : null}</dd></div>
					<div><dt className="engraved text-sepia">Status</dt><dd className="capitalize">{a.status === 'canceled' ? 'cancelled' : a.status}</dd></div>
				</dl>
				<p className="mt-6 text-sm text-sepia">{policyLine(w)}</p>
			</div>
			<div>
				{msg ? <p className="paper mb-6 border-l-4 border-patina p-4" role="status">{msg}</p> : null}
				<div className="flex flex-wrap gap-3">
					<button type="button" className={`plate ${mode === 'move' ? '' : 'plate-ghost'}`} disabled={!w.reschedule.allowed} onClick={() => setMode('move')}>
						Move this expedition
					</button>
					<button type="button" className={`plate ${mode === 'cancel' ? 'plate-oxblood' : 'plate-ghost'}`} disabled={!w.cancel.allowed} onClick={() => setMode('cancel')}>
						Cancel it
					</button>
				</div>
				{!w.reschedule.allowed && !w.cancel.allowed ? <p className="mt-4">{w.cancel.reason}</p> : null}
				{mode === 'move' && w.reschedule.allowed ? <MovePicker appt={a} kind={e.kind} roomKey={e.key} seats={e.seats} busy={busy} onMove={(start, end) => call(`/api/account/appointments/${a.id}/reschedule`, { slot: { productId: a.productId, fromDate: utc(start).date, fromTime: utc(start).time, toDate: utc(end).date, toTime: utc(end).time, staffMemberId: a.staffMemberId ?? null, locationId: a.locationId ?? null } }, `Moved to ${longDayLabel(start)} at ${timeLabel(start)}. A new invitation is on its way.`)} /> : null}
				{mode === 'cancel' && w.cancel.allowed ? (
					<div className="paper mt-6 p-6">
						<p className="font-display text-2xl">Cancel {e.title} on {longDayLabel(e.start)}?</p>
						<p className="mt-2">The session is released for another team. Refunds follow the store’s policy; your email confirms the details.</p>
						<div className="mt-5 flex flex-wrap gap-3">
							<button type="button" className="plate plate-oxblood" disabled={busy} onClick={() => call(`/api/account/appointments/${a.id}/cancel`, {}, 'Cancelled. The session is released.')}>
								{busy ? 'Cancelling…' : 'Yes, cancel it'}
							</button>
							<button type="button" className="plate plate-ghost" onClick={() => setMode(null)}>
								Keep it
							</button>
						</div>
					</div>
				) : null}
			</div>
		</div>
	);
}

function MovePicker({ appt, kind, roomKey, seats, busy, onMove }: { appt: AppointmentDetailResponse; kind: 'room' | 'workshop'; roomKey: string; seats: number; busy: boolean; onMove: (start: number, end: number) => void }) {
	const { data } = useSWR<Record<string, FreeRange[]>>(kind === 'room' ? '/api/rooms/availability' : '/api/workshops/availability', fetcher, { revalidateOnFocus: false });
	const now = useNow(60_000)?.getTime() ?? Date.now();
	const own = Date.parse(appt.from);
	const len = Math.round((Date.parse(appt.to) - own) / 60_000);
	const sessions = useMemo<Session[]>(() => {
		const ranges = data?.[roomKey] ?? [];
		// Merged availability counts this booking as taken: add its own window back.
		const mine: FreeRange = { start: own, end: Date.parse(appt.to), attendees: 0, maxAttendees: 1 };
		const list = kind === 'room' ? roomSessions([...ranges, mine], { durationMin: len, now }) : workshopSessions(ranges, { durationMin: len, now, seats });
		return list.filter((x) => x.start !== own);
	}, [data, roomKey, own, appt.to, kind, len, now, seats]);
	const days = useMemo(() => byDate(sessions), [sessions]);
	const dates = useMemo(() => localDates(today(now), siteConfig.horizonDays), [now]);
	const counts = useMemo(() => Object.fromEntries(dates.map((d) => [d, days[d]?.length ?? 0])), [dates, days]);
	const [date, setDate] = useState<string | null>(null);
	const active = date && counts[date] ? date : (dates.find((d) => counts[d]) ?? null);
	const [pick, setPick] = useState<Session | null>(null);
	if (!data) return <p className="mt-6">Reading the board…</p>;
	return (
		<div className={`${b.panel} mt-6`}>
			<div className={b.section}>
				<p className={b.label}>
					<span>New date</span>
					{active ? <span className={b.labelNote}>{localDateParts(active).long}</span> : null}
				</p>
				<DateStrip dates={dates} selected={active} counts={counts} onSelect={(d) => { setDate(d); setPick(null); }} />
				<div className="mt-3">{active ? <SessionButtons sessions={days[active] ?? []} selected={pick?.start ?? null} onSelect={setPick} /> : <p className={b.empty}>No other sessions free. Email {siteConfig.contact.email}.</p>}</div>
			</div>
			<div className={b.bar}>
				<div className={b.total}>
					<span className={b.totalAmount}>{pick ? `${localDateParts(pick.date).weekday} ${pick.time}` : 'Pick a time'}</span>
					<span className={b.totalNote}>Same room, same team, same price</span>
				</div>
				<button type="button" className={b.cta} disabled={!pick || busy} onClick={() => pick && onMove(pick.start, pick.end)}>
					{busy ? 'Moving…' : 'Move here'}
				</button>
			</div>
		</div>
	);
}
