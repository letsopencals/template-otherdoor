'use client';

import { expeditionOf } from '@/lib/expedition';
import { previewAppointments, previewCart } from '@/lib/preview-fixtures';
import { SealedInvitation } from '@/components/invitation/sealed-invitation';
import { LogbookView, type PassportRoom } from '@/components/logbook/logbook-view';
import { SatchelView } from '@/components/satchel/satchel-drawer';

const noop = async () => {};

/** Fixture renderings of the post-booking screens (dev, or COMPASS_PREVIEW=1). */
export function PreviewScreen({ screen, rooms }: { screen: string; rooms: PassportRoom[] }) {
	if (screen === 'invitation') {
		const [first] = previewAppointments();
		return (
			<section className="wrap pb-24 pt-[calc(var(--header-h)+40px)]">
				<p className="folio mx-auto max-w-xl">Preview · the sealed invitation</p>
				<div className="mt-10">
					<SealedInvitation expeditions={[expeditionOf(first!)]} team="Lost Lanterns" guest="Ada" orderName="#GC1041" nextRoom={{ title: 'The Gaslight Affair at No. 9', href: '/rooms/gaslight-no-9' }} />
				</div>
			</section>
		);
	}
	if (screen === 'logbook') return <LogbookView rooms={rooms} fixture={previewAppointments() as never} />;
	if (screen === 'satchel') {
		return (
			<section className="wrap pb-24 pt-[calc(var(--header-h)+40px)]">
				<p className="folio mx-auto max-w-xl">Preview · the satchel</p>
				<div className="mx-auto mt-10 h-[760px] max-w-[460px]">
					<SatchelView cart={previewCart()} timeRemaining={12 * 60} removeItem={noop} applyDiscountCode={async () => true} removeDiscountCode={noop} discountCodeError={null} />
				</div>
			</section>
		);
	}
	return null;
}
