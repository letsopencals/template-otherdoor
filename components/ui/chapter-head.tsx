import type { ReactNode } from 'react';
import { roman } from '@/lib/when';

/** A chapter opening: engraved folio between double rules, then the title and an optional lede. */
export function ChapterHead({ n, label, title, lede, align = 'center', id }: { n?: number; label: string; title: ReactNode; lede?: ReactNode; align?: 'center' | 'left'; id?: string }) {
	return (
		<header className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'} id={id}>
			<p className={`folio ${align === 'left' ? 'folio-left' : ''}`}>{n ? `Chapter ${roman(n)} · ${label}` : label}</p>
			<h2 className="font-display mt-5 text-[clamp(2.2rem,4.6vw,3.6rem)] leading-[1.02]">{title}</h2>
			{lede ? <p className="mt-4 text-[1.08rem] leading-relaxed opacity-85">{lede}</p> : null}
		</header>
	);
}
