import type { Metadata } from 'next';
import type { ComponentType } from 'react';
import { notFound } from 'next/navigation';
import { getAddOnsForProduct, getCatalogue, getRoomRanges } from '@/lib/server-data';
import { findRoom } from '@/lib/rooms';
import { buildWorldProps, worldVenue } from '@/lib/world-props';
import { roomPresentation, siteConfig } from '@/lib/site-config';
import type { RoomWorldProps } from '@/lib/worlds';
import { BookingPanel } from '@/components/booking/booking-panel';

export type RoomSearch = Promise<Record<string, string | string[] | undefined>>;

const one = (v: string | string[] | undefined) => (typeof v === 'string' ? v : null);

/** Metadata for a room page (title, tagline, key art). */
export async function roomMetadata(slug: string): Promise<Metadata> {
	const room = findRoom(await getCatalogue(), slug);
	if (!room) return { title: 'Room not found' };
	const p = roomPresentation(slug);
	return {
		title: room.title,
		description: p?.tagline ?? room.description.slice(0, 160),
		openGraph: room.images[0] ? { images: [room.images[0]] } : undefined,
	};
}

/**
 * A room page: wires the data and the shared booking panel, then renders `World`
 * (components/worlds/<slug>), which owns the whole design between the shared header
 * and footer. Each built world has its own route file (app/rooms/<slug>/page.tsx) so
 * only that world's JS and CSS ship with it; app/rooms/[slug] serves the generic world.
 */
export async function RoomPage({ slug, searchParams, World }: { slug: string; searchParams: RoomSearch; World: ComponentType<RoomWorldProps> }) {
	const sp = await searchParams;
	const catalogue = await getCatalogue();
	const room = findRoom(catalogue, slug);
	if (!room) notFound();

	const [ranges, addOns] = await Promise.all([getRoomRanges(null), getAddOnsForProduct(room.options[0]?.slug ?? '')]);
	const team = Number(one(sp.team));
	const venue = worldVenue(room.venue);

	const booking = (
		<BookingPanel
			room={{ slug: room.slug, title: room.title, durationMin: room.durationMin, options: room.options, locationId: room.venue?.id ?? null, venueShort: venue?.short ?? null }}
			initialRanges={ranges[room.slug] ?? []}
			addOns={addOns}
			renderedAt={Date.now()}
			initialDate={one(sp.date)}
			initialTime={one(sp.time)}
			initialTeam={Number.isFinite(team) && team > 0 ? team : null}
			heading={roomPresentation(room.slug)?.bookingHeading}
		/>
	);

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'TouristAttraction',
		name: room.title,
		description: room.description,
		isAccessibleForFree: false,
		image: room.images[0],
		containedInPlace: venue ? { '@type': 'EntertainmentBusiness', name: venue.name, address: `${venue.address}, ${venue.postcode}` } : undefined,
		offers: room.options.map((o) => ({ '@type': 'Offer', name: `${o.size} players`, price: o.price, priceCurrency: siteConfig.currency })),
	};

	return (
		<>
			<World {...buildWorldProps(room, catalogue, booking)} />
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
		</>
	);
}
