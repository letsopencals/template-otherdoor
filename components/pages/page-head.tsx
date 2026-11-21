import type { ReactNode } from 'react';

/**
 * The opening of an inner page: the label, a large title and the lede, with a
 * sill of door light under it. Clears the fixed header.
 */
export function PageHead({ label, title, lede, children }: { label: string; title: ReactNode; lede?: ReactNode; children?: ReactNode }) {
	return (
		<header className="pool relative pt-[calc(var(--header-h)+56px)]">
			<div className="wrap">
				<p className="label">{label}</p>
				<div className="mt-5 grid items-end gap-6 md:grid-cols-[1.4fr_1fr] md:gap-16">
					<h1 className="font-display text-[clamp(2.8rem,6.5vw,5.8rem)] leading-[0.95] tracking-[-0.045em]">{title}</h1>
					{lede ? <p className="max-w-[46ch] text-[1.05rem] leading-relaxed text-ink-2">{lede}</p> : null}
				</div>
				{children}
				<span className="slit mt-10 block w-40 opacity-80" aria-hidden />
			</div>
		</header>
	);
}
