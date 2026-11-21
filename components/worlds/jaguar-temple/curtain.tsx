import type { CSSProperties } from 'react';
import { Leaf, type LeafKind, type LeafTone } from './art';
import s from './jaguar.module.css';

export interface LeafSpot {
	kind: LeafKind;
	seed: number;
	tone: LeafTone;
	rim?: 'moon' | 'gold' | 'none';
	/** Stem position in % of the layer (left cluster; the right cluster mirrors it). */
	x: number;
	y: number;
	/** Width, a CSS length. */
	w: string;
	/** Blade angle (deg). 0 = tip up for monstera, along the frond for palm/fern. */
	r: number;
	/** Sway phase (s). */
	d?: number;
	/** Hide on phones (keeps the frame light at 390 px). */
	wide?: boolean;
}

const ORIGIN: Record<LeafKind, [string, string]> = { monstera: ['50%', '100%'], palm: ['4%', '96%'], fern: ['5%', '94%'] };

/**
 * Foreground leaves for a layer: a left cluster and its mirror on the right. Inside a
 * `[data-curtain]` layer they read `--part` (0 → they meet over the content, 1 → drawn
 * back to the edges as a frame). `--part` defaults to 1, so without JS, with reduced
 * motion and in screenshots the content is uncovered.
 */
export function Curtain({ left, right, className }: { left: LeafSpot[]; right?: LeafSpot[]; className?: string }) {
	return (
		<div className={`${s.curtain} ${className ?? ''}`} aria-hidden>
			<div className={s.curtainL}>{left.map(spot)}</div>
			<div className={s.curtainR}>{(right ?? left).map(spot)}</div>
		</div>
	);
}

function spot(l: LeafSpot, i: number) {
	const [ox, oy] = ORIGIN[l.kind];
	return (
		<div
			key={`${l.kind}-${l.seed}-${i}`}
			className={s.leafSpot}
			data-wide={l.wide ? '' : undefined}
			style={{ left: `${l.x}%`, top: `${l.y}%`, '--w': l.w, '--ox': ox, '--oy': oy, '--r': `${l.r}deg` } as CSSProperties}
		>
			<Leaf kind={l.kind} seed={l.seed} tone={l.tone} rim={l.rim ?? 'moon'} className={s.leafSvg} style={{ animationDelay: `${-(l.d ?? i * 1.3)}s` }} />
		</div>
	);
}
