'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * The temple at night (hero loop) over its poster. No video under reduced motion; a
 * failing video drops back to the poster; a missing poster leaves the green-black ground.
 * Pauses while off screen.
 */
export function TempleLoop({ src, poster, className }: { src?: string; poster?: string; className?: string }) {
	const box = useRef<HTMLDivElement>(null);
	const video = useRef<HTMLVideoElement>(null);
	const [play, setPlay] = useState(false);
	const [posterOk, setPosterOk] = useState(Boolean(poster));

	useEffect(() => {
		if (!src || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		setPlay(true);
	}, [src]);

	useEffect(() => {
		const v = video.current;
		const el = box.current;
		if (!v || !el) return;
		v.muted = true;
		const io = new IntersectionObserver(([e]) => {
			if (e?.isIntersecting) v.play().catch(() => undefined);
			else v.pause();
		});
		io.observe(el);
		return () => io.disconnect();
	}, [play]);

	return (
		<div ref={box} className={className} aria-hidden>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			{posterOk && poster ? <img src={poster} alt="" fetchPriority="high" onError={() => setPosterOk(false)} /> : null}
			{play && src ? <video ref={video} src={src} poster={poster} muted loop playsInline autoPlay preload="auto" onError={() => setPlay(false)} /> : null}
		</div>
	);
}
