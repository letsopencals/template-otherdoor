import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAddOnsForProduct, getCatalogue, getRoomRanges } from '@/lib/server-data';
import { findRoom } from '@/lib/rooms';
import { buildWorldProps, worldVenue } from '@/lib/world-props';
import { roomPresentation, siteConfig } from '@/lib/site-config';
import { BookingPanel } from '@/components/booking/booking-panel';
import { worldFor } from '@/components/worlds/registry';

type Params = Promise<{ slug: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

const one = (v: string | string[] | undefined) => (typeof v === 'string' ? v : null);

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
	const { slug } = await params;
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
 * A room world. The page wires data + the shared booking panel; the world
 * component (components/worlds/<slug>) owns the whole design in between the
 * shared header and footer.
 */
export default async function RoomPage({ params, searchParams }: { params: Params; searchParams: Search }) {
	const { slug } = await params;
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
		/>
	);

	const World = worldFor(room.slug);
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
