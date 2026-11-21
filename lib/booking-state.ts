import type {
	AppointmentStatusType,
	OrderListItemResponse,
	PaymentInstructions,
	StorefrontAppointmentPendingReason,
} from '@opencals/storefront-sdk';

/**
 * Whether a booking still waits for something, and how to pay for it. Pure.
 *
 * A booking waits only when it is `pending` WITH a `pendingReason`. Right after
 * checkout, bookings on a store that confirms automatically are briefly
 * `pending` with no reason while a background job confirms them: those are
 * confirmed, never "waiting".
 */
type Appt = { status?: AppointmentStatusType | null; pendingReason?: StorefrontAppointmentPendingReason | null } | null | undefined;

export type Awaiting = StorefrontAppointmentPendingReason;

export function awaitingOf(a: Appt): Awaiting | null {
	if (!a || a.status !== 'pending' || !a.pendingReason) return null;
	return a.pendingReason === 'awaiting_payment' ? 'awaiting_payment' : 'awaiting_approval';
}

/** Across an order: payment first (it's what the customer has to act on), then approval. */
export function awaitingOfAll(appts: readonly Appt[]): Awaiting | null {
	const reasons = appts.map(awaitingOf);
	if (reasons.includes('awaiting_payment')) return 'awaiting_payment';
	if (reasons.includes('awaiting_approval')) return 'awaiting_approval';
	return null;
}

export function awaitingLabel(r: Awaiting): string {
	return r === 'awaiting_payment' ? 'Awaiting payment' : 'Awaiting the studio’s OK';
}

/** Order payment state in the roll's words. Never blank, never a raw value. */
export function paymentLabel(o: Partial<Pick<OrderListItemResponse, 'isFullyPaid' | 'paymentStatus' | 'refundStatus'>>): string {
	if (o.paymentStatus === 'voided') return 'Cancelled — not charged';
	if (o.refundStatus === 'fully-refunded') return 'Refunded';
	if (o.isFullyPaid || o.paymentStatus === 'paid') return 'Paid';
	if (o.paymentStatus === 'partially-paid') return 'Part paid';
	return 'Payment due';
}

/** Only an https link is ever rendered as "Pay invoice". */
export function safeInvoiceUrl(url: string | null | undefined): string | null {
	return typeof url === 'string' && url.startsWith('https://') ? url : null;
}

// Checkout → thank-you hand-off. Submit returns the payment instructions once; the call
// sheet reads them back from this tab's sessionStorage (a reload keeps them, a new device
// doesn't: then the page points to the email).
const KEY = 'afterglow:checkout:';

export interface CheckoutHandoff {
	instructions: PaymentInstructions | null;
	awaiting: Awaiting | null;
}

export function saveHandoff(orderId: string, h: CheckoutHandoff): void {
	try {
		sessionStorage.setItem(KEY + orderId, JSON.stringify(h));
	} catch {
		// Private mode or storage full: the page falls back to the email.
	}
}

export function readHandoff(orderId: string): CheckoutHandoff | null {
	try {
		const raw = sessionStorage.getItem(KEY + orderId);
		if (!raw) return null;
		const h = JSON.parse(raw) as Partial<CheckoutHandoff>;
		return { instructions: h.instructions ?? null, awaiting: h.awaiting ?? null };
	} catch {
		return null;
	}
}
