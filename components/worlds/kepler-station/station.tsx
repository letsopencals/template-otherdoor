'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent } from 'react';
import { MODULES, type ModuleKind } from './mission';
import { CX, HUB_RY, VB_H, VB_W, frame, hubY, rotationFor, type Face } from './station-geometry';
import s from './station.module.css';

const POOL = 96;
const START = rotationFor(0, 0) - 0.62;
const IDLE = 0.0022;

/**
 * THE STATION YOU CAN TURN. A hand-built, projected model of Kepler's ring:
 * 32 shaded hull segments painter-sorted around the spindle, truss spokes, the
 * docked shuttle, debris trailing from the breach and lit windows on the
 * command drum. Drag (or arrow keys) to turn it; it keeps spinning with inertia
 * and settles back to a slow idle spin. Hotspots open mission notes; choosing a
 * ring module from the list swings it round to face you.
 * Paths are written through refs inside rAF (no React renders per frame), only
 * while the model is on screen. Reduced motion: no idle spin or inertia.
 */
export function Station() {
	const initial = useMemo(() => frame(START), []);
	const [sel, setSel] = useState<ModuleKind>('dock');
	const selRef = useRef<number | null>(0);
	const svgRef = useRef<SVGSVGElement>(null);
	const stageRef = useRef<HTMLDivElement>(null);
	const backRefs = useRef<Array<SVGGElement | null>>([]);
	const frontRefs = useRef<Array<SVGGElement | null>>([]);
	const spokeB = useRef<SVGPathElement>(null);
	const spokeF = useRef<SVGPathElement>(null);
	const shuttleB = useRef<SVGGElement>(null);
	const shuttleF = useRef<SVGGElement>(null);
	const dotsRef = useRef<Array<SVGCircleElement | null>>([]);
	const debrisRef = useRef<SVGPathElement>(null);
	const hotRefs = useRef<Record<number, HTMLButtonElement | null>>({});
	const kickRef = useRef<() => void>(() => undefined);
	const motion = useRef({ rot: START, vel: IDLE, target: null as number | null, drag: false, lastX: 0, lastT: 0, still: false, t: 0, dirty: true });

	const paint = useCallback((list: Face[], refs: Array<SVGGElement | null>) => {
		const selSeg = selRef.current;
		for (let i = 0; i < POOL; i++) {
			const g = refs[i];
			if (!g) continue;
			const f = list[i];
			const face = g.firstChild as SVGPathElement;
			const light = g.lastChild as SVGPathElement;
			if (!f) {
				if (face.getAttribute('d')) {
					face.setAttribute('d', '');
					light.setAttribute('d', '');
				}
				continue;
			}
			face.setAttribute('d', f.d);
			face.setAttribute('fill', f.fill);
			face.dataset.sel = f.seg === selSeg ? 'y' : 'n';
			light.setAttribute('d', f.light);
			light.setAttribute('stroke', f.lightColor || 'none');
		}
	}, []);

	useEffect(() => {
		const m = motion.current;
		m.still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (m.still) m.vel = 0;
		let raf = 0;
		let visible = false;
		const stage = stageRef.current;
		const tick = () => {
			raf = 0;
			if (!m.drag) {
				if (m.target !== null) {
					const diff = m.target - m.rot;
					m.rot += diff * (m.still ? 1 : 0.075);
					m.vel = 0;
					m.dirty = true;
					if (Math.abs(diff) < 0.0008) {
						m.rot = m.target;
						m.target = null;
						m.vel = m.still ? 0 : IDLE * 0.2;
					}
				} else if (!m.still) {
					m.vel += (IDLE - m.vel) * 0.012;
					m.rot += m.vel;
					m.dirty = true;
				}
			}
			if (!m.still) {
				m.t += 1 / 60;
				m.dirty = true;
			}
			if (m.dirty) {
				m.dirty = false;
				const f = frame(m.rot, m.t);
				paint(f.back, backRefs.current);
				paint(f.front, frontRefs.current);
				spokeB.current?.setAttribute('d', f.spokesBack);
				spokeF.current?.setAttribute('d', f.spokesFront);
				for (const [g, on] of [
					[shuttleB.current, !f.shuttle.front],
					[shuttleF.current, f.shuttle.front],
				] as const) {
					if (!g) continue;
					g.style.display = on ? '' : 'none';
					(g.firstChild as SVGPathElement).setAttribute('d', f.shuttle.d);
					(g.childNodes[1] as SVGPathElement).setAttribute('d', f.shuttle.d);
					const [cx, cy] = f.shuttle.cap.split(' ');
					(g.lastChild as SVGCircleElement).setAttribute('cx', cx ?? '0');
					(g.lastChild as SVGCircleElement).setAttribute('cy', cy ?? '0');
				}
				f.dots.forEach((d, i) => {
					const c = dotsRef.current[i];
					if (!c) return;
					c.setAttribute('cx', String(d.x));
					c.setAttribute('cy', String(d.y));
					c.setAttribute('opacity', String(d.o));
				});
				debrisRef.current?.setAttribute('d', f.debris);
				for (const [seg, h] of Object.entries(f.hot)) {
					const b = hotRefs.current[Number(seg)];
					if (!b) continue;
					b.style.left = `${((h.x / VB_W) * 100).toFixed(2)}%`;
					b.style.top = `${((h.y / VB_H) * 100).toFixed(2)}%`;
					const side = h.back ? 'back' : 'front';
					if (b.dataset.side !== side) {
						b.dataset.side = side;
						b.tabIndex = h.back ? -1 : 0;
						b.setAttribute('aria-hidden', h.back ? 'true' : 'false');
					}
				}
			}
			if (visible) raf = requestAnimationFrame(tick);
		};
		const io = new IntersectionObserver(([e]) => {
			visible = Boolean(e?.isIntersecting);
			if (visible && !raf) raf = requestAnimationFrame(tick);
		});
		if (stage) io.observe(stage);
		kickRef.current = () => {
			m.dirty = true;
			if (!raf) raf = requestAnimationFrame(tick);
		};
		return () => {
			cancelAnimationFrame(raf);
			io.disconnect();
		};
	}, [paint]);

	const kick = () => kickRef.current();

	const onDown = (e: RPointerEvent<HTMLDivElement>) => {
		if ((e.target as HTMLElement).closest('button')) return;
		const m = motion.current;
		m.drag = true;
		m.target = null;
		m.lastX = e.clientX;
		m.lastT = performance.now();
		m.vel = 0;
		e.currentTarget.setPointerCapture(e.pointerId);
		e.currentTarget.dataset.drag = 'y';
	};
	const onMove = (e: RPointerEvent<HTMLDivElement>) => {
		const m = motion.current;
		if (!m.drag) return;
		const w = stageRef.current?.clientWidth ?? VB_W;
		const dx = e.clientX - m.lastX;
		const now = performance.now();
		const dr = (-dx / w) * 3.4;
		m.rot += dr;
		const dt = Math.max(8, now - m.lastT);
		m.vel = m.still ? 0 : Math.max(-0.12, Math.min(0.12, (dr / dt) * 16));
		m.lastX = e.clientX;
		m.lastT = now;
		m.dirty = true;
		kick();
	};
	const onUp = (e: RPointerEvent<HTMLDivElement>) => {
		const m = motion.current;
		if (!m.drag) return;
		m.drag = false;
		if (performance.now() - m.lastT > 90) m.vel *= 0.2;
		delete e.currentTarget.dataset.drag;
		kick();
	};
	const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
		if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
		e.preventDefault();
		const m = motion.current;
		const dir = e.key === 'ArrowLeft' ? 1 : -1;
		m.target = null;
		if (m.still) m.rot += dir * 0.2;
		else m.vel = dir * 0.05;
		m.dirty = true;
		kick();
	};

	const choose = (id: ModuleKind) => {
		setSel(id);
		const mod = MODULES.find((x) => x.id === id);
		selRef.current = mod?.segment ?? null;
		const m = motion.current;
		if (mod?.segment !== null && mod?.segment !== undefined) m.target = rotationFor(mod.segment, m.rot);
		m.dirty = true;
		kick();
	};

	const current = MODULES.find((x) => x.id === sel) ?? MODULES[0]!;
	const ring = MODULES.filter((x) => x.segment !== null);

	return (
		<div className={s.wrap}>
			<div
				ref={stageRef}
				className={s.stage}
				tabIndex={0}
				role="group"
				aria-roledescription="turnable model"
				aria-label="Kepler Station. Drag, or use the left and right arrow keys, to turn the ring."
				onPointerDown={onDown}
				onPointerMove={onMove}
				onPointerUp={onUp}
				onPointerCancel={onUp}
				onKeyDown={onKey}
			>
				<svg ref={svgRef} viewBox={`0 0 ${VB_W} ${VB_H}`} className={s.svg} aria-hidden>
					<defs>
						<linearGradient id="kHub" x1="0" x2="1">
							<stop offset="0" stopColor="#1a2238" />
							<stop offset=".28" stopColor="#a7b2c6" />
							<stop offset=".5" stopColor="#59647c" />
							<stop offset="1" stopColor="#0a0f1e" />
						</linearGradient>
						<linearGradient id="kDrum" x1="0" x2="1">
							<stop offset="0" stopColor="#141b2e" />
							<stop offset=".3" stopColor="#c3ccdb" />
							<stop offset=".55" stopColor="#5d6880" />
							<stop offset="1" stopColor="#070b17" />
						</linearGradient>
						<radialGradient id="kCore" cx=".5" cy=".5" r=".5">
							<stop offset="0" stopColor="#bff9ff" stopOpacity=".9" />
							<stop offset=".4" stopColor="#3ed2d6" stopOpacity=".35" />
							<stop offset="1" stopColor="#3ed2d6" stopOpacity="0" />
						</radialGradient>
						<filter id="kGlow" x="-50%" y="-50%" width="200%" height="200%">
							<feGaussianBlur stdDeviation="2.2" />
						</filter>
					</defs>

					{/* the planet's glow from below and the ring's shadow on space */}
					<ellipse cx={CX} cy={hubY(-40)} rx="330" ry="150" fill="url(#kCore)" opacity=".18" />

					<g className={s.back}>
						{Array.from({ length: POOL }, (_, i) => {
							const f = initial.back[i];
							return (
								<g key={i} ref={(el) => void (backRefs.current[i] = el)}>
									<path d={f?.d ?? ''} fill={f?.fill ?? 'none'} className={s.face} suppressHydrationWarning />
									<path d={f?.light ?? ''} stroke={f?.lightColor || 'none'} className={s.window} suppressHydrationWarning />
								</g>
							);
						})}
						<path ref={spokeB} d={initial.spokesBack} className={s.spoke} suppressHydrationWarning />
						<g ref={shuttleB} style={{ display: initial.shuttle.front ? 'none' : undefined }} suppressHydrationWarning>
							<path d={initial.shuttle.d} className={s.shuttle} suppressHydrationWarning />
							<path d={initial.shuttle.d} className={s.shuttleTop} suppressHydrationWarning />
							<circle r="3" className={s.beacon} suppressHydrationWarning />
						</g>
					</g>

					<Hub />
					<g className={s.drumDots}>
						{initial.dots.map((d, i) => (
							<circle key={i} ref={(el) => void (dotsRef.current[i] = el)} cx={d.x} cy={d.y} r="2.4" opacity={d.o} suppressHydrationWarning />
						))}
					</g>

					<g className={s.front}>
						<path ref={spokeF} d={initial.spokesFront} className={s.spoke} suppressHydrationWarning />
						{Array.from({ length: POOL }, (_, i) => {
							const f = initial.front[i];
							return (
								<g key={i} ref={(el) => void (frontRefs.current[i] = el)}>
									<path d={f?.d ?? ''} fill={f?.fill ?? 'none'} className={s.face} suppressHydrationWarning />
									<path d={f?.light ?? ''} stroke={f?.lightColor || 'none'} className={s.window} suppressHydrationWarning />
								</g>
							);
						})}
						<g ref={shuttleF} style={{ display: initial.shuttle.front ? undefined : 'none' }} suppressHydrationWarning>
							<path d={initial.shuttle.d} className={s.shuttle} suppressHydrationWarning />
							<path d={initial.shuttle.d} className={s.shuttleTop} suppressHydrationWarning />
							<circle r="3" className={s.beacon} suppressHydrationWarning />
						</g>
						<path ref={debrisRef} d={initial.debris} className={s.debris} suppressHydrationWarning />
					</g>
				</svg>

				<div className={s.hotLayer}>
					{ring.map((mod) => (
						<button
							key={mod.id}
							type="button"
							ref={(el) => void (hotRefs.current[mod.segment!] = el)}
							className={s.hot}
							style={{ left: `${((initial.hot[mod.segment!]!.x / VB_W) * 100).toFixed(2)}%`, top: `${((initial.hot[mod.segment!]!.y / VB_H) * 100).toFixed(2)}%` }}
							data-side={initial.hot[mod.segment!]!.back ? 'back' : 'front'}
							tabIndex={initial.hot[mod.segment!]!.back ? -1 : 0}
							suppressHydrationWarning
							data-on={sel === mod.id}
							data-kind={mod.id}
							onClick={() => choose(mod.id)}
							aria-label={`${mod.name}: mission note`}
						>
							<i />
							<span>{mod.name}</span>
						</button>
					))}
					<button type="button" className={`${s.hot} ${s.hotFixed}`} style={{ left: `${((CX + 70) / VB_W) * 100}%`, top: `${(hubY(47) / VB_H) * 100}%` }} data-on={sel === 'command'} onClick={() => choose('command')} aria-label="Command spindle: mission note">
						<i />
						<span>Command</span>
					</button>
					<button type="button" className={`${s.hot} ${s.hotFixed}`} style={{ left: `${((CX + 14) / VB_W) * 100}%`, top: `${(hubY(296) / VB_H) * 100}%` }} data-on={sel === 'comms'} onClick={() => choose('comms')} aria-label="Comms mast: mission note">
						<i />
						<span>Comms mast</span>
					</button>
				</div>
				<p className={s.hint} aria-hidden>
					<span className={s.hintIcon}>⟲</span> Drag to turn the station
				</p>
			</div>

			<div className={s.notes}>
				<div className={s.tabs} role="tablist" aria-label="Station modules">
					{MODULES.map((mod) => (
						<button key={mod.id} type="button" role="tab" aria-selected={sel === mod.id} className={s.tab} onClick={() => choose(mod.id)}>
							<span className={s.tabCode}>{mod.code}</span>
							{mod.name}
						</button>
					))}
				</div>
				<article className={s.note} role="tabpanel" aria-live="polite" key={current.id}>
					<p className={s.noteCode}>
						<span className={s.noteDot} data-kind={current.id} /> MISSION NOTE · {current.code}
					</p>
					<h3 className={s.noteTitle}>{current.name}</h3>
					<p className={s.noteBody}>{current.note}</p>
				</article>
			</div>
		</div>
	);
}

/** The spindle, drums, mast and docking stem: cylinders, so they look the same at any rotation. */
function Hub() {
	const cyl = (r: number, zTop: number, zBot: number, fill: string, cls?: string) => {
		const yt = hubY(zTop);
		const yb = hubY(zBot);
		const ry = HUB_RY(r);
		return (
			<g className={cls}>
				<path d={`M${CX - r} ${yt}V${yb}A${r} ${ry} 0 0 0 ${CX + r} ${yb}V${yt}Z`} fill={fill} />
				<ellipse cx={CX} cy={yt} rx={r} ry={ry} fill="#8e99ad" />
				<ellipse cx={CX} cy={yt} rx={r} ry={ry} fill="none" stroke="#d9e2f0" strokeOpacity=".35" />
			</g>
		);
	};
	const solar = (side: 1 | -1) => {
		const x0 = CX + side * 18;
		const y = hubY(178);
		const cells = Array.from({ length: 6 }, (_, k) => k);
		return (
			<g className={s.solar}>
				<path d={`M${x0} ${y}H${x0 + side * 170}`} className={s.solarBoom} />
				{cells.map((k) => {
					const x = x0 + side * (22 + k * 25);
					return <path key={k} d={`M${x} ${y - 13}h${side * 22}l${side * 4} 26h${-side * 22}z`} className={s.solarCell} />;
				})}
			</g>
		);
	};
	return (
		<g>
			{/* docking stem below */}
			{cyl(12, -128, -190, 'url(#kHub)')}
			<ellipse cx={CX} cy={hubY(-176)} rx="22" ry={HUB_RY(22)} fill="none" stroke="#9aa6bb" strokeWidth="2.6" />
			<circle cx={CX} cy={hubY(-192) + 5} r="3" className={s.blinkRed} />
			{/* the spindle */}
			{cyl(22, 140, -128, 'url(#kHub)')}
			{[110, 16, -16, -90].map((z) => (
				<path key={z} d={`M${CX - 22} ${hubY(z)}A22 ${HUB_RY(22)} 0 0 0 ${CX + 22} ${hubY(z)}`} fill="none" stroke="#05080f" strokeOpacity=".55" strokeWidth="1.2" />
			))}
			{/* lower drum */}
			{cyl(34, -30, -54, 'url(#kDrum)')}
			{/* command drum */}
			{cyl(54, 64, 30, 'url(#kDrum)')}
			<path d={`M${CX - 54} ${hubY(47)}A54 ${HUB_RY(54)} 0 0 0 ${CX + 54} ${hubY(47)}`} fill="none" stroke="#04070e" strokeOpacity=".6" strokeWidth="1.1" />
			{/* solar wings on the despun mast (they hold still while the ring turns) */}
			{solar(-1)}
			{solar(1)}
			{/* comms mast and dish */}
			<path d={`M${CX} ${hubY(140)}V${hubY(300)}M${CX - 7} ${hubY(140)}L${CX} ${hubY(250)}L${CX + 7} ${hubY(140)}`} className={s.mast} />
			<path d={`M${CX - 22} ${hubY(236)}Q${CX} ${hubY(214)} ${CX + 22} ${hubY(236)}`} className={s.dish} />
			<line x1={CX} y1={hubY(228)} x2={CX} y2={hubY(238)} className={s.mast} />
			<circle cx={CX} cy={hubY(302)} r="3.2" className={s.blinkRed} />
			<circle cx={CX} cy={hubY(302)} r="9" className={s.ping} />
		</g>
	);
}
