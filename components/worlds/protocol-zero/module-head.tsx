import s from './protocol.module.css';

/** A module's title bar: number, live status chip, title (glitch copy in data-text) and note. */
export function ModuleHead({ n, title, status, note }: { n: string; title: string; status: string; note: string }) {
	return (
		<div className={s.mHead}>
			<p className={s.mNum}>
				MODULE {n}
				<span className={s.mStatus} data-status={status.toLowerCase()}>
					{status}
				</span>
			</p>
			<h2 className={s.mTitle} data-text={title}>
				{title}
			</h2>
			<p className={s.mNote}>{note}</p>
		</div>
	);
}
