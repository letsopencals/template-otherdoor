/** A five-step meter (difficulty, fear): thin bars, lit ones in the room's colour. */
export function Meter({ value, of = 5, label, tone = 'var(--door)' }: { value: number; of?: number; label: string; tone?: string }) {
	return (
		<span className="inline-flex items-end gap-[3px]" role="img" aria-label={`${label}: ${value} of ${of}`}>
			{Array.from({ length: of }, (_, i) => (
				<span key={i} className="block w-[5px] rounded-[1px]" style={{ height: `${8 + i * 2.5}px`, background: i < value ? tone : 'rgba(232,222,255,0.16)', boxShadow: i < value ? `0 0 6px ${tone}` : 'none' }} />
			))}
		</span>
	);
}
