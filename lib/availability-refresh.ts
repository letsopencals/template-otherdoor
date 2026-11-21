import { mutate } from 'swr';

/** The client's availability keys (SWR), shared by the booking panel, /book, Tonight, workshops and the move picker. */
export const AVAILABILITY_KEYS = ['/api/rooms/availability', '/api/workshops/availability'] as const;

/**
 * Re-read availability after the customer's own booking changes it (add, remove, cancel, move), so a
 * session they just took (or released) doesn't stay on offer from SWR's cache. Only mounted keys refetch;
 * the routes send `no-cache`, so the browser asks the server (whose cache the route handlers revalidated).
 */
export function refreshAvailability(): void {
	for (const key of AVAILABILITY_KEYS) void mutate(key);
}
