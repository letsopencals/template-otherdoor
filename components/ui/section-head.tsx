import type { ReactNode } from 'react';

/** Section head: "02 · label" in mono, a big display title, the lede bottom-right, and a sill that lights up. */
export function SectionHead({ n, label, title, lede, id, stack = false }: { n: string; label: string; title: ReactNode; lede?: ReactNode; id?: string; stack?: boolean }) {
	return (
		<div>
			<div className={stack ? "shead shead-stack" : "shead"}>
				<div>
					<p className="label">
						{n} · {label}
					</p>
					<h2 id={id}>{title}</h2>
				</div>
				{lede ? <p className="lede">{lede}</p> : null}
			</div>
			<span className="sill" aria-hidden />
		</div>
	);
}
