import type { RoomWorldProps } from '@/lib/worlds';
import PlaceholderWorld from '../_placeholder/placeholder-world';

/**
 * PLACEHOLDER world for `hotel-lumiere`. The world agent replaces this file (and adds
 * its own CSS module, illustrations and scroll choreography in this folder).
 * Contract: components/worlds/README.md and lib/worlds.ts.
 */
export default function HotelLumiereWorld(props: RoomWorldProps) {
	return (
		<PlaceholderWorld
			{...props}
			emblem={
				<svg viewBox="0 0 200 200" fill="currentColor"><path d="M100 20 170 80 100 185 30 80Z"/><path d="M30 80h140M100 20 70 80l30 105 30-105Z" stroke="#000" strokeOpacity=".3" strokeWidth="3" fill="none"/></svg>
			}
		/>
	);
}
