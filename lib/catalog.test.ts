import { describe, expect, it } from 'vitest';
import { buildCatalog, classKeyForSlug, findCoach, findSite, offeringKeyForSlug, serviceKeyForSlug } from '@/lib/catalog';
import { LOC, STAFF, collection, group, location, staffMember, variant } from '@/lib/test-fixtures';

const v = (slug: string, productId: string, title: string, o: Partial<Parameters<typeof variant>[0]> = {}) =>
	variant({ id: slug, slug, productId, title, variantTitle: '', price: 36, duration: 3000, maxAttendees: 14, loc: LOC.southBeach!, staff: [STAFF.valentina!], ...o });

const labVal = v('glute-lab-south-beach-valentina', 'group-glute-lab', 'Glute Lab');
const absLuca = v('abs-club-south-beach-luca', 'group-abs-club', 'Abs Club', { staff: [STAFF.luca!], duration: 1800 });
const ringDante = v('ring-rounds-wynwood-dante', 'group-ring-rounds', 'Ring Rounds', { loc: LOC.wynwood!, staff: [STAFF.dante!], maxAttendees: 12 });
const ptCoach = v('pt-coach', 'group-physique-coaching', 'Physique Coaching 1:1', { maxAttendees: 1, duration: 1800, staff: [STAFF.luca!] });
const ptHead = v('pt-head', 'group-physique-coaching', 'Physique Coaching 1:1', { maxAttendees: 1, duration: 1800, staff: [STAFF.valentina!, STAFF.dante!] });
const golden = v('golden-hour-shoot', 'group-golden-hour-shoot', 'Golden Hour Shoot', { maxAttendees: 1, duration: 2700, staff: [STAFF.ava!] });
const wall = v('studio-wall-hire', 'group-studio-wall-hire', 'Studio Wall Hire', { maxAttendees: 1, loc: LOC.wynwood!, staff: [] });
const tableSB = v('bar-table-south-beach', 'group-bar-table', 'Afterglow Bar Table', { maxAttendees: 6, duration: 2700, staff: [] });
const tableW = v('cafe-table-wynwood', 'group-bar-table', 'Afterglow Bar Table', { maxAttendees: 4, duration: 2700, staff: [], loc: LOC.wynwood! });
const sunset = v('event-sunset-sessions', 'group-event-sunset-sessions', 'Sunset Sessions', { maxAttendees: 40, duration: 7200 });

const catalog = buildCatalog({
	products: [
		group('group-glute-lab', 'Glute Lab', [labVal]),
		group('group-abs-club', 'Abs Club', [absLuca]),
		group('group-ring-rounds', 'Ring Rounds', [ringDante]),
		group('group-physique-coaching', 'Physique Coaching 1:1', [ptCoach, ptHead]),
		group('group-golden-hour-shoot', 'Golden Hour Shoot', [golden]),
		group('group-studio-wall-hire', 'Studio Wall Hire', [wall]),
		group('group-bar-table', 'Afterglow Bar Table', [tableSB, tableW]),
		group('group-event-sunset-sessions', 'Sunset Sessions', [sunset]),
	],
	collections: [
		collection('sculpt', ['group-glute-lab', 'group-abs-club']),
		collection('box', ['group-ring-rounds']),
		collection('coaching', ['group-physique-coaching']),
		collection('content', ['group-golden-hour-shoot']),
		// the dataset files the wall under glow; site copy moves it to content
		collection('glow', ['group-studio-wall-hire']),
		collection('bar', ['group-bar-table']),
		collection('events', ['group-event-sunset-sessions']),
	],
	staff: [
		staffMember(STAFF.valentina!, [LOC.southBeach!]),
		staffMember(STAFF.luca!, [LOC.southBeach!]),
		staffMember(STAFF.dante!, [LOC.wynwood!]),
		staffMember(STAFF.ava!, [LOC.southBeach!]),
	],
	locations: [location(LOC.southBeach!), location(LOC.wynwood!)],
});

describe('slug keys', () => {
	it('maps variant slugs to class, service and event keys', () => {
		expect(classKeyForSlug('glute-lab-south-beach-valentina')).toBe('glute-lab');
		expect(classKeyForSlug('ride-after-dark-wynwood-jaylen')).toBe('ride-after-dark');
		expect(serviceKeyForSlug('pt-senior')).toBe('physique-coaching');
		expect(serviceKeyForSlug('compression-wynwood')).toBe('compression-lounge');
		expect(serviceKeyForSlug('cafe-table-wynwood')).toBe('bar-table');
		expect(offeringKeyForSlug('event-creator-night')).toBe('event-creator-night');
		expect(classKeyForSlug('unknown-thing')).toBeNull();
	});
});

describe('buildCatalog', () => {
	it('groups class series with their own site, coach and set', () => {
		const lab = catalog.classes.find((c) => c.key === 'glute-lab')!;
		expect(lab.kind).toBe('class');
		expect(lab.category).toBe('sculpt');
		expect(lab.tone).toBe('sculpt');
		expect(lab.series[0]!.set).toBe('mirror-hall');
		expect(lab.series.map((s) => [s.site?.key, s.coach?.slug])).toEqual([['south-beach', 'valentina-cruz']]);
		expect(catalog.classes.find((c) => c.key === 'ring-rounds')!.series[0]!.set).toBe('ring');
	});

	it('books coaching tiers, shoots, the wall and tables in the service booker', () => {
		const pt = catalog.services.find((s) => s.key === 'physique-coaching')!;
		expect(pt.kind).toBe('service');
		expect(pt.series.map((s) => s.slug)).toEqual(['pt-coach', 'pt-head']);
		expect(pt.coachIds).toEqual(expect.arrayContaining(['staff-luca-romano', 'staff-valentina-cruz', 'staff-dante-rivers']));
		expect(catalog.services.find((s) => s.key === 'golden-hour-shoot')?.series[0]?.set).toBe('rooftop');
		expect(catalog.services.find((s) => s.key === 'studio-wall-hire')?.category).toBe('content');
		expect(catalog.services.find((s) => s.key === 'bar-table')?.series).toHaveLength(2);
	});

	it('keeps events apart', () => {
		expect(catalog.events.map((e) => e.key)).toEqual(['event-sunset-sessions']);
	});

	it('orders people coaches first, then crew', () => {
		expect(catalog.coaches.map((c) => c.slug)).toEqual(['dante-rivers', 'valentina-cruz', 'luca-romano', 'ava-lin']);
		expect(findCoach(catalog, 'staff-ava-lin')?.meta?.role).toBe('photographer');
	});

	it('finds sites by key and lists what runs there', () => {
		expect(findSite(catalog, 'wynwood')?.offeringKeys).toEqual(expect.arrayContaining(['ring-rounds', 'studio-wall-hire', 'bar-table']));
		expect(findSite(catalog, 'afterglow-south-beach')?.key).toBe('south-beach');
	});
});
