/** Small hand-drawn line icons (stroke = currentColor). */
export function SatchelIcon({ size = 26 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden>
			<path d="M10 11V8.5a6 6 0 0 1 12 0V11" />
			<path d="M4.5 12.5h23l-1.6 13.2a2.5 2.5 0 0 1-2.5 2.3H8.6a2.5 2.5 0 0 1-2.5-2.3Z" />
			<path d="M4.5 12.5 8 18.5h16l3.5-6" />
			<rect x="13.5" y="16.5" width="5" height="4.5" rx=".8" fill="currentColor" fillOpacity=".25" />
		</svg>
	);
}
export function LogbookIcon({ size = 24 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
			<path d="M7 5h16a3 3 0 0 1 3 3v19H10a3 3 0 0 1-3-3Z" />
			<path d="M7 24a3 3 0 0 1 3-3h16" />
			<circle cx="16.5" cy="12.5" r="3.5" />
			<path d="M16.5 7.5v1.5M16.5 16v1.5M11.5 12.5H13M20 12.5h1.5" />
		</svg>
	);
}
export function MenuIcon({ size = 24 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
			<path d="M4 7h16M4 12h16M4 17h10" />
		</svg>
	);
}
export function CloseIcon({ size = 24 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
			<path d="M6 6l12 12M18 6 6 18" />
		</svg>
	);
}
export function Caret({ open }: { open: boolean }) {
	return (
		<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden style={{ transition: 'transform .3s', transform: open ? 'rotate(180deg)' : 'none' }}>
			<path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
		</svg>
	);
}
