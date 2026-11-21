import type { ReactNode } from 'react';
import { DoorMark } from '@/components/brand/logo';

/** The sign-in card: smoked glass with the door mark. */
export function AuthCard({ kicker, title, intro, children, footer }: { kicker: string; title: string; intro?: string; children?: ReactNode; footer?: ReactNode }) {
	return (
		<section className="pool wrap grid min-h-[86vh] place-items-center pb-20 pt-[calc(var(--header-h)+32px)]">
			<div className="glass relative w-full max-w-md px-6 py-10 text-center sm:px-10">
				<span className="inline-block text-[#efe7da]">
					<DoorMark size={40} />
				</span>
				<p className="label mt-5 justify-center">{kicker}</p>
				<h1 className="font-display mt-3 text-[2.4rem] leading-tight tracking-tight">{title}</h1>
				{intro ? <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-2">{intro}</p> : null}
				<div className="mt-7 text-left">{children}</div>
				{footer ? <p className="mt-8 text-sm text-ink-3">{footer}</p> : null}
			</div>
		</section>
	);
}
