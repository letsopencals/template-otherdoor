'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import type { CheckoutQuestionResponse, CustomerProviderCatalogItem, PaymentProviderName } from '@opencals/storefront-sdk';
import { useCheckout } from '@/contexts/checkout-context';
import { useCart } from '@/contexts/cart-context';
import { expeditionOf } from '@/lib/expedition';
import { grossSubtotal, linePrice, visibleDiscounts } from '@/lib/satchel';
import { codeState } from '@/lib/discount-state';
import { formatPrice } from '@/lib/format';
import { LuggageTag } from '@/components/satchel/luggage-tag';
import s from './letter.module.css';

const StripePayment = dynamic(() => import('./stripe-payment').then((m) => m.StripePayment), {
	ssr: false,
	loading: () => <p className="mt-4 text-sm text-sepia">Opening the card form…</p>,
});

const title = (q: CheckoutQuestionResponse) => q.translations?.[0]?.title ?? q.internalName;

/** The sentence a question is written into on the letter (by its title; unknown questions get a plain label). */
function phrase(q: CheckoutQuestionResponse): { before: string; after?: string } {
	const t = title(q).toLowerCase();
	if (t.includes('team name')) return { before: 'We travel under the name of', after: ',' };
	if (t.includes('occasion')) return { before: 'and we come on the occasion of', after: '.' };
	if (t.includes('experience')) return { before: 'As to our experience:', after: '.' };
	if (t.includes('anything') || t.includes('know')) return { before: 'You should know:' };
	return { before: `${title(q)}:` };
}

function QuestionLine({ q, value, onChange, disabled }: { q: CheckoutQuestionResponse; value: string; onChange: (v: string) => void; disabled: boolean }) {
	const p = phrase(q);
	const options = q.translations?.[0]?.options ?? [];
	const label = title(q);
	const req = q.required ? (
		<span className={s.req} aria-hidden>
			*
		</span>
	) : null;
	if (q.type === 'multi-line-text-field') {
		return (
			<span className="block">
				{p.before}
				{req}
				<textarea className={s.area} aria-label={label} value={value} required={q.required} disabled={disabled} onChange={(e) => onChange(e.target.value)} placeholder={q.translations?.[0]?.description || ''} />
			</span>
		);
	}
	if ((q.type === 'dropdown' || q.type === 'checkbox') && options.length) {
		return (
			<span>
				{p.before}{' '}
				<select className={s.line} aria-label={label} value={value} required={q.required} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
					<option value="">choose…</option>
					{options.map((o) => (
						<option key={o} value={o}>
							{o}
						</option>
					))}
				</select>
				{req}
				{p.after ?? ''}{' '}
			</span>
		);
	}
	return (
		<span>
			{p.before}{' '}
			<input className={s.line} aria-label={label} value={value} required={q.required} disabled={disabled} onChange={(e) => onChange(e.target.value)} placeholder={label.toLowerCase().includes('team') ? 'the Lost Lanterns' : ''} size={Math.max(12, value.length + 2)} />
			{req}
			{p.after ?? ''}{' '}
		</span>
	);
}

function methodCopy(p: CustomerProviderCatalogItem): { label: string; note: string; action: string } {
	if (p.checkoutMode === 'internal') return { label: p.displayName || 'Card', note: 'Pay now by card. Secure, through Stripe.', action: 'Continue to card' };
	if (p.checkoutMode === 'redirect') return { label: p.displayName, note: p.description ?? 'You’ll be taken to finish payment.', action: 'Continue to payment' };
	if (p.name === 'bank_transfer') return { label: p.displayName || 'Bank transfer', note: p.description ?? 'We email the details; the booking is held until it arrives.', action: 'Send the letter' };
	return { label: p.displayName || 'Pay at the venue', note: p.description ?? 'Pay when you arrive, by card or cash.', action: 'Send the letter' };
}

function Part({ n, title: head, done, onEdit, children, locked }: { n: string; title: string; done?: boolean; onEdit?: () => void; children: ReactNode; locked?: boolean }) {
	return (
		<section className={`${s.part} ${locked ? s.locked : ''}`} aria-disabled={locked || undefined}>
			<h2 className={s.partHead}>
				<span>
					{n} · {head}
				</span>
				{done && onEdit ? (
					<button type="button" onClick={onEdit} className="font-[var(--font-ui)] text-sm normal-case tracking-normal text-patina underline">
						Amend
					</button>
				) : null}
			</h2>
			{children}
		</section>
	);
}

/**
 * Checkout as a Letter of Passage: one page. The satchel tags are clipped on top;
 * the team's answers are written into the letter's lines, then the bearer signs,
 * then the passage fee. One primary action per part.
 */
export function LetterOfPassage() {
	const c = useCheckout();
	const { cart, applyDiscountCode, discountCodeError } = useCart();
	const [method, setMethod] = useState<PaymentProviderName | null>(null);
	const [code, setCode] = useState('');
	const signed = c.step === 'payment-select' || c.step === 'payment';
	const chosen = method ?? (c.providers.length === 1 ? (c.providers[0]?.name ?? null) : null);
	const total = formatPrice(cart?.total ?? 0);
	const items = c.items;
	const cs = codeState(cart);

	if (!cart && !c.checkoutComplete) {
		return (
			<div className={s.page}>
				<div className="wrap py-24 text-center">
					<p className="font-display text-3xl">Unpacking your satchel…</p>
				</div>
			</div>
		);
	}

	return (
		<div className={s.page}>
			<div className="wrap">
				<div className="flex flex-wrap items-baseline justify-between gap-3">
					<p className="folio folio-left flex-1">The Letter of Passage</p>
					<HoldNote seconds={c.timeRemaining} onExtend={c.extendCart} />
				</div>
				<div className={`${s.tags} ${s.clip}`} aria-label="In your satchel">
					{items.map((it, i) => (
						<LuggageTag key={it.id} compact tilt={i % 2 ? 1 : -1} e={expeditionOf({ ...(it.appointment ?? { id: it.id, from: '', to: '' }), addOns: it.addOnItems?.map((a) => ({ addOn: a.addOn })) } as never)} price={linePrice(it)} />
					))}
				</div>

				<article className={s.letter}>
					<div className={s.crest}>
						<div>
							<p className="engraved text-sepia">The Gilded Compass · Edinburgh</p>
							<p className={s.salutation}>To the Keepers of the Society,</p>
						</div>
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src="/compass-mark.svg" alt="" width={64} height={64} className="hidden sm:block" />
					</div>
					<p className="text-[1.05rem] leading-relaxed">
						We, the undersigned, request passage for {items.length} {items.length === 1 ? 'expedition' : 'expeditions'} as tagged above, and give the following account of ourselves.
					</p>

					<form onSubmit={c.handleSign}>
						{c.questions.length ? (
							<Part n="I" title="Of our party" done={signed} onEdit={() => c.setStep('customer')}>
								<p className={`${s.prose} mt-3`}>
									{c.questions
										.slice()
										.sort((a, b) => a.order - b.order)
										.map((q) => (
											<QuestionLine key={q.id} q={q} value={c.answers[q.id] ?? ''} disabled={signed || c.submitting} onChange={(v) => c.setAnswers((a) => ({ ...a, [q.id]: v }))} />
										))}
								</p>
							</Part>
						) : null}

						<Part n={c.questions.length ? 'II' : 'I'} title="The bearer" done={signed} onEdit={() => c.setStep('customer')}>
							<p className={`${s.prose} mt-3`}>
								Signed,{' '}
								<input className={s.line} aria-label="First name" autoComplete="given-name" required value={c.firstName} disabled={signed || c.submitting || Boolean(c.customerId)} onChange={(e) => c.setFirstName(e.target.value)} placeholder="first name" size={Math.max(10, c.firstName.length + 2)} />{' '}
								<input className={s.line} aria-label="Last name" autoComplete="family-name" required value={c.lastName} disabled={signed || c.submitting || Boolean(c.customerId)} onChange={(e) => c.setLastName(e.target.value)} placeholder="last name" size={Math.max(10, c.lastName.length + 2)} />
								{c.fieldErrors.firstName || c.fieldErrors.lastName ? <span className={s.fieldErr}>{c.fieldErrors.firstName ?? c.fieldErrors.lastName}</span> : null}
								, to whom the society may write at{' '}
								<input className={s.line} aria-label="Email" type="email" autoComplete="email" required value={c.email} disabled={signed || c.submitting || Boolean(c.customerId)} onChange={(e) => c.setEmail(e.target.value)} placeholder="your email" size={Math.max(18, c.email.length + 2)} />
								.
								{c.fieldErrors.email ? <span className={s.fieldErr}>{c.fieldErrors.email}</span> : null}
							</p>
							{c.customerId ? <p className={s.signed}>Signed in: your logbook keeps this expedition.</p> : <p className={s.signed}>The invitation and your Explorer’s Logbook go to this email. No password, ever.</p>}
							{!signed ? (
								<div className={s.sealRow}>
									<button type="submit" className="plate" disabled={c.submitting || c.isExpired}>
										{c.submitting ? 'Sealing…' : 'Seal the letter'}
									</button>
									<span className="text-sm text-sepia">Then choose how to pay the passage fee.</span>
								</div>
							) : null}
						</Part>
					</form>

					<Part n={c.questions.length ? 'III' : 'II'} title="The passage fee" locked={!signed}>
						<div className={s.ledger}>
							<div>
								<span>Expeditions &amp; extras</span>
								<span>{formatPrice(grossSubtotal(items))}</span>
							</div>
							{visibleDiscounts(cart).map((d) => (
								<div key={d.id}>
									<span>
										{d.title}
										{d.code ? ` (${d.code})` : ''}
									</span>
									<span>−{formatPrice(d.totalAmount)}</span>
								</div>
							))}
							<div className={s.ledgerTotal}>
								<span>Total</span>
								<span>{total}</span>
							</div>
						</div>
						{cs.status === 'none' ? (
							<form
								className="mt-4 flex flex-wrap items-center gap-2 font-[var(--font-ui)]"
								onSubmit={async (e) => {
									e.preventDefault();
									if (code.trim() && (await applyDiscountCode(code.trim()))) setCode('');
								}}
							>
								<label className="typed text-sm" htmlFor="pscode">
									P.S. A society code:
								</label>
								<input id="pscode" className={`${s.line} !min-w-[9ch] uppercase`} value={code} onChange={(e) => setCode(e.target.value)} />
								<button type="submit" className="plate plate-ghost plate-sm">
									Apply
								</button>
								{discountCodeError ? <span className={s.fieldErr}>{discountCodeError.message ?? 'That code didn’t work.'}</span> : null}
							</form>
						) : cs.status === 'outranked' ? (
							<p className="typed mt-3 text-sm">P.S. Code {cs.code} kept on file: a better offer already applies.</p>
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
												<button type="button" className="plate plate-sm mt-3" onClick={() => void c.handleStartCheckout('cash')}>
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
														<span className="block text-sm text-sepia">{m.note}</span>
													</span>
												</label>
											);
										})}
									</div>
									<div className={s.sealRow}>
										<button type="submit" className="plate plate-gold" disabled={!chosen || c.submitting || c.isExpired}>
											{c.submitting ? 'Sending…' : chosen ? `${methodCopy(c.providers.find((p) => p.name === chosen)!).action} · ${total}` : 'Choose how to pay'}
										</button>
									</div>
								</form>
							) : (
								<p className="mt-4 text-sm">No payment methods are switched on for this store yet.</p>
							)
						) : (
							<p className="mt-4 text-sm text-sepia">Seal the letter above first.</p>
						)}
					</Part>

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

					<p className="typed mt-10 text-[0.85rem] text-sepia">
						Free to move or cancel from your logbook until 24 hours before. Arrive 15 minutes early for the briefing.{' '}
						<Link href="/faq" className="underline">
							Questions
						</Link>
					</p>
					<span className={`wax ${s.seal}`} aria-hidden>
						G
					</span>
				</article>
			</div>
		</div>
	);
}

function HoldNote({ seconds, onExtend }: { seconds: number | null; onExtend: () => void }) {
	if (seconds === null) return null;
	const m = Math.floor(Math.max(0, seconds) / 60);
	const sec = Math.max(0, seconds) % 60;
	return (
		<p className="typed text-sm">
			{seconds > 0 ? (
				<>
					Sessions held for {m}:{String(sec).padStart(2, '0')}
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
