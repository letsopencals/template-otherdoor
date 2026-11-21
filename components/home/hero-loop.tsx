'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * The home hero's background: a muted loop over its poster. If the video is
 * missing or fails, the poster stays; if that fails too, the CSS gradient shows.
 * Reduced motion: the poster only.
 */
export function HeroLoop({ src, poster, className }: { src: string; poster: string; className?: string }) {
	const ref = useRef<HTMLVideoElement>(null);
	const [video, setVideo] = useState(false);
	const [posterOk, setPosterOk] = useState(true);
	useEffect(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		setVideo(true);
	}, []);
	useEffect(() => {
		const v = ref.current;
		if (!v) return;
		v.muted = true;
		v.play().catch(() => undefined);
	}, [video]);
	return (
		<div className={className} aria-hidden>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			{posterOk ? <img src={poster} alt="" onError={() => setPosterOk(false)} /> : null}
			{video ? <video ref={ref} src={src} muted loop playsInline autoPlay preload="auto" onError={() => setVideo(false)} /> : null}
		</div>
	);
}
