import type { Metadata } from 'next';
import { getCatalogue } from '@/lib/server-data';
import { passportRooms } from '@/lib/passport';
import { LogbookView } from '@/components/logbook/logbook-view';

export const metadata: Metadata = { title: 'Explorer’s Logbook', robots: { index: false, follow: false } };

export default async function AccountPage() {
	return <LogbookView rooms={passportRooms(await getCatalogue())} />;
}
