import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';

/** The compass-rose mark (hand-drawn SVG in public/) with the engraved wordmark. */
export function Logo({ tone = 'dark', compact = false }: { tone?: 'light' | 'dark'; compact?: boolean }) {
	return (
		<Link href="/" className="group flex items-center gap-3" aria-label={`${siteConfig.name}, home`}>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img src="/compass-mark.svg" alt="" width={44} height={44} className="h-11 w-11 shrink-0 transition-transform duration-700 group-hover:rotate-[22deg]" />
			{compact ? null : (
				<span className="leading-none">
					<span className={`engraved block text-[1.18rem] tracking-[0.16em] ${tone === 'light' ? 'text-[#f3e6c4]' : 'text-ink-green'}`}>The Gilded Compass</span>
					<span className={`mt-1 hidden text-[0.68rem] font-bold uppercase tracking-[0.22em] sm:block ${tone === 'light' ? 'text-[#d9c08a]' : 'text-sepia'}`}>{siteConfig.strap}</span>
				</span>
			)}
		</Link>
	);
}
