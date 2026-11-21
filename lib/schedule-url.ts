/**
 * Schedule URLs ("call times"). Pure, safe in RSC and client.
 *   `day=YYYY-MM-DD` (Miami date), `site=<site key>`, `type=<collection slug>`,
 *   `class=<class key>`, `coach=<staff slug>`, `shots=1` (only sessions with
 *   shot add-ons), `s=<seriesSlug>@<startISO>` (opens that row, expanded).
 */
export interface ScheduleParams {
	day?: string | null;
	site?: string | null;
	type?: string | null;
	class?: string | null;
	coach?: string | null;
	shots?: boolean | null;
	occ?: { seriesSlug: string; start: string; localDate?: string } | null;
}

export function sessionKey(o: { seriesSlug: string; start: string }): string {
	return `${o.seriesSlug}@${o.start}`;
}

export function parseSessionKey(s: string | null | undefined): { seriesSlug: string; start: string } | null {
	if (!s) return null;
	const at = s.lastIndexOf('@');
	if (at <= 0) return null;
	return { seriesSlug: s.slice(0, at), start: s.slice(at + 1) };
}

export function scheduleHref(p: ScheduleParams = {}): string {
	const q = new URLSearchParams();
	const day = p.day ?? p.occ?.localDate ?? null;
	if (day) q.set('day', day);
	if (p.site) q.set('site', p.site);
	if (p.type) q.set('type', p.type);
	if (p.class) q.set('class', p.class);
	if (p.coach) q.set('coach', p.coach);
	if (p.shots) q.set('shots', '1');
	if (p.occ) q.set('s', sessionKey(p.occ));
	const s = q.toString();
	return s ? `/schedule?${s}` : '/schedule';
}
