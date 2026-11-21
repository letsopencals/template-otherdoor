import '@/lib/opencals';
import { NextResponse } from 'next/server';
import { getWorkshopRanges } from '@/lib/server-data';

/** Free windows with seats per workshop slug, cached 60 s with the `availability` tag. */
export async function GET() {
	const ranges = await getWorkshopRanges();
	return NextResponse.json(ranges, { headers: { 'Cache-Control': 'private, max-age=30' } });
}
