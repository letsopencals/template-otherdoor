import { describe, expect, it } from 'vitest';
import { distinctVariant } from '@/lib/booking-meta';

describe('distinctVariant', () => {
	it('drops a variant that only names the site and the person', () => {
		expect(distinctVariant('Collingwood · Jo', 'Jo Mercer', 'Mettle Collingwood · The Engine House')).toBeNull();
		expect(distinctVariant('Wynwood', null, 'Afterglow Wynwood')).toBeNull();
	});

	it('keeps a variant that says something new', () => {
		expect(distinctVariant('Head Coach', 'Kai Nakamura', 'Mettle Cremorne · The Yard')).toBe('Head Coach');
		expect(distinctVariant('Wynwood · Booth 2', null, 'Afterglow Wynwood')).toBe('Wynwood · Booth 2');
	});

	it('is null without a variant', () => {
		expect(distinctVariant(null, 'Jo Mercer')).toBeNull();
	});
});
