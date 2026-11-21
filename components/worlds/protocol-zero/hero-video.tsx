'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * The observation feed: the hero loop over its poster. Plays only while on
 * screen; reduced motion or a missing file keeps the still; a missing still
 * leaves the clinical white gradient underneath.
 */
export function FeedVideo({ src, poster, className }: { src?: string; poster?: string; className?: string }) {
	const box = useRef<HTMLDivElement>(null);
	const vid = useRef<HTMLVideoElement>(null);
	const [on, setOn] = useState(false);
	const [posterOk, setPosterOk] = useState(Boolean(poster));

	useEffect(() => {
		if (!src || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		setOn(true);
	}, [src]);

	useEffect(() => {
		const v = vid.current;
		const el = box.current;
		if (!v || !el) return;
		v.muted = true;
		const io = new IntersectionObserver(([e]) => {
			if (e?.isIntersecting) v.play().catch(() => undefined);
			else v.pause();
		});
		io.observe(el);
		return () => io.disconnect();
	}, [on]);

	useEffect(() => {
		const img = box.current?.querySelector('img');
		if (img && img.complete && img.naturalWidth === 0) setPosterOk(false);
	}, []);

	return (
		<div ref={box} className={className} aria-hidden>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			{posterOk && poster ? <img src={poster} alt="" onError={() => setPosterOk(false)} /> : null}
			{on && src ? <video ref={vid} src={src} muted loop playsInline preload="metadata" onError={() => setOn(false)} /> : null}
		</div>
	);
}
