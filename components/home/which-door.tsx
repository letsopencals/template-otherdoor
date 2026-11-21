'use client';

import Link from 'next/link';
import { useMemo, useState, type CSSProperties } from 'react';
import type { QuizQuestion } from '@/lib/site-config';
import type { DoorRoom } from '@/lib/doors';
import { setDoorLight } from '@/lib/door-light';
import { DoorArt } from '@/components/doors/door-art';
import { doorArt } from '@/components/doors/door-sources';
import { ArrowIcon } from '@/components/shell/icons';
import s from './which-door.module.css';

/**
 * "Which door is yours?": four questions. Six small doors show the score live:
 * the light under each door grows with its points, and the winner opens.
 */
export function WhichDoor({ questions, doors }: { questions: readonly QuizQuestion[]; doors: DoorRoom[] }) {
	const [answers, setAnswers] = useState<number[]>([]);
	const step = answers.length;
	const done = step >= questions.length;
	const score = useMemo(() => {
		const out: Record<string, number> = {};
		answers.forEach((a, qi) => {
			for (const [slug, n] of Object.entries(questions[qi]?.answers[a]?.rooms ?? {})) out[slug] = (out[slug] ?? 0) + n;
		});
		return out;
	}, [answers, questions]);
	const max = Math.max(1, ...Object.values(score));
	const winner = done ? ([...doors].sort((a, b) => (score[b.slug] ?? 0) - (score[a.slug] ?? 0))[0] ?? null) : null;
	const q = questions[step];

	const answer = (i: number) => {
		const next = [...answers, i];
		setAnswers(next);
		if (next.length >= questions.length) {
			const sc: Record<string, number> = {};
			next.forEach((a, qi) => {
				for (const [slug, n] of Object.entries(questions[qi]?.answers[a]?.rooms ?? {})) sc[slug] = (sc[slug] ?? 0) + n;
			});
			const w = [...doors].sort((a, b) => (sc[b.slug] ?? 0) - (sc[a.slug] ?? 0))[0];
			if (w) setDoorLight(w.palette.glow);
		}
	};

	return (
		<div className={s.wrap}>
			<div className={s.row} aria-hidden>
				{doors.map((d) => {
					const share = (score[d.slug] ?? 0) / max;
					const won = winner?.slug === d.slug;
					return (
						<span key={d.slug} className={s.mini} data-won={won} data-lost={Boolean(winner) && !won} style={{ '--slit': d.palette.glow, '--share': share.toFixed(2) } as CSSProperties}>
							<span className={s.miniFrame}>
								<DoorArt sources={doorArt(d)} alt="" glow={d.palette.glow} className={s.miniArt} />
								<span className={s.miniLeaf} />
							</span>
							<span className={s.miniSill} />
							<span className={s.miniName}>{d.short}</span>
						</span>
					);
				})}
			</div>

			<div className={s.panel} aria-live="polite">
				{!done && q ? (
					<>
						<p className="label">
							Question {step + 1} of {questions.length}
						</p>
						<p className={s.q}>{q.q}</p>
						<div className={s.answers}>
							{q.answers.map((a, i) => (
								<button key={a.label} type="button" className={s.answer} onClick={() => answer(i)}>
									{a.label}
									<ArrowIcon />
								</button>
							))}
						</div>
						{step ? (
							<button type="button" className="mt-5 text-sm text-ink-3 underline underline-offset-4" onClick={() => setAnswers((x) => x.slice(0, -1))}>
								Back
							</button>
						) : null}
					</>
				) : winner ? (
					<>
						<p className="label">Your door</p>
						<p className={s.q}>{winner.title}</p>
						<p className="mt-2 text-ink-2">
							{winner.genre} · {winner.year} · {winner.players} players · {winner.venueShort}
						</p>
						<p className="mt-2 max-w-[46ch] text-ink-3">{winner.tagline}</p>
						<p className="mt-7 flex flex-wrap gap-3">
							<Link href={`/rooms/${winner.slug}`} className="btn">
								Open this door <ArrowIcon />
							</Link>
							<button
								type="button"
								className="btn btn-glass"
								onClick={() => {
									setAnswers([]);
									setDoorLight(null);
								}}
							>
								Start again
							</button>
						</p>
					</>
				) : null}
			</div>
		</div>
	);
}
