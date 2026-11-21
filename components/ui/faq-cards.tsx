/** Questions as index cards (native details/summary, no JS). */
export function FaqCards({ items }: { items: ReadonlyArray<{ q: string; a: string }> }) {
	return (
		<div className="grid gap-3">
			{items.map((f, i) => (
				<details key={f.q} className="group paper border-l-4 border-oxblood open:shadow-lg">
					<summary className="flex min-h-[56px] cursor-pointer list-none items-center gap-4 px-5 py-3 [&::-webkit-details-marker]:hidden">
						<span className="typed w-8 shrink-0 text-sepia">{String(i + 1).padStart(2, '0')}</span>
						<span className="font-display flex-1 text-[1.3rem] leading-snug">{f.q}</span>
						<span aria-hidden className="text-xl text-oxblood transition-transform group-open:rotate-45">+</span>
					</summary>
					<p className="px-5 pb-5 pl-[4.25rem] leading-relaxed text-[#3b2e1d]">{f.a}</p>
				</details>
			))}
		</div>
	);
}
