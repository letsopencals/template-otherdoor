import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import type { RoomWorldProps } from '@/lib/worlds';
import { SafeImg } from '@/components/ui/safe-img';
import { cutive, gloock } from './font';
import { buildWall, type DocBox, type DocKey } from './layout';
import { Wall, type WallIndexItem } from './wall';
import { CaseNotes, CaseProvider } from './case-notes';
import { HeroMedia, Live } from './hero-media';
import { CallingCard, DeskPhoto, Doc, EndNote, Exhibit, GmNote, IntroCard, Newspaper, PawnTicket, PlanSheet, Register, Telegram, WindowPhoto } from './documents';
import { Signature, WaxSeal } from './art';
import s from './gaslight.module.css';

const MEDIA = '/worlds/gaslight-no-9';

/**
 * THE GASLIGHT AFFAIR AT No. 9 (1891). A horizontal investigation: after a rain-soaked
 * gaslit street (the hero loop, flickering lamps, drifting fog), the page becomes the
 * detective's evidence wall, travelled sideways as you scroll. Each scene is a document
 * pinned to the wall (the newspaper, the inspector's telegram, the photograph of the lit
 * window, the floor plan, the desk as found, the pawn ticket with the stats, the game
 * master's card, the exhibits, the register), joined by red string that draws itself from
 * pin to pin. A reading glass finds three hidden clues (optional, never gating). The wall
 * ends before the warrant: the booking panel in a normal vertical section. Phones get the
 * same documents as a vertical stack.
 */
export default function GaslightNo9({ room, presentation: p, cover, photos, gameMaster, next, records, booking }: RoomWorldProps) {
	const m = p.media;
	const stills = m.stills ?? [];
	const wide = stills[0] ?? `${MEDIA}/wide.jpg`;
	const windowStill = stills[1] ?? `${MEDIA}/study-window.jpg`;
	const desk = stills[2] ?? `${MEDIA}/case-file.jpg`;
	const wallStill = stills[3] ?? `${MEDIA}/evidence-wall.jpg`;
	const fog = stills[4] ?? `${MEDIA}/plate-fog.jpg`;
	const [setup, stakes, todo, inside] = p.beats;
	const venueName = room.venue?.name ?? 'Otherdoor Vaults';
	const exhibits = photos.slice(0, 3);
	const scene = buildWall({ photos: exhibits.length, gameMaster: Boolean(gameMaster), records: records.length > 0 });
	const [main, tail] = splitTitle(room.title);

	const box = (k: DocKey): DocBox => scene.docs[k]!;
	const index: WallIndexItem[] = [
		{ key: 'paper', label: 'The newspaper' },
		{ key: 'telegram', label: 'The telegram' },
		{ key: 'plan', label: 'The plan' },
		{ key: 'desk', label: 'The desk' },
		{ key: 'ticket', label: 'The ticket' },
		...(gameMaster ? [{ key: 'card', label: 'The game master' }] : []),
	].map((it) => ({ ...it, x: box(it.key as DocKey).x, w: box(it.key as DocKey).w }));

	return (
		<div className={`${s.world} ${gloock.variable} ${cutive.variable}`} style={{ '--door': p.palette.glow, '--wallimg': `url(${wallStill})` } as CSSProperties}>
			{/* ---------------------------------------------------------------- The street */}
			<header className={s.hero}>
				<HeroMedia src={m.loop} poster={m.poster ?? wide} fog={fog} />
				<div className={s.heroShade} aria-hidden />
				<div className={`wrap ${s.heroInner}`}>
					<p className={s.heroKicker}>
						<span className={s.typed}>Edinburgh · Tuesday 17 November 1891 · 11.40 p.m.</span>
					</p>
					<h1 className={s.heroTitle}>
						<span className={s.heroMain}>{main}</span>
						{tail ? (
							<span className={s.heroTail}>
								<span className={s.heroAt}>at</span>
								<span className={s.plaque}>{tail}</span>
							</span>
						) : null}
					</h1>
					<p className={s.heroTag}>{p.tagline}</p>
					<div className={s.heroActions}>
						<a href="#book" className={s.btnGas}>
							Take the case <span>· from {room.fromPriceLabel}</span>
						</a>
						<a href="#wall" className={s.btnLine}>
							Read the evidence <span aria-hidden className={s.arrowSide}>→</span>
							<span aria-hidden className={s.arrowDown}>↓</span>
						</a>
					</div>
					<p className={s.heroFacts}>
						Door {String(p.order).padStart(2, '0')} · {p.genre} · {p.minPlayers}–{p.maxPlayers} players · {p.gameMinutes} min · {venueName}
					</p>
				</div>
			</header>

			{/* ---------------------------------------------------------------- The evidence wall */}
			<CaseProvider>
				<Wall
					width={scene.width}
					strings={scene.strings}
					knots={scene.knots}
					index={index}
					notes={<CaseNotes />}
					backdrop={
						<>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img className={s.backFog} src={fog} alt="" loading="lazy" decoding="async" />
							<span className={s.backWisp} />
						</>
					}
				>
					<Doc box={box('intro')} kind="kIntro" label="Case No. 9">
						<IntroCard />
					</Doc>
					<Doc box={box('paper')} kind="kPaper" label="The newspaper: Inventor vanishes from a locked study">
						<Newspaper title={room.title} setup={setup?.body} description={room.description} />
					</Doc>
					<Doc box={box('telegram')} kind="kTelegram" label="A telegram from the inspector">
						<Telegram stakes={stakes} venue={venueName} />
					</Doc>
					<Doc box={box('window')} kind="kWindow" label="A photograph of the study window">
						<WindowPhoto src={windowStill} inside={inside?.body} />
					</Doc>
					<Doc box={box('plan')} kind="kPlan" label="The floor plan of No. 9">
						<PlanSheet todo={todo} />
					</Doc>
					<Doc box={box('desk')} kind="kDesk" label="A police photograph of the desk">
						<DeskPhoto src={desk} />
					</Doc>
					<Doc box={box('ticket')} kind="kTicket" label="The pawn ticket: the room in numbers">
						<PawnTicket room={room} p={p} />
					</Doc>
					{gameMaster ? (
						<>
							<Doc box={box('card')} kind="kCard" label={`Calling card: ${gameMaster.name}`}>
								<CallingCard gm={gameMaster} venue={venueName} />
							</Doc>
							<Doc box={box('note')} kind="kNote" label="A note from your game master">
								<GmNote gm={gameMaster} />
							</Doc>
						</>
					) : null}
					{exhibits.map((src, i) => (
						<Doc key={src} box={box(`ex${i}` as DocKey)} kind="kExhibit" label={`Exhibit ${String.fromCharCode(65 + i)}`}>
							<Exhibit src={src} i={i} />
						</Doc>
					))}
					{records.length ? (
						<Doc box={box('register')} kind="kRegister" label="Cases closed this season">
							<Register records={records} />
						</Doc>
					) : null}
					<Doc box={box('end')} kind="kEnd" label="To the warrant">
						<EndNote />
					</Doc>
				</Wall>
			</CaseProvider>

			{/* ---------------------------------------------------------------- The warrant (booking) */}
			<section id="warrant" className={s.warrant} aria-labelledby="gl-warrant-title">
				<div className={`wrap ${s.warrantGrid}`}>
					<div className={s.warrantCol}>
						<div className={s.warrantDoc}>
							<span className={s.warrantPin} aria-hidden />
							<p className={s.warrantCrest}>City of Edinburgh Police</p>
							<h2 id="gl-warrant-title" className={s.warrantTitle}>
								Warrant to enter No. 9
							</h2>
							<p className={s.warrantBody}>
								The bearer, with a party of not fewer than <Field>{p.minPlayers}</Field> nor more than <Field>{p.maxPlayers}</Field> persons, is authorised to enter the premises at No. 9 Heriot Row and to remain there <Field>{p.gameMinutes} minutes</Field>, or until the inspector arrives, whichever is sooner.
							</p>
							<dl className={s.warrantTerms}>
								<div>
									<dt>Report to</dt>
									<dd>
										{venueName}
										{room.venue?.address ? `, ${room.venue.address}` : ''}, fifteen minutes before the hour.
									</dd>
								</div>
								<div>
									<dt>Fee</dt>
									<dd>One price for the whole party, from {room.fromPriceLabel}. Choose a time and the size of your party.</dd>
								</div>
								<div>
									<dt>Dress</dt>
									<dd>{p.wear}</dd>
								</div>
							</dl>
							<div className={s.warrantFoot}>
								<span className={s.warrantSign}>
									<Signature className={s.warrantSig} />
									<span>{gameMaster ? `${gameMaster.name}, for the inspector` : 'For the inspector'}</span>
								</span>
								<WaxSeal className={s.warrantSeal} />
							</div>
						</div>
						{cover ? (
							<div className={s.warrantCover}>
								<SafeImg src={cover} alt={`${room.title} key art`} className={s.fill} fallback={null} />
							</div>
						) : null}
					</div>
					<div className={s.panelCol}>{booking}</div>
				</div>
			</section>

			{/* ---------------------------------------------------------------- Next door: down the lane */}
			{next ? (
				<Live as="section" className={s.lane} label="Next door">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img className={s.laneImg} src={fog} alt="" loading="lazy" decoding="async" />
					<span className={s.laneFog} aria-hidden />
					<span className={s.laneLight} style={{ '--n': next.palette.glow } as CSSProperties} aria-hidden />
					<div className={`wrap ${s.laneInner}`}>
						<Link href={next.href} className={s.laneLink} style={{ '--n': next.palette.glow } as CSSProperties}>
							<span className={s.laneLabel}>Further down the lane · next door</span>
							<span className={s.laneTitle}>{next.title}</span>
							<span className={s.laneTag}>{next.tagline}</span>
							<span className={s.laneGo}>
								{next.genre} <span aria-hidden>→</span>
							</span>
						</Link>
					</div>
				</Live>
			) : null}
		</div>
	);
}

/** "The Gaslight Affair at No. 9" → ["The Gaslight Affair", "No. 9"]: the house number goes on a plaque. */
function splitTitle(title: string): [string, string | null] {
	const m = /^(.*?)\s+at\s+(No\.?\s*\d+.*)$/i.exec(title);
	return m ? [m[1]!, m[2]!] : [title, null];
}

function Field({ children }: { children: ReactNode }) {
	return <span className={s.field}>{children}</span>;
}
