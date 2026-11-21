import { RoomPage, roomMetadata, type RoomSearch } from '@/components/worlds/room-page';
import World from '@/components/worlds/hotel-lumiere';

const SLUG = 'hotel-lumiere';

export const generateMetadata = () => roomMetadata(SLUG);

export default function HotelLumierePage({ searchParams }: { searchParams: RoomSearch }) {
	return <RoomPage slug={SLUG} searchParams={searchParams} World={World} />;
}
