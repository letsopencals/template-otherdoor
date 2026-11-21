import type { Metadata } from 'next';
import { getCatalogue, getWorkshopRanges } from '@/lib/server-data';
import { gameMaster, siteConfig } from '@/lib/site-config';
import { PageHead } from '@/components/pages/page-head';
import { WorkshopBooker } from '@/components/booking/workshop-booker';
import { SafeImg } from '@/components/ui/safe-img';

export const metadata: Metadata = { title: 'Workshops', description: 'Lockpicking 101 and Ciphers & Secret Inks: small game-master-led classes at The Bond, Leith. Priced per person.' };
export const revalidate = 60;

function Emblem({ kind }: { kind: 'lock' | 'cipher' }) {
	return (
		<svg viewBox="0 0 300 200" className="h-full w-full" aria-hidden>
			<rect width="300" height="200" fill={kind === 'lock' ? '#1e3a30' : '#7a1e22'} />
			<g fill="none" stroke="#e6c46a" strokeWidth="2">
				{kind === 'lock' ? (
					<>
						<path d="M120 95v-25a30 30 0 0 1 60 0v25" strokeWidth="8" />
						<rect x="100" y="95" width="100" height="78" rx="6" fill="#c8a04a" stroke="#6e4f17" />
						<circle cx="150" cy="124" r="10" fill="#3d2a0a" stroke="none" />
						<path d="M146 130h8l4 26h-16z" fill="#3d2a0a" stroke="none" />
						<path d="M30 40h40M230 160h40" strokeDasharray="3 5" />
					</>
				) : (
					<>
						<circle cx="150" cy="100" r="70" />
						<circle cx="150" cy="100" r="50" />
						{Array.from({ length: 26 }, (_, i) => (
							<text key={i} x="150" y="38" textAnchor="middle" fill="#e6c46a" stroke="none" transform={`rotate(${(i * 360) / 26} 150 100)`} style={{ font: '13px var(--font-type)' }}>
								{String.fromCharCode(65 + i)}
							</text>
						))}
						<circle cx="150" cy="100" r="6" fill="#e6c46a" />
					</>
				)}
			</g>
		</svg>
	);
}

export default async function WorkshopsPage() {
	const [catalogue, ranges] = await Promise.all([getCatalogue(), getWorkshopRanges()]);
	const renderedAt = Date.now();
	return (
		<>
			<PageHead folio="The Workshop Hall · The Bond, Leith" title="Learn the society’s trades." lede="Small classes at the long oak tables, led by our game masters. Priced per person; come alone or bring the team." />
			<section className="wrap grid gap-20 py-16 pb-24">
				{catalogue.workshops.map((w, i) => {
					const host = catalogue.staff.find((s) => w.staffIds.includes(s.id));
					const gm = gameMaster(host?.slug);
					const copy = siteConfig.workshops[w.slug];
					return (
						<article key={w.slug} className="grid items-start gap-10 lg:grid-cols-[1fr_minmax(420px,520px)]">
							<div>
								<div className="paper p-3">
									<SafeImg src={w.images[0]} alt={w.title} className="block aspect-[3/2] w-full object-cover" fallback={<div className="aspect-[3/2]"><Emblem kind={i % 2 ? 'cipher' : 'lock'} /></div>} />
								</div>
								<p className="engraved mt-6 text-sepia">
									Workshop {i + 1} · {w.durationMin} min · {w.seats} seats{copy?.age ? ` · ${copy.age}` : ''}
								</p>
								<h2 className="font-display mt-1 text-[clamp(2rem,4vw,3rem)]">{w.title}</h2>
								<p className="mt-4 max-w-prose leading-relaxed">{copy?.blurb ?? w.description}</p>
								{host ? (
									<p className="mt-4 text-[0.95rem]">
										Taught by <b>{host.name}</b>
										{gm ? `, ${gm.title}` : ''}.
									</p>
								) : null}
								{copy?.bring ? <p className="typed mt-3 text-[0.9rem]">Bring: {copy.bring}</p> : null}
							</div>
							<WorkshopBooker w={{ slug: w.slug, productId: w.productId, title: w.title, durationMin: w.durationMin, price: w.price, seats: w.seats, locationId: w.venue?.id ?? null, staffMemberId: w.staffIds[0] ?? null }} initialRanges={ranges} renderedAt={renderedAt} />
						</article>
					);
				})}
				{!catalogue.workshops.length ? <p className="text-center">No workshops on the calendar right now.</p> : null}
			</section>
		</>
	);
}
