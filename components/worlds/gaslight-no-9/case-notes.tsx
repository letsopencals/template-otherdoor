'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import s from './gaslight.module.css';

/** The three hidden clues the glass can find. Optional fun: nothing here gates booking. */
export const CLUES = [
	{ id: 'ink', hint: 'Something in the newspaper’s margin', found: 'Pencil in the margin: “up the flue?”' },
	{ id: 'seal', hint: 'Something on the desk', found: 'A monogram in the wax: A.Q.' },
	{ id: 'watch', hint: 'Something else on the desk', found: 'The watch stopped at 11.47' },
] as const;

export type ClueId = (typeof CLUES)[number]['id'];

interface CaseState {
	found: ReadonlySet<ClueId>;
	find: (id: ClueId) => void;
}

const CaseContext = createContext<CaseState>({ found: new Set(), find: () => undefined });

export function useCase() {
	return useContext(CaseContext);
}

export function CaseProvider({ children }: { children: ReactNode }) {
	const [found, setFound] = useState<ReadonlySet<ClueId>>(() => new Set());
	const find = useCallback((id: ClueId) => {
		setFound((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
	}, []);
	const value = useMemo(() => ({ found, find }), [found, find]);
	return <CaseContext.Provider value={value}>{children}</CaseContext.Provider>;
}

/**
 * The detective's notebook: a tally of the clues found with the glass. On the wall it sits in
 * the corner of the stage; in the stacked layout it rides along the bottom of the screen while
 * the documents pass. All three found: a red "SOLVED?" stamp and a wink.
 */
export function CaseNotes() {
	const { found } = useCase();
	const n = found.size;
	const solved = n === CLUES.length;
	return (
		<aside className={s.notes} data-solved={solved || undefined} aria-label="Case notes">
			<p className={s.notesHead}>
				<span>Case notes</span>
				<b aria-live="polite">
					{n} of {CLUES.length}
				</b>
			</p>
			<ol className={s.notesList}>
				{CLUES.map((c) => {
					const got = found.has(c.id);
					return (
						<li key={c.id} data-got={got || undefined}>
							<i aria-hidden />
							<span>{got ? c.found : c.hint}</span>
						</li>
					);
				})}
			</ol>
			<p className={s.notesFoot}>{solved ? 'Solved? Not yet. The rest of the evidence is behind the door.' : 'Take the glass to the newspaper and the desk.'}</p>
			<span className={s.stamp} aria-hidden>
				Solved?
			</span>
		</aside>
	);
}
