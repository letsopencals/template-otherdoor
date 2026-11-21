import type { Metadata } from 'next';
import { getCatalogue } from '@/lib/server-data';
import { sigilRooms } from '@/lib/sigils';
import { DoorsOpened } from '@/components/account/doors-opened';

export const metadata: Metadata = { title: 'Doors opened', robots: { index: false, follow: false } };

export default async function AccountPage() {
	return <DoorsOpened rooms={sigilRooms(await getCatalogue())} />;
}
