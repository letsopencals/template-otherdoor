/**
 * Test-only builders for SDK-shaped data. Imported by `*.test.ts` files only.
 */
import type {
	CurrentAvailabilitySlot,
	LocationDetailResponse,
	ProductCollectionResponse,
	ProductListItemResponse,
	ProductListVariant,
	ProductListVariantLocation,
	ProductListVariantStaffMember,
	StaffMemberListItemResponse,
} from '@opencals/storefront-sdk';
import type { Series } from '@/lib/catalog';

type Loc = Pick<ProductListVariantLocation, 'id' | 'slug' | 'title' | 'type'>;
type Staff = Pick<ProductListVariantStaffMember, 'id' | 'slug' | 'firstName' | 'lastName'>;

export const LOC: Record<string, Loc> = {
	southBeach: { id: 'loc-south-beach', slug: 'afterglow-south-beach', title: 'Afterglow South Beach', type: 'physical' },
	wynwood: { id: 'loc-wynwood', slug: 'afterglow-wynwood', title: 'Afterglow Wynwood', type: 'physical' },
};

export const STAFF: Record<string, Staff> = {
	valentina: { id: 'staff-valentina-cruz', slug: 'valentina-cruz', firstName: 'Valentina', lastName: 'Cruz' },
	dante: { id: 'staff-dante-rivers', slug: 'dante-rivers', firstName: 'Dante', lastName: 'Rivers' },
	luca: { id: 'staff-luca-romano', slug: 'luca-romano', firstName: 'Luca', lastName: 'Romano' },
	ava: { id: 'staff-ava-lin', slug: 'ava-lin', firstName: 'Ava', lastName: 'Lin' },
};

export function variant(o: {
	id: string;
	slug: string;
	productId: string;
	title: string;
	variantTitle: string;
	price: number;
	duration: number;
	maxAttendees: number;
	loc: Loc;
	staff: Staff[];
	color?: ProductListVariant['color'];
}): ProductListVariant {
	return {
		id: o.id,
		productId: o.productId,
		storeId: 'store',
		slug: o.slug,
		scheduleId: 'sch',
		productPoolId: null,
		title: o.title,
		variantTitle: o.variantTitle,
		description: '',
		imageId: '',
		color: o.color ?? 'rose',
		price: o.price,
		duration: o.duration,
		maxAttendees: o.maxAttendees,
		status: 'active',
		image: null,
		staffMembers: o.staff.map((s) => ({ ...s, storeId: 'store', scheduleId: 'sch', imageId: '', image: null, locations: [] })),
		locations: [
			{
				...o.loc,
				storeId: 'store',
				scheduleId: null,
				description: null,
				link: null,
				addressLine1: null,
				addressLine2: null,
				city: null,
				state: null,
				postalCode: null,
				country: null,
				addressPlaceId: null,
				latitude: null,
				longitude: null,
				address: null,
				staffMembers: [],
			},
		],
		schedule: null,
		images: [],
		collections: [],
		productPool: null,
	} as unknown as ProductListVariant;
}

export function group(productId: string, title: string, variants: ProductListVariant[], extra: Partial<ProductListItemResponse> = {}): ProductListItemResponse {
	const first = variants[0]!;
	return {
		id: first.id,
		productId,
		slug: first.slug,
		title,
		variantTitle: first.variantTitle,
		description: `${title} description`,
		imageId: '',
		color: first.color,
		price: first.price,
		duration: first.duration,
		maxAttendees: first.maxAttendees,
		advanceScheduleThreshold: 0,
		cancelGap: 43200,
		variants,
		...extra,
	} as ProductListItemResponse;
}

export function location(l: Loc): LocationDetailResponse {
	return { ...l, link: l.type === 'online' ? 'https://meet.example/live' : null, products: [], staffMembers: [], availabilities: [] } as unknown as LocationDetailResponse;
}

export function staffMember(s: Staff, locs: Loc[], productIds: string[] = []): StaffMemberListItemResponse {
	return {
		...s,
		storeId: 'store',
		scheduleId: 'sch',
		imageId: '',
		image: null,
		schedule: null,
		products: productIds.map((id) => ({ id, productId: id })),
		locations: locs,
	} as unknown as StaffMemberListItemResponse;
}

export function collection(slug: string, productIds: string[]): ProductCollectionResponse {
	return {
		id: `col-${slug}`,
		storeId: 'store',
		title: slug,
		description: '',
		slug,
		isVisible: true,
		products: productIds.map((id) => ({ id, productId: id })),
	} as unknown as ProductCollectionResponse;
}

/** A merged-availability range from a UTC start ISO string and a length in minutes. */
export function slot(startIso: string, minutes: number, attendees = 0, maxAttendees = 12): CurrentAvailabilitySlot {
	const start = new Date(startIso);
	const end = new Date(start.getTime() + minutes * 60_000);
	const d = (x: Date) => x.toISOString().slice(0, 10);
	const t = (x: Date) => x.toISOString().slice(11, 19);
	return { productId: 'p', fromDate: d(start), fromTime: t(start), toDate: d(end), toTime: t(end), attendees, maxAttendees, staffMemberIds: null, locationIds: null };
}

export function series(o: Partial<Series> & Pick<Series, 'id' | 'offeringKey'>): Series {
	const site = { id: 'loc-south-beach', slug: 'afterglow-south-beach', key: 'south-beach', name: 'Afterglow South Beach', nickname: 'South Beach', online: false };
	const coach = { id: 'staff-valentina-cruz', slug: 'valentina-cruz', name: 'Valentina Cruz', firstName: 'Valentina', image: null };
	return {
		slug: o.id,
		productId: `group-${o.offeringKey}`,
		kind: 'class',
		category: 'sculpt',
		tone: 'sculpt',
		title: o.offeringKey,
		variantTitle: 'South Beach · Valentina',
		set: 'mirror-hall',
		site,
		sites: [site],
		coach,
		coaches: [coach],
		capacity: 10,
		price: 32,
		duration: 60 * 60,
		allowCustomDuration: false,
		maxDuration: null,
		images: [],
		color: 'rose',
		advanceThreshold: 0,
		cancelGap: 43200,
		...o,
	};
}
