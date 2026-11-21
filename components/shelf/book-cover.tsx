import type { CSSProperties } from 'react';
import type { RoomPalette } from '@/lib/site-config';
import { roman } from '@/lib/when';
import { SafeImg } from '@/components/ui/safe-img';

/** A room's cover: the store's cover art when it exists, else a cloth-bound cover drawn in CSS + SVG. */
export function BookCover({ title, genre, volume, palette, src, className = '' }: { title: string; genre: string; volume: number; palette: RoomPalette; src: string | null; className?: string }) {
	const drawn = (
		<div
			className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden p-[8%] text-center"
			style={{ background: `radial-gradient(ellipse at 30% 20%, rgba(255,255,255,.14), transparent 60%), linear-gradient(90deg, rgba(0,0,0,.35) 0, rgba(0,0,0,0) 7%), ${palette.spine}`, color: palette.foil } as CSSProperties}
		>
			<div className="absolute inset-[5%] border" style={{ borderColor: palette.foil, opacity: 0.7 }} />
			<div className="absolute inset-[7%] border border-dashed" style={{ borderColor: palette.foil, opacity: 0.35 }} />
			<span className="engraved relative mt-2 text-[0.8rem]">Volume {roman(volume)}</span>
			<svg viewBox="0 0 100 100" className="relative w-[46%]" aria-hidden>
				<circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="1.5" />
				<circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth=".6" strokeDasharray="2 3" />
				<path d="M50 10 L56 50 L50 90 L44 50Z" fill="currentColor" />
				<path d="M10 50 L50 44 L90 50 L50 56Z" fill="currentColor" opacity=".55" />
			</svg>
			<span className="relative">
				<span className="font-display block text-[clamp(1.2rem,2.4vw,1.8rem)] leading-[1.05]">{title}</span>
				<span className="engraved mt-2 block text-[0.75rem] opacity-85">{genre}</span>
			</span>
		</div>
	);
	return (
		<div className={`relative aspect-[3/4] overflow-hidden shadow-[0_20px_40px_-20px_rgba(40,20,5,.7)] ${className}`}>
			<SafeImg src={src} alt={`${title} cover art`} className="h-full w-full object-cover" fallback={drawn} />
		</div>
	);
}
