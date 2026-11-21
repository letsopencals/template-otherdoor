/** Fine line icons (stroke = currentColor, 1.5). */
export function DoorsIcon({ size = 22 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden>
			<path d="M4 20.5V4.5h8v16" />
			<path d="M9 20.5V3.2l10 1.6v15.7" />
			<path d="M2.5 20.5h19" />
			<circle cx="16.2" cy="12.5" r=".9" fill="currentColor" stroke="none" />
		</svg>
	);
}
export function UserIcon({ size = 20 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
			<circle cx="12" cy="8.5" r="4" />
			<path d="M4.5 20.5c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5" strokeLinecap="round" />
		</svg>
	);
}
export function MenuIcon({ size = 24 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
			<path d="M4 8h16M4 16h11" />
		</svg>
	);
}
export function CloseIcon({ size = 24 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
			<path d="M6 6l12 12M18 6 6 18" />
		</svg>
	);
}
export function Caret({ open }: { open: boolean }) {
	return (
		<svg width="10" height="10" viewBox="0 0 12 12" aria-hidden style={{ transition: 'transform .3s', transform: open ? 'rotate(180deg)' : 'none' }}>
			<path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
		</svg>
	);
}
export function ArrowIcon({ size = 16 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
			<path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" />
		</svg>
	);
}
