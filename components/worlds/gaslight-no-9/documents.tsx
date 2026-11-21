import type { CSSProperties, ReactNode } from 'react';
import type { RoomWorldProps } from '@/lib/worlds';
import { minutesLabel } from '@/lib/when';
import { SafeImg } from '@/components/ui/safe-img';
import type { DocBox } from './layout';
import { Lens, type LensClue } from './lens';
import { FloorPlan } from './floor-plan';
import { Cameo, Monogram, PencilNote, Signature, WaxSeal } from './art';
import s from './gaslight.module.css';

/**
 * The documents on the evidence wall. Each is a physical object pinned at its pin (which is
 * also its transform-origin, so it hangs and drops from it). On the wall they use their
 * authored box (em); in the stacked layout they flow at full width.
 */
export function Doc({ box, kind, label, children }: { box: DocBox; kind: string; label: string; children: ReactNode }) {
	const style = { '--x': box.x, '--y': box.y, '--w': box.w, '--h': box.h, '--r': `${box.r}deg`, '--px': `${box.px * 100}%`, '--py': `${box.py}em` } as CSSProperties;
	return (
		<article className={`${s.doc} ${s[kind] ?? ''}`} style={style} data-doc="" data-x={box.x} data-w={box.w} aria-label={label}>
			<span className={s.tie} aria-hidden>
				<svg viewBox="0 0 20 100" preserveAspectRatio="none">
					<path d="M10 0C4 30 16 60 10 100" pathLength={1} vectorEffect="non-scaling-stroke" />
				</svg>
			</span>
			<span className={s.pin} aria-hidden />
			{children}
		</article>
	);
}

/* ------------------------------------------------------------------ the case card */
export function IntroCard() {
	return (
		<div className={s.introCard}>
			<p className={s.introNo}>
				Case <span>No. 9</span>
			</p>
			<h2 className={s.introTitle}>The disappearance of Professor Ambrose Quill, inventor</h2>
			<p className={s.introMeta}>Opened Wednesday 18 November 1891, 6.10 a.m.</p>
			<ul className={s.introList}>
				<li>
					<span className={s.wideOnly}>Keep scrolling: the wall moves with you.</span>
					<span className={s.stackOnly}>Scroll down the wall, document by document.</span>
				</li>
				<li>Take the glass to the newspaper and the desk. Three things are hidden.</li>
				<li>
					Or <a href="#warrant">go straight to the warrant ↓</a>
				</li>
			</ul>
		</div>
	);
}

/* ------------------------------------------------------------------ the newspaper */
function NewspaperPage({ title, setup, description }: { title: string; setup?: string; description: string }) {
	return (
		<div className={s.paperPage}>
			<p className={s.paperTop}>
				<span>Late edition</span>
				<span>Wednesday, 18 November 1891</span>
				<span>One penny</span>
			</p>
			<p className={s.masthead}>The Caledonian Evening Post</p>
			<p className={s.paperRule}>
				<span>Edinburgh · Leith · the Lothians</span>
				<span>No. 14,027</span>
			</p>
			<h3 className={s.headline}>Inventor vanishes from a locked study</h3>
			<p className={s.deck}>Heriot Row door bolted from within · Lamp left burning · Police “at a loss”</p>
			<div className={s.paperCols}>
				<div className={s.paperLead}>
					<p className={s.dropcap}>{setup ?? `${title}.`}</p>
					<p>{description}</p>
					<p>
						The housekeeper, Mrs Elspeth Rintoul, heard the bolt shot at a quarter to midnight and the professor wish her a curt good night through the door. At six she found the lamp still lit, the fire out, and no professor.
					</p>
				</div>
				<div className={s.paperSide}>
					<p className={s.brief}>
						<b>The gas bill.</b> The Edinburgh Gas-Light Company confirms that consumption at No. 9 trebled in October. “Inventors,” said a clerk, “burn the midnight oil, and ours.”
					</p>
					<p className={s.ad}>
						<b>Quill’s Patent Escapement.</b> Orders no longer accepted.
					</p>
					<p className={s.ad}>
						<b>Wanted:</b> a chimney sweep, discreet, for Heriot Row. Apply at No. 9.
					</p>
					<p className={s.ad}>
						<b>Lost:</b> a brass key, ornate, near Queen Street Gardens. Reward.
					</p>
				</div>
			</div>
			<span className={s.ink}>
				<PencilNote />
			</span>
		</div>
	);
}

const PAPER_CLUES: LensClue[] = [{ id: 'ink', x: 0.775, y: 0.83, label: 'Examine the pencil in the margin' }];
const PAPER_REST: [number, number] = [0.3, 0.42];

export function Newspaper({ title, setup, description }: { title: string; setup?: string; description: string }) {
	return <Lens label="The newspaper" clues={PAPER_CLUES} rest={PAPER_REST} page={<NewspaperPage title={title} setup={setup} description={description} />} magnified={<NewspaperPage title={title} setup={setup} description={description} />} />;
}

/* ------------------------------------------------------------------ the telegram */
export function Telegram({ stakes, venue }: { stakes?: { title: string; body: string }; venue: string }) {
	const words = (stakes?.body ?? 'The inspector arrives in an hour.')
		.replace(/[“”"’]/g, (c) => (c === '’' ? "'" : ''))
		.split(/(?<=[.!?])\s+/)
		.map((line) => line.replace(/[.!?]$/, '').toUpperCase());
	return (
		<div className={s.telegram}>
			<p className={s.tgHead}>
				<span>Post Office Telegraphs</span>
				<span>No. 9 / 47</span>
			</p>
			<dl className={s.tgMeta}>
				<div>
					<dt>Handed in at</dt>
					<dd>Leith Walk, 10.52 p.m.</dd>
				</div>
				<div>
					<dt>To</dt>
					<dd>The party, care of {venue}</dd>
				</div>
			</dl>
			<div className={s.tgBody}>
				{words.map((w, i) => (
					<p key={i} className={s.tape} style={{ '--i': i } as CSSProperties}>
						{w} <b>STOP</b>
					</p>
				))}
				<p className={s.tape} style={{ '--i': words.length } as CSSProperties}>
					HALDANE INSPECTOR CITY POLICE
				</p>
			</div>
		</div>
	);
}

/* ------------------------------------------------------------------ the photograph of the window */
export function WindowPhoto({ src, inside }: { src: string; inside?: string }) {
	return (
		<figure className={s.cabinet}>
			<div className={s.cabinetPrint}>
				<SafeImg src={src} alt="The lit window of the study at No. 9 from the street: a green lamp, bookshelves and a figure at the desk, a gas lamp outside" className={s.fill} fallback={<span className={s.imgFallback} />} />
			</div>
			<figcaption>
				<span className={s.cabinetCap}>The study window, 11.40 p.m. The lamp still lit.</span>
				{inside ? <span className={s.cabinetInside}>{inside}</span> : null}
				<span className={s.cabinetImprint}>Marr &amp; Son · Photographers · Princes Street</span>
			</figcaption>
		</figure>
	);
}

/* ------------------------------------------------------------------ the floor plan */
export function PlanSheet({ todo }: { todo?: { title: string; body: string } }) {
	return (
		<div className={s.planSheet}>
			<p className={s.planTitle}>
				No. 9 Heriot Row <span>first floor · drawn from memory by P.C. 114</span>
			</p>
			<FloorPlan />
			{todo ? (
				<div className={s.planTodo}>
					<h3>{todo.title}</h3>
					<p>{todo.body}</p>
				</div>
			) : null}
		</div>
	);
}

/* ------------------------------------------------------------------ the desk, as found */
function DeskImage({ src, magnified = false }: { src: string; magnified?: boolean }) {
	return (
		<div className={s.deskImg}>
			{magnified ? (
				// eslint-disable-next-line @next/next/no-img-element
				<img src={src} alt="" className={s.fill} loading="lazy" decoding="async" />
			) : (
				<SafeImg src={src} alt="Police photograph of the professor's desk as found: the case book with red string, sepia photographs, a reading glass, a pocket watch, an ink bottle and a sealed letter" className={s.fill} fallback={<span className={s.imgFallback} />} />
			)}
			<span className={s.sealMark}>
				<Monogram />
			</span>
			<span className={s.watchMark}>11.47 · stopped</span>
		</div>
	);
}

const DESK_CLUES: LensClue[] = [
	{ id: 'seal', x: 0.739, y: 0.805, label: 'Examine the wax seal' },
	{ id: 'watch', x: 0.471, y: 0.782, label: 'Examine the pocket watch' },
];
const DESK_REST: [number, number] = [0.62, 0.3];

export function DeskPhoto({ src }: { src: string }) {
	return (
		<figure className={s.desk}>
			<p className={s.deskHead}>
				<span>City Police · Photograph 3</span>
				<span>The desk, as found · 6.40 a.m.</span>
			</p>
			<Lens label="The desk photograph" clues={DESK_CLUES} rest={DESK_REST} zoom={2.6} page={<DeskImage src={src} />} magnified={<DeskImage src={src} magnified />} />
			<figcaption className={s.deskCap}>Nothing has been moved. The letter is unopened. The watch was not wound.</figcaption>
		</figure>
	);
}

/* ------------------------------------------------------------------ the pawn ticket (stats) */
export function PawnTicket({ room, p }: { room: RoomWorldProps['room']; p: RoomWorldProps['presentation'] }) {
	return (
		<div className={s.ticket}>
			<p className={s.ticketShop}>
				J. Abernethy
				<span>Pawnbroker · Candlemaker Row</span>
			</p>
			<p className={s.ticketNo}>
				Pledge <b>No. 9</b>
			</p>
			<dl className={s.ticketRows}>
				<div>
					<dt>Article</dt>
					<dd>One locked study, contents unknown</dd>
				</div>
				<div>
					<dt>Party</dt>
					<dd>
						{p.minPlayers}–{p.maxPlayers} persons
					</dd>
				</div>
				<div>
					<dt>Time allowed</dt>
					<dd>{p.gameMinutes} minutes</dd>
				</div>
				<div>
					<dt>Whole visit</dt>
					<dd>{minutesLabel(room.visitMinutes)}</dd>
				</div>
				<div>
					<dt>Difficulty</dt>
					<dd>
						<Dots n={p.difficulty} label="Difficulty" />
					</dd>
				</div>
				<div>
					<dt>Fright</dt>
					<dd>
						<Dots n={p.fear} label="Fear" />
					</dd>
				</div>
				<div>
					<dt>Age</dt>
					<dd>{p.minAge} and over</dd>
				</div>
				<div>
					<dt>Redeemed</dt>
					<dd>{p.successRate} parties in 100 escape</dd>
				</div>
				{p.record ? (
					<div>
						<dt>Quickest</dt>
						<dd>{p.record}</dd>
					</div>
				) : null}
			</dl>
			<p className={s.ticketPrice}>
				From <b>{room.fromPriceLabel}</b> the party
			</p>
			<p className={s.ticketStub} aria-hidden>
				<span>No. 9</span>
				<span>Keep this ticket</span>
			</p>
		</div>
	);
}

function Dots({ n, label }: { n: number; label: string }) {
	return (
		<span className={s.dots} role="img" aria-label={`${label}: ${n} of 5`}>
			{Array.from({ length: 5 }, (_, i) => (
				<i key={i} data-on={i < n || undefined} />
			))}
		</span>
	);
}

/* ------------------------------------------------------------------ the game master */
export function CallingCard({ gm, venue }: { gm: NonNullable<RoomWorldProps['gameMaster']>; venue: string }) {
	const initials = gm.name
		.split(/\s+/)
		.map((w) => w[0] ?? '')
		.join('')
		.slice(0, 2);
	return (
		<div className={s.card}>
			<span className={s.cardCameo}>
				<SafeImg src={gm.image} alt={gm.name} className={s.fill} fallback={<Cameo initials={initials} className={s.fill} />} />
			</span>
			<span className={s.cardText}>
				<span className={s.cardName}>{gm.name}</span>
				<span className={s.cardTitle}>{gm.title}</span>
				<span className={s.cardVenue}>{venue}</span>
			</span>
		</div>
	);
}

export function GmNote({ gm }: { gm: NonNullable<RoomWorldProps['gameMaster']> }) {
	return (
		<div className={s.note}>
			<p className={s.noteHead}>From the desk of your game master</p>
			<p className={s.noteBody}>{gm.bio}</p>
			<p className={s.noteBody}>I watch every case from the next room. Ring the bell on the mantel and a hint comes down the speaking tube.</p>
			<p className={s.noteSign}>
				<Signature className={s.noteSig} />
				<span>{gm.name}</span>
			</p>
		</div>
	);
}

/* ------------------------------------------------------------------ exhibits (store photos) */
export function Exhibit({ src, i }: { src: string; i: number }) {
	const letter = String.fromCharCode(65 + i);
	return (
		<figure className={s.exhibit}>
			<div className={s.exhibitPrint}>
				<SafeImg src={src} alt={`Inside the room, view ${i + 1}`} className={s.fill} fallback={<span className={s.imgFallback} />} />
			</div>
			<figcaption>
				<span className={s.tag}>Exhibit {letter}</span>
				<span>Inside the study</span>
			</figcaption>
		</figure>
	);
}

/* ------------------------------------------------------------------ the register (records) */
export function Register({ records }: { records: RoomWorldProps['records'] }) {
	return (
		<div className={s.register}>
			<p className={s.registerHead}>Cases closed</p>
			<p className={s.registerSub}>This season · sample records</p>
			<ol>
				{records.map((r, i) => (
					<li key={r.team}>
						<span>{String(i + 1).padStart(2, '0')}</span>
						<b>{r.team}</b>
						<em>{r.time}</em>
					</li>
				))}
			</ol>
			<p className={s.registerFoot}>Your name here, in ink.</p>
		</div>
	);
}

/* ------------------------------------------------------------------ the end of the wall */
export function EndNote() {
	return (
		<div className={s.endNote}>
			<p>The warrant is signed. It only wants your names.</p>
			<a href="#warrant">
				To the warrant <span aria-hidden>↓</span>
			</a>
			<WaxSeal className={s.endSeal} />
		</div>
	);
}
