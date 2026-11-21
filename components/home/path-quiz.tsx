'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { QuizQuestion } from '@/lib/site-config';
import type { ShelfRoom } from '@/lib/shelf';

const POINTS: Array<[number, number]> = [
	[60, 300],
	[210, 150],
	[370, 260],
	[530, 110],
	[700, 210],
];

/** "Which room are you?": each answer draws the next leg of a dotted route on a chart and ends at a room. */
export function PathQuiz({ questions, rooms }: { questions: readonly QuizQuestion[]; rooms: ShelfRoom[] }) {
	const [answers, setAnswers] = useState<number[]>([]);
	const step = answers.length;
	const done = step >= questions.length;
	const result = useMemo(() => {
		if (!done) return null;
		const score: Record<string, number> = {};
		answers.forEach((a, qi) => {
			for (const [slug, n] of Object.entries(questions[qi]?.answers[a]?.rooms ?? {})) score[slug] = (score[slug] ?? 0) + n;
		});
		const known = rooms.filter((r) => score[r.slug] !== undefined).sort((a, b) => (score[b.slug] ?? 0) - (score[a.slug] ?? 0));
		return known[0] ?? rooms[0] ?? null;
	}, [done, answers, questions, rooms]);
	const q = questions[step];
	const legs = POINTS.slice(0, step + 1);
	const path = legs.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');

	return (
		<div className="grid items-center gap-8 lg:grid-cols-[1.25fr_1fr]">
			<div className="paper paper-ruled relative overflow-hidden p-3">
				<svg viewBox="0 0 760 360" className="block w-full" role="img" aria-label={`Your route: ${step} of ${questions.length} legs drawn`}>
					<rect width="760" height="360" fill="#f3e6c8" />
					<g stroke="#8a6a43" strokeOpacity=".25">
						{Array.from({ length: 12 }, (_, i) => <line key={i} x1={i * 70} y1="0" x2={i * 70} y2="360" />)}
						{Array.from({ length: 6 }, (_, i) => <line key={i} x1="0" y1={i * 70} x2="760" y2={i * 70} />)}
					</g>
					<path d="M0 330 C 120 300 200 340 300 310 S 480 340 560 300 S 700 330 760 310 L760 360 L0 360Z" fill="#e2c98f" stroke="#5a3f1e" />
					<path d="M520 0 C 540 40 600 50 640 30 S 720 10 760 40 L760 0Z" fill="#e2c98f" stroke="#5a3f1e" />
					{POINTS.slice(0, questions.length + 1).map(([x, y], i) => (
						<g key={i} opacity={i <= step ? 1 : 0.35}>
							<circle cx={x} cy={y} r="9" fill={i <= step ? '#7a1e22' : 'none'} stroke="#7a1e22" strokeWidth="2" />
							<text x={x} y={y - 18} textAnchor="middle" fill="#5a3f1e" style={{ font: '14px var(--font-engraved)' }}>
								{i === 0 ? 'start' : i === questions.length ? 'X' : `${i}`}
							</text>
						</g>
					))}
					<path key={step} d={path} fill="none" stroke="#7a1e22" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" className="quiz-route" />
					{done ? (
						<g transform={`translate(${POINTS[questions.length]![0]} ${POINTS[questions.length]![1]})`} stroke="#7a1e22" strokeWidth="4" strokeLinecap="round">
							<path d="M-12 -12 L12 12 M12 -12 L-12 12" />
						</g>
					) : null}
				</svg>
			</div>
			<div aria-live="polite">
				{!done && q ? (
					<>
						<p className="engraved text-sepia">
							Leg {step + 1} of {questions.length}
						</p>
						<p className="font-display mt-2 text-[1.9rem] leading-tight">{q.q}</p>
						<div className="mt-5 grid gap-2">
							{q.answers.map((a, i) => (
								<button key={a.label} type="button" onClick={() => setAnswers((x) => [...x, i])} className="flex min-h-[48px] items-center justify-between gap-3 border border-[#8a6a43]/50 bg-vellum px-4 text-left font-semibold transition hover:border-ink-green hover:bg-[#efe3c4]">
									{a.label}
									<span aria-hidden className="text-sepia">→</span>
								</button>
							))}
						</div>
						{step ? (
							<button type="button" className="mt-4 text-sm underline" onClick={() => setAnswers((x) => x.slice(0, -1))}>
								Back a leg
							</button>
						) : null}
					</>
				) : result ? (
					<>
						<p className="engraved text-sepia">X marks your room</p>
						<p className="font-display mt-2 text-[2.2rem] leading-tight">{result.title}</p>
						<p className="mt-2">
							{result.genre}
							{result.year ? `, ${result.year}` : ''} · {result.players} players · {result.venueShort}
						</p>
						<p className="mt-5 flex flex-wrap gap-3">
							<Link href={`/rooms/${result.slug}`} className="plate">
								Open this volume
							</Link>
							<button type="button" className="plate plate-ghost" onClick={() => setAnswers([])}>
								Chart another route
							</button>
						</p>
					</>
				) : null}
			</div>
		</div>
	);
}
