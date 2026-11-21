/** Engraved plate of a house (SVG, no photo needed): the Cowgate vaults or the bonded warehouse at Leith. */
export function VenuePlate({ kind, className = '' }: { kind: 'vaults' | 'leith'; className?: string }) {
	const ink = '#4a3418';
	return (
		<svg viewBox="0 0 480 300" className={className} role="img" aria-label={kind === 'vaults' ? 'Engraving of sandstone vaults under the Old Town' : 'Engraving of a bonded warehouse on the Shore at Leith'}>
			<defs>
				<pattern id={`eng-${kind}`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
					<path d="M0 0v5" stroke={ink} strokeWidth=".7" strokeOpacity=".5" />
				</pattern>
				<pattern id={`eng2-${kind}`} width="3.5" height="3.5" patternUnits="userSpaceOnUse" patternTransform="rotate(60)">
					<path d="M0 0v3.5" stroke={ink} strokeWidth=".8" strokeOpacity=".7" />
				</pattern>
			</defs>
			<rect width="480" height="300" fill="#f1e2c0" />
			{kind === 'vaults' ? (
				<g stroke={ink} strokeWidth="1.4" fill="none">
					<path d="M0 60 H480" />
					{[0, 1, 2, 3].map((i) => {
						const x = 20 + i * 115;
						return (
							<g key={i}>
								<path d={`M${x} 300 V150 A55 55 0 0 1 ${x + 110} 150 V300`} fill={`url(#eng2-${kind})`} />
								<path d={`M${x + 14} 300 V158 A41 41 0 0 1 ${x + 96} 158 V300`} fill="#2a1c0c" fillOpacity=".75" />
								{[0, 1, 2, 3, 4, 5, 6].map((k) => (
									<path key={k} d={`M${(x + 55 + Math.cos(Math.PI + (k * Math.PI) / 6) * 55).toFixed(2)} ${(150 + Math.sin(Math.PI + (k * Math.PI) / 6) * 55).toFixed(2)} L${(x + 55 + Math.cos(Math.PI + (k * Math.PI) / 6) * 41).toFixed(2)} ${(158 + Math.sin(Math.PI + (k * Math.PI) / 6) * 41).toFixed(2)}`} />
								))}
								<circle cx={x + 55} cy="215" r="10" fill="#f6c96a" fillOpacity=".9" stroke="none" />
								<circle cx={x + 55} cy="215" r="26" fill="#f6c96a" fillOpacity=".18" stroke="none" />
							</g>
						);
					})}
					{Array.from({ length: 9 }, (_, i) => <path key={i} d={`M0 ${70 + i * 9} H480`} strokeOpacity=".25" />)}
					<path d="M0 0 H480 V60 H0Z" fill={`url(#eng-${kind})`} />
				</g>
			) : (
				<g stroke={ink} strokeWidth="1.4" fill="none">
					<path d="M0 230 H480" />
					<path d="M30 230 V90 L95 40 L160 90 V230 M160 230 V100 L240 50 L320 100 V230 M320 230 V90 L385 40 L450 90 V230" fill={`url(#eng-${kind})`} />
					{[30, 160, 320].map((x, gi) =>
						[0, 1, 2].map((row) =>
							[0, 1, 2].map((col) => {
								const w = gi === 1 ? 160 : 130;
								const cx = x + 20 + col * ((w - 40) / 2);
								return <rect key={`${gi}${row}${col}`} x={cx - 9} y={110 + row * 38} width="18" height="24" fill={row === 2 && col === 1 ? '#f6c96a' : '#2a1c0c'} fillOpacity={row === 2 && col === 1 ? 0.9 : 0.7} />;
							}),
						),
					)}
					<path d="M222 230 V190 A18 18 0 0 1 258 190 V230" fill="#2a1c0c" fillOpacity=".8" />
					<path d="M0 230 H480 V300 H0Z" fill={`url(#eng2-${kind})`} />
					{Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${20 + i * 75} ${252 + (i % 2) * 14} q12 -6 24 0 t24 0`} stroke="#f1e2c0" strokeWidth="2" />)}
					<path d="M60 230 V200 M60 205 h-14 M420 230 V196 q8 -12 0 -20" />
				</g>
			)}
			<rect x="6" y="6" width="468" height="288" stroke={ink} strokeWidth="1" fill="none" />
		</svg>
	);
}
