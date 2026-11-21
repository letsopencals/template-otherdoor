import type { CSSProperties } from 'react';
import s from './protocol.module.css';

const COLS = 48;
const ROWS = 6;

/** Deterministic noise (integer hash): identical on the server and the client. */
function noise(c: number, r: number, salt: number): number {
	let h = (Math.imul(c + 1, 73856093) ^ Math.imul(r + 1, 19349663) ^ Math.imul(salt + 7, 83492791)) >>> 0;
	h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
	return (h % 1000) / 1000;
}

/**
 * The pixel seam between two modules: the colour below dissolves up into the
 * colour above as square pixels (more pixels lower down), plus two torn scan
 * bands. Pixels pop in as the seam scrolls through (CSS scroll-driven, static
 * where unsupported or with reduced motion). Pure SVG, no canvas.
 */
export function PixelSeam({ from, to, salt = 1, tear = '#31D7E8' }: { from: string; to: string; salt?: number; tear?: string }) {
	const cells: Array<{ x: number; y: number; o: number }> = [];
	for (let r = 0; r < ROWS; r++) {
		for (let c = 0; c < COLS; c++) {
			const n = noise(c, r, salt);
			if (n < (r + 1) / (ROWS + 1)) cells.push({ x: c * 10, y: r * 10, o: Math.round(n * 40) });
		}
	}
	const bandY = 10 + Math.round(noise(3, 3, salt) * 30);
	return (
		<div className={s.seam} style={{ background: from }} aria-hidden>
			<svg viewBox={`0 0 ${COLS * 10} ${ROWS * 10}`} preserveAspectRatio="none" className={s.seamSvg}>
				{cells.map((p) => (
					<rect key={`${p.x}-${p.y}`} x={p.x} y={p.y} width="10.4" height="10.4" fill={to} className={s.seamPx} style={{ '--o': p.o } as CSSProperties} />
				))}
				<rect x={Math.round(noise(1, 2, salt) * 200)} y={bandY} width={140 + Math.round(noise(2, 1, salt) * 120)} height="1.6" fill={tear} className={s.seamTear} />
				<rect x={240 + Math.round(noise(5, 4, salt) * 160)} y={bandY + 9} width={60 + Math.round(noise(4, 5, salt) * 80)} height="1" fill="#E5243B" className={s.seamTear} />
			</svg>
		</div>
	);
}

/** SVG filters for the glitch bursts: horizontal band displacement and an RGB split. */
export function GlitchDefs() {
	return (
		<svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden focusable="false">
			<filter id="pz-glitch" x="-5%" y="-5%" width="110%" height="110%">
				<feTurbulence type="fractalNoise" baseFrequency="0.0001 0.22" numOctaves="1" seed="4" result="bands" />
				<feDisplacementMap in="SourceGraphic" in2="bands" scale="26" xChannelSelector="R" yChannelSelector="A" result="shift" />
				<feOffset in="shift" dx="-2" result="r" />
				<feColorMatrix in="r" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
				<feOffset in="shift" dx="2" result="c" />
				<feColorMatrix in="c" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="cyan" />
				<feBlend in="red" in2="cyan" mode="screen" />
			</filter>
		</svg>
	);
}
