'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { ShelfRoom } from '@/lib/shelf';
import { roomPresentation, siteConfig } from '@/lib/site-config';
import { useCart } from '@/contexts/cart-context';
import { useSatchelUi } from '@/contexts/satchel-ui-context';
import { satchelCount } from '@/lib/satchel';
import { roman } from '@/lib/when';
import { Logo } from '@/components/brand/logo';
import { Spine } from '@/components/shelf/spine';
import { Caret, CloseIcon, LogbookIcon, MenuIcon, SatchelIcon } from './icons';
import s from './header.module.css';

/** Transparent over the home hero and every room world; solid vellum everywhere else and once scrolled. */
function heroTone(pathname: string): 'light' | 'dark' | null {
	if (pathname === '/') return 'light';
	const m = /^\/rooms\/([^/]+)$/.exec(pathname);
	if (m) return roomPresentation(m[1] as string)?.headerTone ?? 'dark';
	return null;
}

export function Header({ shelf }: { shelf: ShelfRoom[] }) {
	const pathname = usePathname() ?? '/';
	const tone = heroTone(pathname);
	const [scrolled, setScrolled] = useState(false);
	const [shelfOpen, setShelfOpen] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [peek, setPeek] = useState<string | null>(null);
	const { cart } = useCart();
	const { setOpen, flashKey } = useSatchelUi();
	const count = satchelCount(cart);

	useEffect(() => {
		const on = () => setScrolled(window.scrollY > 24);
		on();
		window.addEventListener('scroll', on, { passive: true });
		return () => window.removeEventListener('scroll', on);
	}, []);

	// Close menus on navigation and Escape.
	useEffect(() => {
		setShelfOpen(false);
		setMenuOpen(false);
	}, [pathname]);
	useEffect(() => {
		const esc = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				setShelfOpen(false);
				setMenuOpen(false);
			}
		};
		window.addEventListener('keydown', esc);
		return () => window.removeEventListener('keydown', esc);
	}, []);
	useEffect(() => {
		document.documentElement.style.overflow = menuOpen ? 'hidden' : '';
	}, [menuOpen]);

	const solid = !tone || scrolled || shelfOpen;
	const peeked = shelf.find((r) => r.slug === peek) ?? shelf[0];

	return (
		<header className={s.header} data-solid={solid} data-tone={tone ?? 'dark'} onMouseLeave={() => setShelfOpen(false)}>
			<a href="#main" className="sr-only-focusable absolute left-2 top-2 z-10 bg-vellum px-3 py-2">
				Skip to content
			</a>
			<div className={`wrap ${s.inner}`}>
				<Logo tone={solid ? 'dark' : (tone ?? 'dark')} />
				<nav className={s.nav} aria-label="Main">
					<button type="button" className={s.navLink} aria-expanded={shelfOpen} aria-controls="shelf-menu" onClick={() => setShelfOpen((v) => !v)} onMouseEnter={() => setShelfOpen(true)}>
						Rooms <Caret open={shelfOpen} />
					</button>
					{siteConfig.nav.slice(1).map((n) => (
						<Link key={n.href} href={n.href} className={s.navLink} aria-current={pathname.startsWith(n.href) ? 'page' : undefined} onMouseEnter={() => setShelfOpen(false)}>
							{n.label}
						</Link>
					))}
				</nav>
				<div className={s.right}>
					<Link href="/account" className={`${s.iconBtn} ${s.desktopOnly}`} aria-label="Your Explorer’s Logbook">
						<LogbookIcon /> <span>Logbook</span>
					</Link>
					<button type="button" className={s.iconBtn} onClick={() => setOpen(true)} aria-label={`Open your satchel, ${count} ${count === 1 ? 'booking' : 'bookings'}`}>
						<span key={flashKey} className={flashKey ? s.flash : undefined} style={{ display: 'inline-flex' }}>
							<SatchelIcon />
						</span>
						{count ? <span className={s.count}>{count}</span> : null}
					</button>
					<button type="button" className={`${s.iconBtn} ${s.mobileOnly}`} onClick={() => setMenuOpen(true)} aria-label="Open the menu">
						<MenuIcon />
					</button>
				</div>
			</div>

			{shelfOpen ? (
				<div id="shelf-menu" className={s.shelf}>
					<div className={`wrap ${s.shelfInner}`}>
						<div>
							<p className="folio folio-left">The society’s shelf · {shelf.length} volumes</p>
							<div className={s.books}>
								{shelf.length ? (
									shelf.map((r) => <Spine key={r.slug} room={r} width={60} height={200} out={peek === r.slug} onFocus={() => setPeek(r.slug)} showLetter={false} />)
								) : (
									<p className="pb-8">The shelf is being restocked. See every room on the <Link href="/rooms" className="underline">rooms page</Link>.</p>
								)}
							</div>
						</div>
						{peeked ? (
							<div className={s.peek}>
								<p className="engraved text-sepia">
									Volume {roman(peeked.volume)} · {peeked.venueShort}
								</p>
								<p className={s.peekTitle}>{peeked.title}</p>
								<p className="text-[0.92rem] text-[#4b3b26]">
									{peeked.genre}
									{peeked.year ? `, ${peeked.year}` : ''} · {peeked.players} players
								</p>
								<p className="mt-4 flex flex-wrap gap-2">
									<Link href={`/rooms/${peeked.slug}`} className="plate plate-sm">
										Open the volume
									</Link>
									<Link href="/rooms" className="plate plate-ghost plate-sm">
										All rooms
									</Link>
								</p>
							</div>
						) : null}
					</div>
					<div className={s.plank} />
				</div>
			) : null}

			{menuOpen ? (
				<div className={s.drawer} role="dialog" aria-modal="true" aria-label="Menu">
					<div className={`wrap ${s.drawerHead}`}>
						<Logo />
						<button type="button" className={s.iconBtn} onClick={() => setMenuOpen(false)} aria-label="Close the menu">
							<CloseIcon />
						</button>
					</div>
					<div className="wrap pb-10">
						<p className="folio folio-left mt-2">The rooms</p>
						<div className={s.drawerLinks}>
							{shelf.map((r) => (
								<Link key={r.slug} href={`/rooms/${r.slug}`}>
									<span>{r.title}</span>
									<small>{r.venueShort}</small>
								</Link>
							))}
						</div>
						<p className="folio folio-left mt-8">The society</p>
						<div className={s.drawerLinks}>
							<Link href="/book">
								<span>Plan an expedition</span>
								<small>All sessions</small>
							</Link>
							<Link href="/workshops">
								<span>Workshops</span>
								<small>Lockpicking, ciphers</small>
							</Link>
							<Link href="/groups">
								<span>Groups</span>
								<small>Team days, birthdays</small>
							</Link>
							<Link href="/faq">
								<span>Questions</span>
								<small>Before you come</small>
							</Link>
							<Link href="/account">
								<span>Explorer’s Logbook</span>
								<small>Your bookings</small>
							</Link>
						</div>
					</div>
				</div>
			) : null}
		</header>
	);
}
