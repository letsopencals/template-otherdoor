import '@/lib/opencals';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { getServiceRanges } from '@/lib/server-data';

const ID = /^[A-Za-z0-9_-]{1,80}$/;

/**
 * Free windows for one bookable service (optionally one coach, one site)
 * across the whole booking horizon. Cached server-side for 60 s and tagged
 * `availability`; the slot rack derives days and start times from it.
 */
export async function GET(request: NextRequest) {
	const q = request.nextUrl.searchParams;
	const productId = q.get('productId') ?? '';
	const staffMemberId = q.get('staffMemberId');
	const locationId = q.get('locationId');
	if (!ID.test(productId) || (staffMemberId && !ID.test(staffMemberId)) || (locationId && !ID.test(locationId))) {
		return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
	}
	try {
		const ranges = await getServiceRanges({ productId, staffMemberId, locationId });
		return NextResponse.json(ranges, { headers: { 'Cache-Control': 'private, max-age=30' } });
	} catch (err) {
		return handleApiError(err);
	}
}
