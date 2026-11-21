'use client';

import { useEffect, useRef, useState } from 'react';

/** The world's hero loop over its poster; missing video keeps the poster, missing poster shows deep space. */
export function HeroVideo({ src, poster, className }: { src?: string; poster?: string; className?: string }) {
	const ref = useRef<HTMLVideoElement>(null);
	const [on, setOn] = useState(false);
	const [posterOk, setPosterOk] = useState(Boolean(poster));
	useEffect(() => {
		if (!src || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		setOn(true);
	}, [src]);
	useEffect(() => {
		const v = ref.current;
		if (!v) return;
		v.muted = true;
		v.play().catch(() => undefined);
	}, [on]);
	return (
		<div className={className} aria-hidden>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			{posterOk && poster ? <img src={poster} alt="" onError={() => setPosterOk(false)} /> : null}
			{on && src ? <video ref={ref} src={src} muted loop playsInline autoPlay preload="auto" onError={() => setOn(false)} /> : null}
		</div>
	);
}
