import type { Catalogue } from '@/lib/rooms';
import { roomPresentation } from '@/lib/site-config';
import type { PassportRoom } from '@/components/logbook/logbook-view';

/** One passport slot per room in the store, inked in the room's colour. */
export function passportRooms(c: Catalogue): PassportRoom[] {
	return c.rooms.map((r) => ({ slug: r.slug, title: r.title, ink: roomPresentation(r.slug)?.palette.spine ?? '#7a1e22' }));
}
