import type { Metadata } from 'next';
import { getCatalogue, getRoomRanges } from '@/lib/server-data';
import { doorRooms } from '@/lib/doors';
import { siteConfig } from '@/lib/site-config';
import { PageHead } from '@/components/pages/page-head';
import { SessionBoard, type BoardRoom } from '@/components/booking/session-board';
import { doorArt } from '@/components/doors/door-sources';

export const metadata: Metadata = { title: 'Book a session', description: 'Every escape room session at Otherdoor, Edinburgh: pick a date, a room and a time.' };

type Search = Promise<{ venue?: string | string[] }>;

export default async function BookPage({ searchParams }: { searchParams: Search }) {
	const sp = await searchParams;
	const [catalogue, ranges] = await Promise.all([getCatalogue(), getRoomRanges(null)]);
	const doors = doorRooms(catalogue);
	const rooms: BoardRoom[] = catalogue.rooms.map((r) => {
		const d = doors.find((x) => x.slug === r.slug)!;
		return { slug: r.slug, title: r.title, genre: d.genre, durationMin: r.durationMin, gameMinutes: d.gameMinutes, options: r.options, locationId: r.venue?.id ?? null, venueSlug: r.venue?.slug ?? null, venueShort: d.venueShort, glow: d.palette.glow, art: doorArt(d), difficulty: d.difficulty, fear: d.fear, players: d.players };
	});
	const venues = Object.entries(siteConfig.venues).map(([slug, v]) => ({ slug, short: v.name }));
	return (
		<>
			<PageHead label="Book" title="Every door, every session." lede="Pick a day, then a room and a time. Prices are for your whole team; Matinee sessions (Monday to Thursday before 15:00) are 15% off." />
			<section className="wrap py-12 pb-24">
				<SessionBoard rooms={rooms} venues={venues} initialRanges={ranges} renderedAt={Date.now()} initialVenue={typeof sp.venue === 'string' ? sp.venue : null} />
			</section>
		</>
	);
}
