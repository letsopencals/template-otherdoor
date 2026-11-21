/** Questions as a quiet list (native details/summary, no JS). */
export function FaqCards({ items }: { items: ReadonlyArray<{ q: string; a: string }> }) {
	return (
		<div className="border-t border-line">
			{items.map((f) => (
				<details key={f.q} className="group border-b border-line">
					<summary className="flex min-h-[64px] cursor-pointer list-none items-center gap-6 py-4 [&::-webkit-details-marker]:hidden">
						<span className="font-display flex-1 text-[1.25rem] leading-snug tracking-tight md:text-[1.4rem]">{f.q}</span>
						<span aria-hidden className="relative h-4 w-4 shrink-0">
							<span className="absolute left-0 top-1/2 h-px w-4 bg-ink-2" />
							<span className="absolute left-1/2 top-0 h-4 w-px bg-ink-2 transition-transform duration-300 group-open:scale-y-0" />
						</span>
					</summary>
					<p className="max-w-[62ch] pb-6 leading-relaxed text-ink-2">{f.a}</p>
				</details>
			))}
		</div>
	);
}
