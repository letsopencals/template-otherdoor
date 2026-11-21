'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface SatchelUi {
	open: boolean;
	setOpen: (open: boolean) => void;
	/** Bumps on every add, so the header buckle can flash and the count tick. */
	flashKey: number;
	flash: () => void;
}

const SatchelUiContext = createContext<SatchelUi | null>(null);

/** Open state of the Satchel drawer (the cart), shared by the header and every booking surface. */
export function SatchelUiProvider({ children }: { children: ReactNode }) {
	const [open, setOpen] = useState(false);
	const [flashKey, setFlashKey] = useState(0);
	const flash = useCallback(() => setFlashKey((k) => k + 1), []);
	const value = useMemo(() => ({ open, setOpen, flashKey, flash }), [open, flashKey, flash]);
	return <SatchelUiContext.Provider value={value}>{children}</SatchelUiContext.Provider>;
}

export function useSatchelUi(): SatchelUi {
	const ctx = useContext(SatchelUiContext);
	if (!ctx) throw new Error('useSatchelUi must be used inside SatchelUiProvider');
	return ctx;
}
