'use client';

import { useState, type CSSProperties } from 'react';

/**
 * A room's picture with a fallback chain (store key art → template key art →
 * poster): the first source that loads wins. When none loads, a dark gradient
 * lit from below in the room's colour shows. Never a broken-image icon.
 */
export function DoorArt({ sources, alt, glow, className = '', loading = 'lazy', style }: { sources: ReadonlyArray<string | null | undefined>; alt: string; glow: string; className?: string; loading?: 'lazy' | 'eager'; style?: CSSProperties }) {
	const list = sources.filter((s): s is string => Boolean(s));
	const [i, setI] = useState(0);
	const src = list[i];
	if (!src) {
		return <span aria-hidden className={className} style={{ display: 'block', background: `radial-gradient(90% 60% at 50% 110%, ${glow}55, transparent 70%), linear-gradient(180deg, #16121f, #0b0910)`, ...style }} />;
	}
	// eslint-disable-next-line @next/next/no-img-element
	return <img key={src} src={src} alt={alt} className={className} loading={loading} decoding="async" style={style} onError={() => setI((n) => n + 1)} />;
}
