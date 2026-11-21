/**
 * The shell's one light: `--door` on <html>. The corridor, the doors menu and a
 * room world set it to that room's glow; `null` returns to the page's base light.
 * Client only (no-ops on the server).
 */
let base: string | null = null;

export function setBaseDoorLight(color: string | null): void {
	base = color;
	setDoorLight(null);
}

export function setDoorLight(color: string | null): void {
	if (typeof document === 'undefined') return;
	const c = color ?? base;
	if (c) document.documentElement.style.setProperty('--door', c);
	else document.documentElement.style.removeProperty('--door');
}
