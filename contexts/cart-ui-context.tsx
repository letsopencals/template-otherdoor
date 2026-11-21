'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface CartUi {
	open: boolean;
	setOpen: (open: boolean) => void;
	/** Bumps on every add, so the header buckle can flash and the count tick. */
	flashKey: number;
	flash: () => void;
}

const CartUiContext = createContext<CartUi | null>(null);

/** Open state of the Satchel drawer (the cart), shared by the header and every booking surface. */
export function CartUiProvider({ children }: { children: ReactNode }) {
	const [open, setOpen] = useState(false);
	const [flashKey, setFlashKey] = useState(0);
	const flash = useCallback(() => setFlashKey((k) => k + 1), []);
	const value = useMemo(() => ({ open, setOpen, flashKey, flash }), [open, flashKey, flash]);
	return <CartUiContext.Provider value={value}>{children}</CartUiContext.Provider>;
}

export function useCartUi(): CartUi {
	const ctx = useContext(CartUiContext);
	if (!ctx) throw new Error('useCartUi must be used inside CartUiProvider');
	return ctx;
}
