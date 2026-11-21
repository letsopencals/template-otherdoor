'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface ShotListUi {
	open: boolean;
	setOpen: (open: boolean) => void;
	/** Bumps on every add, so the header count can tick and the frame can flash. */
	flashKey: number;
	flash: () => void;
}

const ShotListUiContext = createContext<ShotListUi | null>(null);

/** Open state of the Shot List drawer (the cart), shared by the header and every booking surface. */
export function ShotListUiProvider({ children }: { children: ReactNode }) {
	const [open, setOpen] = useState(false);
	const [flashKey, setFlashKey] = useState(0);
	const flash = useCallback(() => setFlashKey((k) => k + 1), []);
	const value = useMemo(() => ({ open, setOpen, flashKey, flash }), [open, flashKey, flash]);
	return <ShotListUiContext.Provider value={value}>{children}</ShotListUiContext.Provider>;
}

export function useShotListUi(): ShotListUi {
	const ctx = useContext(ShotListUiContext);
	if (!ctx) throw new Error('useShotListUi must be used inside ShotListUiProvider');
	return ctx;
}
