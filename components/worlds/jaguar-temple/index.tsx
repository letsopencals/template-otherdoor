import type { RoomWorldProps } from '@/lib/worlds';
import PlaceholderWorld from '../_placeholder/placeholder-world';

/**
 * PLACEHOLDER world for `jaguar-temple`. The world agent replaces this file (and adds
 * its own CSS module, illustrations and scroll choreography in this folder).
 * Contract: components/worlds/README.md and lib/worlds.ts.
 */
export default function JaguarTempleWorld(props: RoomWorldProps) {
	return (
		<PlaceholderWorld
			{...props}
			emblem={
				<svg viewBox="0 0 200 200" fill="currentColor"><path d="M100 10c30 40 60 60 60 100a60 60 0 0 1-120 0c0-40 30-60 60-100Z"/><path d="M100 40v150" stroke="#000" strokeOpacity=".25" strokeWidth="3"/></svg>
			}
		/>
	);
}
