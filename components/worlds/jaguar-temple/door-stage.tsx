'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { DOOR_ORDER, GLYPHS, Glyph } from './art';
import { useProgress } from './use-progress';
import s from './jaguar.module.css';

const START = [4, 3, 5];
const smooth = (x: number) => x * x * (3 - 2 * x);
const clamp = (x: number) => Math.min(1, Math.max(0, x));

/**
 * THE SEALED DOOR. A pinned stage built on the photo `stone-door.jpg`: the two stone
 * leaves are cut out of the photo itself and slide into the walls as you scroll, over
 * `idol.jpg` waiting behind. Opening grinds (a shudder while moving) and throws dust in
 * proportion to its speed. When the door is open the idol catches a sweep of light and
 * its jade eyes glint.
 *
 * The glyph lock (three carved dials) is optional fun: scrolling opens the door anyway.
 * Solving it (or "skip") grinds it open at once, lights the eyes harder and adds a line.
 * Reduced motion: the door stands open, the lock still works.
 */
export function DoorStage({ door, idol, title, body }: { door: string; idol: string; title: string; body: string }) {
	const track = useRef<HTMLElement>(null);
	const stage = useRef<HTMLDivElement>(null);
	const [dials, setDials] = useState(START);
	const [mode, setMode] = useState<'sealed' | 'solved' | 'forced'>('sealed');
	const [lit, setLit] = useState(false);
	const tween = useRef({ v: 0, on: false });
	const prev = useRef({ open: 0, dust: 0, t: 0 });
	const reduced = useRef(false);

	useEffect(() => {
		reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced.current) {
			stage.current?.style.setProperty('--open', '1');
			setLit(true);
		}
	}, []);

	const kick = useProgress(track, 'pinned', (p, dt) => {
		const el = stage.current;
		if (!el || reduced.current) return false;
		const tw = tween.current;
		if (tw.on && tw.v < 1) tw.v = Math.min(1, tw.v + dt / 1500);
		const scrollOpen = smooth(clamp((p - 0.22) / 0.5));
		const open = Math.max(scrollOpen, smooth(tw.v));
		const st = prev.current;
		const speed = Math.abs(open - st.open) / Math.max(1, dt);
		st.dust = Math.max(st.dust * 0.94, Math.min(1, speed * 90));
		st.t += dt;
		st.open = open;
		const shake = st.dust > 0.05 ? Math.sin(st.t / 23) * 1.6 * st.dust : 0;
		el.style.setProperty('--open', open.toFixed(4));
		el.style.setProperty('--dust', st.dust.toFixed(3));
		el.style.setProperty('--shake', `${shake.toFixed(2)}px`);
		el.style.setProperty('--p', p.toFixed(4));
		const isLit = open > 0.82;
		if (isLit !== lit) setLit(isLit);
		return st.dust > 0.01 || (tw.on && tw.v < 1);
	});

	const turn = (i: number) => {
		if (mode !== 'sealed') return;
		const next = dials.map((d, j) => (j === i ? (d + 1) % GLYPHS.length : d));
		setDials(next);
		if (next.every((d, j) => d === DOOR_ORDER[j])) open('solved');
	};
	const open = (m: 'solved' | 'forced') => {
		setMode(m);
		tween.current.on = true;
		kick.current();
	};

	const status = mode === 'solved' ? 'The three faces line up. Something heavy gives way inside the wall.' : mode === 'forced' ? 'You put your shoulders to the stone. It moves, grudgingly.' : 'Sealed. Three carved faces, one order.';

	return (
		<section ref={track} id="jt-door" className={s.doorTrack} aria-labelledby="jt-door-title">
			<div ref={stage} className={s.doorStage} data-lit={lit ? '' : undefined} data-mode={mode}>
				<div className={s.doorPhoto}>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src={door} alt="" className={s.doorBg} loading="lazy" decoding="async" />
					<div className={s.doorway}>
						<div className={s.idolBox}>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src={idol} alt="The golden jaguar idol on its altar, in a shaft of light" loading="lazy" decoding="async" />
							<span className={s.sweep} aria-hidden />
							<i className={s.eye} style={{ left: '45.9%', top: '42.3%' } as CSSProperties} aria-hidden />
							<i className={s.eye} style={{ left: '53.2%', top: '42.3%' } as CSSProperties} aria-hidden />
						</div>
						<div className={`${s.leaf} ${s.leafL}`} aria-hidden>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src={door} alt="" loading="lazy" decoding="async" />
						</div>
						<div className={`${s.leaf} ${s.leafR}`} aria-hidden>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src={door} alt="" loading="lazy" decoding="async" />
						</div>
						<span className={s.doorDust} aria-hidden>
							{DUST.map((d, i) => (
								<i
									key={i}
									style={
										{
											left: `${d.x}%`,
											animationDelay: `${d.o}s`,
											animationDuration: `${d.d}s`,
											width: d.w,
											height: d.w,
										} as CSSProperties
									}
								/>
							))}
						</span>
					</div>
					<span className={s.lintelDust} aria-hidden>
						{DUST.slice(0, 8).map((d, i) => (
							<i
								key={i}
								style={
									{
										left: `${d.x}%`,
										animationDelay: `${d.o * 0.7}s`,
									} as CSSProperties
								}
							/>
						))}
					</span>
				</div>
				<div className={s.doorShade} aria-hidden />

				<div className={s.doorCopy}>
					<p className={s.layerTag}>−63 m · The sealed door</p>
					<h2 id="jt-door-title" className={s.h2}>
						{title}
					</h2>
					<p className={s.lede}>{body}</p>
					<p className={s.idolLine} data-show={lit ? '' : undefined}>
						Twenty-two kilos of gold with jade for eyes, sitting exactly where she said it would be.
						{mode === 'solved' ? <b> You read the door like Vance did.</b> : null}
					</p>
				</div>

				<div className={s.lock} role="group" aria-labelledby="jt-lock-label">
					<p id="jt-lock-label" className={s.lockLabel}>
						The door’s three faces <span>Turn them to the order in Vance’s notebook</span>
					</p>
					<div className={s.dials}>
						{dials.map((d, i) => (
							<button
								key={i}
								type="button"
								className={s.dial}
								onClick={() => turn(i)}
								disabled={mode !== 'sealed'}
								aria-label={`Face ${i + 1}: ${GLYPHS[d]!.name}. Turn it.`}
								style={{ '--turn': `${-d * 60}deg` } as CSSProperties}
								data-ok={mode === 'solved' ? '' : undefined}
							>
								<span className={s.dialRing} aria-hidden>
									{GLYPHS.map((g, j) => (
										<span key={g.name} data-top={j === d ? '' : undefined} style={{ '--a': `${j * 60}deg` } as CSSProperties}>
											<Glyph i={j} gold={mode === 'solved' && j === d} />
										</span>
									))}
								</span>
								<span className={s.dialHub} aria-hidden />
							</button>
						))}
					</div>
					<p className={s.lockStatus} role="status" aria-live="polite">
						{status}
					</p>
					{mode === 'sealed' ? (
						<button type="button" className={s.skip} onClick={() => open('forced')}>
							Skip the puzzle, push the door
						</button>
					) : null}
				</div>
			</div>
		</section>
	);
}

const DUST = Array.from({ length: 18 }, (_, i) => ({
	x: Math.round(((i * 37) % 100) * 10) / 10,
	d: Math.round((1.8 + ((i * 7) % 10) / 6) * 100) / 100,
	o: Math.round(((i * 0.37) % 2.6) * 100) / 100,
	w: 3 + (i % 4) * 2,
}));
