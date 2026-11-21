'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { CartResponse } from '@opencals/storefront-sdk';
import { useCart } from '@/contexts/cart-context';
import { useCartUi } from '@/contexts/cart-ui-context';
import { visitOf } from '@/lib/visit';
import { grossSubtotal, linePrice, visibleDiscounts } from '@/lib/cart-lines';
import { codeState } from '@/lib/discount-state';
import { formatPrice } from '@/lib/format';
import { Drawer } from '@/components/ui/drawer';
import { CloseIcon } from '@/components/shell/icons';
import { DoorCard } from './door-card';
import s from './cart.module.css';

/** "Your doors": the cart drawer. Totals come from the cart. */
export function CartDrawer() {
	const { open, setOpen } = useCartUi();
	return (
		<Drawer open={open} onClose={() => setOpen(false)} label="Your doors">
			<CartContents onClose={() => setOpen(false)} />
		</Drawer>
	);
}

function CartContents({ onClose }: { onClose?: () => void }) {
	const { cart, timeRemaining, removeItem, applyDiscountCode, removeDiscountCode, discountCodeError } = useCart();
	return <CartView cart={cart} timeRemaining={timeRemaining} removeItem={removeItem} applyDiscountCode={applyDiscountCode} removeDiscountCode={removeDiscountCode} discountCodeError={discountCodeError} onClose={onClose} />;
}

export interface CartViewProps {
	cart: CartResponse | null;
	timeRemaining: number | null;
	removeItem: (id: string) => Promise<void>;
	applyDiscountCode: (code: string) => Promise<boolean>;
	removeDiscountCode: () => Promise<void>;
	discountCodeError: { message?: string } | null;
	onClose?: () => void;
}

/** The cart itself, driven by props (the drawer passes the live cart; /preview passes a fixture). */
export function CartView({ cart, timeRemaining, removeItem, applyDiscountCode, removeDiscountCode, discountCodeError, onClose }: CartViewProps) {
	const [code, setCode] = useState('');
	const [busy, setBusy] = useState<string | null>(null);
	const items = cart?.items ?? [];
	const discounts = visibleDiscounts(cart);
	const cs = codeState(cart);
	const secs = timeRemaining !== null ? Math.max(0, Math.floor(timeRemaining)) : null;

	const remove = async (id: string) => {
		setBusy(id);
		await removeItem(id);
		setBusy(null);
	};

	return (
		<div className={s.cart}>
			<div className={s.head}>
				<div>
					<p className="label">Your doors</p>
					<h2 className={s.heading}>{items.length ? `${items.length} ${items.length === 1 ? 'door' : 'doors'} held for you` : 'No doors picked yet'}</h2>
				</div>
				{onClose ? (
					<button type="button" className={s.close} onClick={onClose} aria-label="Close your doors">
						<CloseIcon />
					</button>
				) : null}
			</div>
			{secs !== null && items.length ? <HoldBar seconds={secs} /> : null}
			<div className={s.body}>
				{items.length ? (
					<div className={s.list}>
						{items.map((it) => (
							<DoorCard
								key={it.id}
								v={visitOf({ ...(it.appointment ?? { id: it.id, from: '', to: '' }), addOns: it.addOnItems?.map((a) => ({ addOn: a.addOn })) } as never)}
								price={linePrice(it)}
								actions={
									<button type="button" onClick={() => remove(it.id)} disabled={busy === it.id}>
										{busy === it.id ? 'Removing…' : 'Remove'}
									</button>
								}
							/>
						))}
					</div>
				) : (
					<div className={s.empty}>
						<div className={s.emptyDoor} aria-hidden>
							<span className="slit" />
						</div>
						<p className="font-display text-[1.5rem] leading-tight">Every door is still closed.</p>
						<p className="mt-2 text-sm text-ink-3">Pick a room, a time and your team. It waits here while you decide.</p>
						<p className="mt-6">
							<Link href="/book" className="btn" onClick={onClose}>
								Find a session
							</Link>
						</p>
					</div>
				)}
			</div>
			{items.length ? (
				<div className={s.foot}>
					<form
						className={s.code}
						onSubmit={async (e) => {
							e.preventDefault();
							if (code.trim()) {
								const ok = await applyDiscountCode(code.trim());
								if (ok) setCode('');
							}
						}}
					>
						<input aria-label="Discount code" placeholder="Discount code" value={code} onChange={(e) => setCode(e.target.value)} />
						<button type="submit">Apply</button>
					</form>
					{discountCodeError ? <p className={s.note}>{discountCodeError.message ?? 'That code didn’t work.'}</p> : null}
					{cs.status === 'outranked' ? <p className={s.note}>Code {cs.code} saved: a better offer already applies.</p> : null}
					<div className={s.row}>
						<span>Rooms and extras</span>
						<span>{formatPrice(grossSubtotal(items))}</span>
					</div>
					{discounts.map((d) => (
						<div key={d.id} className={s.row}>
							<span>
								{d.title}
								{d.code ? ` (${d.code})` : ''}
							</span>
							<span>−{formatPrice(d.totalAmount)}</span>
						</div>
					))}
					{cs.status === 'active' ? (
						<button type="button" className="self-start text-xs text-ink-3 underline" onClick={() => removeDiscountCode()}>
							Remove code {cs.code}
						</button>
					) : null}
					<div className={s.total}>
						<span>Total</span>
						<strong>{formatPrice(cart?.total ?? 0)}</strong>
					</div>
					<Link href="/checkout" className="btn btn-lg btn-block" onClick={onClose}>
						Checkout
					</Link>
				</div>
			) : null}
		</div>
	);
}

function HoldBar({ seconds }: { seconds: number }) {
	const m = Math.floor(seconds / 60);
	const sec = seconds % 60;
	const pct = Math.min(100, (seconds / (15 * 60)) * 100);
	return (
		<div className={s.hold}>
			<span className={s.holdTrack}>
				<span className={s.holdFill} style={{ width: `${pct}%` }} />
			</span>
			<span className="mono text-[0.78rem] text-ink-2">{seconds > 0 ? `Held for ${m}:${String(sec).padStart(2, '0')}` : 'Hold expired: sessions may be gone'}</span>
		</div>
	);
}
