import type { RoomWorldProps } from '@/lib/worlds';
import PlaceholderWorld from '../_placeholder/placeholder-world';

/**
 * PLACEHOLDER world for `leviathan-dive`. The world agent replaces this file (and adds
 * its own CSS module, illustrations and scroll choreography in this folder).
 * Contract: components/worlds/README.md and lib/worlds.ts.
 */
export default function LeviathanDiveWorld(props: RoomWorldProps) {
	return (
		<PlaceholderWorld
			{...props}
			emblem={
				<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="14"><circle cx="100" cy="100" r="80"/><circle cx="100" cy="100" r="52" strokeWidth="6"/><g fill="currentColor" stroke="none"><circle cx="100" cy="14" r="7"/><circle cx="100" cy="186" r="7"/><circle cx="14" cy="100" r="7"/><circle cx="186" cy="100" r="7"/></g></svg>
			}
		/>
	);
}
