import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { RoomWorldProps } from '@/lib/worlds';

/**
 * Room slug → world component (code-split per world, server-rendered).
 * A world lives in `components/worlds/<slug>/index.tsx` (default export).
 * A store room without an entry renders the generic world (`_placeholder`).
 * Add a line here when you add a world; nothing else in the shell changes.
 *
 * Built: kepler-station. To build: jaguar-temple, gaslight-no-9, protocol-zero,
 * hotel-lumiere, clockmakers-workshop (the v1 drafts are in the `v0-parchment` tag).
 */
const WORLDS: Record<string, ComponentType<RoomWorldProps>> = {
	'kepler-station': dynamic(() => import('./kepler-station')),
	'jaguar-temple': dynamic(() => import('./jaguar-temple')),
	'hotel-lumiere': dynamic(() => import('./hotel-lumiere')),
	'gaslight-no-9': dynamic(() => import('./gaslight-no-9')),
	'protocol-zero': dynamic(() => import('./protocol-zero')),
	'clockmakers-workshop': dynamic(() => import('./clockmakers-workshop')),
};

const GenericWorld = dynamic(() => import('./_placeholder/placeholder-world'));

export function worldFor(slug: string): ComponentType<RoomWorldProps> {
	return WORLDS[slug] ?? GenericWorld;
}

export const WORLD_SLUGS = Object.keys(WORLDS);
