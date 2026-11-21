import type { Metadata, Viewport } from 'next';
import { Funnel_Display, Mona_Sans, Spline_Sans_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { Providers } from '@/components/providers';
import { Header } from '@/components/shell/header';
import { Footer } from '@/components/shell/footer';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { getCatalogue, getStoreSettings } from '@/lib/server-data';
import { doorRooms } from '@/lib/doors';
import { siteConfig } from '@/lib/site-config';
import './globals.css';

const funnel = Funnel_Display({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], variable: '--font-funnel', display: 'swap' });
const mona = Mona_Sans({ subsets: ['latin'], variable: '--font-mona', display: 'swap' });
const splineMono = Spline_Sans_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-spline-mono', display: 'swap' });

export const metadata: Metadata = {
	metadataBase: new URL(siteConfig.url),
	title: { default: `${siteConfig.name} · Immersive escape rooms in Edinburgh`, template: `%s · ${siteConfig.name}` },
	description: siteConfig.description,
	openGraph: { siteName: siteConfig.name, type: 'website', locale: 'en_GB' },
};

export const viewport: Viewport = { themeColor: '#0c0a12', width: 'device-width', initialScale: 1, colorScheme: 'dark' };

const jsonLd = {
	'@context': 'https://schema.org',
	'@type': ['EntertainmentBusiness', 'TouristAttraction'],
	name: siteConfig.name,
	slogan: siteConfig.tagline,
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
	const doors = doorRooms(catalogue);
	return (
		<html lang="en-GB" className={`${funnel.variable} ${mona.variable} ${splineMono.variable}`}>
			<body>
				<Providers initialSettings={settings}>
					<Header doors={doors} />
					<main id="main">{children}</main>
					<Footer doors={doors} />
					<CartDrawer />
				</Providers>
				<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
				<Analytics />
			</body>
		</html>
	);
}
