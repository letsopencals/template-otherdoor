'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/** A modal side drawer: Escape closes, focus moves in and back, the page doesn't scroll behind it. */
export function Drawer({ open, onClose, label, children, className = '', side = 'right' }: { open: boolean; onClose: () => void; label: string; children: ReactNode; className?: string; side?: 'right' | 'bottom' }) {
	const ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (!open) return;
		const prev = document.activeElement as HTMLElement | null;
		document.documentElement.style.overflow = 'hidden';
		const t = window.setTimeout(() => ref.current?.querySelector<HTMLElement>('button, a, input')?.focus(), 30);
		const key = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
			if (e.key === 'Tab' && ref.current) {
				const f = [...ref.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input, select, textarea')];
				if (!f.length) return;
				const first = f[0]!;
				const last = f[f.length - 1]!;
				if (e.shiftKey && document.activeElement === first) {
					e.preventDefault();
					last.focus();
				} else if (!e.shiftKey && document.activeElement === last) {
					e.preventDefault();
					first.focus();
				}
			}
		};
		window.addEventListener('keydown', key);
		return () => {
			window.clearTimeout(t);
			window.removeEventListener('keydown', key);
			document.documentElement.style.overflow = '';
			prev?.focus?.();
		};
	}, [open, onClose]);
	if (!open) return null;
	return (
		<div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={label}>
			<button type="button" aria-label="Close" className="absolute inset-0 cursor-default bg-[#15201b]/55 backdrop-blur-[2px]" onClick={onClose} />
			<div ref={ref} className={`drawer-in absolute ${side === 'right' ? 'inset-y-0 right-0 w-full max-w-[460px]' : 'inset-x-0 bottom-0 max-h-[90dvh]'} flex flex-col ${className}`}>
				{children}
			</div>
		</div>
	);
}
