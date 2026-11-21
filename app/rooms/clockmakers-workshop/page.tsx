import { RoomPage, roomMetadata, type RoomSearch } from '@/components/worlds/room-page';
import World from '@/components/worlds/clockmakers-workshop';

const SLUG = 'clockmakers-workshop';

export const generateMetadata = () => roomMetadata(SLUG);

export default function ClockmakersWorkshopPage({ searchParams }: { searchParams: RoomSearch }) {
	return <RoomPage slug={SLUG} searchParams={searchParams} World={World} />;
}
