'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { signIn as nextAuthSignIn } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { useCart } from '@/contexts/cart-context';
import { usePaymentProviders } from '@/hooks/use-payment-providers';
import { useCheckoutQuestions } from '@/hooks/use-checkout-questions';
import type {
	CustomerProviderCatalogItem,
	CheckoutStartResponse,
	CheckoutResponse,
	SubmitCheckout,
	CartItem,
	CheckoutCustomer,
	CheckoutQuestionAnswer,
	CheckoutQuestionResponse as CheckoutQuestion,
	CheckoutErrorCode,
	CheckoutErrorResponse,
	PaymentProviderName,
	SaveCustomerResponse,
	StartCheckout,
} from '@opencals/storefront-sdk';
import { awaitingOfAll, saveHandoff } from '@/lib/booking-state';
import { bannerMessage, hasFieldErrors, mapFieldErrors, readFieldErrors, type ApiFieldError, type FieldErrors } from '@/lib/field-errors';

export type CheckoutStep = 'customer' | 'questions' | 'payment-select' | 'payment';

/** The talent's fields, by their path in the customer payload (the API's `customer.email` is `email`). */
export type CustomerField = 'email' | 'firstName' | 'lastName';
const CUSTOMER_FIELDS: readonly CustomerField[] = ['email', 'firstName', 'lastName'];

/** A failed save-customer: the API's field errors for the talent's fields, and the banner line for the rest. */
async function customerSaveFailure(res: Response, fallback: string): Promise<{ byField: FieldErrors<CustomerField>; banner: string | null }> {
	const body = (await res.json().catch(() => null)) as { error?: unknown } | null;
	const { byField, unmapped } = mapFieldErrors(readFieldErrors(body), CUSTOMER_FIELDS);
	return { byField, banner: bannerMessage(typeof body?.error === 'string' ? body.error : null, byField, unmapped, fallback) };
}

/** A failed checkout call, with the API's machine-readable `code` (and the order a checked-out cart became). */
class CheckoutRequestError extends Error {
	constructor(
		message: string,
		readonly status: number,
		readonly code?: CheckoutErrorCode,
		readonly orderId?: CheckoutErrorResponse['orderId'],
		readonly fieldErrors: ApiFieldError[] = [],
	) {
		super(message);
		this.name = 'CheckoutRequestError';
	}
}

// Another start/submit of the same cart (a double tap, a second tab) answers 409 CHECKOUT_IN_PROGRESS:
// wait a moment and ask again; once that one has placed the order, the retry returns it.
const IN_PROGRESS_RETRIES = 2;
const RETRY_MS = 1500;

async function postCheckout<T>(url: string, headers: Record<string, string>, body: unknown): Promise<T> {
	for (let attempt = 0; ; attempt++) {
		const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
		if (res.ok) return (await res.json()) as T;
		// `/api/*` error JSON: `error` is the message, `code`/`orderId` come from the API's checkout error body.
		const data = (await res.json().catch(() => ({}))) as { error?: unknown } & Partial<CheckoutErrorResponse>;
		const code = typeof data.code === 'string' ? data.code : undefined;
		if (code === 'CHECKOUT_IN_PROGRESS' && attempt < IN_PROGRESS_RETRIES) {
			await new Promise((r) => setTimeout(r, RETRY_MS));
			continue;
		}
		const message = typeof data.error === 'string' && data.error ? data.error : 'Checkout failed';
		throw new CheckoutRequestError(message, res.status, code, typeof data.orderId === 'string' ? data.orderId : undefined, readFieldErrors(data));
	}
}

interface CheckoutContextValue {
	// State
	step: CheckoutStep;
	error: string | null;
	/** The API's reason for the last checkout failure, e.g. `CART_EXPIRED`. */
	errorCode: CheckoutErrorCode | null;
	submitting: boolean;
	checkoutComplete: boolean;
	/** The API's messages for the talent's fields, shown under each one; a field's clear when it's edited. */
	fieldErrors: FieldErrors<CustomerField>;

	// Customer
	email: string;
	firstName: string;
	lastName: string;
	customerId: string | null;
	setEmail: (v: string) => void;
	setFirstName: (v: string) => void;
	setLastName: (v: string) => void;

	// Questions
	questions: CheckoutQuestion[];
	answers: Record<string, string>;
	setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;

	// Payment
	providers: CustomerProviderCatalogItem[];
	selectedProvider: PaymentProviderName | null;
	paymentData: CheckoutStartResponse | null;

	// Cart info
	items: CartItem[];
	isExpired: boolean;
	timeRemaining: number | null;
	minutes: number | null;
	seconds: number | null;

	// Actions
	setStep: (step: CheckoutStep) => void;
	setError: (error: string | null) => void;
	handleSaveCustomer: (e: React.FormEvent) => Promise<void>;
	handleSaveAnswers: (e: React.FormEvent) => Promise<void>;
	/** The release form: save the customer, then the answers, in one submit. */
	handleSign: (e: React.FormEvent) => Promise<void>;
	handleStartCheckout: (providerName: PaymentProviderName) => Promise<void>;
	handleSubmitCheckout: (stripePaymentIntentId?: string) => Promise<boolean>;
	/** After CART_EXPIRED: drop the cart and go back to the schedule. */
	restartFromSchedule: () => void;
	extendCart: () => void;
}

const CheckoutContext = createContext<CheckoutContextValue | undefined>(undefined);

export function CheckoutProvider({ children }: { children: ReactNode }) {
	const router = useRouter();
	const { data: session } = useSession();
	const { cart, cartId, isLoaded, timeRemaining, extendCart, clearCart } = useCart();

	const [step, setStep] = useState<CheckoutStep>('customer');
	const [error, setError] = useState<string | null>(null);
	const [errorCode, setErrorCode] = useState<CheckoutErrorCode | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [checkoutComplete, setCheckoutComplete] = useState(false);
	const [fieldErrors, setFieldErrors] = useState<FieldErrors<CustomerField>>({});

	// Customer info
	const [email, setEmailValue] = useState('');
	const [firstName, setFirstNameValue] = useState('');
	const [lastName, setLastNameValue] = useState('');
	// Editing a field clears its error.
	const clearFieldError = useCallback((field: CustomerField) => setFieldErrors((f) => (f[field] ? { ...f, [field]: undefined } : f)), []);
	const setEmail = useCallback(
		(v: string) => {
			setEmailValue(v);
			clearFieldError('email');
		},
		[clearFieldError],
	);
	const setFirstName = useCallback(
		(v: string) => {
			setFirstNameValue(v);
			clearFieldError('firstName');
		},
		[clearFieldError],
	);
	const setLastName = useCallback(
		(v: string) => {
			setLastNameValue(v);
			clearFieldError('lastName');
		},
		[clearFieldError],
	);
	const [customerId, setCustomerId] = useState<string | null>(null);
	const [prefilled, setPrefilled] = useState(false);

	// Pre-fill from session
	useEffect(() => {
		if (session?.customer && !prefilled) {
			if (session.customer.id) setCustomerId(session.customer.id);
			if (session.customer.email) setEmailValue(session.customer.email);
			if (session.customer.firstName) setFirstNameValue(session.customer.firstName);
			if (session.customer.lastName) setLastNameValue(session.customer.lastName);
			setPrefilled(true);
		}
	}, [session, prefilled]);

	// Questions (cart-scoped) and payment providers (cart-aware) both load in
	// parallel via SWR — independent of the customer-save step, so there's no
	// sequential fetch waterfall. `answers` stays local to this step machine.
	const questions = useCheckoutQuestions(cartId);
	const providers = usePaymentProviders(cartId);
	const [answers, setAnswers] = useState<Record<string, string>>({});

	// Payment
	const [selectedProvider, setSelectedProvider] = useState<PaymentProviderName | null>(null);
	const [paymentData, setPaymentData] = useState<CheckoutStartResponse | null>(null);

	// Redirect if no cart — but only once CartProvider has read the stored cart id
	// from localStorage. Before that cartId is always null, so a hard reload of
	// /checkout would otherwise bounce to /schedule.
	useEffect(() => {
		if (isLoaded && !cartId && !checkoutComplete) {
			router.replace('/schedule');
		}
	}, [isLoaded, cartId, checkoutComplete, router]);

	const cartHeaders = useCallback(
		(): Record<string, string> =>
			cartId
				? { 'X-Cart-Id': cartId, 'Content-Type': 'application/json' }
				: { 'Content-Type': 'application/json' },
		[cartId],
	);

	// Step 1: Save customer info
	const handleSaveCustomer = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			setError(null);
			setFieldErrors({});
			setSubmitting(true);

			try {
				const customerPayload: CheckoutCustomer = customerId
					? { customer: { kind: 'existing', customerId } }
					: { customer: { kind: 'new', email, firstName: firstName || undefined, lastName: lastName || undefined } };

				const res = await fetch('/api/checkout/save-customer', {
					method: 'POST',
					headers: cartHeaders(),
					body: JSON.stringify(customerPayload),
				});

				if (!res.ok) {
					const failure = await customerSaveFailure(res, 'Failed to save customer info');
					setFieldErrors(failure.byField);
					setError(failure.banner);
					return;
				}

				const saveResult: SaveCustomerResponse = await res.json();
				if (saveResult.customerId) {
					setCustomerId(saveResult.customerId);
				}

				// Questions are already loaded in parallel via SWR — just branch on them
				// (no sequential fetch here).
				setStep(questions.length > 0 ? 'questions' : 'payment-select');
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : 'An error occurred');
			} finally {
				setSubmitting(false);
			}
		},
		[email, firstName, lastName, customerId, cartHeaders, questions.length],
	);

	// Step 2: Save question answers
	const handleSaveAnswers = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			setError(null);
			setSubmitting(true);

			try {
				// The API wants the question text alongside each answer (kept as a historical record).
				const answerArray: CheckoutQuestionAnswer[] = questions
					.filter((q) => answers[q.id] !== undefined && answers[q.id] !== '')
					.map((q) => ({
						questionId: q.id,
						question: q.translations?.[0]?.title ?? q.internalName,
						answer: answers[q.id] as string,
					}));

				const res = await fetch('/api/checkout/save-answers', {
					method: 'POST',
					headers: cartHeaders(),
					body: JSON.stringify({ answers: answerArray }),
				});

				if (!res.ok && res.status !== 204) {
					throw new Error('Failed to save answers');
				}

				setStep('payment-select');
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : 'An error occurred');
			} finally {
				setSubmitting(false);
			}
		},
		[answers, questions, cartHeaders],
	);

	// Release form: customer + answers in one go (same calls as steps 1 and 2, in order).
	const handleSign = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			setError(null);
			setFieldErrors({});
			setSubmitting(true);
			try {
				const customerPayload: CheckoutCustomer = customerId
					? { customer: { kind: 'existing', customerId } }
					: { customer: { kind: 'new', email, firstName: firstName || undefined, lastName: lastName || undefined } };
				const res = await fetch('/api/checkout/save-customer', { method: 'POST', headers: cartHeaders(), body: JSON.stringify(customerPayload) });
				if (!res.ok) {
					const failure = await customerSaveFailure(res, 'We couldn’t save your details');
					setFieldErrors(failure.byField);
					setError(failure.banner);
					return;
				}
				const saveResult: SaveCustomerResponse = await res.json().catch(() => ({}));
				if (saveResult.customerId) setCustomerId(saveResult.customerId);

				const answerArray: CheckoutQuestionAnswer[] = questions
					.filter((q) => answers[q.id] !== undefined && answers[q.id] !== '')
					.map((q) => ({ questionId: q.id, question: q.translations?.[0]?.title ?? q.internalName, answer: answers[q.id] as string }));
				if (answerArray.length) {
					const r2 = await fetch('/api/checkout/save-answers', { method: 'POST', headers: cartHeaders(), body: JSON.stringify({ answers: answerArray }) });
					if (!r2.ok && r2.status !== 204) throw new Error('We couldn’t save your answers');
				}
				setStep('payment-select');
			} catch (err: unknown) {
				setError(err instanceof Error ? err.message : 'An error occurred');
			} finally {
				setSubmitting(false);
			}
		},
		[customerId, email, firstName, lastName, cartHeaders, questions, answers],
	);

	// Turns a failed start/submit into the right next step. True when it navigated away.
	const onCheckoutError = useCallback(
		(err: unknown): boolean => {
			if (!(err instanceof CheckoutRequestError)) {
				setError(err instanceof Error ? err.message : 'An error occurred');
				return false;
			}
			if (err.code === 'CART_ALREADY_CHECKED_OUT') {
				// This shot list is already booked (another tab, a retried request): show that booking.
				setCheckoutComplete(true);
				clearCart();
				router.push(err.orderId ? `/thank-you?orderId=${encodeURIComponent(err.orderId)}` : '/thank-you');
				return true;
			}
			setErrorCode(err.code ?? null);
			// A field of the talent's the API rejected: back to the form, the message under that field.
			const { byField, unmapped } = mapFieldErrors(err.fieldErrors, CUSTOMER_FIELDS);
			if (hasFieldErrors(byField)) {
				setFieldErrors(byField);
				setStep('customer');
				setError(bannerMessage(err.message, byField, unmapped, 'Checkout failed'));
				return false;
			}
			switch (err.code) {
				case 'CART_EXPIRED':
					setError('Your hold ran out and one of these spots was taken. Pick a new time and we’ll hold it again.');
					break;
				case 'CHECKOUT_IN_PROGRESS':
					setError('We’re still processing this booking. Give it a few seconds, then try again.');
					break;
				case 'PAYMENT_NOT_AUTHORIZED':
					setError('Your card wasn’t authorised and nothing was charged. Try again, or use another card.');
					break;
				default:
					setError(err.message);
			}
			return false;
		},
		[clearCart, router],
	);

	// Step 4: Submit checkout. Resolves true once the order is placed (the page is on its way to the call
	// sheet); false when it failed and the error is on screen.
	const handleSubmitCheckout = useCallback(
		async (stripePaymentIntentId?: string): Promise<boolean> => {
			setError(null);
			setErrorCode(null);
			setSubmitting(true);

			try {
				const submitPayload: SubmitCheckout = {
					appointmentsSettings: { markAsScheduled: true },
				};
				if (stripePaymentIntentId) {
					submitPayload.stripePaymentIntentId = stripePaymentIntentId;
				}

				const data = await postCheckout<CheckoutResponse>('/api/checkout/submit', cartHeaders(), submitPayload);

				// Auto-authenticate customer if tokens returned
				if (data.auth?.accessToken) {
					await nextAuthSignIn('checkout-token', {
						accessToken: data.auth.accessToken,
						refreshToken: data.auth.refreshToken,
						redirect: false,
					});
				}

				const orderId = data.order?.id ?? '';
				if (orderId) {
					saveHandoff(orderId, {
						instructions: data.paymentInstructions ?? null,
						awaiting: awaitingOfAll((data.order?.lineItems ?? []).map((li) => li.appointment)),
					});
				}
				setCheckoutComplete(true);
				clearCart();
				router.push(orderId ? `/thank-you?orderId=${encodeURIComponent(orderId)}` : '/thank-you');
				return true;
			} catch (err: unknown) {
				if (!onCheckoutError(err)) setSubmitting(false);
				return false;
			}
		},
		[cartHeaders, clearCart, router, onCheckoutError],
	);

	// Step 3: Start checkout with the chosen provider, then route on how that provider takes money:
	// a card form (`internal`), a redirect, or nothing to collect online (`manual`: desk, bank transfer,
	// invoice; `none`: nothing to pay), which places the order straight away.
	const handleStartCheckout = useCallback(
		async (providerName: PaymentProviderName) => {
			setError(null);
			setErrorCode(null);
			setSubmitting(true);
			setSelectedProvider(providerName);

			let placed = false;
			try {
				const startPayload: StartCheckout = { provider: providerName };
				if (customerId) {
					startPayload.customer = { kind: 'existing', customerId };
				}

				const data = await postCheckout<CheckoutStartResponse>('/api/checkout/start', cartHeaders(), startPayload);
				setPaymentData(data);

				// Key off the RESPONSE provider: when nothing is collectible the backend overrides the
				// requested one (e.g. Stripe) with "no payment required".
				const responseProvider = data.provider;
				const mode = responseProvider === 'no_payment_required'
					? 'none'
					: (providers.find((p) => p.name === responseProvider) ?? providers.find((p) => p.name === providerName))?.checkoutMode;
				if (responseProvider !== providerName) setSelectedProvider(responseProvider);

				if (mode === 'manual' || mode === 'none') {
					placed = await handleSubmitCheckout();
				} else if (data.redirectUrl) {
					placed = true;
					window.location.href = data.redirectUrl;
				} else {
					setStep('payment');
				}
			} catch (err: unknown) {
				placed = onCheckoutError(err);
			} finally {
				// Back buttons and spinners never stay stuck: only a page on its way out keeps the flag.
				if (!placed) setSubmitting(false);
			}
		},
		[cartHeaders, customerId, providers, handleSubmitCheckout, onCheckoutError],
	);

	/** Leave a hold that expired (a slot was taken meanwhile): drop the cart and go pick a new time. */
	const restartFromSchedule = useCallback(() => {
		clearCart();
		router.push('/schedule');
	}, [clearCart, router]);

	const items = useMemo<CartItem[]>(() => cart?.items ?? [], [cart?.items]);
	const isExpired = timeRemaining !== null && timeRemaining <= 0;
	const minutes = timeRemaining !== null ? Math.floor(timeRemaining / 60) : null;
	const seconds = timeRemaining !== null ? timeRemaining % 60 : null;

	// Memoized so consumers don't re-render on every provider render from an
	// inline object identity change.
	const value = useMemo<CheckoutContextValue>(
		() => ({
			step,
			error,
			errorCode,
			submitting,
			checkoutComplete,
			fieldErrors,
			email,
			firstName,
			lastName,
			customerId,
			setEmail,
			setFirstName,
			setLastName,
			questions,
			answers,
			setAnswers,
			providers,
			selectedProvider,
			paymentData,
			items,
			isExpired,
			timeRemaining,
			minutes,
			seconds,
			setStep,
			setError,
			handleSaveCustomer,
			handleSaveAnswers,
			handleSign,
			handleStartCheckout,
			handleSubmitCheckout,
			restartFromSchedule,
			extendCart,
		}),
		[
			step,
			error,
			errorCode,
			submitting,
			checkoutComplete,
			fieldErrors,
			email,
			firstName,
			lastName,
			customerId,
			setEmail,
			setFirstName,
			setLastName,
			questions,
			answers,
			providers,
			selectedProvider,
			paymentData,
			items,
			isExpired,
			timeRemaining,
			minutes,
			seconds,
			handleSaveCustomer,
			handleSaveAnswers,
			handleSign,
			handleStartCheckout,
			handleSubmitCheckout,
			restartFromSchedule,
			extendCart,
		],
	);

	return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
}

export function useCheckout(): CheckoutContextValue {
	const ctx = useContext(CheckoutContext);
	if (!ctx) {
		throw new Error('useCheckout must be used within CheckoutProvider');
	}
	return ctx;
}
