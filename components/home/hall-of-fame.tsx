'use client';

import { useState } from 'react';
import { fullDateLabel } from '@/lib/when';

/** Hall of Fame: the fastest escapes per room, as a ledger. Sample records from site-config. */
export function HallOfFame({ rooms, records }: { rooms: Array<{ slug: string; short: string }>; records: Record<string, Array<{ team: string; time: string; date: string }>> }) {
	const list = rooms.filter((r) => records[r.slug]?.length);
	const [active, setActive] = useState(list[0]?.slug ?? '');
	const rows = records[active] ?? [];
	if (!list.length) return null;
	return (
		<div className="paper paper-ruled mx-auto max-w-4xl p-6 md:p-10">
			<div className="scroll-x -mx-2 flex gap-1 px-2" role="tablist" aria-label="Rooms">
				{list.map((r) => (
					<button key={r.slug} type="button" role="tab" aria-selected={active === r.slug} onClick={() => setActive(r.slug)} className={`shrink-0 border-b-2 px-3 py-2 text-[0.9rem] font-bold whitespace-nowrap transition ${active === r.slug ? 'border-oxblood text-oxblood' : 'border-transparent text-sepia hover:text-deep-ink'}`}>
						{r.short}
					</button>
				))}
			</div>
			<table className="mt-6 w-full border-collapse text-left">
				<thead>
					<tr className="engraved text-[0.85rem] text-sepia">
						<th className="w-12 pb-2 font-normal">No.</th>
						<th className="pb-2 font-normal">Team</th>
						<th className="pb-2 text-right font-normal">Time</th>
						<th className="hidden pb-2 text-right font-normal sm:table-cell">Date</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((r, i) => (
						<tr key={r.team} className="border-t border-dotted border-[#8a6a43]/60">
							<td className="font-display py-3 text-2xl text-oxblood">{i + 1}</td>
							<td className="font-display py-3 text-[1.35rem]">{r.team}</td>
							<td className="typed py-3 text-right text-[1.2rem] font-bold">{r.time}</td>
							<td className="hidden py-3 text-right text-sm text-sepia sm:table-cell">{fullDateLabel(`${r.date}T12:00:00Z`)}</td>
						</tr>
					))}
				</tbody>
			</table>
			<p className="typed mt-5 text-[0.8rem] text-sepia">Times from briefing bell to final lock. Sample ledger for this template.</p>
		</div>
	);
}
