'use client';

import { visitOf } from '@/lib/visit';
import { previewAppointments, previewCart } from '@/lib/preview-fixtures';
import { roomPresentation } from '@/lib/site-config';
import { DoorUnlocks } from '@/components/thank-you/door-unlocks';
import { DoorsOpened, type SigilRoom } from '@/components/account/doors-opened';
import { CartView } from '@/components/cart/cart-drawer';

const noop = async () => {};

/** Fixture renderings of the post-booking screens (dev, or OTHERDOOR_PREVIEW=1). */
export function PreviewScreen({ screen, rooms }: { screen: string; rooms: SigilRoom[] }) {
	if (screen === 'thank-you') {
		const [first] = previewAppointments();
		const next = roomPresentation('protocol-zero');
		return (
			<section className="pool wrap pb-24 pt-[calc(var(--header-h)+48px)]">
				<DoorUnlocks visits={[visitOf(first!)]} team="Escape Velocity" guest="Ada" orderName="#OD1041" nextRoom={next ? { title: next.title, href: '/rooms/protocol-zero', glow: next.palette.glow } : null} />
			</section>
		);
	}
	if (screen === 'account') return <DoorsOpened rooms={rooms} fixture={previewAppointments() as never} />;
	if (screen === 'cart') {
		return (
			<section className="wrap pb-24 pt-[calc(var(--header-h)+40px)]">
				<p className="label">Preview · your doors</p>
				<div className="mx-auto mt-8 h-[820px] max-w-[460px] overflow-hidden rounded-[14px]">
					<CartView cart={previewCart()} timeRemaining={11 * 60 + 42} removeItem={noop} applyDiscountCode={async () => true} removeDiscountCode={noop} discountCodeError={null} />
				</div>
			</section>
		);
	}
	return null;
}
