import type { OrderDetailResponse } from '@opencals/storefront-sdk';
import { visitOf, type Visit } from '@/lib/visit';

/** Visits of an order (sorted), with each line's add-ons (the order's appointment carries none). */
export function orderVisits(order: OrderDetailResponse | null | undefined): Visit[] {
	return (order?.lineItems ?? [])
		.filter((li) => li.appointment)
		.map((li) => visitOf(li.appointment as never, (li.addOnLineItems ?? []).map((x) => x.addOn?.title ?? '').filter(Boolean)))
		.sort((a, b) => a.start - b.start);
}

/** The team name answered at checkout ("Team name" question), if any. */
export function teamNameOf(order: OrderDetailResponse | null | undefined): string | null {
	for (const li of order?.lineItems ?? []) {
		const answers = (li.appointment as { checkoutQuestionAnswers?: Array<{ question?: string | null; answer?: string | null }> } | null)?.checkoutQuestionAnswers ?? [];
		const hit = answers.find((a) => /team/i.test(a.question ?? '') && a.answer?.trim());
		if (hit?.answer) return hit.answer.trim();
	}
	return null;
}
