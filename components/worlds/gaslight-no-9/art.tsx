/** Hand-drawn SVG ornaments for Gaslight No. 9 (server-rendered; all coordinates authored, no maths). */

/** A blob of red sealing wax with a pressed "9" and a ragged rim. */
export function WaxSeal({ className, letter = '9' }: { className?: string; letter?: string }) {
	return (
		<svg className={className} viewBox="0 0 120 120" aria-hidden>
			<defs>
				<radialGradient id="gl-wax" cx="38%" cy="32%" r="75%">
					<stop offset="0" stopColor="#d2443c" />
					<stop offset=".55" stopColor="#8f1a1b" />
					<stop offset="1" stopColor="#4a0a0c" />
				</radialGradient>
				<radialGradient id="gl-wax-in" cx="60%" cy="65%" r="70%">
					<stop offset="0" stopColor="#a52323" />
					<stop offset="1" stopColor="#5c0d10" />
				</radialGradient>
			</defs>
			<path d="M60 4c9 2 13 9 22 9s13 7 16 15 11 12 11 21-4 13-2 22-6 15-13 20-9 13-19 15-14-2-22 1-16 1-22-5-14-8-17-16-10-12-10-21 6-13 5-22 6-15 14-19 11-11 20-12 9-9 17-8z" fill="url(#gl-wax)" />
			<circle cx="60" cy="60" r="34" fill="url(#gl-wax-in)" stroke="#3d0709" strokeOpacity=".5" strokeWidth="1.5" />
			<circle cx="60" cy="60" r="29" fill="none" stroke="#e46a5c" strokeOpacity=".35" strokeWidth="1" strokeDasharray="2 3" />
			<text x="60" y="75" textAnchor="middle" fontFamily="var(--gl-display), serif" fontSize="44" fill="#3a0507" fillOpacity=".75">
				{letter}
			</text>
			<text x="59" y="73.5" textAnchor="middle" fontFamily="var(--gl-display), serif" fontSize="44" fill="#e9705f" fillOpacity=".35">
				{letter}
			</text>
			<path d="M36 34c6-7 16-11 26-11" stroke="#fff" strokeOpacity=".28" strokeWidth="3" strokeLinecap="round" fill="none" />
		</svg>
	);
}

/** A pen signature (an authored path, drawn once by hand). */
export function Signature({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 220 70" aria-hidden>
			<path
				d="M8 48c10-22 18-38 22-36s-8 34-6 38 14-30 20-30-4 26 0 28 10-14 16-14 2 12 6 12 8-16 14-14-2 14 2 14 10-18 16-18-4 22 2 22 12-30 18-34 2 28 6 32 6-10 12-12 4 8 10 6 30-14 50-10"
				fill="none"
				stroke="currentColor"
				strokeWidth="2.2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path d="M30 58c40-6 90-8 150-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity=".7" />
		</svg>
	);
}

/** Interlaced "A Q" monogram, as pressed into the wax on the desk (visible only under the glass). */
export function Monogram({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 100 100" aria-hidden>
			<circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="2.5" />
			<circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 2.5" />
			<path d="M24 74L44 24h4l20 50M32 56h28" fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
			<circle cx="58" cy="50" r="16" fill="none" stroke="currentColor" strokeWidth="4.5" />
			<path d="M64 60l14 16" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
		</svg>
	);
}

/** A soft pencil ring with an arrow and a note, for the newspaper margin (visible only under the glass). */
export function PencilNote({ className }: { className?: string }) {
	return (
		<svg className={className} viewBox="0 0 180 120" aria-hidden>
			<path d="M20 64c-4-22 30-36 66-34s62 14 58 34-36 30-70 28-50-10-54-28z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
			<path d="M24 60c2-16 34-26 64-24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".6" />
			<text x="84" y="70" textAnchor="middle" fontFamily="var(--gl-type), monospace" fontSize="21" fill="currentColor" transform="rotate(-6 84 70)">
				up the flue?
			</text>
			<path d="M140 92c8 6 12 12 14 22M154 114l-8-4M154 114l2-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
		</svg>
	);
}

/** Silhouette-free cameo fallback: an engraved oval with the game master's initials. */
export function Cameo({ initials, className }: { initials: string; className?: string }) {
	return (
		<svg className={className} viewBox="0 0 100 128" aria-hidden>
			<defs>
				<radialGradient id="gl-cameo" cx="50%" cy="38%" r="70%">
					<stop offset="0" stopColor="#2a3d33" />
					<stop offset="1" stopColor="#0f1a15" />
				</radialGradient>
			</defs>
			<ellipse cx="50" cy="64" rx="46" ry="60" fill="url(#gl-cameo)" />
			<ellipse cx="50" cy="64" rx="40" ry="53" fill="none" stroke="#c9a15a" strokeOpacity=".55" strokeWidth="1" />
			<text x="50" y="78" textAnchor="middle" fontFamily="var(--gl-display), serif" fontSize="38" fill="#e8c98a">
				{initials}
			</text>
		</svg>
	);
}
