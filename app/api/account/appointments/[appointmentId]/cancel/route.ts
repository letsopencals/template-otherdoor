import '@/lib/opencals';
import { AppointmentService } from '@opencals/storefront-sdk';
import { requireAuth } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { handleApiError } from '@/lib/api-error-handler';
import { publicPayload } from '@/lib/public-payload';

export async function PUT(
	_request: NextRequest,
	{ params }: { params: Promise<{ appointmentId: string }> },
) {
	const { appointmentId } = await params;
	const auth = await requireAuth();
	if (auth.error) return auth.error;

	try {
		const { data } = await AppointmentService.cancel({
			path: { appointmentId },
			body: { notifyCustomer: true },
			headers: auth.headers,
		});
		// Places changed: the Floor, events and slot-rack ranges are cached under this tag.
		revalidateTag('availability');
		return NextResponse.json(publicPayload(data));
	} catch (err) {
		return handleApiError(err);
	}
}
