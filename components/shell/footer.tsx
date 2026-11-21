import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';
import type { ShelfRoom } from '@/lib/shelf';

/** The colophon: ink-green cloth with a marbled endpaper edge. */
export function Footer({ shelf }: { shelf: ShelfRoom[] }) {
	const venues = Object.entries(siteConfig.venues);
	return (
		<footer className="band-green">
			<div className="marble" aria-hidden />
			<div className="wrap grid gap-12 py-16 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
				<div>
					<div className="flex items-center gap-3">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src="/compass-mark.svg" alt="" width={56} height={56} />
						<p className="engraved text-[1.4rem] text-[#f1dfb2]">The Gilded Compass</p>
					</div>
					<p className="font-display mt-5 max-w-sm text-[1.35rem] leading-snug text-[#efe5cc]">“{siteConfig.tagline}”</p>
					<p className="typed mt-6 text-sm text-[#cdbb8f]">
						{siteConfig.contact.email}
						<br />
						{siteConfig.contact.phone}
					</p>
				</div>
				<div>
					<p className="engraved mb-3 text-[#d9c08a]">The volumes</p>
					<ul className="space-y-2 text-[0.95rem]">
						{shelf.map((r) => (
							<li key={r.slug}>
								<Link href={`/rooms/${r.slug}`} className="hover:underline">
									{r.title}
								</Link>
							</li>
						))}
					</ul>
				</div>
				<div>
					<p className="engraved mb-3 text-[#d9c08a]">The houses</p>
					<ul className="space-y-4 text-[0.95rem]">
						{venues.map(([slug, v]) => (
							<li key={slug}>
								<Link href={`/venues/${slug}`} className="font-bold hover:underline">
									{v.name}
								</Link>
								<br />
								<span className="text-[#cdbb8f]">
									{v.address}, {v.postcode}
								</span>
							</li>
						))}
					</ul>
				</div>
				<div>
					<p className="engraved mb-3 text-[#d9c08a]">The society</p>
					<ul className="space-y-2 text-[0.95rem]">
						<li><Link href="/book" className="hover:underline">Plan an expedition</Link></li>
						<li><Link href="/workshops" className="hover:underline">Workshops</Link></li>
						<li><Link href="/groups" className="hover:underline">Groups &amp; parties</Link></li>
						<li><Link href="/faq" className="hover:underline">Questions</Link></li>
						<li><Link href="/account" className="hover:underline">Explorer’s Logbook</Link></li>
					</ul>
				</div>
			</div>
			<div className="wrap flex flex-wrap items-center justify-between gap-3 border-t border-[#d9c08a]/25 py-6 text-[0.8rem] text-[#bfae86]">
				<p>© {new Date().getFullYear()} The Gilded Compass, Edinburgh. All stories original.</p>
				<p>
					Booking by{' '}
					<a href="https://opencals.com" className="underline">
						Opencals
					</a>{' '}
					· open-source template
				</p>
			</div>
		</footer>
	);
}
