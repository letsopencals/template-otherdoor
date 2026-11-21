import { describe, expect, it } from 'vitest';
import { doorsForMood } from '@/lib/doors';
import { ROOM_ORDER, roomPresentation } from '@/lib/site-config';

const doors = ROOM_ORDER.map((slug, i) => {
	const p = roomPresentation(slug)!;
	return { slug, number: i + 1, moods: p.moods, difficulty: p.difficulty, fear: p.fear };
});

describe('the corridor', () => {
	it('has the six Otherdoor rooms in door order', () => {
		expect(ROOM_ORDER).toEqual(['jaguar-temple', 'gaslight-no-9', 'protocol-zero', 'kepler-station', 'hotel-lumiere', 'clockmakers-workshop']);
		expect(roomPresentation('kepler-station')).toMatchObject({ epic: true, gameMinutes: 90, players: [4, 8], venue: 'otherdoor-leith' });
	});
	it('moves matching doors to the front for a mood', () => {
		const future = doorsForMood(doors, 'future');
		expect(future.filter((d) => d.match).map((d) => d.door.slug)).toEqual(['protocol-zero', 'kepler-station']);
		expect(future).toHaveLength(6);
	});
	it('sorts hardest and scariest first', () => {
		expect(doorsForMood(doors, 'hardest')[0]!.door.slug).toBe('kepler-station');
		expect(doorsForMood(doors, 'scariest')[0]!.door.slug).toBe('protocol-zero');
	});
});
