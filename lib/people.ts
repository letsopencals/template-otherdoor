import type { Catalogue } from '@/lib/rooms';
import { FALLBACK_PALETTE, roomPresentation, siteConfig, type GameMaster } from '@/lib/site-config';
import type { GameMasterView } from '@/components/people/game-master-card';

/** Game masters: the store's staff (portraits) joined with site-config titles and bios, in corridor order. */
export function gameMasterViews(c: Catalogue): GameMasterView[] {
	const gms = siteConfig.gameMasters as Record<string, GameMaster>;
	const slugs = [...new Set([...Object.keys(gms), ...c.staff.map((s) => s.slug)])];
	return slugs
		.map((slug) => {
			const gm = gms[slug];
			const staff = c.staff.find((s) => s.slug === slug);
			if (!gm && !staff) return null;
			if (c.staff.length && !staff) return null; // the store is the source of truth once it has staff
			const room = gm ? c.rooms.find((r) => r.slug === gm.room) : undefined;
			return { slug, name: staff?.name || gm!.name, title: gm?.title ?? 'Game master', bio: gm?.bio ?? '', image: staff?.image ?? null, room: room?.title ?? null, roomHref: room ? `/rooms/${room.slug}` : null, tone: roomPresentation(gm?.room ?? '')?.palette.glow ?? FALLBACK_PALETTE.glow };
		})
		.filter((x): x is GameMasterView => x !== null)
		.sort((a, b) => c.rooms.findIndex((r) => r.title === a.room) - c.rooms.findIndex((r) => r.title === b.room));
}
