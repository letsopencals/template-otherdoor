import { describe, expect, it } from 'vitest';
import { visitOf, partyLabel } from '@/lib/visit';

describe('visitOf', () => {
	it('reads a room booking: team from the variant slug, call time 15 min before', () => {
		const e = visitOf({ id: 'a1', from: '2026-11-28T19:30:00Z', to: '2026-11-28T21:00:00Z', product: { slug: 'jaguar-temple-4p', title: 'The Jaguar Temple', variantTitle: '4 players' }, location: { slug: 'otherdoor-vaults', title: 'The Vaults' }, addOns: [{ addOn: { title: 'Victory Bottle' } }] });
		expect(e).toMatchObject({ kind: 'room', key: 'jaguar-temple', team: 4, venueName: 'Otherdoor Vaults', addOns: ['Victory Bottle'] });
		expect(new Date(e.call).toISOString()).toBe('2026-11-28T19:15:00.000Z');
		expect(partyLabel(e)).toBe('4 players');
	});
	it('reads a workshop booking with seats', () => {
		const e = visitOf({ id: 'w1', from: '2026-11-26T19:00:00Z', to: '2026-11-26T20:00:00Z', numberOfAttendees: 3, product: { slug: 'lockpicking-101', title: 'Lockpicking 101' } });
		expect(e.kind).toBe('workshop');
		expect(partyLabel(e)).toBe('3 seats');
	});
});
