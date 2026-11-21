import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCatalogue } from '@/lib/server-data';
import { sigilRooms } from '@/lib/sigils';
import { siteConfig } from '@/lib/site-config';
import { PreviewScreen } from '@/components/preview/preview-screens';

export const metadata: Metadata = { title: 'Preview', robots: { index: false, follow: false } };

const SCREENS = ['thank-you', 'account', 'cart'];

type Params = Promise<{ screen: string }>;

/** Post-booking screens with fixture data, for design review and screenshots. Dev only unless OTHERDOOR_PREVIEW=1. */
export default async function PreviewPage({ params }: { params: Params }) {
	const { screen } = await params;
	const enabled = process.env.NODE_ENV === 'development' || process.env[siteConfig.previewEnv] === '1';
	if (!enabled || !SCREENS.includes(screen)) notFound();
	return (
		<>
			<PreviewScreen screen={screen} rooms={sigilRooms(await getCatalogue())} />
			<nav className="wrap flex justify-center gap-4 pb-12 text-sm">
				{SCREENS.map((s) => (
					<Link key={s} href={`/preview/${s}`} className={s === screen ? 'link text-ink' : 'link text-ink-3'}>
						{s}
					</Link>
				))}
			</nav>
		</>
	);
}
