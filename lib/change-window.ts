import type { AppointmentDetailProduct, AppointmentStatusType } from '@opencals/storefront-sdk';
import { formatGap } from '@/lib/policy';
import { siteConfig } from '@/lib/site-config';
import { dayLabel, timeLabel } from '@/lib/when';

/**
 * When a booking can still be cancelled or moved online. Mirrors the backend:
 * scheduled, allowed on the product, and now before `start − gap`. The backend
 * re-checks every request; this only decides which buttons show.
 */
export interface ChangeAction {
	allowed: boolean;
	untilLabel: string | null;
	gapLabel: string | null;
	reason: string | null;
}

export interface ChangeAppt {
	from: string;
	status?: AppointmentStatusType | null;
	product?: Partial<Pick<AppointmentDetailProduct, 'cancelGap' | 'rescheduleGap' | 'allowCustomerCancel' | 'allowCustomerReschedule'>> | null;
}

function action(a: ChangeAppt, now: number, gapSeconds: number, allowed: boolean, verb: 'cancel' | 'move'): ChangeAction {
	const start = Date.parse(a.from);
	const gap = Math.max(0, gapSeconds);
	const until = start - gap * 1000;
	const untilLabel = gap > 0 ? `${dayLabel(until)}, ${timeLabel(until)}` : null;
	const gapLabel = gap > 0 ? formatGap(gap) : null;
	let reason: string | null = null;
	if (a.status === 'canceled') reason = 'This booking is cancelled.';
	else if (a.status !== 'scheduled') reason = start <= now ? 'This session is done.' : 'This booking isn’t confirmed yet.';
	else if (start <= now) reason = 'This session has started.';
	else if (!allowed) reason = `This one can’t be ${verb === 'cancel' ? 'cancelled' : 'moved'} online. Email ${siteConfig.contact.email}.`;
	else if (until <= now) reason = `Online ${verb === 'cancel' ? 'cancelling' : 'moving'} closed ${gapLabel} before, at ${untilLabel}. Email ${siteConfig.contact.email} and we’ll see what we can do.`;
	return { allowed: reason === null, untilLabel, gapLabel, reason };
}

export function changeWindow(a: ChangeAppt, now: number = Date.now()) {
	const p = a.product;
	return {
		cancel: action(a, now, p?.cancelGap ?? 0, p?.allowCustomerCancel !== false, 'cancel'),
		reschedule: action(a, now, p?.rescheduleGap ?? 0, p?.allowCustomerReschedule !== false, 'move'),
	};
}

export function policyLine(w: ReturnType<typeof changeWindow>): string | null {
	const { cancel: c, reschedule: r } = w;
	const until = (x: ChangeAction) => (x.untilLabel ? `until ${x.untilLabel}` : 'until it starts');
	if (c.allowed && r.allowed) return `Free to move or cancel ${until(c)}.`;
	if (c.allowed) return `Free to cancel ${until(c)}.`;
	if (r.allowed) return `Free to move ${until(r)}.`;
	return c.reason;
}
