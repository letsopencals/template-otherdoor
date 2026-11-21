'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { CartResponse } from '@opencals/storefront-sdk';
import { useCart } from '@/contexts/cart-context';
import { useSatchelUi } from '@/contexts/satchel-ui-context';
import { expeditionOf } from '@/lib/expedition';
import { grossSubtotal, linePrice, visibleDiscounts } from '@/lib/satchel';
import { codeState } from '@/lib/discount-state';
import { formatPrice } from '@/lib/format';
import { Drawer } from '@/components/ui/drawer';
import { CloseIcon } from '@/components/shell/icons';
import { LuggageTag } from './luggage-tag';
import s from './satchel.module.css';

/** The Satchel: the cart as luggage tags on a strap. Totals come from the cart. */
export function SatchelDrawer() {
	const { open, setOpen } = useSatchelUi();
	return (
		<Drawer open={open} onClose={() => setOpen(false)} label="Your satchel">
			<SatchelContents onClose={() => setOpen(false)} />
		</Drawer>
	);
}

function SatchelContents({ onClose }: { onClose?: () => void }) {
	const { cart, timeRemaining, removeItem, applyDiscountCode, removeDiscountCode, discountCodeError } = useCart();
	return <SatchelView cart={cart} timeRemaining={timeRemaining} removeItem={removeItem} applyDiscountCode={applyDiscountCode} removeDiscountCode={removeDiscountCode} discountCodeError={discountCodeError} onClose={onClose} />;
}

export interface SatchelViewProps {
	cart: CartResponse | null;
	timeRemaining: number | null;
	removeItem: (id: string) => Promise<void>;
	applyDiscountCode: (code: string) => Promise<boolean>;
	removeDiscountCode: () => Promise<void>;
	discountCodeError: { message?: string } | null;
	onClose?: () => void;
}

/** The satchel itself, driven by props (the drawer passes the live cart; /preview passes a fixture). */
export function SatchelView({ cart, timeRemaining, removeItem, applyDiscountCode, removeDiscountCode, discountCodeError, onClose }: SatchelViewProps) {
	const [code, setCode] = useState('');
	const [busy, setBusy] = useState<string | null>(null);
	const items = cart?.items ?? [];
	const discounts = visibleDiscounts(cart);
	const cs = codeState(cart);
	const mins = timeRemaining !== null ? Math.max(0, Math.ceil(timeRemaining / 60)) : null;

	const remove = async (id: string) => {
		setBusy(id);
		await removeItem(id);
		setBusy(null);
	};

	return (
		<div className={`${s.satchel} flex flex-col`}>
			<div className={s.head}>
				<div>
					<p className="engraved text-[#e6c88a]">The satchel</p>
					<h2>{items.length ? `${items.length} ${items.length === 1 ? 'expedition' : 'expeditions'} packed` : 'Nothing packed yet'}</h2>
				</div>
				{onClose ? (
					<button type="button" className={s.close} onClick={onClose} aria-label="Close the satchel">
						<CloseIcon />
					</button>
				) : null}
			</div>
			<div className={s.strap} aria-hidden />
			<div className={s.body}>
				{items.length ? (
					<div className={s.tags}>
						{items.map((it, i) => (
							<LuggageTag
								key={it.id}
								tilt={i % 2 ? 0.7 : -0.7}
								e={expeditionOf({ ...(it.appointment ?? { id: it.id, from: '', to: '' }), addOns: it.addOnItems?.map((a) => ({ addOn: a.addOn })) } as never)}
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
						<p>Your satchel is empty.</p>
						<p className="mt-2 text-sm opacity-80">Pick a room, a time and your team; it lands here as a luggage tag.</p>
						<p className="mt-6">
							<Link href="/book" className="plate plate-gold" onClick={onClose}>
								Plan an expedition
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
						<input aria-label="Society code" placeholder="Society code" value={code} onChange={(e) => setCode(e.target.value)} />
						<button type="submit">Apply</button>
					</form>
					{discountCodeError ? <p className={s.note}>{discountCodeError.message ?? 'That code didn’t work.'}</p> : null}
					{cs.status === 'outranked' ? <p className={s.note}>Code {cs.code} saved: a better offer already applies.</p> : null}
					<div className={s.row}>
						<span>Expeditions &amp; extras</span>
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
						<button type="button" className="text-xs underline opacity-80" onClick={() => removeDiscountCode()}>
							Remove code {cs.code}
						</button>
					) : null}
					<div className={s.totalRow}>
						<span className="engraved">Total</span>
						<strong>{formatPrice(cart?.total ?? 0)}</strong>
					</div>
					<Link href="/checkout" className="plate plate-gold w-full" onClick={onClose}>
						Write your Letter of Passage
					</Link>
					{mins !== null ? <p className={s.hold}>{mins > 0 ? `Sessions held for ${mins} more ${mins === 1 ? 'minute' : 'minutes'}.` : 'Your hold has run out: sessions may have been taken.'}</p> : null}
				</div>
			) : null}
		</div>
	);
}
