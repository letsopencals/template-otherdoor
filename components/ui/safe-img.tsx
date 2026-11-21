'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * An <img> that never shows the broken-image icon: when the source is missing or
 * fails (also before hydration, checked on mount), it renders `fallback` instead.
 * Plain <img> on purpose: images are unoptimised and sized at the source.
 */
export function SafeImg({ src, alt, className, fallback = null, loading = 'lazy', style }: { src: string | null | undefined; alt: string; className?: string; fallback?: ReactNode; loading?: 'lazy' | 'eager'; style?: React.CSSProperties }) {
	const [failed, setFailed] = useState(false);
	const ref = useRef<HTMLImageElement>(null);
	useEffect(() => {
		const img = ref.current;
		if (img && img.complete && img.naturalWidth === 0) setFailed(true);
	}, [src]);
	if (!src || failed) return <>{fallback}</>;
	// eslint-disable-next-line @next/next/no-img-element
	return <img ref={ref} src={src} alt={alt} className={className} loading={loading} decoding="async" style={style} onError={() => setFailed(true)} />;
}
