import type { Metadata, Viewport } from 'next';
import { IM_Fell_English, IM_Fell_English_SC, Mulish, Courier_Prime } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { Providers } from '@/components/providers';
import { Header } from '@/components/shell/header';
import { Footer } from '@/components/shell/footer';
import { SatchelDrawer } from '@/components/satchel/satchel-drawer';
import { getCatalogue, getStoreSettings } from '@/lib/server-data';
import { shelfRooms } from '@/lib/shelf';
import { siteConfig } from '@/lib/site-config';
import './globals.css';

const fell = IM_Fell_English({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-fell', display: 'swap' });
const fellSc = IM_Fell_English_SC({ subsets: ['latin'], weight: '400', variable: '--font-fell-sc', display: 'swap' });
const mulish = Mulish({ subsets: ['latin'], variable: '--font-mulish', display: 'swap' });
const courier = Courier_Prime({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-courier', display: 'swap' });

export const metadata: Metadata = {
	metadataBase: new URL(siteConfig.url),
	title: { default: `${siteConfig.name} · Adventure escape rooms in Edinburgh`, template: `%s · ${siteConfig.name}` },
	description: siteConfig.description,
	openGraph: { siteName: siteConfig.name, type: 'website', locale: 'en_GB' },
};

export const viewport: Viewport = { themeColor: '#1e3a30', width: 'device-width', initialScale: 1 };

const jsonLd = {
	'@context': 'https://schema.org',
	'@type': ['EntertainmentBusiness', 'TouristAttraction'],
	name: siteConfig.name,
	description: siteConfig.description,
	url: siteConfig.url,
	email: siteConfig.contact.email,
	telephone: siteConfig.contact.phone,
	priceRange: '££',
	location: Object.values(siteConfig.venues).map((v) => ({
		'@type': 'Place',
		name: v.name,
		address: { '@type': 'PostalAddress', streetAddress: v.address, postalCode: v.postcode, addressLocality: 'Edinburgh', addressCountry: 'GB' },
		geo: { '@type': 'GeoCoordinates', latitude: v.lat, longitude: v.lng },
	})),
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	const [settings, catalogue] = await Promise.all([getStoreSettings(), getCatalogue()]);
	const shelf = shelfRooms(catalogue);
	return (
		<html lang="en-GB" className={`${fell.variable} ${fellSc.variable} ${mulish.variable} ${courier.variable}`}>
			<body>
				{/* Shared SVG filters: ink-bleed for reveals. */}
				<svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
					<filter id="ink-bleed">
						<feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="3" />
						<feDisplacementMap in="SourceGraphic" scale="6" />
					</filter>
				</svg>
				<Providers initialSettings={settings}>
					<Header shelf={shelf} />
					<main id="main">{children}</main>
					<Footer shelf={shelf} />
					<SatchelDrawer />
				</Providers>
				<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
				<Analytics />
			</body>
		</html>
	);
}
