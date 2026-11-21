/** Candle (difficulty) and key (fear) meters: filled glyphs out of five. */
const CANDLE = 'M7 6c0-2 2-3 2-5 0 2 2 3 2 5a2 2 0 0 1-4 0Zm-1 3h6v12H6Z';
const KEY = 'M9 3a4 4 0 1 1-1.2 7.8L7 11.6V14H5v2H3v2H1v-3l6.2-6.2A4 4 0 0 1 9 3Zm1 2.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z';

export function Meter({ value, of = 5, kind, label, tone = 'currentColor' }: { value: number; of?: number; kind: 'candle' | 'key'; label: string; tone?: string }) {
	return (
		<span className="inline-flex items-center gap-[3px]" role="img" aria-label={`${label}: ${value} of ${of}`}>
			{Array.from({ length: of }, (_, i) => (
				<svg key={i} width="14" height="20" viewBox="0 0 18 22" aria-hidden style={{ opacity: i < value ? 1 : 0.22 }}>
					<path d={kind === 'candle' ? CANDLE : KEY} fill={tone} />
				</svg>
			))}
		</span>
	);
}
