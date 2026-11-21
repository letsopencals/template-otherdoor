'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

/**
 * A section whose light switches on as it enters the viewport: `data-lit` flips
 * to "true" and CSS warms its pool of door light and stretches its sill. Content
 * is never hidden (no fade-up reveals); only the light changes.
 */
export function Lamp({ as: Tag = 'section', className = '', style, id, children, ...rest }: { as?: 'section' | 'div'; className?: string; style?: CSSProperties; id?: string; children: ReactNode; 'aria-labelledby'?: string }) {
	const ref = useRef<HTMLElement>(null);
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const io = new IntersectionObserver(([e]) => {
			if (e?.isIntersecting) {
				el.dataset.lit = 'true';
				io.disconnect();
			}
		}, { rootMargin: '0px 0px -25% 0px' });
		io.observe(el);
		return () => io.disconnect();
	}, []);
	return (
		<Tag ref={ref as never} id={id} className={`lamp ${className}`} style={style} data-lit="false" {...rest}>
			{children}
		</Tag>
	);
}
