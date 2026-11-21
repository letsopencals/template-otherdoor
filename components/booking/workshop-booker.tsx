'use client';

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import { byDate, workshopSessions, type FreeRange, type Session } from '@/lib/sessions';
import { fetcher } from '@/lib/fetcher';
import { formatPrice, formatWholePrice } from '@/lib/format';
import { localDates, today } from '@/lib/tz';
import { localDateParts, minutesLabel } from '@/lib/when';
import { siteConfig } from '@/lib/site-config';
import { useNow } from '@/hooks/use-now';
import { useAddToCart } from '@/hooks/use-add-to-cart';
import { DateStrip } from './date-strip';
import { SessionButtons } from './session-buttons';
import s from './booking.module.css';

export interface WorkshopView {
	slug: string;
	productId: string;
	title: string;
	durationMin: number;
	price: number;
	seats: number;
	locationId: string | null;
	staffMemberId: string | null;
}

/** One workshop: date strip above sessions with seats left, a seats stepper, the per-head total. */
export function WorkshopBooker({ w, initialRanges, renderedAt }: { w: WorkshopView; initialRanges: Record<string, FreeRange[]>; renderedAt: number }) {
	const { data } = useSWR<Record<string, FreeRange[]>>('/api/workshops/availability', fetcher, { fallbackData: initialRanges, revalidateOnFocus: false });
	const now = useNow(60_000)?.getTime() ?? renderedAt;
	const [seats, setSeats] = useState(2);
	const sessions = useMemo(() => byDate(workshopSessions(data?.[w.slug] ?? [], { durationMin: w.durationMin, now })), [data, w.slug, w.durationMin, now]);
	const dates = useMemo(() => localDates(today(now), Math.max(siteConfig.horizonDays, 28)), [now]);
	const counts = useMemo(() => Object.fromEntries(dates.map((d) => [d, sessions[d]?.length ?? 0])), [dates, sessions]);
	const [date, setDate] = useState<string | null>(null);
	const active = date && counts[date] ? date : (dates.find((d) => counts[d]) ?? null);
	const [pick, setPick] = useState<Session | null>(null);
	const [added, setAdded] = useState<string | null>(null);
	const { add, pending, error, setError } = useAddToCart();
	const list = active ? (sessions[active] ?? []) : [];
	const max = Math.max(1, Math.min(pick?.left ?? w.seats, w.seats));

	return (
		<div className={s.panel}>
			<div className={s.section}>
				<p className={s.label}>
					<span>1 · Date</span>
					{active ? <span className={s.labelNote}>{localDateParts(active).long}</span> : null}
				</p>
				<DateStrip dates={dates} selected={active} counts={counts} onSelect={(d) => { setDate(d); setPick(null); setAdded(null); }} />
				<div className="mt-3">
					{list.length ? (
						<SessionButtons sessions={list} selected={pick?.start ?? null} onSelect={(x) => { setPick(x); setSeats((n) => Math.min(n, x.left)); setError(null); setAdded(null); }} note={(x) => (x.left <= 3 ? `${x.left} left` : `${x.left} seats`)} />
					) : (
						<p className={s.empty}>No sessions open in the next few weeks.</p>
					)}
				</div>
			</div>
			<div className={s.section}>
				<p className={s.label}>
					<span>2 · Seats</span>
					<span className={s.labelNote}>{formatWholePrice(w.price)} per person</span>
				</p>
				<div className={s.stepper}>
					<button type="button" onClick={() => setSeats((n) => Math.max(1, n - 1))} disabled={seats <= 1} aria-label="One seat fewer">
						−
					</button>
					<output aria-live="polite">{seats}</output>
					<button type="button" onClick={() => setSeats((n) => Math.min(max, n + 1))} disabled={seats >= max} aria-label="One seat more">
						+
					</button>
				</div>
			</div>
			{error ? <p className={s.error}>{error}</p> : null}
			{added ? <p className={s.ok}>Added to your doors: {added}</p> : null}
			<div className={s.bar}>
				<div className={s.total}>
					<span className={s.totalAmount}>{formatPrice(w.price * seats)}</span>
					<span className={s.totalNote}>
						{seats} × {formatWholePrice(w.price)} · {minutesLabel(w.durationMin)}
						{pick ? ` · ${localDateParts(pick.date).weekday} ${pick.time}` : ''}
					</span>
				</div>
				<button
					type="button"
					className={s.cta}
					disabled={!pick || pending}
					onClick={async () => {
						if (!pick) return;
						const ok = await add({ productId: w.productId, locationId: w.locationId, staffMemberId: w.staffMemberId, start: pick.start, end: pick.end, numberOfAttendees: seats });
						if (ok) {
							setAdded(`${w.title}, ${localDateParts(pick.date).long} at ${pick.time}, ${seats} ${seats === 1 ? 'seat' : 'seats'}.`);
							setPick(null);
						}
					}}
				>
					{!pick ? 'Choose a session' : pending ? 'Adding…' : 'Add to your doors'}
				</button>
			</div>
		</div>
	);
}
