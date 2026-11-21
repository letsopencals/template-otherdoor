'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type CSSProperties } from 'react';
import type { DoorRoom } from '@/lib/doors';
import { roomPresentation, siteConfig } from '@/lib/site-config';
import { useCart } from '@/contexts/cart-context';
import { useCartUi } from '@/contexts/cart-ui-context';
import { cartCount } from '@/lib/cart-lines';
import { setBaseDoorLight, setDoorLight } from '@/lib/door-light';
import { Logo } from '@/components/brand/logo';
import { DoorArt } from '@/components/doors/door-art';
import { doorArt } from '@/components/doors/door-sources';
import { ArrowIcon, Caret, CloseIcon, DoorsIcon, MenuIcon, UserIcon } from './icons';
import s from './header.module.css';

/** Pages whose hero runs under the header: the home corridor and every room world. */
function heroTone(pathname: string): 'light' | 'dark' | null {
	if (pathname === '/') return 'light';
	const m = /^\/rooms\/([^/]+)$/.exec(pathname);
	if (m) return roomPresentation(m[1] as string)?.headerTone ?? 'light';
	return null;
}

/**
 * One header everywhere: transparent over heroes and worlds, frosted dark glass
 * once the page scrolls (the blur sits on a child layer, so the doors menu and
 * the phone menu are not clipped by a backdrop-filter containing block).
 */
export function Header({ doors }: { doors: DoorRoom[] }) {
	const pathname = usePathname() ?? '/';
	const tone = heroTone(pathname);
	const [scrolled, setScrolled] = useState(false);
	const [doorsOpen, setDoorsOpen] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const { cart } = useCart();
	const { setOpen, flashKey } = useCartUi();
	const count = cartCount(cart);

	useEffect(() => {
		const on = () => setScrolled(window.scrollY > 24);
		on();
		window.addEventListener('scroll', on, { passive: true });
		return () => window.removeEventListener('scroll', on);
	}, []);

	// A room world lends its light to the whole shell.
	useEffect(() => {
		const m = /^\/rooms\/([^/]+)$/.exec(pathname);
		setBaseDoorLight(m ? (roomPresentation(m[1] as string)?.palette.glow ?? null) : null);
		setDoorsOpen(false);
		setMenuOpen(false);
	}, [pathname]);

	useEffect(() => {
		const esc = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				setDoorsOpen(false);
				setMenuOpen(false);
			}
		};
		window.addEventListener('keydown', esc);
		return () => window.removeEventListener('keydown', esc);
	}, []);
	useEffect(() => {
		document.documentElement.style.overflow = menuOpen ? 'hidden' : '';
	}, [menuOpen]);

	const solid = !tone || scrolled || doorsOpen || menuOpen;

	return (
		<header
			className={s.header}
			data-solid={solid}
			data-tone={solid ? 'light' : (tone ?? 'light')}
			onMouseLeave={() => {
				setDoorsOpen(false);
				setDoorLight(null);
			}}
		>
			<div className={s.glassLayer} aria-hidden />
			<a href="#main" className="sr-only-focusable absolute left-2 top-2 z-10 rounded bg-night-2 px-3 py-2">
				Skip to content
			</a>
			<div className={`wrap ${s.inner}`}>
				<Logo />
				<nav className={s.nav} aria-label="Main">
					<button type="button" className={s.navLink} aria-expanded={doorsOpen} aria-controls="doors-menu" onClick={() => setDoorsOpen((v) => !v)} onMouseEnter={() => setDoorsOpen(true)}>
						Rooms <Caret open={doorsOpen} />
					</button>
					{siteConfig.nav.slice(1).map((n) => (
						<Link key={n.href} href={n.href} className={s.navLink} aria-current={pathname.startsWith(n.href) ? 'page' : undefined} onMouseEnter={() => setDoorsOpen(false)}>
							{n.label}
						</Link>
					))}
				</nav>
				<div className={s.right}>
					<Link href="/account" className={`${s.iconBtn} ${s.desktopOnly}`} aria-label="Your account">
						<UserIcon /> <span>Account</span>
					</Link>
					<button type="button" className={s.cartBtn} onClick={() => setOpen(true)} aria-label={`Your doors: ${count} ${count === 1 ? 'booking' : 'bookings'}`}>
						<span key={flashKey} className={flashKey ? s.flash : undefined} style={{ display: 'inline-flex' }}>
							<DoorsIcon />
						</span>
						<span className={s.cartLabel}>Your doors</span>
						{count ? <span className={s.count}>{count}</span> : null}
					</button>
					<button type="button" className={`${s.iconBtn} ${s.mobileOnly}`} onClick={() => setMenuOpen(true)} aria-label="Open the menu">
						<MenuIcon />
					</button>
				</div>
			</div>

			{doorsOpen ? (
				<div id="doors-menu" className={s.doorsMenu}>
					<div className={`wrap ${s.doorsInner}`}>
						<div className={s.doorsGrid}>
							{doors.map((d) => (
								<Link
									key={d.slug}
									href={`/rooms/${d.slug}`}
									className={s.doorCard}
									style={{ '--slit': d.palette.glow } as CSSProperties}
									onMouseEnter={() => setDoorLight(d.palette.glow)}
									onFocus={() => setDoorLight(d.palette.glow)}
								>
									<span className={s.doorArt}>
										<DoorArt sources={doorArt(d)} alt="" glow={d.palette.glow} className={s.doorImg} />
										<span className={s.doorNum}>{String(d.number).padStart(2, '0')}</span>
										{d.epic ? <span className={s.badge}>The Epic</span> : null}
									</span>
									<span className={`slit ${s.doorSlit}`} aria-hidden />
									<span className={s.doorTitle}>{d.title}</span>
									<span className={s.doorMeta}>
										{d.genre} · {d.year}
									</span>
								</Link>
							))}
						</div>
						<div className={s.doorsAside}>
							<p className="label">Six doors, two venues</p>
							<Link href="/rooms" className={s.asideLink}>
								Compare every room <ArrowIcon />
							</Link>
							<Link href="/book" className={s.asideLink}>
								Find a free session <ArrowIcon />
							</Link>
							<Link href="/#which-door" className={s.asideLink}>
								Which door is yours? <ArrowIcon />
							</Link>
							<Link href="/workshops" className={s.asideLink}>
								Lockpicking and cipher workshops <ArrowIcon />
							</Link>
						</div>
					</div>
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
					<div className="wrap pb-12">
						<p className="label mt-2">The doors</p>
						<div className={s.drawerDoors}>
							{doors.map((d) => (
								<Link key={d.slug} href={`/rooms/${d.slug}`} style={{ '--slit': d.palette.glow } as CSSProperties}>
									<span className={s.drawerThumb}>
										<DoorArt sources={doorArt(d)} alt="" glow={d.palette.glow} className={s.doorImg} />
									</span>
									<span className="min-w-0">
										<span className={s.drawerTitle}>{d.title}</span>
										<small>
											{d.genre} · {d.year} · {d.venueShort}
										</small>
									</span>
								</Link>
							))}
						</div>
						<p className="label mt-9">Otherdoor</p>
						<div className={s.drawerLinks}>
							<Link href="/book">Book a session</Link>
							<Link href="/workshops">Workshops</Link>
							<Link href="/groups">Groups and parties</Link>
							<Link href="/faq">Questions</Link>
							<Link href="/account">Your account</Link>
						</div>
					</div>
				</div>
			) : null}
		</header>
	);
}
