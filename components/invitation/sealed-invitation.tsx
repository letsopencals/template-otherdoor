'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Expedition } from '@/lib/expedition';
import { mapHref, partyLabel } from '@/lib/expedition';
import { googleCalendarHref, icsHref, ICS_FILENAME } from '@/lib/calendar';
import { siteConfig, venuePresentation } from '@/lib/site-config';
import { longDayLabel, timeLabel } from '@/lib/when';
import s from './invitation.module.css';

/**
 * The confirmation artefact: a sealed envelope. Tap the wax seal and the letter
 * unfolds with the team, the room, the date, the call time (15 minutes before),
 * the venue and everything to know. Reduced motion shows it open.
 */
export function SealedInvitation({ expeditions, team, guest, orderName, startOpen = false, nextRoom }: { expeditions: Expedition[]; team: string | null; guest: string | null; orderName: string | null; startOpen?: boolean; nextRoom?: { title: string; href: string } | null }) {
	const [open, setOpen] = useState(startOpen);
	useEffect(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setOpen(true);
	}, []);
	const first = expeditions[0];
	if (!first) return null;
	const v = venuePresentation(first.venueSlug);
	const map = mapHref(first.venueSlug, first.venueAddress);
	const events = expeditions.map((e) => ({ uid: e.id, title: `${e.title} · ${siteConfig.name}`, start: e.call, end: e.end, location: e.venueAddress ?? undefined, description: `Call time ${timeLabel(e.call)} for a ${timeLabel(e.start)} start. ${partyLabel(e)}.` }));

	return (
		<div className={`${s.stage} ${open ? s.open : ''}`}>
			<div className={s.envelope} aria-hidden={open}>
				<div className={s.flap} />
				<p className={s.address}>
					For {team ? `the ${team.replace(/^the\s+/i, '')}` : (guest ?? 'the expedition')}
					<br />
					<span className="typed text-[0.8rem] not-italic">by hand · {siteConfig.city}</span>
				</p>
				<button type="button" className={`wax ${s.sealBtn}`} onClick={() => setOpen(true)} aria-label="Break the seal and open your invitation">
					G
				</button>
				<p className={s.tapHint}>Break the seal</p>
			</div>

			<article className={s.letter} aria-hidden={!open} aria-live="polite">
				<p className={s.requests}>The Gilded Compass requests the pleasure of</p>
				<p className={s.team}>{team ? `the ${team.replace(/^the\s+/i, '')}` : (guest ?? 'your expedition')}</p>
				<p className={s.requests}>on an expedition into</p>
				<p className={s.room}>{first.title}</p>
				<p className="mt-2 text-[1.05rem]">
					{longDayLabel(first.start)} · {partyLabel(first)}
					{first.venueName ? ` · ${first.venueName}` : ''}
				</p>
				<dl className={s.when}>
					<div>
						<dt>Call time</dt>
						<dd>{timeLabel(first.call)}</dd>
					</div>
					<div>
						<dt>Doors close</dt>
						<dd>{timeLabel(first.start)}</dd>
					</div>
					<div>
						<dt>Back in daylight</dt>
						<dd>{timeLabel(first.end)}</dd>
					</div>
				</dl>
				{expeditions.length > 1 ? (
					<p className="typed text-sm">
						Also in this letter:{' '}
						{expeditions
							.slice(1)
							.map((e) => `${e.title}, ${longDayLabel(e.start)} ${timeLabel(e.start)} (call ${timeLabel(e.call)})`)
							.join('; ')}
						.
					</p>
				) : null}
				<div className={s.notes}>
					<section>
						<h3>Where</h3>
						<p>
							{first.venueName}
							{first.venueAddress ? `, ${first.venueAddress}` : ''}.{' '}
							{map ? (
								<a href={map} target="_blank" rel="noreferrer" className="underline">
									Open the map
								</a>
							) : null}
						</p>
						{v ? <p className="mt-1 text-[0.92rem] text-[#4b3b26]">{v.gettingThere[0]}</p> : null}
					</section>
					<section>
						<h3>What to wear</h3>
						<p>{first.wear ?? 'Comfortable clothes and closed shoes.'}</p>
					</section>
					<section>
						<h3>Phones away</h3>
						<p>Phones and bags stay in the lockers: the room has everything you need, and your game master is a voice away. Late arrivals play the time that is left.</p>
					</section>
					{first.addOns.length ? (
						<section>
							<h3>Waiting for you</h3>
							<p>{first.addOns.join(', ')}.</p>
						</section>
					) : null}
				</div>
				<div className={s.actions}>
					<a href={icsHref(events)} download={ICS_FILENAME} className="plate plate-sm">
						Add to calendar
					</a>
					<a href={googleCalendarHref(events[0]!)} target="_blank" rel="noreferrer" className="plate plate-ghost plate-sm">
						Google Calendar
					</a>
					<Link href="/account" className="plate plate-ghost plate-sm">
						Manage in your logbook
					</Link>
				</div>
				{nextRoom ? (
					<p className="mt-8 text-[0.95rem]">
						Your next volume awaits:{' '}
						<Link href={nextRoom.href} className="font-display text-lg italic underline">
							{nextRoom.title}
						</Link>
					</p>
				) : null}
				<p className="typed mt-8 text-[0.8rem] text-sepia">
					{orderName ? `Letter ${orderName} · ` : ''}Free to move or cancel until 24 hours before.
				</p>
			</article>
		</div>
	);
}
