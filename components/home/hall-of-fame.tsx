'use client';

import { useState, type CSSProperties } from 'react';
import s from './home.module.css';

/** Hall of Fame: pick a room, see its three fastest teams (sample data from site-config). */
export function HallOfFame({ doors, records }: { doors: Array<{ slug: string; title: string; glow: string }>; records: Record<string, Array<{ team: string; time: string; date: string }>> }) {
	const [room, setRoom] = useState(doors[0]?.slug ?? '');
	const list = records[room] ?? [];
	const glow = doors.find((d) => d.slug === room)?.glow ?? 'var(--door)';
	return (
		<div className={s.hof} style={{ '--slit': glow } as CSSProperties}>
			<div className={s.hofTabs} role="tablist" aria-label="Room">
				{doors.map((d) => (
					<button key={d.slug} type="button" role="tab" aria-selected={room === d.slug} className={s.hofTab} style={{ '--slit': d.glow } as CSSProperties} onClick={() => setRoom(d.slug)}>
						{d.title}
					</button>
				))}
			</div>
			<ol className={s.hofList} role="tabpanel">
				{list.map((r, i) => (
					<li key={r.team}>
						<span className={s.hofRank}>{i + 1}</span>
						<span className={s.hofTeam}>{r.team}</span>
						<span className={s.hofDate}>{new Date(r.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/London' })}</span>
						<span className={s.hofTime}>{r.time}</span>
					</li>
				))}
			</ol>
		</div>
	);
}
