'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * The establishing shot of the splash page: the hotel loop, printed through a
 * halftone screen. Plays only while the panel is on screen; reduced motion, a
 * missing file or a failed video keep the poster; no poster leaves the panel's
 * own sunset gradient.
 */
export function SplashLoop({ src, poster, className }: { src?: string; poster?: string; className?: string }) {
	const wrap = useRef<HTMLDivElement>(null);
	const vid = useRef<HTMLVideoElement>(null);
	const [on, setOn] = useState(false);
	const [posterOk, setPosterOk] = useState(Boolean(poster));

	useEffect(() => {
		if (!src || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const el = wrap.current;
		if (!el) return;
		const io = new IntersectionObserver(([e]) => {
			if (!e) return;
			if (e.isIntersecting) setOn(true);
			const v = vid.current;
			if (!v) return;
			if (e.isIntersecting) {
				v.muted = true;
				v.play().catch(() => undefined);
			} else v.pause();
		}, { threshold: 0.1 });
		io.observe(el);
		return () => io.disconnect();
	}, [src]);

	useEffect(() => {
		const v = vid.current;
		if (!v) return;
		v.muted = true;
		v.play().catch(() => undefined);
	}, [on]);

	useEffect(() => {
		const img = wrap.current?.querySelector('img');
		if (img && img.complete && img.naturalWidth === 0) setPosterOk(false);
	}, []);

	return (
		<div ref={wrap} className={className} aria-hidden>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			{posterOk && poster ? <img src={poster} alt="" loading="lazy" onError={() => setPosterOk(false)} /> : null}
			{on && src ? <video ref={vid} src={src} muted loop playsInline preload="metadata" poster={posterOk ? poster : undefined} onError={() => setOn(false)} /> : null}
		</div>
	);
}
