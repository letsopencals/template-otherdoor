'use client';

import { useEffect, useRef } from 'react';

/** Seeded PRNG so the sky is the same on every visit. */
function mulberry(seed: number) {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/**
 * Three layers of stars drawn on a canvas (client only, so nothing to hydrate):
 * they drift slowly, twinkle, and shift with scroll and the pointer at three
 * depths. Reduced motion: one still frame.
 */
export function Starfield({ density = 1, className }: { density?: number; className?: string }) {
	const ref = useRef<HTMLCanvasElement>(null);
	useEffect(() => {
		const canvas = ref.current;
		const ctx = canvas?.getContext('2d');
		if (!canvas || !ctx) return;
		const rand = mulberry(2187);
		const layers = [0.15, 0.4, 0.9].map((depth, li) =>
			Array.from({ length: Math.round((li === 2 ? 60 : li === 1 ? 160 : 320) * density) }, () => ({
				x: rand(),
				y: rand(),
				r: (li === 2 ? 1.1 : li === 1 ? 0.7 : 0.45) + rand() * 0.6,
				tw: rand() * Math.PI * 2,
				hue: rand() < 0.12 ? 'rgba(160,220,255,' : rand() < 0.08 ? 'rgba(255,210,170,' : 'rgba(255,255,255,',
				depth,
			})),
		);
		let w = 0;
		let h = 0;
		let dpr = 1;
		const resize = () => {
			dpr = Math.min(2, window.devicePixelRatio || 1);
			w = canvas.clientWidth;
			h = canvas.clientHeight;
			canvas.width = Math.round(w * dpr);
			canvas.height = Math.round(h * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};
		resize();
		let mx = 0;
		let my = 0;
		const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		let t = 0;
		let raf = 0;
		let visible = true;
		const draw = () => {
			t += 1;
			ctx.clearRect(0, 0, w, h);
			const sy = window.scrollY;
			for (const layer of layers) {
				for (const s of layer) {
					const x = (((s.x * w + t * 0.02 * s.depth * 10 + mx * 30 * s.depth) % w) + w) % w;
					const y = (((s.y * h - sy * 0.25 * s.depth + my * 20 * s.depth) % h) + h) % h;
					const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(s.tw + t * 0.03 * (0.5 + s.depth)));
					ctx.beginPath();
					ctx.fillStyle = `${s.hue}${(a * (0.4 + s.depth * 0.6)).toFixed(3)})`;
					ctx.arc(x, y, s.r, 0, Math.PI * 2);
					ctx.fill();
				}
			}
			if (!still && visible) raf = requestAnimationFrame(draw);
		};
		const io = new IntersectionObserver(([e]) => {
			visible = Boolean(e?.isIntersecting);
			if (visible && !still) {
				cancelAnimationFrame(raf);
				raf = requestAnimationFrame(draw);
			}
		});
		io.observe(canvas);
		const move = (e: PointerEvent) => {
			mx = e.clientX / window.innerWidth - 0.5;
			my = e.clientY / window.innerHeight - 0.5;
		};
		window.addEventListener('pointermove', move, { passive: true });
		window.addEventListener('resize', resize);
		draw();
		return () => {
			cancelAnimationFrame(raf);
			io.disconnect();
			window.removeEventListener('pointermove', move);
			window.removeEventListener('resize', resize);
		};
	}, [density]);
	return <canvas ref={ref} className={className} aria-hidden />;
}
