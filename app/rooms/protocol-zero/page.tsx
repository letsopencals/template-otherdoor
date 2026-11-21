import { RoomPage, roomMetadata, type RoomSearch } from '@/components/worlds/room-page';
import World from '@/components/worlds/protocol-zero';

const SLUG = 'protocol-zero';

export const generateMetadata = () => roomMetadata(SLUG);

export default function ProtocolZeroPage({ searchParams }: { searchParams: RoomSearch }) {
	return <RoomPage slug={SLUG} searchParams={searchParams} World={World} />;
}
