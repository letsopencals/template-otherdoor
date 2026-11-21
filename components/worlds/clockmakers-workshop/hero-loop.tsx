'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * The workshop loop behind the hero (graded to midnight blue in CSS). Poster
 * first; the muted video starts only when on screen and motion is allowed,
 * pauses off screen, and drops back to the poster if it fails. A missing poster
 * leaves the painted wall underneath.
 */
export function HeroLoop({ src, poster, className }: { src?: string; poster?: string; className?: string }) {
	const wrap = useRef<HTMLDivElement>(null);
	const video = useRef<HTMLVideoElement>(null);
	const [posterOk, setPosterOk] = useState(Boolean(poster));
	const [on, setOn] = useState(false);

	useEffect(() => {
		if (!src || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		setOn(true);
	}, [src]);

	useEffect(() => {
		const v = video.current;
		const el = wrap.current;
		if (!on || !v || !el) return;
		v.muted = true;
		const io = new IntersectionObserver(([e]) => {
			if (e?.isIntersecting) v.play().catch(() => undefined);
			else v.pause();
		});
		io.observe(el);
		return () => io.disconnect();
	}, [on]);

	return (
		<div ref={wrap} className={className} aria-hidden>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			{posterOk && poster ? <img src={poster} alt="" onError={() => setPosterOk(false)} /> : null}
			{on && src ? <video ref={video} src={src} muted loop playsInline preload="metadata" poster={posterOk ? poster : undefined} onError={() => setOn(false)} /> : null}
		</div>
	);
}
