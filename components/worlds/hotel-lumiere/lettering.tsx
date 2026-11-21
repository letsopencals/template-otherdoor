import type { CSSProperties, ReactNode } from 'react';
import { INK, RED, YELLOW, burstPath } from './art';
import s from './lumiere.module.css';

/**
 * Sound-effect lettering: Bowlby One set in SVG with a thick ink outline
 * (paint-order: stroke), a solid drop shadow and a per-letter wobble (each glyph
 * rotated and lifted by its own amount, deterministic). Pops when its panel slams in.
 */
export function Sfx({
	text,
	fill = YELLOW,
	shade = RED,
	size = 1,
	tilt = -7,
	className,
	style,
}: {
	text: string;
	fill?: string;
	shade?: string;
	size?: number;
	tilt?: number;
	className?: string;
	style?: CSSProperties;
}) {
	const fs = 100;
	const w = Math.round(text.length * fs * 0.74 + 60);
	const h = 170;
	const rot = text
		.split('')
		.map((_, i) => [-6, 4, -2, 7, -5, 3, -8, 5][i % 8])
		.join(' ');
	const dy = text
		.split('')
		.map((_, i) => (i === 0 ? 0 : [-6, 8, -4, 5, -7, 6][i % 6]))
		.join(' ');
	const common = { x: 30, y: 122, fontSize: fs, rotate: rot, dy, textLength: w - 60, lengthAdjust: 'spacingAndGlyphs' as const };
	return (
		<span className={`${s.sfx} ${className ?? ''}`} style={{ '--sfx-w': `${Math.round((w / 10) * size)}`, '--tilt': `${tilt}deg`, ...style } as CSSProperties} aria-hidden>
			<svg viewBox={`0 0 ${w} ${h}`} focusable="false">
				<text {...common} transform="translate(9 9)" fill={INK} stroke={INK} strokeWidth="22" strokeLinejoin="round">
					{text}
				</text>
				<text {...common} fill={shade} stroke={INK} strokeWidth="22" strokeLinejoin="round" paintOrder="stroke" transform="translate(4 4)">
					{text}
				</text>
				<text {...common} fill={fill} stroke={INK} strokeWidth="10" strokeLinejoin="round" paintOrder="stroke">
					{text}
				</text>
			</svg>
		</span>
	);
}

type Tail = 'bl' | 'br' | 'bc' | 'tl' | 'tr' | 'none';

/**
 * A speech balloon (real text, read in order). `i` is its place in the panel's
 * reading order: balloons pop one after another, with a small overshoot.
 */
export function Balloon({ children, i = 0, tail = 'bl', kind = 'speech', className, style }: { children: ReactNode; i?: number; tail?: Tail; kind?: 'speech' | 'whisper' | 'shout'; className?: string; style?: CSSProperties }) {
	return (
		<p className={`${s.balloon} ${className ?? ''}`} data-kind={kind} data-tail={tail} data-pop style={{ '--i': i, ...style } as CSSProperties}>
			{kind === 'shout' ? (
				<svg className={s.shoutBg} viewBox="-120 -80 240 160" preserveAspectRatio="none" aria-hidden focusable="false">
					<path d={burstPath(14, 118, 92, 0.06)} transform="scale(1 0.66)" fill="#FFFFFF" stroke={INK} strokeWidth="5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
				</svg>
			) : null}
			<span className={s.balloonText}>{children}</span>
			{tail !== 'none' && kind !== 'shout' ? (
				<svg className={s.tail} viewBox="0 0 34 34" aria-hidden focusable="false">
					<path d="M3 -6 L3 0 Q8 16 26 32 Q16 14 28 0 L28 -6 Z" fill="#FFFFFF" />
					<path d="M3 0 Q8 16 26 32 Q16 14 28 0" fill="none" stroke={INK} strokeWidth="3" strokeLinejoin="round" strokeDasharray={kind === 'whisper' ? '5 4' : undefined} />
				</svg>
			) : null}
		</p>
	);
}

/** A narration caption box (yellow, squared, lettered). */
export function Caption({ children, i = 0, tone = 'yellow', className, style }: { children: ReactNode; i?: number; tone?: 'yellow' | 'paper' | 'cyan' | 'ink'; className?: string; style?: CSSProperties }) {
	return (
		<p className={`${s.caption} ${className ?? ''}`} data-tone={tone} data-pop style={{ '--i': i, ...style } as CSSProperties}>
			{children}
		</p>
	);
}
