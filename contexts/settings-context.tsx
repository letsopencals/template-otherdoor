'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { StorePublicSettings } from '@opencals/storefront-sdk';
import { siteConfig } from '@/lib/site-config';

interface SettingsContextValue {
	settings: StorePublicSettings | null;
	currency: string;
	timeFormat: '12H' | '24H';
	dateFormat: string;
	loading: boolean;
}

const SettingsContext = createContext<SettingsContextValue>({
	settings: null,
	currency: siteConfig.currency,
	timeFormat: '24H',
	dateFormat: 'DD/MM/YYYY',
	loading: true,
});

export function SettingsProvider({
	children,
	initialSettings = null,
}: {
	children: ReactNode;
	initialSettings?: StorePublicSettings | null;
}) {
	// Settings are fetched on the server and passed in, so there's no loading
	// flash and no client fetch on mount. Value is memoized to keep the context
	// stable across parent re-renders.
	const value = useMemo<SettingsContextValue>(
		() => ({
			settings: initialSettings,
			currency: initialSettings?.currency ?? siteConfig.currency,
			timeFormat: initialSettings?.settings?.timeFormat ?? '24H',
			dateFormat: initialSettings?.settings?.dateFormat ?? 'DD.MM.YYYY',
			loading: false,
		}),
		[initialSettings],
	);

	return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
	return useContext(SettingsContext);
}
