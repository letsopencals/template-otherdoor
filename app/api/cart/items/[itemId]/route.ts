import '@/lib/opencals';
import { CartService } from '@opencals/storefront-sdk';
import { getAccessToken } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { handleApiError } from '@/lib/api-error-handler';
import { publicPayload } from '@/lib/public-payload';

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ itemId: string }> },
) {
	const { itemId } = await params;

	try {
		const token = await getAccessToken();
		const { data } = await CartService.removeItem({ path: { itemId }, headers: { Authorization: `Bearer ${token ?? ''}` } });
		// Places changed: the Floor, events and slot-rack ranges are cached under this tag.
		revalidateTag('availability');
		return NextResponse.json(publicPayload(data));
	} catch (err) {
		return handleApiError(err);
	}
}
