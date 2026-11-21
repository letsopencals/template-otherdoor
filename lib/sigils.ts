import type { Catalogue } from '@/lib/rooms';
import { FALLBACK_PALETTE, roomPresentation } from '@/lib/site-config';
import type { SigilRoom } from '@/components/account/doors-opened';

/** One door per room in the store for the account's "Doors opened" collection. */
export function sigilRooms(c: Catalogue): SigilRoom[] {
	return c.rooms.map((r) => {
		const p = roomPresentation(r.slug);
		return { slug: r.slug, title: r.title, genre: p?.genre ?? "", year: p?.year ?? "", glow: (p?.palette ?? FALLBACK_PALETTE).glow, keyArt: r.images[0] ?? null, art: p?.media.key ?? null, poster: p?.media.poster ?? null };
	});
}
