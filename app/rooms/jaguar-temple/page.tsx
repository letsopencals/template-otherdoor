import { RoomPage, roomMetadata, type RoomSearch } from '@/components/worlds/room-page';
import World from '@/components/worlds/jaguar-temple';

const SLUG = 'jaguar-temple';

export const generateMetadata = () => roomMetadata(SLUG);

export default function JaguarTemplePage({ searchParams }: { searchParams: RoomSearch }) {
	return <RoomPage slug={SLUG} searchParams={searchParams} World={World} />;
}
