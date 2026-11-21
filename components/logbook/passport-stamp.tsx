/** A passport stamp for one room: inked with the date when played, an outline when not. Pure SVG. */
export function PassportStamp({ name, date, inked, shape }: { name: string; date: string | null; inked: boolean; shape: number }) {
	const words = name.replace(/^The\s+/i, '').toUpperCase();
	const id = `arc-${shape}-${words.length}`;
	const ring = shape % 3;
	return (
		<svg viewBox="0 0 120 120" aria-hidden>
			<defs>
				<path id={id} d="M60 60 m-42 0 a42 42 0 1 1 84 0 a42 42 0 1 1 -84 0" />
				<filter id={`rough-${shape}`}>
					<feTurbulence baseFrequency="0.9" numOctaves="1" seed={shape + 2} />
					<feDisplacementMap in="SourceGraphic" scale={inked ? 2.4 : 0} />
				</filter>
			</defs>
			<g fill="none" stroke="currentColor" filter={`url(#rough-${shape})`} strokeDasharray={inked ? undefined : '3 4'}>
				{ring === 0 ? (
					<>
						<circle cx="60" cy="60" r="54" strokeWidth="3" />
						<circle cx="60" cy="60" r="32" strokeWidth="1.5" />
					</>
				) : ring === 1 ? (
					<>
						<rect x="8" y="14" width="104" height="92" rx="10" strokeWidth="3" />
						<rect x="16" y="22" width="88" height="76" rx="6" strokeWidth="1.2" />
					</>
				) : (
					<>
						<path d="M60 4 L112 60 L60 116 L8 60Z" strokeWidth="3" />
						<circle cx="60" cy="60" r="30" strokeWidth="1.5" />
					</>
				)}
				<text fill="currentColor" stroke="none" style={{ font: '9px var(--font-type)', letterSpacing: '0.12em' }}>
					<textPath href={`#${id}`} startOffset="2%">
						{`${words} · THE GILDED COMPASS · `}
					</textPath>
				</text>
				<text x="60" y="58" textAnchor="middle" fill="currentColor" stroke="none" style={{ font: '12px var(--font-engraved)', letterSpacing: '0.1em' }}>
					{inked ? 'escaped' : 'volume'}
				</text>
				<text x="60" y="74" textAnchor="middle" fill="currentColor" stroke="none" style={{ font: 'bold 11px var(--font-type)' }}>
					{inked && date ? date : '—'}
				</text>
			</g>
		</svg>
	);
}
