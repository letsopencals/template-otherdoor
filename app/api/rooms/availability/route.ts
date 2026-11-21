import '@/lib/opencals';
import { NextRequest, NextResponse } from 'next/server';
import { getRoomRanges } from '@/lib/server-data';

const SLUG = /^[a-z0-9-]{1,80}$/;

/**
 * Free windows for every room (or `?venue=<location-slug>`), keyed by room slug,
 * across the whole booking horizon. Cached server-side 60 s with the
 * `availability` tag; the client derives days and session times from it.
 */
export async function GET(request: NextRequest) {
	const venue = request.nextUrl.searchParams.get('venue');
	if (venue && !SLUG.test(venue)) return NextResponse.json({ error: 'Invalid venue' }, { status: 400 });
	const ranges = await getRoomRanges(venue || null);
	return NextResponse.json(ranges, { headers: { 'Cache-Control': 'private, max-age=30' } });
}
