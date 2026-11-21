'use client';

import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { type Appearance, type StripeElementsOptions, type StripeError, loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';

// House tokens as hex (Stripe's iframe can't read CSS variables).
const APPEARANCE: Appearance = {
	theme: 'night',
	variables: {
		colorPrimary: '#F2C46D',
		colorBackground: '#15121E',
		colorText: '#F1ECF4',
		colorTextSecondary: '#A99FB7',
		colorDanger: '#FF8A98',
		fontFamily: '"Mona Sans", system-ui, sans-serif',
		fontSizeBase: '15px',
		borderRadius: '9px',
	},
	rules: {
		'.Input': { border: '1px solid rgba(232,222,255,.16)', boxShadow: 'none', padding: '12px' },
		'.Input:focus': { border: '1px solid #F2C46D', boxShadow: '0 0 0 3px rgba(242,196,109,.18)' },
		'.Label': { fontWeight: '500', color: '#C3BACD' },
		'.Tab--selected': { border: '1px solid #F2C46D' },
	},
};
const FONTS: StripeElementsOptions['fonts'] = [{ cssSrc: 'https://fonts.googleapis.com/css2?family=Mona+Sans:wght@400;500;600&display=swap' }];

/** Stripe card form. Loaded with next/dynamic; the publishable key comes only from checkout start. */
export function StripePayment({ clientSecret, stripeAccountId, publishableKey, onSuccess, onError, disabled, payLabel, fallback }: { clientSecret: string; stripeAccountId?: string | null; publishableKey?: string | null; onSuccess: (paymentIntentId: string) => void; onError: (message: string) => void; disabled?: boolean; payLabel: string; fallback?: ReactNode }) {
	const stripePromise = useMemo(() => (publishableKey ? loadStripe(publishableKey, { stripeAccount: stripeAccountId ?? undefined }) : null), [publishableKey, stripeAccountId]);
	const options = useMemo<StripeElementsOptions>(() => ({ clientSecret, appearance: APPEARANCE, fonts: FONTS }), [clientSecret]);
	if (!stripePromise) {
		return (
			<div role="alert" className="rounded-[10px] bg-[#ff4358]/10 p-4 text-sm shadow-[inset_2px_0_0_#ff4358]">
				Card payments aren’t switched on for this store yet{process.env.NODE_ENV === 'development' ? ' (connect Stripe in the Opencals dashboard)' : ''}.
				{fallback}
			</div>
		);
	}
	return (
		<Elements stripe={stripePromise} options={options}>
			<PayForm onSuccess={onSuccess} onError={onError} disabled={disabled} payLabel={payLabel} />
		</Elements>
	);
}

function PayForm({ onSuccess, onError, disabled, payLabel }: { onSuccess: (id: string) => void; onError: (m: string) => void; disabled?: boolean; payLabel: string }) {
	const stripe = useStripe();
	const elements = useElements();
	const [busy, setBusy] = useState(false);
	const pay = async (e: FormEvent) => {
		e.preventDefault();
		if (!stripe || !elements || busy || disabled) return;
		setBusy(true);
		try {
			const { error, paymentIntent } = await stripe.confirmPayment({ elements, redirect: 'if_required' });
			if (error) onError((error as StripeError).message ?? 'Payment failed');
			else if (paymentIntent?.id) onSuccess(paymentIntent.id);
			else onError('The payment didn’t confirm. Try again.');
		} catch (err) {
			onError(err instanceof Error ? err.message : 'Payment failed');
		} finally {
			setBusy(false);
		}
	};
	return (
		<form onSubmit={pay}>
			<PaymentElement options={{ layout: 'tabs' }} />
			<button type="submit" className="btn btn-lg btn-block mt-5" disabled={!stripe || busy || disabled}>
				{busy ? 'Sealing the payment…' : `Pay ${payLabel}`}
			</button>
			<p className="mt-3 text-xs text-ink-3">Card details go straight to Stripe, encrypted. We never see your card number.</p>
		</form>
	);
}
