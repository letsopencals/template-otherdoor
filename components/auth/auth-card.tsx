import type { ReactNode } from 'react';

/** The society's reading-room card for sign-in states. */
export function AuthCard({ kicker, title, intro, children, footer }: { kicker: string; title: string; intro?: string; children?: ReactNode; footer?: ReactNode }) {
	return (
		<section className="wrap grid min-h-[86vh] place-items-center pb-20 pt-[calc(var(--header-h)+32px)]">
			<div className="paper paper-ruled relative w-full max-w-md px-6 py-10 text-center sm:px-10">
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src="/compass-mark.svg" alt="" width={64} height={64} className="mx-auto" />
				<p className="engraved mt-4 text-sepia">{kicker}</p>
				<h1 className="font-display mt-2 text-4xl leading-tight">{title}</h1>
				{intro ? <p className="mt-3 text-[0.98rem] leading-relaxed text-[#3b2e1d]">{intro}</p> : null}
				<div className="mt-7 text-left">{children}</div>
				{footer ? <p className="mt-8 text-sm text-sepia">{footer}</p> : null}
			</div>
		</section>
	);
}
