'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import type { CheckoutQuestionResponse, CustomerProviderCatalogItem, PaymentProviderName } from '@opencals/storefront-sdk';
import { useCheckout } from '@/contexts/checkout-context';
import { useCart } from '@/contexts/cart-context';
import { visitOf } from '@/lib/visit';
import { grossSubtotal, linePrice, visibleDiscounts } from '@/lib/cart-lines';
import { codeState } from '@/lib/discount-state';
import { formatPrice } from '@/lib/format';
import { DoorCard } from '@/components/cart/door-card';
import { DoorArt } from '@/components/doors/door-art';
import { roomPresentation } from '@/lib/site-config';
import s from './checkout.module.css';

const StripePayment = dynamic(() => import('./stripe-payment').then((m) => m.StripePayment), {
	ssr: false,
	loading: () => <p className="mt-4 text-sm text-ink-3">Opening the card form…</p>,
});

const title = (q: CheckoutQuestionResponse) => q.translations?.[0]?.title ?? q.internalName;

function Question({ q, value, onChange, disabled }: { q: CheckoutQuestionResponse; value: string; onChange: (v: string) => void; disabled: boolean }) {
	const options = q.translations?.[0]?.options ?? [];
	const label = title(q);
	const hint = q.translations?.[0]?.description || '';
	const id = `q-${q.id}`;
	// A file or a star rating can't be answered in this form; the store asks for those another way.
	if (q.type === 'file-upload' || q.type === 'rating') return null;
	if (q.type === 'checkbox' && !options.length) {
		return (
			<label className={s.check} htmlFor={id}>
				<input id={id} type="checkbox" required={q.required} disabled={disabled} checked={value === 'true'} onChange={(e) => onChange(e.target.checked ? 'true' : '')} />
				<span className={s.fieldLabel}>
					{label}
					{q.required ? <span className={s.req}> *</span> : null}
					{hint ? <span className={s.checkHint}>{hint}</span> : null}
				</span>
			</label>
		);
	}
	return (
		<label className={s.field} htmlFor={id}>
			<span className={s.fieldLabel}>
				{label}
				{q.required ? <span className={s.req}> *</span> : <span className={s.opt}> optional</span>}
			</span>
			{q.type === 'multi-line-text-field' ? (
				<textarea id={id} className={`${s.input} ${s.area}`} value={value} required={q.required} disabled={disabled} onChange={(e) => onChange(e.target.value)} placeholder={hint} />
			) : (q.type === 'dropdown' || q.type === 'checkbox') && options.length ? (
				<select id={id} className={s.input} value={value} required={q.required} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
					<option value="">Choose…</option>
					{options.map((o) => (
						<option key={o} value={o}>
							{o}
						</option>
					))}
				</select>
			) : (
				<input id={id} className={s.input} value={value} required={q.required} disabled={disabled} onChange={(e) => onChange(e.target.value)} placeholder={label.toLowerCase().includes('team') ? 'e.g. Escape Velocity' : hint} />
			)}
		</label>
	);
}

function methodCopy(p: CustomerProviderCatalogItem): { label: string; note: string; action: string } {
	if (p.checkoutMode === 'internal') return { label: p.displayName || 'Card', note: 'Pay now by card. Secure, through Stripe.', action: 'Continue to card' };
	if (p.checkoutMode === 'redirect') return { label: p.displayName, note: p.description ?? 'You’ll be taken to finish payment.', action: 'Continue to payment' };
	if (p.name === 'bank_transfer') return { label: p.displayName || 'Bank transfer', note: p.description ?? 'We email the details; the booking is held until it arrives.', action: 'Confirm booking' };
	return { label: p.displayName || 'Pay at the venue', note: p.description ?? 'Pay when you arrive, by card or cash.', action: 'Confirm booking' };
}

function Block({ n, head, note, done, onEdit, children, locked }: { n: string; head: string; note?: string; done?: boolean; onEdit?: () => void; children: ReactNode; locked?: boolean }) {
	return (
		<section className={s.block} data-locked={locked || undefined}>
			<div className={s.blockHead}>
				<span className={s.blockNum}>{n}</span>
				<div className="min-w-0 flex-1">
					<h2>{head}</h2>
					{note ? <p className={s.blockNote}>{note}</p> : null}
				</div>
				{done && onEdit ? (
					<button type="button" onClick={onEdit} className="link text-sm text-ink-2">
						Edit
					</button>
				) : null}
			</div>
			<div className={s.blockBody}>{children}</div>
		</section>
	);
}

/**
 * Checkout on one dark page: the doors you picked across the top, then your
 * team (the store's questions), contact, and payment, top to bottom. Not an
 * accordion and no sticky summary: one primary action per block.
 */
export function CheckoutView() {
	const c = useCheckout();
	const { cart: liveCart, applyDiscountCode, discountCodeError } = useCart();
	const [method, setMethod] = useState<PaymentProviderName | null>(null);
	const [code, setCode] = useState('');
	// Placing the order empties the cart before the thank-you page loads: keep showing the doors
	// being confirmed (not "Free" and an empty ledger) until the redirect.
	const [kept, setKept] = useState(liveCart);
	useEffect(() => {
		if (liveCart?.items?.length) setKept(liveCart);
	}, [liveCart]);
	const placing = (c.submitting || c.checkoutComplete) && !liveCart?.items?.length;
	const cart = placing ? kept : liveCart;
	const signed = c.step === 'payment-select' || c.step === 'payment';
	const chosen = method ?? (c.providers.length === 1 ? (c.providers[0]?.name ?? null) : null);
	const total = formatPrice(cart?.total ?? 0);
	const items = placing ? (kept?.items ?? []) : c.items;
	const cs = codeState(cart);

	if (!cart && !c.checkoutComplete) {
		return (
			<div className="wrap py-40 text-center">
				<p className="font-display text-3xl text-ink-2">Opening your doors…</p>
			</div>
		);
	}

	return (
		<div className={`pool ${s.page}`}>
			<div className="wrap">
				<div className={s.top}>
					<div>
						<p className="label">Checkout</p>
						<h1 className={s.h1}>
							{items.length} {items.length === 1 ? 'door' : 'doors'}, one step away.
						</h1>
					</div>
					<HoldNote seconds={c.timeRemaining} onExtend={c.extendCart} />
				</div>
				<div className={s.cards} aria-label="Your doors">
					{items.map((it) => (
						<DoorCard key={it.id} compact v={visitOf({ ...(it.appointment ?? { id: it.id, from: '', to: '' }), addOns: it.addOnItems?.map((a) => ({ addOn: a.addOn })) } as never)} price={linePrice(it)} />
					))}
				</div>

				<div className={s.layout}>
				<div className={s.flow}>
					<form onSubmit={c.handleSign} className="contents">
						{c.questions.length ? (
							<Block n="01" head="Your team" note="Helps your game master set the room." done={signed} onEdit={() => c.setStep('customer')}>
								<div className={s.fields}>
									{c.questions
										.slice()
										.sort((a, b) => a.order - b.order)
										.map((q) => (
											<Question key={q.id} q={q} value={c.answers[q.id] ?? ''} disabled={signed || c.submitting} onChange={(v) => c.setAnswers((a) => ({ ...a, [q.id]: v }))} />
										))}
								</div>
							</Block>
						) : null}

						<Block n={c.questions.length ? '02' : '01'} head="Contact" note="Your confirmation and account go to this email. No password, ever." done={signed} onEdit={() => c.setStep('customer')}>
							<div className={`${s.fields} ${s.two}`}>
								<label className={s.field}>
									<span className={s.fieldLabel}>First name</span>
									<input className={s.input} autoComplete="given-name" required value={c.firstName} disabled={signed || c.submitting || Boolean(c.customerId)} onChange={(e) => c.setFirstName(e.target.value)} />
									{c.fieldErrors.firstName ? <span className={s.err}>{c.fieldErrors.firstName}</span> : null}
								</label>
								<label className={s.field}>
									<span className={s.fieldLabel}>Last name</span>
									<input className={s.input} autoComplete="family-name" required value={c.lastName} disabled={signed || c.submitting || Boolean(c.customerId)} onChange={(e) => c.setLastName(e.target.value)} />
									{c.fieldErrors.lastName ? <span className={s.err}>{c.fieldErrors.lastName}</span> : null}
								</label>
								<label className={`${s.field} ${s.wide}`}>
									<span className={s.fieldLabel}>Email</span>
									<input className={s.input} type="email" autoComplete="email" required value={c.email} disabled={signed || c.submitting || Boolean(c.customerId)} onChange={(e) => c.setEmail(e.target.value)} />
									{c.fieldErrors.email ? <span className={s.err}>{c.fieldErrors.email}</span> : null}
								</label>
							</div>
							{c.customerId ? <p className="mt-3 text-sm text-ink-3">Signed in: this booking goes to your account.</p> : null}
							{!signed ? (
								<div className="mt-6">
									<button type="submit" className="btn btn-lg" disabled={c.submitting || c.isExpired}>
										{c.submitting ? 'Saving…' : 'Continue to payment'}
									</button>
								</div>
							) : null}
						</Block>
					</form>

					<Block n={c.questions.length ? '03' : '02'} head="Payment" locked={!signed}>
						<div className={s.ledger}>
							<div>
								<span>Rooms and extras</span>
								<span>{formatPrice(grossSubtotal(items))}</span>
							</div>
							{visibleDiscounts(cart).map((d) => (
								<div key={d.id}>
									<span>
										{d.title}
										{d.code && d.code.toUpperCase() !== d.title.toUpperCase() ? ` (${d.code})` : ''}
									</span>
									<span>−{formatPrice(d.totalAmount)}</span>
								</div>
							))}
							<div className={s.ledgerTotal}>
								<span>Total</span>
								<span>{total}</span>
							</div>
						</div>
						{/* A code changes the total, so it's closed once the card payment has been set up for that total. */}
						{cs.status === 'none' && c.step !== 'payment' ? (
							<form
								className={s.code}
								onSubmit={async (e) => {
									e.preventDefault();
									if (code.trim() && (await applyDiscountCode(code.trim()))) setCode('');
								}}
							>
								<input aria-label="Discount code" placeholder="Discount code" className={s.input} value={code} onChange={(e) => setCode(e.target.value)} />
								<button type="submit" className="btn btn-glass btn-sm">
									Apply
								</button>
								{discountCodeError ? <span className={s.err}>{discountCodeError.message ?? 'That code didn’t work.'}</span> : null}
							</form>
						) : cs.status === 'outranked' ? (
							<p className="mt-3 text-sm text-ink-3">Code {cs.code} saved: a better offer already applies.</p>
						) : null}

						{signed ? (
							c.step === 'payment' && c.paymentData?.clientSecret ? (
								<div className="mt-6">
									<StripePayment
										clientSecret={c.paymentData.clientSecret}
										stripeAccountId={c.paymentData.stripeAccountId}
										publishableKey={c.paymentData.publishableKey}
										payLabel={total}
										disabled={c.isExpired || c.submitting}
										onSuccess={(id) => void c.handleSubmitCheckout(id)}
										onError={(m) => c.setError(m)}
										fallback={
											c.providers.some((p) => p.name === 'cash') ? (
												<button type="button" className="btn btn-glass btn-sm mt-3" onClick={() => void c.handleStartCheckout('cash')}>
													Pay at the venue instead
												</button>
											) : null
										}
									/>
								</div>
							) : c.providers.length ? (
								<form
									className="mt-6"
									onSubmit={(e) => {
										e.preventDefault();
										if (chosen) void c.handleStartCheckout(chosen);
									}}
								>
									<div className={s.methods} role="radiogroup" aria-label="How to pay">
										{c.providers.map((p) => {
											const m = methodCopy(p);
											return (
												<label key={p.name} className={s.method}>
													<input type="radio" name="method" checked={chosen === p.name} onChange={() => setMethod(p.name)} />
													<span>
														<b>{m.label}</b>
														<span className="block text-sm text-ink-3">{m.note}</span>
													</span>
												</label>
											);
										})}
									</div>
									<div className="mt-6">
										<button type="submit" className="btn btn-lg" disabled={!chosen || c.submitting || c.isExpired}>
											{c.submitting ? 'Confirming…' : chosen ? `${methodCopy(c.providers.find((p) => p.name === chosen)!).action} · ${total}` : 'Choose how to pay'}
										</button>
									</div>
								</form>
							) : (
								<p className="mt-4 text-sm text-ink-2">No payment methods are switched on for this store yet.</p>
							)
						) : (
							<p className="mt-4 text-sm text-ink-3">Add your contact details first.</p>
						)}
					</Block>

					{c.error ? (
						<div className={s.banner} role="alert">
							{c.error}
							{c.errorCode === 'CART_EXPIRED' ? (
								<button type="button" className="ml-2 underline" onClick={c.restartFromBoard}>
									Pick new times
								</button>
							) : null}
						</div>
					) : null}

					<p className="mt-8 text-[0.85rem] text-ink-3">
						Free to move or cancel from your account until 24 hours before. Arrive 15 minutes early.{' '}
						<Link href="/faq" className="link">
							Questions
						</Link>
					</p>
				</div>
				<FirstDoor items={items} />
				</div>
			</div>
		</div>
	);
}

function HoldNote({ seconds, onExtend }: { seconds: number | null; onExtend: () => void }) {
	if (seconds === null) return null;
	const m = Math.floor(Math.max(0, seconds) / 60);
	const sec = Math.max(0, seconds) % 60;
	return (
		<p className="mono text-[0.82rem] text-ink-2">
			{seconds > 0 ? (
				<>
					Held for {m}:{String(sec).padStart(2, '0')}
					{seconds < 240 ? (
						<button type="button" className="ml-2 underline" onClick={onExtend}>
							Hold longer
						</button>
					) : null}
				</>
			) : (
				'Your hold has run out.'
			)}
		</p>
	);
}

/** Beside the form: the first door you picked, standing open (decoration, not a summary). */
function FirstDoor({ items }: { items: ReturnType<typeof useCheckout>['items'] }) {
	const it = items[0];
	if (!it?.appointment) return null;
	const v = visitOf({ ...it.appointment, addOns: [] } as never);
	const media = roomPresentation(v.key)?.media;
	return (
		<aside className={s.aside} aria-hidden style={{ '--slit': v.palette.glow } as CSSProperties}>
			<div className={s.asideFrame}>
				<DoorArt sources={[media?.key, media?.poster]} alt="" glow={v.palette.glow} className={s.asideArt} />
				<span className={s.asideLeaf} />
			</div>
			<span className={`slit ${s.asideSill}`} />
			<p className={s.asideCaption}>{v.title}</p>
		</aside>
	);
}
