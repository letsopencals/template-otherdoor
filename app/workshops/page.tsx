import type { Metadata } from 'next';
import { getCatalogue, getWorkshopRanges } from '@/lib/server-data';
import { gameMaster, siteConfig } from '@/lib/site-config';
import { PageHead } from '@/components/pages/page-head';
import { WorkshopBooker } from '@/components/booking/workshop-booker';
import { SafeImg } from '@/components/ui/safe-img';

export const metadata: Metadata = { title: 'Workshops', description: 'Lockpicking 101 and Ciphers & Secret Inks: small game-master-led classes at Otherdoor Leith. Priced per person.' };
export const revalidate = 60;

export default async function WorkshopsPage() {
	const [catalogue, ranges] = await Promise.all([getCatalogue(), getWorkshopRanges()]);
	const renderedAt = Date.now();
	return (
		<>
			<PageHead label="Workshops · Otherdoor Leith" title="Learn how the locks work." lede="Small classes at the long tables in the Leith Lobby, led by our game masters. Priced per person; come alone or bring the team." />
			<section className="wrap grid gap-24 py-16 pb-24">
				{catalogue.workshops.map((w, i) => {
					const host = catalogue.staff.find((s) => w.staffIds.includes(s.id));
					const gm = gameMaster(host?.slug);
					const copy = siteConfig.workshops[w.slug];
					return (
						<article key={w.slug} className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_minmax(420px,500px)]">
							<div>
								<div className="overflow-hidden rounded-[16px_16px_4px_4px] bg-night-2 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
									<SafeImg src={w.images[0]} alt={w.title} className="block aspect-[3/2] w-full object-cover" fallback={<span className="block aspect-[3/2] bg-[radial-gradient(60%_60%_at_50%_100%,rgba(242,196,109,0.2),transparent_70%)]" />} />
								</div>
								<p className="label mt-7">
									Workshop {String(i + 1).padStart(2, '0')} · {w.durationMin} min · {w.seats} seats{copy?.age ? ` · ${copy.age}` : ''}
								</p>
								<h2 className="font-display mt-3 text-[clamp(2.2rem,4vw,3.2rem)] leading-none tracking-tight">{w.title}</h2>
								<p className="mt-4 max-w-prose leading-relaxed text-ink-2">{copy?.blurb ?? w.description}</p>
								{host ? (
									<p className="mt-4 text-[0.95rem] text-ink-2">
										Taught by <b className="font-semibold text-ink">{host.name}</b>
										{gm ? `, ${gm.title}` : ''}.
									</p>
								) : null}
								{copy?.bring ? <p className="mono mt-3 text-[0.82rem] text-ink-3">Bring: {copy.bring}</p> : null}
							</div>
							<WorkshopBooker w={{ slug: w.slug, productId: w.productId, title: w.title, durationMin: w.durationMin, price: w.price, seats: w.seats, locationId: w.venue?.id ?? null, staffMemberId: w.staffIds[0] ?? null }} initialRanges={ranges} renderedAt={renderedAt} />
						</article>
					);
				})}
				{!catalogue.workshops.length ? <p className="text-ink-2">No workshops on the calendar right now.</p> : null}
			</section>
		</>
	);
}
