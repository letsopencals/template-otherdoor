import Link from 'next/link';
import { siteConfig } from '@/lib/site-config';

/**
 * The mark (public/logo-mark.svg, drawn by hand): a door frame and a door leaf
 * ajar, two offset shapes, with the room's light in the slit and spilling across
 * the floor. Inline here so the slit takes `--door`: the logo borrows whichever
 * world is in focus.
 */
export function DoorMark({ size = 26, className = '' }: { size?: number; className?: string }) {
	return (
		<svg width={size} height={Math.round(size * 1.2)} viewBox="0 0 120 144" className={className} aria-hidden>
			<defs>
				<linearGradient id="od-slit" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="var(--door)" stopOpacity=".75" />
					<stop offset=".55" stopColor="#fff2dc" />
					<stop offset="1" stopColor="var(--door)" />
				</linearGradient>
				<linearGradient id="od-spill" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="var(--door)" stopOpacity=".85" />
					<stop offset="1" stopColor="var(--door)" stopOpacity="0" />
				</linearGradient>
			</defs>
			<polygon points="72,114 86,114 108,130 76,130" fill="url(#od-spill)" />
			<rect x="72" y="18" width="14" height="96" fill="url(#od-slit)" />
			<rect x="34" y="14" width="56" height="100" fill="none" stroke="currentColor" strokeWidth="6" />
			<polygon points="24,24 72,18 72,114 24,122" fill="currentColor" />
			<circle cx="64" cy="70" r="2.6" fill="#120E17" />
		</svg>
	);
}

export function Logo({ compact = false }: { compact?: boolean }) {
	return (
		<Link href="/" className="group flex items-center gap-2 text-[#efe7da]" aria-label={`${siteConfig.name}, home`}>
			<DoorMark className="shrink-0 transition-transform duration-700 group-hover:-translate-y-0.5" />
			{compact ? null : <span className="font-display text-[1.22rem] font-semibold tracking-[0.07em]">{siteConfig.wordmark}</span>}
		</Link>
	);
}
