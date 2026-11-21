'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * A brass compass whose needle swings toward the pointer on a spring, and,
 * when the pointer rests, points at the next free session (straight down, to
 * Tonight’s expeditions) with its name engraved under the glass.
 */
export function CompassNeedle({ next }: { next: { label: string; href: string } | null }) {
	const ref = useRef<HTMLAnchorElement>(null);
	const needle = useRef<SVGGElement>(null);
	const [idle, setIdle] = useState(true);
	useEffect(() => {
		const el = ref.current;
		const n = needle.current;
		if (!el || !n) return;
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const REST = 180; // points down the page, to the sessions
		let angle = REST;
		let vel = 0;
		let target = REST;
		let last = -10_000;
		let raf = 0;
		const draw = () => n.setAttribute('transform', `rotate(${angle.toFixed(2)} 100 100)`);
		draw();
		if (reduce) return;
		const move = (e: PointerEvent) => {
			const r = el.getBoundingClientRect();
			const dx = e.clientX - (r.left + r.width / 2);
			const dy = e.clientY - (r.top + r.height / 2);
			let a = (Math.atan2(dx, -dy) * 180) / Math.PI;
			// Shortest way round.
			while (a - angle > 180) a -= 360;
			while (a - angle < -180) a += 360;
			target = a;
			last = performance.now();
			setIdle(false);
		};
		const tick = (t: number) => {
			if (t - last > 2200) {
				let a = REST + Math.sin(t / 900) * 3;
				while (a - angle > 180) a -= 360;
				while (a - angle < -180) a += 360;
				target = a;
				if (t - last < 2300) setIdle(true);
			}
			// Damped spring.
			vel = vel * 0.86 + (target - angle) * 0.045;
			angle += vel;
			draw();
			raf = requestAnimationFrame(tick);
		};
		window.addEventListener('pointermove', move, { passive: true });
		raf = requestAnimationFrame(tick);
		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener('pointermove', move);
		};
	}, []);

	const ticks = Array.from({ length: 72 }, (_, i) => i);
	return (
		<a ref={ref} href={next?.href ?? '#tonight'} className="group block select-none" aria-label={next ? `Next free session: ${next.label}` : 'Tonight’s expeditions'}>
			<svg viewBox="0 0 200 200" className="w-full drop-shadow-[0_12px_20px_rgba(0,0,0,0.55)]">
				<defs>
					<radialGradient id="brass" cx="35%" cy="30%" r="80%">
						<stop offset="0" stopColor="#f6e2a2" />
						<stop offset=".45" stopColor="#c8a04a" />
						<stop offset="1" stopColor="#6e4f17" />
					</radialGradient>
					<radialGradient id="face" cx="50%" cy="40%" r="70%">
						<stop offset="0" stopColor="#fbf3dc" />
						<stop offset="1" stopColor="#e2cd9c" />
					</radialGradient>
					<linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
						<stop offset="0" stopColor="#fff" stopOpacity=".55" />
						<stop offset=".35" stopColor="#fff" stopOpacity="0" />
					</linearGradient>
				</defs>
				<circle cx="100" cy="100" r="98" fill="url(#brass)" />
				<circle cx="100" cy="100" r="88" fill="#4a3410" opacity=".35" />
				<circle cx="100" cy="100" r="84" fill="url(#face)" />
				<g stroke="#5a3f1e">
					{ticks.map((i) => (
						<line key={i} x1="100" y1="19" x2="100" y2={i % 18 === 0 ? 31 : i % 6 === 0 ? 27 : 23} strokeWidth={i % 18 === 0 ? 2 : 1} transform={`rotate(${i * 5} 100 100)`} />
					))}
				</g>
				<g fill="#1e3a30" style={{ font: '17px var(--font-display)' }} textAnchor="middle">
					<text x="100" y="47">N</text>
					<text x="157" y="106">E</text>
					<text x="100" y="166">S</text>
					<text x="43" y="106">W</text>
				</g>
				<circle cx="100" cy="100" r="40" fill="none" stroke="#8a6a43" strokeDasharray="1 3" />
				<g ref={needle}>
					<path d="M100 30 L108 100 L100 108 L92 100 Z" fill="#7a1e22" />
					<path d="M100 170 L108 100 L100 92 L92 100 Z" fill="#1e3a30" />
					<path d="M100 30 L100 108 L92 100 Z" fill="#000" opacity=".18" />
				</g>
				<circle cx="100" cy="100" r="7" fill="url(#brass)" stroke="#5a3f1e" />
				<circle cx="100" cy="100" r="84" fill="url(#glass)" />
			</svg>
			{next ? (
				<span className={`mt-2 block text-center transition-opacity duration-500 ${idle ? 'opacity-100' : 'opacity-60'}`}>
					<span className="engraved block text-[0.7rem] text-[#d9c08a]">next free session</span>
					<span className="typed block text-[0.8rem] text-[#f3e6c4] group-hover:underline">{next.label}</span>
				</span>
			) : null}
		</a>
	);
}
