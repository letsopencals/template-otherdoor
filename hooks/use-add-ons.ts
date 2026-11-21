'use client';

import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';
import type { AddOnListItemResponse } from '@opencals/storefront-sdk';
import { fetcher } from '@/lib/fetcher';

/** Add-ons offered with one product (by slug), plus the visitor's picks (id → quantity). */
export function useAddOns(slug: string | null) {
	const { data, isLoading } = useSWR<AddOnListItemResponse[]>(slug ? `/api/products/${slug}/add-ons` : null, fetcher, { revalidateOnFocus: false, dedupingInterval: 60_000 });
	const [picked, setPicked] = useState<Record<string, number>>({});
	const addOns = useMemo(() => (Array.isArray(data) ? data : []), [data]);
	const setQuantity = useCallback((id: string, q: number) => setPicked((p) => {
		const next = { ...p };
		if (q <= 0) delete next[id];
		else next[id] = q;
		return next;
	}), []);
	const reset = useCallback(() => setPicked({}), []);
	/** Only picks still offered. */
	const selection = useMemo(() => addOns.filter((a) => picked[a.id]).map((a) => ({ addOnId: a.id, quantity: picked[a.id]! })), [addOns, picked]);
	return { addOns, loading: isLoading, picked, setQuantity, reset, selection };
}
