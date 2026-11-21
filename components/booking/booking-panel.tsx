'use client';

import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';
import type { AddOnListItemResponse } from '@opencals/storefront-sdk';
import type { TeamOption } from '@/lib/rooms';
import { byDate, roomSessions, type FreeRange, type Session } from '@/lib/sessions';
import { fetcher } from '@/lib/fetcher';
import { formatPrice } from '@/lib/format';
import { localDates, today } from '@/lib/tz';
import { localDateParts, minutesLabel } from '@/lib/when';
import { siteConfig } from '@/lib/site-config';
import { useNow } from '@/hooks/use-now';
import { useAddToCart } from '@/hooks/use-add-to-cart';
import { DateStrip } from './date-strip';
import { SessionButtons, offerNote } from './session-buttons';
import { TeamSizes } from './team-sizes';
import { AddOnList } from './add-on-list';
import s from './booking.module.css';

export interface PanelRoom {
	slug: string;
	title: string;
	durationMin: number;
	options: TeamOption[];
	locationId: string | null;
	venueShort: string | null;
}

export interface BookingPanelProps {
	room: PanelRoom;
	/** Server-rendered free windows for this room (fallback until the cached route answers). */
	initialRanges: FreeRange[];
	addOns: AddOnListItemResponse[];
	/** Server render time, so the first client render matches. */
	renderedAt: number;
	/** Deep link: `?date=YYYY-MM-DD&time=HH:mm&team=4`. */
	initialDate?: string | null;
	initialTime?: string | null;
	initialTeam?: number | null;
	/** Heading override (worlds may pass their own words). */
	heading?: string;
}

type Ranges = Record<string, FreeRange[]>;

/**
 * The one booking panel: every room world embeds it, skinned by --bp-* variables.
 * Plain on purpose: the date strip sits directly above the session times, then
 * team size (group price + per head), extras, and the total with "Add to your doors"
 * always in view (the bar is sticky at the bottom of the panel).
 */
export function BookingPanel({ room, initialRanges, addOns, renderedAt, initialDate, initialTime, initialTeam, heading }: BookingPanelProps) {
	const fallback = useMemo<Ranges>(() => ({ [room.slug]: initialRanges }), [room.slug, initialRanges]);
	const { data } = useSWR<Ranges>('/api/rooms/availability', fetcher, { fallbackData: fallback, revalidateOnFocus: false, dedupingInterval: 30_000 });
	const live = useNow(60_000);
	const now = live?.getTime() ?? renderedAt;

	const sessions = useMemo(() => roomSessions(data?.[room.slug] ?? initialRanges, { durationMin: room.durationMin, now }), [data, room.slug, initialRanges, room.durationMin, now]);
	const days = useMemo(() => byDate(sessions), [sessions]);
	const dates = useMemo(() => localDates(today(now), siteConfig.horizonDays), [now]);
	const counts = useMemo(() => Object.fromEntries(Object.entries(days).map(([d, l]) => [d, l.length])), [days]);
	const firstOpen = dates.find((d) => counts[d]) ?? dates[0] ?? null;

	const [date, setDate] = useState<string | null>(() => (initialDate && counts[initialDate] ? initialDate : firstOpen));
	const [start, setStart] = useState<number | null>(() => (initialDate && initialTime ? (days[initialDate]?.find((x) => x.time === initialTime)?.start ?? null) : null));
	const [team, setTeam] = useState<number | null>(() => (initialTeam && room.options.some((o) => o.size === initialTeam) ? initialTeam : null));
	const [picked, setPicked] = useState<Record<string, number>>({});
	const [added, setAdded] = useState<string | null>(null);
	const { add, pending, error, setError } = useAddToCart();

	const activeDate = date && counts[date] ? date : firstOpen;
	const daySessions = activeDate ? (days[activeDate] ?? []) : [];
	const chosen: Session | null = sessions.find((x) => x.start === start) ?? null;
	const option = room.options.find((o) => o.size === team) ?? null;
	const addOnTotal = addOns.reduce((sum, a) => sum + (picked[a.id] ? a.price * picked[a.id]! : 0), 0);
	const total = (option?.price ?? 0) + addOnTotal;

	const pickDate = useCallback((d: string) => {
		setDate(d);
		setStart(null);
		setAdded(null);
	}, []);
	const pickSession = useCallback((x: Session) => {
		setStart(x.start);
		setAdded(null);
		setError(null);
	}, [setError]);
	const pickTeam = useCallback((n: number) => {
		setTeam(n);
		setAdded(null);
	}, []);
	const toggle = useCallback((id: string, on: boolean) => setPicked((p) => {
		const next = { ...p };
		if (on) next[id] = 1;
		else delete next[id];
		return next;
	}), []);

	const submit = async () => {
		if (!chosen || !option) return;
		const ok = await add({
			productId: option.productId,
			locationId: room.locationId,
			start: chosen.start,
			end: chosen.end,
			numberOfAttendees: 1,
			people: option.size,
			addOns: Object.entries(picked).map(([addOnId, quantity]) => ({ addOnId, quantity })),
		});
		if (ok) {
			setAdded(`${room.title}, ${localDateParts(chosen.date).long} at ${chosen.time}, ${option.size} players.`);
			setStart(null);
			setPicked({});
		}
	};

	const cta = !chosen ? 'Choose a time' : !option ? 'Choose your team' : pending ? 'Adding…' : 'Add to your doors';
	const note = chosen ? `${localDateParts(chosen.date).weekday} ${localDateParts(chosen.date).day} ${localDateParts(chosen.date).month} · ${chosen.time}${option ? ` · ${option.size} players` : ''}` : `${minutesLabel(room.durationMin)} visit${room.venueShort ? ` · ${room.venueShort}` : ''}`;

	return (
		<section id="book" className={s.panel} aria-label={`Book ${room.title}`}>
			<div className={s.head}>
				<h2 className={s.title}>{heading ?? 'Book this room'}</h2>
				<span className={s.meta}>
					{minutesLabel(room.durationMin)} visit{room.venueShort ? ` · ${room.venueShort}` : ''}
				</span>
			</div>

			<div className={s.section}>
				<p className={s.label}>
					<span>1 · Date</span>
					{activeDate ? <span className={s.labelNote}>{localDateParts(activeDate).long}</span> : null}
				</p>
				<DateStrip dates={dates} selected={activeDate} counts={counts} onSelect={pickDate} />
				<div style={{ marginTop: 12 }}>
					{daySessions.length ? (
						<SessionButtons sessions={daySessions} selected={start} onSelect={pickSession} note={offerNote} />
					) : sessions.length ? (
						<p className={s.empty}>No sessions left this day.</p>
					) : (
						<p className={s.empty}>No sessions open right now. Email {siteConfig.contact.email} and we’ll find you a time.</p>
					)}
				</div>
			</div>

			<div className={s.section}>
				<p className={s.label}>
					<span>2 · Team size</span>
					<span className={s.labelNote}>Price for the whole team</span>
				</p>
				<TeamSizes options={room.options} selected={team} onSelect={pickTeam} />
			</div>

			{addOns.length ? (
				<div className={s.section}>
					<p className={s.label}>
						<span>3 · Extras</span>
						<span className={s.labelNote}>Optional</span>
					</p>
					<AddOnList addOns={addOns} picked={picked} onToggle={toggle} />
				</div>
			) : null}

			{error ? (
				<p className={s.error} role="alert">
					{error}
				</p>
			) : null}
			{added ? (
				<p className={s.ok} role="status">
					Added to your doors: {added}
				</p>
			) : null}

			<div className={s.bar}>
				<div className={s.total}>
					<span className={s.totalAmount}>{option ? formatPrice(total) : `from ${formatPrice(room.options[0]?.price ?? 0)}`}</span>
					<span className={s.totalNote}>{note}</span>
				</div>
				<button type="button" className={s.cta} disabled={!chosen || !option || pending} onClick={submit}>
					{cta}
				</button>
			</div>
		</section>
	);
}
