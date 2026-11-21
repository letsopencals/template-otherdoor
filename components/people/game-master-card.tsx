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

/** Initials in the room's light when the store has no portrait yet. */
function Monogram({ name }: { name: string }) {
	const initials = name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2);
	return (
		<span className="grid h-full w-full place-items-center bg-[radial-gradient(80%_60%_at_50%_100%,color-mix(in_srgb,var(--tone)_35%,transparent),transparent_70%),linear-gradient(180deg,#1a1622,#0e0c13)]">
			<span className="font-display text-[3.2rem] font-light tracking-tight text-ink/70">{initials}</span>
		</span>
	);
}

/** A game master: portrait (store) or monogram, lit from below in their room's colour. */
export function GameMasterCard({ gm }: { gm: GameMasterView }) {
	return (
		<article className="group flex h-full flex-col" style={{ '--tone': gm.tone, '--slit': gm.tone } as CSSProperties}>
			<div className="relative aspect-[4/5] overflow-hidden rounded-[12px_12px_3px_3px] bg-night-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
				<SafeImg src={gm.image} alt={`${gm.name}, ${gm.title}`} className="h-full w-full object-cover grayscale-[0.35] transition duration-700 group-hover:grayscale-0" fallback={<Monogram name={gm.name} />} />
				<span className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,color-mix(in_srgb,var(--tone)_28%,transparent))] mix-blend-screen" />
			</div>
			<span className="slit mx-3 opacity-80" aria-hidden />
			<h3 className="font-display mt-4 text-[1.3rem] leading-tight tracking-tight">{gm.name}</h3>
			<p className="mt-1 text-[0.82rem] text-ink-3">{gm.title}</p>
			<p className="mt-3 flex-1 text-[0.92rem] leading-relaxed text-ink-2">{gm.bio}</p>
			{gm.room && gm.roomHref ? (
				<a href={gm.roomHref} className="link mt-3 text-[0.85rem] text-ink-2">
					Runs {gm.room}
				</a>
			) : null}
		</article>
	);
}
