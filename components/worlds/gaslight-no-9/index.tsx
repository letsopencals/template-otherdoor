import type { RoomWorldProps } from '@/lib/worlds';
import PlaceholderWorld from '../_placeholder/placeholder-world';

/**
 * PLACEHOLDER world for `gaslight-no-9`. The world agent replaces this file (and adds
 * its own CSS module, illustrations and scroll choreography in this folder).
 * Contract: components/worlds/README.md and lib/worlds.ts.
 */
export default function GaslightNo9World(props: RoomWorldProps) {
	return (
		<PlaceholderWorld
			{...props}
			emblem={
				<svg viewBox="0 0 200 200" fill="currentColor"><rect x="92" y="120" width="16" height="78"/><path d="M60 50h80l-12 70H72Z"/><circle cx="100" cy="85" r="18" fill="#fff" fillOpacity=".5"/><path d="M80 50l20-30 20 30Z"/></svg>
			}
		/>
	);
}
