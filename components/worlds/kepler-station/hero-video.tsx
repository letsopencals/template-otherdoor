'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * The world's hero loop over its poster. Metadata only until it is on screen,
 * then it plays (and pauses again when scrolled away), so a deep link to #book
 * doesn't download the loop. A missing video keeps the poster; a missing poster
 * shows deep space. Reduced motion: poster only.
 */
export function HeroVideo({ src, poster, className }: { src?: string; poster?: string; className?: string }) {
	const wrap = useRef<HTMLDivElement>(null);
	const ref = useRef<HTMLVideoElement>(null);
	const [on, setOn] = useState(false);
	const [posterOk, setPosterOk] = useState(Boolean(poster));
	useEffect(() => {
		if (!src || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		setOn(true);
	}, [src]);
	useEffect(() => {
		const v = ref.current;
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
			{on && src ? <video ref={ref} src={src} muted loop playsInline preload="metadata" poster={poster} onError={() => setOn(false)} /> : null}
		</div>
	);
}
