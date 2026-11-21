'use client';

import Link from 'next/link';
import { useEffect, useState, type CSSProperties } from 'react';
import type { Visit } from '@/lib/visit';
import { mapHref, partyLabel } from '@/lib/visit';
import { googleCalendarHref, icsHref, ICS_FILENAME } from '@/lib/calendar';
import { roomPresentation, siteConfig, venuePresentation } from '@/lib/site-config';
import { longDayLabel, timeLabel } from '@/lib/when';
import { DoorArt } from '@/components/doors/door-art';
import { ArrowIcon } from '@/components/shell/icons';
import s from './door-unlocks.module.css';

type Phase = 'typing' | 'unlocked' | 'open';

/**
 * The confirmation artefact: a lock keys in the booking reference and unlocks,
 * the door swings open onto the room's key art, then everything to know: team,
 * room, date, arrive-by time (15 minutes early), venue, what to wear, phones
 * away, calendar, manage, and the next door. Reduced motion: shown open.
 */
export function DoorUnlocks({ visits, team, guest, orderName, nextRoom }: { visits: Visit[]; team: string | null; guest: string | null; orderName: string | null; nextRoom?: { title: string; href: string; glow: string } | null }) {
	const first = visits[0];
	const ref = (orderName ?? '#OD').replace(/\s+/g, '');
	const [typed, setTyped] = useState(0);
	const [phase, setPhase] = useState<Phase>('typing');

	useEffect(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			setTyped(ref.length);
			setPhase('open');
			return;
		}
		const timers: number[] = [];
		for (let i = 1; i <= ref.length; i++) timers.push(window.setTimeout(() => setTyped(i), 350 + i * 130));
		const done = 350 + ref.length * 130;
		timers.push(window.setTimeout(() => setPhase('unlocked'), done + 250));
		timers.push(window.setTimeout(() => setPhase('open'), done + 900));
		return () => timers.forEach((t) => window.clearTimeout(t));
	}, [ref]);

	if (!first) return null;
	const p = roomPresentation(first.key);
	const v = venuePresentation(first.venueSlug);
	const map = mapHref(first.venueSlug, first.venueAddress);
	const who = team ? team.replace(/^the\s+/i, '') : (guest ?? null);
	const events = visits.map((e) => ({ uid: e.id, title: `${e.title} · ${siteConfig.name}`, start: e.call, end: e.end, location: e.venueAddress ?? undefined, description: `Arrive by ${timeLabel(e.call)} for a ${timeLabel(e.start)} start. ${partyLabel(e)}.` }));

	return (
		<div className={s.wrap} data-phase={phase} style={{ '--slit': first.palette.glow, '--door': first.palette.glow } as CSSProperties}>
			<div className={s.stage}>
				<div className={s.lock} aria-live="polite">
					<span className={s.lockLed} aria-hidden />
					<span className={s.lockRef} aria-label={`Booking reference ${ref}`}>
						{ref.split('').map((ch, i) => (
							<span key={i} data-on={i < typed}>
								{i < typed ? ch : '·'}
							</span>
						))}
					</span>
					<span className={s.lockState}>{phase === 'typing' ? 'Checking your booking' : 'Unlocked'}</span>
				</div>

				<div className={s.doorway} aria-hidden>
					<div className={s.frame}>
						<DoorArt sources={[p?.media.key, p?.media.poster]} alt="" glow={first.palette.glow} className={s.art} loading="eager" />
						<span className={s.leaf}>
							<span className={s.knob} />
						</span>
					</div>
					<span className={`slit ${s.sill}`} />
					<span className={s.spill} />
				</div>

				<div className={s.headline}>
					<p className="label">The door unlocks</p>
					<h1 className={s.h1}>{who ? `You’re in, ${who}.` : 'You’re in.'}</h1>
					<p className={s.room}>
						{first.title} · {longDayLabel(first.start)}
					</p>
				</div>
			</div>

			<div className={s.details}>
				<div className={s.arrive}>
					<p className="label label-plain">Arrive by</p>
					<p className={s.big}>{timeLabel(first.call)}</p>
					<p className="text-ink-2">
						15 minutes before your {timeLabel(first.start)} start. Back out by {timeLabel(first.end)}.
					</p>
				</div>
				<dl className={s.facts}>
					<div>
						<dt>Room</dt>
						<dd>{first.title}</dd>
					</div>
					<div>
						<dt>Team</dt>
						<dd>
							{who ? `${who}, ` : ''}
							{partyLabel(first)}
						</dd>
					</div>
					<div>
						<dt>Where</dt>
						<dd>
							{first.venueName}
							{first.venueAddress ? `, ${first.venueAddress}` : ''}
							{map ? (
								<>
									{' '}
									<a href={map} target="_blank" rel="noreferrer" className="link">
										Map
									</a>
								</>
							) : null}
							{v ? <span className="mt-1 block text-[0.9rem] text-ink-3">{v.gettingThere[0]}</span> : null}
						</dd>
					</div>
					<div>
						<dt>What to wear</dt>
						<dd>{first.wear ?? 'Comfortable clothes and closed shoes.'}</dd>
					</div>
					<div>
						<dt>Phones away</dt>
						<dd>Phones and bags stay in the lockers in the Lobby. The room has everything you need, and your game master is a voice away.</dd>
					</div>
					{first.addOns.length ? (
						<div>
							<dt>Waiting for you</dt>
							<dd>{first.addOns.join(', ')}</dd>
						</div>
					) : null}
					{visits.length > 1 ? (
						<div>
							<dt>Also booked</dt>
							<dd>{visits.slice(1).map((e) => `${e.title}, ${longDayLabel(e.start)} ${timeLabel(e.start)} (arrive ${timeLabel(e.call)})`).join('; ')}</dd>
						</div>
					) : null}
				</dl>
				<div className={s.actions}>
					<a href={icsHref(events)} download={ICS_FILENAME} className="btn">
						Add to calendar
					</a>
					<a href={googleCalendarHref(events[0]!)} target="_blank" rel="noreferrer" className="btn btn-glass">
						Google Calendar
					</a>
					<Link href="/account" className="btn btn-glass">
						Manage booking
					</Link>
				</div>
				<p className="mt-6 text-[0.85rem] text-ink-3">
					{orderName ? `Booking ${orderName} · ` : ''}Free to move or cancel until 24 hours before.
				</p>
			</div>

			{nextRoom ? (
				<Link href={nextRoom.href} className={s.next} style={{ '--slit': nextRoom.glow } as CSSProperties}>
					<span className="label label-plain">Open another door</span>
					<span className={s.nextTitle}>
						{nextRoom.title} <ArrowIcon size={22} />
					</span>
				</Link>
			) : null}
		</div>
	);
}
