import { describe, expect, it } from 'vitest';
import { editsState, rollStats, splitRoll } from '@/lib/roll';
import type { BookingView } from '@/lib/booking-view';

const H = 3_600_000;
const now = Date.parse('2026-11-04T17:00:00Z');
const shot = { kind: 'photos' as const, label: 'Photo Set', deliverable: '', spec: '10 edits', eta: '48 h' };
const roll = { kind: 'roll' as const, label: 'Raw Camera Roll', deliverable: '', spec: 'All frames', eta: '24 h' };

const v = (id: string, startOffsetH: number, o: Partial<BookingView> = {}): BookingView =>
	({ id, start: now + startOffsetH * H, end: now + (startOffsetH + 1) * H, status: 'scheduled', awaiting: null, booked: true, shots: [], setName: 'Mirror Hall', ...o }) as BookingView;

describe('splitRoll', () => {
	it('splits upcoming, shot and cancelled, newest shot first', () => {
		const s = splitRoll(
			[v('a', 5), v('b', -30), v('c', -2), v('d', 10, { status: 'canceled' }), v('e', 2, { status: 'pending', booked: false }), v('f', 3, { status: 'pending', awaiting: 'awaiting_payment' })],
			now,
		);
		expect(s.upcoming.map((x) => x.id)).toEqual(['f', 'a']);
		expect(s.shot.map((x) => x.id)).toEqual(['c', 'b']);
		expect(s.cancelled.map((x) => x.id)).toEqual(['d']);
	});
});

describe('editsState', () => {
	it('is none without shots', () => {
		expect(editsState(v('a', -5), now)).toEqual({ kind: 'none' });
	});
	it('treats a shoot as always delivering', () => {
		expect(editsState({ ...v('s', -60), category: 'content' }, now)).toEqual({ kind: 'sent' });
	});
	it('has no edits for a studio hire, where the customer shoots themselves', () => {
		expect(editsState({ ...v('s', -60), category: 'content', offeringKey: 'studio-wall-hire' }, now)).toEqual({ kind: 'none' });
	});
	it('is in the edit until the longest turnaround passes, then sent', () => {
		const recent = v('a', -5, { shots: [shot, roll] });
		expect(editsState(recent, now)).toEqual({ kind: 'editing', dueAt: recent.end + 48 * H });
		expect(editsState(v('b', -60, { shots: [shot] }), now)).toEqual({ kind: 'sent' });
	});
});

describe('rollStats', () => {
	it('counts sessions, shots and distinct sets', () => {
		expect(rollStats([v('a', -5, { shots: [shot, roll] }), v('b', -30, { setName: 'Neon Room' }), v('c', -40)])).toEqual({ sessions: 3, shots: 2, sets: 2 });
	});
});
