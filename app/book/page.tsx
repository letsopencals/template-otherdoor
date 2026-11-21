import type { Metadata } from 'next';
import { getCatalogue, getRoomRanges } from '@/lib/server-data';
import { shelfRooms } from '@/lib/shelf';
import { roomPresentation, siteConfig } from '@/lib/site-config';
import { PageHead } from '@/components/pages/page-head';
import { ExpeditionBoard, type BoardRoom } from '@/components/booking/expedition-board';

export const metadata: Metadata = { title: 'Plan an expedition', description: 'Every escape room session at The Gilded Compass, Edinburgh: pick a date, a room and a time.' };

type Search = Promise<{ venue?: string | string[] }>;

export default async function BookPage({ searchParams }: { searchParams: Search }) {
	const sp = await searchParams;
	const [catalogue, ranges] = await Promise.all([getCatalogue(), getRoomRanges(null)]);
	const shelf = shelfRooms(catalogue);
	const rooms: BoardRoom[] = catalogue.rooms.map((r) => {
		const sh = shelf.find((x) => x.slug === r.slug)!;
		return { slug: r.slug, title: r.title, genre: sh.genre, durationMin: r.durationMin, gameMinutes: roomPresentation(r.slug)?.gameMinutes ?? 60, options: r.options, locationId: r.venue?.id ?? null, venueSlug: r.venue?.slug ?? null, venueShort: sh.venueShort, spine: sh.palette.spine, foil: sh.palette.foil, difficulty: sh.difficulty, fear: sh.fear, players: sh.players };
	});
	const venues = Object.entries(siteConfig.venues).map(([slug, v]) => ({ slug, short: v.short }));
	return (
		<>
			<PageHead folio="The expedition board" title="Plan an expedition." lede="Pick a day, then a room and a time. The price is for your whole team; Matinee sessions (Monday to Thursday before 15:00) are 15% off." />
			<section className="wrap py-12 pb-24">
				<ExpeditionBoard rooms={rooms} venues={venues} initialRanges={ranges} renderedAt={Date.now()} initialVenue={typeof sp.venue === 'string' ? sp.venue : null} />
			</section>
		</>
	);
}
