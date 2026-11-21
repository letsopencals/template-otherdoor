import type { BookingView } from '@/lib/booking-view';
import type { CalendarEvent } from '@/lib/calendar';
import { siteConfig } from '@/lib/site-config';

/** A booked session as a calendar entry. */
export function toCalendarEvent(v: BookingView): CalendarEvent {
	const shots = v.shots.map((s) => s.label).join(', ');
	return {
		uid: `${v.id}@${siteConfig.name.toLowerCase()}`,
		title: `${v.title} at ${siteConfig.name}`,
		start: v.start,
		end: v.end,
		location: [v.setName, v.address].filter(Boolean).join(', ') || undefined,
		description: [v.coach ? `With ${v.coach}` : null, shots ? `Shots: ${shots}` : null, v.wardrobe ? `Wardrobe: ${v.wardrobe}` : null].filter(Boolean).join('\n') || undefined,
	};
}

/** The call time: when to arrive (15 minutes early, 25 when there is a shoot or glam). */
export function callTime(v: BookingView): number {
	const early = v.shots.length || v.category === 'content' ? 25 : 15;
	return v.start - early * 60_000;
}

/** The deliverables line for the call sheet. */
export function deliveryLine(views: readonly BookingView[]): string | null {
	const shots = views.flatMap((v) => v.shots);
	if (!shots.length && !views.some((v) => v.category === 'content')) return null;
	const fastest = shots.some((s) => s.eta === '24 h') ? '24 hours' : '48 hours';
	return `Your edits land in your inbox within ${fastest} of each session, graded and cropped for stories and feed.`;
}
