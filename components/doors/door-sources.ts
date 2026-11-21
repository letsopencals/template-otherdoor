import type { DoorRoom } from '@/lib/doors';

/** Picture sources for a door, best first: the store's key art, then the template's key art and poster. */
export function doorArt(d: Pick<DoorRoom, 'keyArt' | 'media'>): Array<string | null | undefined> {
	return [d.keyArt, d.media.key, d.media.poster];
}
