import type { Metadata } from 'next';
import { RoomPage, roomMetadata, type RoomSearch } from '@/components/worlds/room-page';
import GenericWorld from '@/components/worlds/_placeholder/placeholder-world';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
	return roomMetadata((await params).slug);
}

/** A store room without its own world route (app/rooms/<slug>) renders the generic world. */
export default async function GenericRoomPage({ params, searchParams }: { params: Params; searchParams: RoomSearch }) {
	return <RoomPage slug={(await params).slug} searchParams={searchParams} World={GenericWorld} />;
}
