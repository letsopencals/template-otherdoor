import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { getCatalogue } from '@/lib/server-data';
import { doorRooms } from '@/lib/doors';
import { roomPresentation } from '@/lib/site-config';
import { formatWholePrice } from '@/lib/format';
import { minutesLabel } from '@/lib/when';
import { PageHead } from '@/components/pages/page-head';
import { DoorArt } from '@/components/doors/door-art';
import { doorArt } from '@/components/doors/door-sources';
import { Meter } from '@/components/ui/meters';
import s from '@/components/rooms/rooms.module.css';

export const metadata: Metadata = { title: 'The rooms', description: 'Six immersive escape rooms in Edinburgh: a jungle temple, a gaslit study, a rogue-AI lab, a space station, a Riviera heist and a family clockwork workshop.' };
export const revalidate = 60;

export default async function RoomsPage() {
	const catalogue = await getCatalogue();
	const doors = doorRooms(catalogue);
	return (
		<>
			<PageHead label="The rooms" title="Six doors. Six worlds." lede="Every room is a private game for your team, with its own story, set and game master. Compare them here, then step through." />
			<section className="wrap grid gap-6 py-16 pb-24">
				{doors.map((d) => {
					const p = roomPresentation(d.slug);
					const r = catalogue.rooms.find((x) => x.slug === d.slug)!;
					return (
						<article key={d.slug} className={s.row} style={{ '--slit': d.palette.glow } as CSSProperties}>
							<Link href={`/rooms/${d.slug}`} className={s.art} aria-label={`Open ${d.title}`}>
								<DoorArt sources={doorArt(d)} alt="" glow={d.palette.glow} className={s.img} />
								<span className={s.num}>{String(d.number).padStart(2, '0')}</span>
							</Link>
							<div className={s.body}>
								<p className="label">
									{d.genre} · {d.year} · {d.venueShort}
									{d.epic ? ' · the Epic' : ''}
								</p>
								<h2 className={s.title}>{d.title}</h2>
								<p className={s.tagline}>{p?.tagline}</p>
								<dl className={s.stats}>
									<div><dt>Team</dt><dd>{d.players} players</dd></div>
									<div><dt>Game</dt><dd>{p?.gameMinutes ?? 60} min <span className="text-ink-3">({minutesLabel(r.durationMin)} visit)</span></dd></div>
									<div><dt>Age</dt><dd>{d.minAge}+</dd></div>
									<div><dt>Difficulty</dt><dd><Meter value={d.difficulty} label="Difficulty" tone={d.palette.glow} /></dd></div>
									<div><dt>Fear</dt><dd><Meter value={d.fear} label="Fear" tone={d.palette.glow} /></dd></div>
									<div><dt>Escape rate</dt><dd>{p?.successRate ?? 50}%</dd></div>
								</dl>
								<p className="mt-7 flex flex-wrap items-center gap-3">
									<Link href={`/rooms/${d.slug}`} className="btn">
										Step through
									</Link>
									<Link href={`/rooms/${d.slug}#book`} className="btn btn-glass">
										Book from {formatWholePrice(d.fromPrice)}
									</Link>
								</p>
							</div>
						</article>
					);
				})}
				{!doors.length ? <p className="text-ink-2">No rooms yet: add the `rooms` collection in your Opencals dashboard.</p> : null}
			</section>
		</>
	);
}
