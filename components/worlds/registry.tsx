import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { RoomWorldProps } from '@/lib/worlds';

/**
 * Room slug → world component (code-split per world, server-rendered).
 * A world lives in `components/worlds/<slug>/index.tsx` (default export).
 * A store room without a folder renders the generic world.
 * Add a line here when you add a world; nothing else in the shell changes.
 */
const WORLDS: Record<string, ComponentType<RoomWorldProps>> = {
	'jaguar-temple': dynamic(() => import('./jaguar-temple')),
	'gaslight-no-9': dynamic(() => import('./gaslight-no-9')),
	'cartographers-tomb': dynamic(() => import('./cartographers-tomb')),
	'leviathan-dive': dynamic(() => import('./leviathan-dive')),
	'hotel-lumiere': dynamic(() => import('./hotel-lumiere')),
	'clockmakers-workshop': dynamic(() => import('./clockmakers-workshop')),
};

const GenericWorld = dynamic(() => import('./_placeholder/placeholder-world'));

export function worldFor(slug: string): ComponentType<RoomWorldProps> {
	return WORLDS[slug] ?? GenericWorld;
}

export const WORLD_SLUGS = Object.keys(WORLDS);
