import { RoomPage, roomMetadata, type RoomSearch } from '@/components/worlds/room-page';
import World from '@/components/worlds/kepler-station';

const SLUG = 'kepler-station';

export const generateMetadata = () => roomMetadata(SLUG);

export default function KeplerStationPage({ searchParams }: { searchParams: RoomSearch }) {
	return <RoomPage slug={SLUG} searchParams={searchParams} World={World} />;
}
