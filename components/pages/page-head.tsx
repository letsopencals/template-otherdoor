import type { ReactNode } from 'react';

/** The opening of an inner page: an engraved frame on vellum, folio, title and lede. Clears the fixed header. */
export function PageHead({ folio, title, lede, children }: { folio: string; title: ReactNode; lede?: ReactNode; children?: ReactNode }) {
	return (
		<header className="relative pt-[calc(var(--header-h)+28px)]">
			<div className="wrap">
				<div className="relative border border-[#8a6a43]/60 px-5 py-12 text-center outline outline-1 outline-offset-[5px] outline-[#8a6a43]/35 md:px-12 md:py-16">
					<Corner className="left-2 top-2" />
					<Corner className="right-2 top-2 rotate-90" />
					<Corner className="bottom-2 right-2 rotate-180" />
					<Corner className="bottom-2 left-2 -rotate-90" />
					<p className="folio mx-auto max-w-xl">{folio}</p>
					<h1 className="font-display mx-auto mt-5 max-w-4xl text-[clamp(2.5rem,6vw,4.6rem)] leading-[1]">{title}</h1>
					{lede ? <p className="mx-auto mt-5 max-w-2xl text-[1.1rem] leading-relaxed text-[#3b2e1d]">{lede}</p> : null}
					{children}
				</div>
			</div>
		</header>
	);
}

function Corner({ className }: { className: string }) {
	return (
		<svg viewBox="0 0 40 40" className={`absolute h-8 w-8 text-gold-deep ${className}`} aria-hidden>
			<path d="M2 38V14C2 7 7 2 14 2h24" fill="none" stroke="currentColor" strokeWidth="1.2" />
			<path d="M8 38V18c0-6 4-10 10-10h20" fill="none" stroke="currentColor" strokeWidth=".8" />
			<circle cx="14" cy="14" r="2.5" fill="currentColor" />
		</svg>
	);
}
