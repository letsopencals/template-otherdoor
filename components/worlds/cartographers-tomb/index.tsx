import type { RoomWorldProps } from '@/lib/worlds';
import PlaceholderWorld from '../_placeholder/placeholder-world';

/**
 * PLACEHOLDER world for `cartographers-tomb`. The world agent replaces this file (and adds
 * its own CSS module, illustrations and scroll choreography in this folder).
 * Contract: components/worlds/README.md and lib/worlds.ts.
 */
export default function CartographersTombWorld(props: RoomWorldProps) {
	return (
		<PlaceholderWorld
			{...props}
			emblem={
				<svg viewBox="0 0 200 200" fill="currentColor"><path d="M100 20 190 180H10Z"/><path d="M100 60 150 150H50Z" fill="#000" fillOpacity=".2"/></svg>
			}
		/>
	);
}
