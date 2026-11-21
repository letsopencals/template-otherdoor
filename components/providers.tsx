'use client';

import type { StorePublicSettings } from '@opencals/storefront-sdk';
import { SessionProvider } from 'next-auth/react';
import { CartProvider } from '@/contexts/cart-context';
import { TimezoneProvider } from '@/contexts/timezone-context';
import { SettingsProvider } from '@/contexts/settings-context';
import { SatchelUiProvider } from '@/contexts/satchel-ui-context';

export function Providers({ children, initialSettings = null }: { children: React.ReactNode; initialSettings?: StorePublicSettings | null }) {
	return (
		<SessionProvider>
			<SettingsProvider initialSettings={initialSettings}>
				<TimezoneProvider>
					<CartProvider>
						<SatchelUiProvider>{children}</SatchelUiProvider>
					</CartProvider>
				</TimezoneProvider>
			</SettingsProvider>
		</SessionProvider>
	);
}
