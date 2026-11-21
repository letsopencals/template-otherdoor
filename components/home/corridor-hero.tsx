import Link from 'next/link';
import type { DoorRoom } from '@/lib/doors';
import { siteConfig } from '@/lib/site-config';
import { Corridor } from './corridor';
import { HeroLoop } from './hero-loop';
import s from './corridor-hero.module.css';

/** Home hero: the corridor of six doors over the home hero loop. */
export function CorridorHero({ doors }: { doors: DoorRoom[] }) {
	return (
		<section className={s.hero} aria-labelledby="hero-title">
			<HeroLoop src={siteConfig.media.heroLoop} poster={siteConfig.media.heroPoster} className={s.bg} />
			<div className={s.vanish} aria-hidden />
			<div className={`wrap ${s.inner}`}>
				<div className={s.intro}>
					<div>
						<p className="label">{siteConfig.strap}</p>
						<h1 id="hero-title" className={s.title}>
							<span className="lit-text">Pick a door.</span>
							<span className={s.second}>Leave the world behind.</span>
						</h1>
					</div>
					<div className={s.side}>
						<p>Six private escape rooms, six different worlds: from a jungle temple in 1936 to a dying space station in 2187. Under the Old Town and on the Shore at Leith.</p>
						<p className={s.ctas}>
							<Link href="/book" className="btn">
								Find a session
							</Link>
							<Link href="#which-door" className="btn btn-glass">
								Which door is yours?
							</Link>
						</p>
					</div>
				</div>
				<Corridor doors={doors} moods={siteConfig.moods} />
			</div>
		</section>
	);
}
