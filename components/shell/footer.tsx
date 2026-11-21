import Link from 'next/link';
import type { CSSProperties } from 'react';
import { siteConfig } from '@/lib/site-config';
import type { DoorRoom } from '@/lib/doors';
import { DoorMark } from '@/components/brand/logo';

/** The threshold: six slivers of light (one per door, in its colour), then the colophon. */
export function Footer({ doors }: { doors: DoorRoom[] }) {
	const venues = Object.entries(siteConfig.venues);
	return (
		<footer className="relative overflow-clip border-t border-line bg-night-0">
			<div className="wrap">
				<div className="grid grid-cols-6 gap-3 pt-px md:gap-6" aria-hidden>
					{doors.map((d) => (
						<span key={d.slug} className="slit block" style={{ '--slit': d.palette.glow, opacity: 0.85 } as CSSProperties} />
					))}
				</div>
				<div className="grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
					<div>
						<div className="flex items-center gap-3 text-[#efe7da]">
							<DoorMark size={34} />
							<span className="font-display text-[1.5rem] font-semibold tracking-[0.07em]">{siteConfig.wordmark}</span>
						</div>
						<p className="font-display mt-6 max-w-sm text-[1.7rem] leading-[1.15] tracking-tight text-ink">{siteConfig.tagline}</p>
						<p className="mt-6 text-sm leading-relaxed text-ink-3">
							<a href={`mailto:${siteConfig.contact.email}`} className="link text-ink-2">
								{siteConfig.contact.email}
							</a>
							<br />
							{siteConfig.contact.phone}
						</p>
					</div>
					<div>
						<p className="label label-plain mb-4">Doors</p>
						<ul className="space-y-2.5 text-[0.95rem] text-ink-2">
							{doors.map((d) => (
								<li key={d.slug}>
									<Link href={`/rooms/${d.slug}`} className="transition hover:text-ink">
										{d.title}
									</Link>
								</li>
							))}
						</ul>
					</div>
					<div>
						<p className="label label-plain mb-4">Venues</p>
						<ul className="space-y-5 text-[0.95rem]">
							{venues.map(([slug, v]) => (
								<li key={slug}>
									<Link href={`/venues/${slug}`} className="font-medium text-ink transition hover:text-white">
										{v.name}
									</Link>
									<span className="block text-ink-3">
										{v.address}, {v.postcode}
									</span>
								</li>
							))}
						</ul>
					</div>
					<div>
						<p className="label label-plain mb-4">Otherdoor</p>
						<ul className="space-y-2.5 text-[0.95rem] text-ink-2">
							<li><Link href="/book" className="transition hover:text-ink">Book a session</Link></li>
							<li><Link href="/workshops" className="transition hover:text-ink">Workshops</Link></li>
							<li><Link href="/groups" className="transition hover:text-ink">Groups and parties</Link></li>
							<li><Link href="/faq" className="transition hover:text-ink">Questions</Link></li>
							<li><Link href="/account" className="transition hover:text-ink">Your account</Link></li>
						</ul>
					</div>
				</div>
				<div className="flex flex-wrap items-center justify-between gap-3 border-t border-line py-6 text-[0.8rem] text-ink-3">
					<p>© {new Date().getFullYear()} Otherdoor, Edinburgh. Every story original.</p>
					<p>
						Booking by{' '}
						<a href="https://opencals.com" className="link">
							Opencals
						</a>{' '}
						· open-source template
					</p>
				</div>
			</div>
		</footer>
	);
}
