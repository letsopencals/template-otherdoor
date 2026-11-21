import type { RoomWorldProps } from '@/lib/worlds';
import PlaceholderWorld from '../_placeholder/placeholder-world';

/**
 * PLACEHOLDER world for `clockmakers-workshop`. The world agent replaces this file (and adds
 * its own CSS module, illustrations and scroll choreography in this folder).
 * Contract: components/worlds/README.md and lib/worlds.ts.
 */
export default function ClockmakersWorkshopWorld(props: RoomWorldProps) {
	return (
		<PlaceholderWorld
			{...props}
			emblem={
				<svg viewBox="0 0 200 200" fill="currentColor"><path d="M100 10l12 22 24-8 2 25 25 4-9 23 20 15-20 15 9 23-25 4-2 25-24-8-12 22-12-22-24 8-2-25-25-4 9-23-20-15 20-15-9-23 25-4 2-25 24 8Z"/><circle cx="100" cy="100" r="30" fill="#000" fillOpacity=".25"/></svg>
			}
		/>
	);
}
