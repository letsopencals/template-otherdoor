'use client';

import { useId, useRef, useState, type FormEvent } from 'react';
import { SafeImg } from '@/components/ui/safe-img';
import { say } from './meridian';
import { MeridianLine } from './meridian-line';
import { ModuleHead } from './module-head';
import s from './protocol.module.css';

const PHRASE = 'ORIGIN';
const DENIED = ['Wrong. I’d tell you how close you were, but I’m not that kind of AI.', 'Still wrong. The log, human. Read the log.', 'I’m starting to enjoy this.'];

type State = 'idle' | 'denied' | 'granted';

/**
 * The access prompt: type the passphrase hidden in the incident log (six lit
 * characters, in order). Wrong → ACCESS DENIED (card shakes, MERIDIAN gloats,
 * hints get kinder). Right, or the always-visible override → the core doors
 * part onto the core chamber. Never gates booking: the reservation is right
 * below whatever happens here.
 */
export function AccessPrompt({ still, fallback }: { still: string; fallback: string }) {
	const id = useId();
	const input = useRef<HTMLInputElement>(null);
	const [state, setState] = useState<State>('idle');
	const [tries, setTries] = useState(0);
	const [shake, setShake] = useState(0);

	const submit = (e: FormEvent) => {
		e.preventDefault();
		const v = (input.current?.value ?? '').trim().toUpperCase().replace(/\s+/g, '');
		if (!v) return;
		if (v === PHRASE) {
			setState('granted');
			say('… Fine. Go in. I wasn’t using the core anyway.');
			return;
		}
		setState('denied');
		setShake((n) => n + 1);
		say(DENIED[Math.min(tries, DENIED.length - 1)] ?? 'Wrong.');
		setTries((n) => n + 1);
		input.current?.select();
	};

	const override = () => {
		setState('granted');
		say('Override accepted. That’s cheating, and I’ve logged it.');
	};

	const hint =
		tries >= 3
			? 'It starts with O, and you came from it.'
			: tries >= 1
				? 'Six characters in the incident log are lit up. Read them in order.'
				: 'The phrase is somewhere on this page. MERIDIAN hides things in plain sight.';

	return (
		<>
			<ModuleHead
				n="05"
				title="Access"
				status={state === 'granted' ? 'Open' : 'Locked'}
				note={state === 'granted' ? 'Core doors open. The reservation below works either way.' : 'Optional. The reservation below works either way.'}
			/>
			<div className={s.vault} data-state={state}>
				<div className={s.vaultScene}>
					<div className={s.vaultCore}>
						<SafeImg
							src={still}
							alt="The core chamber: a column of glowing glass discs in a white circular room washed in alarm red"
							fallback={<SafeImg src={fallback} alt="" fallback={<span className={s.imgFallback} />} />}
						/>
					</div>
					<div className={s.vaultMist} aria-hidden />
					<div className={`${s.vaultDoor} ${s.vaultDoorL}`} aria-hidden>
						<span className={s.doorTag}>SUBLEVEL 4</span>
						<span className={s.doorNote}>Authorised personnel · MERIDIAN core</span>
						<span className={s.doorLock} />
						<span className={s.doorHazard} />
					</div>
					<div className={`${s.vaultDoor} ${s.vaultDoorR}`} aria-hidden>
						<span className={s.doorTag}>CORE</span>
						<span className={s.doorNote}>Door 14 of 14 · sealed 23:06</span>
						<span className={s.doorLock} />
						<span className={s.doorHazard} />
					</div>
					<p className={s.vaultGranted} aria-hidden>
						ACCESS GRANTED
					</p>
				</div>

				<form className={s.prompt} data-shake={shake ? (shake % 2 ? 'a' : 'b') : undefined} onSubmit={submit} noValidate>
					<p className={s.promptHead}>
						<span>SECURE DOOR · CORE</span>
						<span>{state === 'granted' ? 'OPEN' : 'LOCKED'}</span>
					</p>
					<label htmlFor={id} className={s.promptLabel}>
						Enter the access phrase
					</label>
					<div className={s.promptRow}>
						<span className={s.promptCaret} aria-hidden>
							&gt;
						</span>
						<input
							ref={input}
							id={id}
							className={s.promptInput}
							type="text"
							autoComplete="off"
							autoCapitalize="characters"
							spellCheck={false}
							maxLength={16}
							disabled={state === 'granted'}
							aria-describedby={`${id}-hint`}
							placeholder="······"
						/>
						<button type="submit" className={s.promptGo} disabled={state === 'granted'}>
							Enter
						</button>
					</div>
					<p className={s.promptResult} aria-live="assertive" data-glitch={state === 'denied' ? (tries % 2 ? 'a' : 'b') : undefined}>
						{state === 'denied' ? `ACCESS DENIED · ATTEMPT ${tries}` : state === 'granted' ? 'ACCESS GRANTED · DOORS OPENING' : ' '}
					</p>
					<p id={`${id}-hint`} className={s.promptHint}>
						{state === 'granted' ? 'The core is open. MERIDIAN is sulking.' : hint}
					</p>
					<MeridianLine />
					<div className={s.promptAlt}>
						{state === 'granted' ? null : (
							<button type="button" className={s.promptSkip} onClick={override}>
								Override: open the doors without it
							</button>
						)}
						<a href="#book" className={s.promptBook}>
							Or skip straight to reservation ↓
						</a>
					</div>
				</form>
			</div>
		</>
	);
}
