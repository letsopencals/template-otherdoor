import { RoomPage, roomMetadata, type RoomSearch } from '@/components/worlds/room-page';
import World from '@/components/worlds/gaslight-no-9';

const SLUG = 'gaslight-no-9';

export const generateMetadata = () => roomMetadata(SLUG);

export default function GaslightNo9Page({ searchParams }: { searchParams: RoomSearch }) {
	return <RoomPage slug={SLUG} searchParams={searchParams} World={World} />;
}
