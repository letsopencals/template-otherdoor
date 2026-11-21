import { describe, expect, it } from 'vitest';
import { awaitingOf, awaitingOfAll, paymentLabel, safeInvoiceUrl } from '@/lib/booking-state';

describe('awaitingOf', () => {
	it('waits only on pending with a reason', () => {
		expect(awaitingOf({ status: 'pending', pendingReason: 'awaiting_payment' })).toBe('awaiting_payment');
		expect(awaitingOf({ status: 'pending', pendingReason: 'awaiting_approval' })).toBe('awaiting_approval');
	});
	it('treats pending without a reason (auto-confirm in flight) and scheduled as confirmed', () => {
		expect(awaitingOf({ status: 'pending', pendingReason: null })).toBeNull();
		expect(awaitingOf({ status: 'pending' })).toBeNull();
		expect(awaitingOf({ status: 'scheduled', pendingReason: 'awaiting_approval' })).toBeNull();
		expect(awaitingOf(null)).toBeNull();
	});
	it('puts payment first across an order', () => {
		expect(awaitingOfAll([{ status: 'pending', pendingReason: 'awaiting_approval' }, { status: 'pending', pendingReason: 'awaiting_payment' }])).toBe('awaiting_payment');
		expect(awaitingOfAll([{ status: 'scheduled' }, { status: 'pending', pendingReason: null }])).toBeNull();
	});
});

describe('paymentLabel', () => {
	it('never returns a blank or raw value', () => {
		expect(paymentLabel({ paymentStatus: 'voided' })).toBe('Cancelled — not charged');
		expect(paymentLabel({ isFullyPaid: true, paymentStatus: 'paid' })).toBe('Paid');
		expect(paymentLabel({ paymentStatus: 'partially-paid' })).toBe('Part paid');
		expect(paymentLabel({ paymentStatus: 'unpaid' })).toBe('Payment due');
		// @ts-expect-error a status newer than the SDK union still reads as due
		expect(paymentLabel({ paymentStatus: 'something-new' })).toBe('Payment due');
	});
});

describe('safeInvoiceUrl', () => {
	it('keeps https links only', () => {
		expect(safeInvoiceUrl('https://invoice.stripe.com/i/x')).toBe('https://invoice.stripe.com/i/x');
		expect(safeInvoiceUrl('javascript:alert(1)')).toBeNull();
		expect(safeInvoiceUrl(null)).toBeNull();
	});
});
