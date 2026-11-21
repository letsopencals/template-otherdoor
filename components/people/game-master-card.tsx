import type { CSSProperties } from 'react';
import { SafeImg } from '@/components/ui/safe-img';

export interface GameMasterView {
	slug: string;
	name: string;
	title: string;
	bio: string;
	image: string | null;
	room: string | null;
	roomHref: string | null;
	tone: string;
}

function Medallion({ name, tone }: { name: string; tone: string }) {
	const initials = name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2);
	return (
		<svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden>
			<defs>
				<radialGradient id={`m-${initials}`} cx="40%" cy="35%" r="75%">
					<stop offset="0" stopColor="#fff" stopOpacity=".18" />
					<stop offset="1" stopColor="#000" stopOpacity=".25" />
				</radialGradient>
			</defs>
			<rect width="200" height="200" fill={tone} />
			<rect width="200" height="200" fill={`url(#m-${initials})`} />
			{/* A head-and-shoulders silhouette in the cameo style. */}
			<path d="M100 52a30 30 0 1 1 0 60a30 30 0 1 1 0-60Zm-58 130c4-36 28-58 58-58s54 22 58 58Z" fill="#f3e6c4" fillOpacity=".16" />
			<circle cx="100" cy="100" r="88" fill="none" stroke="#e6c46a" strokeWidth="2" />
			<circle cx="100" cy="100" r="82" fill="none" stroke="#e6c46a" strokeWidth=".8" strokeDasharray="2 4" />
			<text x="100" y="186" textAnchor="middle" fill="#e6c46a" style={{ font: '22px var(--font-engraved)', letterSpacing: '0.2em' }}>
				{initials.toLowerCase()}
			</text>
		</svg>
	);
}

/** A game master in a cabinet frame: portrait (store) or a cameo medallion, in-world title, bio, their room. */
export function GameMasterCard({ gm }: { gm: GameMasterView }) {
	return (
		<article className="paper flex h-full flex-col p-4" style={{ '--tone': gm.tone } as CSSProperties}>
			<div className="relative aspect-square overflow-hidden border-[6px] border-[#5b3818] shadow-[inset_0_0_0_2px_#c8a04a]">
				<SafeImg src={gm.image} alt={`${gm.name}, ${gm.title}`} className="h-full w-full object-cover sepia-[.25]" fallback={<Medallion name={gm.name} tone={gm.tone} />} />
			</div>
			<p className="engraved mt-4 text-[0.85rem] text-oxblood">{gm.title}</p>
			<h3 className="font-display text-[1.6rem] leading-tight">{gm.name}</h3>
			<p className="mt-2 flex-1 text-[0.95rem] leading-relaxed text-[#3b2e1d]">{gm.bio}</p>
			{gm.room && gm.roomHref ? (
				<a href={gm.roomHref} className="typed mt-3 text-[0.85rem] underline underline-offset-4">
					Runs {gm.room}
				</a>
			) : null}
		</article>
	);
}
