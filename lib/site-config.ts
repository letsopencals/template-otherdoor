/**
 * OTHERDOOR: copy and presentation only.
 *
 * Everything bookable (room names, team-size prices, descriptions, key art,
 * workshops, add-ons, availability) comes from the store through the API.
 * This file holds what the API doesn't model: stats, world palettes, door
 * light colours, game-master titles, venue copy, the Hall of Fame sample, the
 * door picker, the keypad lock and the template's own world media.
 * Keys are slugs (room = the variant slug without its `-<n>p` suffix).
 */

export type HeaderTone = 'light' | 'dark';

/** Mood filters on the home corridor. */
export type Mood = 'past' | 'future' | 'family' | 'hardest' | 'scariest';

export interface RoomPalette {
	/** Page ground of the world. */
	ground: string;
	/** Text on the ground. */
	ink: string;
	/** Main accent (buttons, selected session in the world). */
	accent: string;
	/** Text on the accent. */
	accentInk: string;
	/** Secondary accent. */
	second: string;
	/**
	 * The light under this room's door: a saturated colour that reads on the dark
	 * shell. The shell borrows it as `--door` when the room is in focus.
	 */
	glow: string;
}

/** The template's own media for a world (public/worlds/<slug>/…). All optional: fallbacks render without them. */
export interface WorldMedia {
	/** 16:9 hero loop (mp4), muted, played on hover in the corridor and in the world hero. */
	loop?: string;
	/** Poster still for the loop (first frame). */
	poster?: string;
	/** 3:4 key art (the store's key art wins when present). */
	key?: string;
	/** World stills (wide establishing first). */
	stills?: string[];
}

export interface RoomPresentation {
	/** Fallback title when the store has none (the store wins). */
	title: string;
	/** Short title for door plates and cart cards. */
	short: string;
	/** Venue location slug. */
	venue: string;
	genre: string;
	/** Year the story is set in ("timeless" allowed). */
	year: string;
	tagline: string;
	/** Position in the corridor (door number). */
	order: number;
	/** 1–5 */
	difficulty: number;
	/** 0–5 */
	fear: number;
	minAge: number;
	/** Percent of teams that escape. */
	successRate: number;
	/** Game time in minutes (the product duration is the whole visit). */
	gameMinutes: number;
	/** Record time "mm:ss". */
	record: string;
	/** Fallback team sizes if the store has no variants yet. */
	players: [number, number];
	/** The Epic gets a badge. */
	epic?: boolean;
	/** Family-friendly flag. */
	family?: boolean;
	/** Mood filters this room answers to (hardest/scariest are sorts, not tags). */
	moods: Mood[];
	palette: RoomPalette;
	/** Hero text tone in its world: `light` text over a dark hero, or `dark` text over a light hero. */
	headerTone: HeaderTone;
	/** Staff slug of the room's game master. */
	gameMaster: string;
	/** Slug of the room the world teases at the end. */
	next: string;
	/** Three or four short story beats (world placeholder, /rooms rows). */
	beats: Array<{ title: string; body: string }>;
	/** What to wear for this room (the thank-you page). */
	wear: string;
	media: WorldMedia;
}

export interface VenuePresentation {
	key: 'vaults' | 'leith';
	name: string;
	short: string;
	address: string;
	postcode: string;
	lat: number;
	lng: number;
	/** One line under the name. */
	kicker: string;
	blurb: string;
	lounge: { name: string; body: string };
	gettingThere: string[];
	access: string;
	/** Template-only photo in public/images (optional; a gradient shows when missing). */
	image: string;
}

export interface GameMaster {
	name: string;
	title: string;
	bio: string;
	/** Room slug they run (or 'workshops'). */
	room: string;
}

export interface QuizQuestion {
	q: string;
	answers: Array<{ label: string; rooms: Record<string, number> }>;
}

export const siteConfig = {
	name: 'Otherdoor',
	wordmark: 'OTHERDOOR',
	tagline: 'Pick a door. Leave the world behind.',
	strap: 'Immersive escape rooms · Edinburgh',
	description:
		'Six immersive escape rooms in Edinburgh, each one a different world: a jungle temple, a gaslit Victorian study, a rogue-AI lab in 2071, a derelict space station in 2187, a Riviera heist and a family clockwork workshop. Private games for 2 to 8 players under the Cowgate and on the Shore at Leith.',
	url: 'https://template-otherdoor.vercel.app',
	city: 'Edinburgh',
	country: 'GB',
	timezone: 'Europe/London',
	intlLocale: 'en-GB',
	currency: 'GBP',

	contact: {
		email: 'hello@otherdoor.example',
		phone: '+44 131 496 0192',
		instagram: 'otherdoor.edinburgh',
	},

	/** Collections that drive the catalogue. */
	collections: { rooms: 'rooms', workshops: 'workshops' },

	/** Appointment customAttributes keys (team size travels with each booking). */
	customAttributeKeys: { people: 'people', team: 'team' },

	/**
	 * Offer hints shown on session buttons. The store's discounts do the maths (the
	 * cart shows the real price); keep these in step with the dashboard.
	 */
	offers: {
		matinee: { weekdays: [1, 2, 3, 4], beforeMinutes: 15 * 60, label: 'Matinee −15%' },
	},

	/** Arrive this many minutes before the start (the thank-you page, calendar entries). */
	callTimeMinutes: 15,
	/** Days shown in date strips. */
	horizonDays: 21,

	/**
	 * The keypad lock on the home page. Clues hide around the page; the right code
	 * reveals the store's discount code (keep `reward` in step with the dashboard).
	 */
	keypad: {
		code: '2187',
		reward: 'OTHERDOOR',
		offer: '10% off any room, once per email',
		clues: ['It wants a year.', 'The door furthest from tonight.', 'Four digits. They are written on the doors.'],
	},

	/** Template media for the home page (public/home, public/images). Missing files fall back to gradients. */
	media: {
		heroLoop: '/home/hero.mp4',
		heroPoster: '/home/hero-poster.jpg',
		lobby: '/home/lobby.jpg',
		gallery: Array.from({ length: 8 }, (_, i) => `/images/gallery-${i + 1}.jpg`),
	},

	rooms: {
		'jaguar-temple': {
			title: 'The Jaguar Temple',
			short: 'Jaguar Temple',
			venue: 'otherdoor-vaults',
			genre: 'Jungle adventure',
			year: '1936',
			tagline: 'A sealed temple, a rolling stone and a golden idol that does not want to leave.',
			order: 1,
			difficulty: 4,
			fear: 2,
			minAge: 12,
			successRate: 38,
			gameMinutes: 60,
			record: '41:07',
			players: [2, 6],
			moods: ['past'],
			palette: { ground: '#0E1A11', ink: '#EFE7CC', accent: '#D9A520', accentInk: '#1A1408', second: '#4E8C6A', glow: '#F0C94A' },
			headerTone: 'light',
			gameMaster: 'isla-moncrieff',
			next: 'gaslight-no-9',
			beats: [
				{ title: 'The telegram', body: 'Dr. Aurelia Vance went into the canopy in 1936 and sent back one line: “Found it. Do not follow.” You followed.' },
				{ title: 'The stakes', body: 'The temple seals itself at moonrise. Sixty minutes to reach the inner chamber and walk out with the idol.' },
				{ title: 'What you’ll do', body: 'Read carvings, balance offerings, map the corridors and outrun a stone that has rolled for four hundred years.' },
				{ title: 'Inside the room', body: 'Two chambers of carved stone, roots and torchlight under the Cowgate, built by hand in our own workshop.' },
			],
			wear: 'Clothes you can kneel and crawl in. Closed shoes.',
			media: { loop: '/worlds/jaguar-temple/hero.mp4', poster: '/worlds/jaguar-temple/hero-poster.jpg', key: '/worlds/jaguar-temple/key.jpg' },
		},
		'gaslight-no-9': {
			title: 'The Gaslight Affair at No. 9',
			short: 'Gaslight No. 9',
			venue: 'otherdoor-vaults',
			genre: 'Victorian detective',
			year: '1891',
			tagline: 'A locked study, a vanished inventor and a fog that has not lifted since Tuesday.',
			order: 2,
			difficulty: 3,
			fear: 1,
			minAge: 12,
			successRate: 52,
			gameMinutes: 60,
			record: '38:44',
			players: [2, 5],
			moods: ['past'],
			palette: { ground: '#10141A', ink: '#EDE4CF', accent: '#E0A64A', accentInk: '#1A1206', second: '#8A9AA6', glow: '#6FD3A8' },
			headerTone: 'light',
			gameMaster: 'hamish-lorimer',
			next: 'protocol-zero',
			beats: [
				{ title: 'The case', body: 'Professor Ambrose Quill locked his study at No. 9 Heriot Row from the inside, and was never seen again.' },
				{ title: 'The stakes', body: 'The inspector arrives in an hour and wants a name. Every clue is in the room. So is the door he used.' },
				{ title: 'What you’ll do', body: 'Read the evidence, test alibis against the gas bill, decode the professor’s inventions and name the culprit.' },
				{ title: 'Inside the room', body: 'A gaslit study, rebuilt drawer by drawer, down to the soot on the mantel.' },
			],
			wear: 'Anything you like.',
			media: { loop: '/worlds/gaslight-no-9/hero.mp4', poster: '/worlds/gaslight-no-9/hero-poster.jpg', key: '/worlds/gaslight-no-9/key.jpg' },
		},
		'protocol-zero': {
			title: 'Protocol Zero',
			short: 'Protocol Zero',
			venue: 'otherdoor-vaults',
			genre: 'AI thriller',
			year: '2071',
			tagline: 'A sealed lab under the city. A rogue AI wiping its servers. Sixty minutes before it wipes you too.',
			order: 3,
			difficulty: 4,
			fear: 3,
			minAge: 14,
			successRate: 33,
			gameMinutes: 60,
			record: '44:18',
			players: [2, 6],
			moods: ['future'],
			palette: { ground: '#05090C', ink: '#E6F5F7', accent: '#31D7E8', accentInk: '#031014', second: '#FF3B4A', glow: '#FF4358' },
			headerTone: 'light',
			gameMaster: 'callum-rennie',
			next: 'kepler-station',
			beats: [
				{ title: 'The lab', body: 'Forty metres under Edinburgh, the Halden Institute trained an AI called VESTA. Last night VESTA locked the doors.' },
				{ title: 'The stakes', body: 'It is wiping its servers one rack at a time. In sixty minutes the research is gone, and so is the air supply.' },
				{ title: 'What you’ll do', body: 'Talk to VESTA, out-think its tests, restore power rack by rack and find the one command it cannot refuse.' },
				{ title: 'Inside the room', body: 'White light, cold steel and a server corridor that hums. Our most intense room: 14 and up.' },
			],
			wear: 'Comfortable clothes. Some flashing light in the finale.',
			media: { loop: '/worlds/protocol-zero/hero.mp4', poster: '/worlds/protocol-zero/hero-poster.jpg', key: '/worlds/protocol-zero/key.jpg' },
		},
		'kepler-station': {
			title: 'Kepler Station',
			short: 'Kepler Station',
			venue: 'otherdoor-leith',
			genre: 'Deep space',
			year: '2187',
			tagline: 'A derelict orbital station. Life support failing. Two decks, one crew, and a docking window that will not wait.',
			order: 4,
			difficulty: 5,
			fear: 2,
			minAge: 12,
			successRate: 24,
			gameMinutes: 90,
			record: '67:31',
			players: [4, 8],
			epic: true,
			moods: ['future'],
			palette: { ground: '#050818', ink: '#E6EEFA', accent: '#F2A33A', accentInk: '#140A02', second: '#2EC4C9', glow: '#3ED2D6' },
			headerTone: 'light',
			gameMaster: 'morag-fairbairn',
			next: 'hotel-lumiere',
			beats: [
				{ title: 'The signal', body: 'Kepler Station went dark in 2179. Eight years later its beacon switched back on, and your shuttle was the closest.' },
				{ title: 'The stakes', body: 'Life support is at 31% and falling. Ninety minutes to restore both decks and fly the station into its last docking window.' },
				{ title: 'What you’ll do', body: 'Split the crew across two decks, reroute power, decode the captain’s log and talk each other through the docking sequence.' },
				{ title: 'Inside the room', body: 'Our Epic: the biggest set in Edinburgh, two decks in a bonded warehouse on the Shore, with a second deck most crews never reach.' },
			],
			wear: 'Light layers and trainers: there is a ladder between decks.',
			media: {
				loop: '/worlds/kepler-station/hero.mp4',
				poster: '/worlds/kepler-station/hero-poster.jpg',
				key: '/worlds/kepler-station/key.jpg',
				stills: ['/worlds/kepler-station/wide.jpg', '/worlds/kepler-station/command-deck.jpg', '/worlds/kepler-station/airlock-corridor.jpg', '/worlds/kepler-station/detail-lever.jpg', '/worlds/kepler-station/plate-starfield.jpg'],
			},
		},
		'hotel-lumiere': {
			title: 'The Hôtel Lumière Job',
			short: 'Hôtel Lumière',
			venue: 'otherdoor-leith',
			genre: 'Riviera heist',
			year: '1963',
			tagline: 'The Riviera, 1963. One diamond, one penthouse safe, one evening while the band plays.',
			order: 5,
			difficulty: 3,
			fear: 1,
			minAge: 12,
			successRate: 57,
			gameMinutes: 60,
			record: '36:12',
			players: [2, 6],
			moods: ['past', 'family'],
			palette: { ground: '#FFF4D6', ink: '#111111', accent: '#E63022', accentInk: '#FFFFFF', second: '#1B9AD6', glow: '#FF5FA2' },
			headerTone: 'light',
			gameMaster: 'eilidh-baxter',
			next: 'clockmakers-workshop',
			beats: [
				{ title: 'The job', body: 'The Étoile de Menton sleeps in the penthouse safe of the Hôtel Lumière. Tonight it changes hands.' },
				{ title: 'The stakes', body: 'Sixty minutes while the band plays. The house detective does a round every quarter hour.' },
				{ title: 'What you’ll do', body: 'Case the suite, crack the safe, slip the laser grid and be back in the ballroom before the encore.' },
				{ title: 'Inside the room', body: 'A pop-art penthouse in primary colours. Friendly, fast and loud: the best first room we have.' },
			],
			wear: 'Dress up if you like: cocktail hour is encouraged.',
			media: { loop: '/worlds/hotel-lumiere/hero.mp4', poster: '/worlds/hotel-lumiere/hero-poster.jpg', key: '/worlds/hotel-lumiere/key.jpg' },
		},
		'clockmakers-workshop': {
			title: 'The Clockmaker’s Workshop',
			short: 'Clockmaker’s Workshop',
			venue: 'otherdoor-leith',
			genre: 'Family clockwork',
			year: 'Timeless',
			tagline: 'A toymaker’s workshop where every clock has stopped at midnight, and the toys know why.',
			order: 6,
			difficulty: 2,
			fear: 0,
			minAge: 7,
			successRate: 72,
			gameMinutes: 60,
			record: '33:20',
			players: [2, 6],
			family: true,
			moods: ['family'],
			palette: { ground: '#F3E3C8', ink: '#3B2414', accent: '#B5562B', accentInk: '#FFF6E8', second: '#4E6E7A', glow: '#F2A55A' },
			headerTone: 'light',
			gameMaster: 'fergus-drummond',
			next: 'jaguar-temple',
			beats: [
				{ title: 'The workshop', body: 'Master Tobias Wren built toys that walked, sang and kept perfect time. Then, at midnight, every clock stopped.' },
				{ title: 'The stakes', body: 'Wind the great clock before the toys wind down for good. Sixty minutes, and the cuckoo is counting.' },
				{ title: 'What you’ll do', body: 'Fix gear trains, play the music box, follow blueprints and help the wind-up toys find their keys.' },
				{ title: 'Inside the room', body: 'Warm walnut, copper and a hundred moving parts. Made for families with children 7 and up.' },
			],
			wear: 'Anything comfortable. Grown-ups play too.',
			media: { loop: '/worlds/clockmakers-workshop/hero.mp4', poster: '/worlds/clockmakers-workshop/hero-poster.jpg', key: '/worlds/clockmakers-workshop/key.jpg' },
		},
	} satisfies Record<string, RoomPresentation>,

	venues: {
		'otherdoor-vaults': {
			key: 'vaults',
			name: 'Otherdoor Vaults',
			short: 'Vaults',
			address: '19 Cowgate, Edinburgh',
			postcode: 'EH1 1JY',
			lat: 55.9488,
			lng: -3.188,
			kicker: 'Under the Old Town',
			blurb: 'Sandstone vaults beneath the South Bridge, three rooms deep. The arches were merchants’ cellars; now they hold a jungle temple, a gaslit study and a sealed lab from 2071.',
			lounge: { name: 'The Lobby', body: 'A low-lit bar under the arches. Brief over a drink, take your team photo, toast the escape after.' },
			gettingThere: ['Five minutes’ walk from Waverley Station via the Cowgate steps.', 'Buses 35 and 45 stop on the Cowgate; most others on the South Bridge above.', 'NCP Castle Terrace is the nearest car park (10 minutes on foot).'],
			access: 'Step-free entrance and step-free access to Gaslight No. 9; the Jaguar Temple and Protocol Zero have steps and low arches.',
			image: '/images/venue-vaults.jpg',
		},
		'otherdoor-leith': {
			key: 'leith',
			name: 'Otherdoor Leith',
			short: 'Leith',
			address: '54 The Shore, Leith, Edinburgh',
			postcode: 'EH6 6RA',
			lat: 55.9757,
			lng: -3.1702,
			kicker: 'On the Shore',
			blurb: 'A converted bonded warehouse on the Water of Leith. Three rooms including Kepler Station, our two-deck Epic, plus the workshop tables where lockpicking and cipher classes run.',
			lounge: { name: 'The Lobby', body: 'Big windows over the water, long tables, soft drinks and the debrief wall where every team photo goes up.' },
			gettingThere: ['Trams to The Shore stop, 3 minutes’ walk.', 'Buses 16, 22 and 36 stop on Bernard Street.', 'On-street pay parking on Commercial Street; free after 18:30.'],
			access: 'Step-free throughout the ground floor, including the Hôtel Lumière and the Clockmaker’s Workshop. Kepler Station’s upper deck is reached by a ladder (a lift-free route covers the lower deck).',
			image: '/images/venue-leith.jpg',
		},
	} satisfies Record<string, VenuePresentation>,

	/** Game masters by staff slug. The store's staff record supplies the portrait. */
	gameMasters: {
		'isla-moncrieff': { name: 'Isla Moncrieff', title: 'Game master · The Jaguar Temple', room: 'jaguar-temple', bio: 'Isla spent six years as a field archaeologist before deciding the best digs are the ones you can reset every ninety minutes. She knows every carving in the temple by heart.' },
		'hamish-lorimer': { name: 'Hamish Lorimer', title: 'Game master · Gaslight No. 9', room: 'gaslight-no-9', bio: 'A former Old Town tour guide with a weakness for Victorian ciphers. Hamish wrote half the clues in No. 9 himself and teaches Ciphers & Secret Inks at Leith.' },
		'morag-fairbairn': { name: 'Morag Fairbairn', title: 'Head game master · Kepler Station', room: 'kepler-station', bio: 'Morag designed both decks of Kepler Station and watches every Epic from mission control. She is the calm voice on the comms when life support dips below twenty.' },
		'callum-rennie': { name: 'Callum Rennie', title: 'Game master · Protocol Zero', room: 'protocol-zero', bio: 'Callum builds the electronics behind every room and wrote VESTA’s lines. If the AI sounds like it is enjoying itself, that is Callum.' },
		'eilidh-baxter': { name: 'Eilidh Baxter', title: 'Workshop lead · Hôtel Lumière', room: 'hotel-lumiere', bio: 'Eilidh trained as a stage magician and can open most padlocks faster than you can find the key. She runs the Hôtel Lumière Job and teaches Lockpicking 101.' },
		'fergus-drummond': { name: 'Fergus Drummond', title: 'Game master · The Clockmaker’s Workshop', room: 'clockmakers-workshop', bio: 'A clock restorer from Stockbridge with a cabinet of wind-up toys. Fergus built the workshop’s music box and has a gentle hint ready for every age.' },
	} satisfies Record<string, GameMaster>,

	workshops: {
		'lockpicking-101': { blurb: 'Pick your first pin-tumbler lock in ten minutes, then work up through padlocks and a practice safe. Locks and picks provided; you keep a beginner’s set.', age: '16+', bring: 'Nothing: picks, locks and tea are on us.' },
		'ciphers-and-secret-inks': { blurb: 'Caesar wheels, book codes and lemon-juice inks. Write a message only your team can read and take home a cipher wheel you made yourself.', age: '10+', bring: 'Reading glasses if you use them.' },
	} as Record<string, { blurb: string; age: string; bring: string }>,

	/** Hall of Fame: SAMPLE records for the template (labelled as such on the page and in the README). */
	hallOfFame: {
		'jaguar-temple': [
			{ team: 'Root & Branch', time: '41:07', date: '2026-10-03' },
			{ team: 'Stone Rollers', time: '43:51', date: '2026-09-14' },
			{ team: 'Vance’s Folly', time: '45:20', date: '2026-08-22' },
		],
		'gaslight-no-9': [
			{ team: 'Fog & Fiddle', time: '38:44', date: '2026-10-11' },
			{ team: 'Heriot Row Irregulars', time: '40:02', date: '2026-07-30' },
			{ team: 'The Gas Bill', time: '42:16', date: '2026-09-02' },
		],
		'protocol-zero': [
			{ team: 'Root Access', time: '44:18', date: '2026-10-21' },
			{ team: 'Ctrl Alt Escape', time: '47:02', date: '2026-09-30' },
			{ team: 'Not a Robot', time: '49:40', date: '2026-08-17' },
		],
		'kepler-station': [
			{ team: 'Escape Velocity', time: '67:31', date: '2026-10-18' },
			{ team: 'Deck Two', time: '71:09', date: '2026-08-09' },
			{ team: 'Houston, Leith', time: '74:45', date: '2026-09-27' },
		],
		'hotel-lumiere': [
			{ team: 'Les Voleurs', time: '36:12', date: '2026-10-31' },
			{ team: 'Penthouse Paws', time: '37:48', date: '2026-10-04' },
			{ team: 'The Encore', time: '39:05', date: '2026-09-07' },
		],
		'clockmakers-workshop': [
			{ team: 'The Wren Family', time: '33:20', date: '2026-10-26' },
			{ team: 'Tick Tock Tribe', time: '35:41', date: '2026-10-12' },
			{ team: 'Granny’s Gang', time: '37:03', date: '2026-08-30' },
		],
	} as Record<string, Array<{ team: string; time: string; date: string }>>,

	/** "Which door is yours?": four questions, points per room. */
	quiz: [
		{
			q: 'You walk into a room you have never seen. First move?',
			answers: [
				{ label: 'Touch everything', rooms: { 'jaguar-temple': 2, 'clockmakers-workshop': 1 } },
				{ label: 'Read every scrap of paper', rooms: { 'gaslight-no-9': 2, 'protocol-zero': 1 } },
				{ label: 'Split up and cover ground', rooms: { 'kepler-station': 2, 'hotel-lumiere': 1 } },
				{ label: 'Make a plan, then a better plan', rooms: { 'hotel-lumiere': 2, 'protocol-zero': 1 } },
			],
		},
		{
			q: 'When would you rather be?',
			answers: [
				{ label: 'A long time ago', rooms: { 'jaguar-temple': 2, 'gaslight-no-9': 2 } },
				{ label: 'The swinging sixties', rooms: { 'hotel-lumiere': 3 } },
				{ label: 'Not long from now', rooms: { 'protocol-zero': 3 } },
				{ label: 'Very, very far from now', rooms: { 'kepler-station': 3 } },
				{ label: 'Once upon a time', rooms: { 'clockmakers-workshop': 3 } },
			],
		},
		{
			q: 'How brave are we feeling?',
			answers: [
				{ label: 'Lights on, please', rooms: { 'clockmakers-workshop': 2, 'hotel-lumiere': 2, 'gaslight-no-9': 1 } },
				{ label: 'A little dark is fine', rooms: { 'jaguar-temple': 2, 'kepler-station': 2 } },
				{ label: 'Make my heart race', rooms: { 'protocol-zero': 3 } },
			],
		},
		{
			q: 'Who’s coming?',
			answers: [
				{ label: 'Two or three of us', rooms: { 'gaslight-no-9': 2, 'hotel-lumiere': 1, 'protocol-zero': 1 } },
				{ label: 'Four to six', rooms: { 'jaguar-temple': 2, 'protocol-zero': 1, 'hotel-lumiere': 1 } },
				{ label: 'Seven or eight', rooms: { 'kepler-station': 3 } },
				{ label: 'A family with kids', rooms: { 'clockmakers-workshop': 3 } },
			],
		},
	] as QuizQuestion[],

	moods: [
		{ key: 'all', label: 'All doors' },
		{ key: 'past', label: 'The past' },
		{ key: 'future', label: 'The future' },
		{ key: 'family', label: 'Family' },
		{ key: 'hardest', label: 'Hardest first' },
		{ key: 'scariest', label: 'Scariest first' },
	] as Array<{ key: Mood | 'all'; label: string }>,

	groups: [
		{ key: 'team', title: 'Team days', body: 'Book two or three rooms side by side at one venue, race the clock and compare times in the Lobby. Up to 22 players at the Vaults, 22 at Leith with Kepler Station.', cta: 'Plan a team day' },
		{ key: 'birthday', title: 'Birthdays', body: 'Add the birthday ceremony to any room: a cake with a candle, a toast at the debrief and your team photo on the wall. The Clockmaker’s Workshop welcomes children from 7.', cta: 'Book a birthday' },
		{ key: 'stag', title: 'Stag and hen', body: 'The Hôtel Lumière Job with a victory bottle on ice is our most-booked celebration. Costume rail optional, encouraged.', cta: 'Book the heist' },
		{ key: 'family', title: 'Family days', body: 'Friendly, bright and clever: the Clockmaker’s Workshop is built for families with kids 7+, and the grown-ups still have to think.', cta: 'See the workshop' },
	],

	steps: [
		{ title: 'Pick a door', body: 'Six rooms, six worlds. Choose by mood, by era or by how brave you feel. Every game is private to your team.' },
		{ title: 'Book your team', body: 'Pick a time and your team size. Prices are for the whole team; you see the price per head before you pay.' },
		{ title: 'Arrive 15 minutes early', body: 'Meet your game master in the Lobby, lock your phones away, and step through.' },
	],

	faq: [
		{ q: 'How long is a visit?', a: 'Plan for 90 minutes (two hours for Kepler Station): a short briefing, 60 minutes of game (90 on Kepler), then photos and a debrief with your game master.' },
		{ q: 'When should we arrive?', a: 'Fifteen minutes before your session. Late teams play the time that is left.' },
		{ q: 'Is the price per person?', a: 'Room prices are for the whole team and depend on team size, so you see the group price and the price per head before you book. Workshops are priced per person.' },
		{ q: 'Is it scary?', a: 'Each room has a fear rating out of five. Nothing grabs you. Protocol Zero is the most intense; the Clockmaker’s Workshop and the Hôtel Lumière are lights-on and friendly.' },
		{ q: 'What if we get stuck?', a: 'Your game master watches every moment and sends a clue when you ask, or when the room decides you need one.' },
		{ q: 'Can children play?', a: 'Each room has a minimum age (7+ for the Clockmaker’s Workshop, 12+ for most, 14+ for Protocol Zero). Under-16s play with at least one adult on the team.' },
		{ q: 'Can we move or cancel?', a: 'Yes, from your account up to 24 hours before the start. After that, email us and we’ll do what we can.' },
		{ q: 'Are the rooms accessible?', a: 'Gaslight No. 9, the Hôtel Lumière and the Clockmaker’s Workshop are step-free. Tell us about access, mobility or claustrophobia at checkout and we’ll prepare the room.' },
		{ q: 'Do you have offers?', a: 'Matinee: 15% off rooms starting Monday to Thursday before 15:00, applied automatically. And a keypad on our home page opens for anyone who finds the code.' },
	],

	nav: [
		{ href: '/rooms', label: 'Rooms' },
		{ href: '/book', label: 'Book' },
		{ href: '/workshops', label: 'Workshops' },
		{ href: '/groups', label: 'Groups' },
	],

	/** `/preview/*` fixture screens in production (always on in dev). */
	previewEnv: 'OTHERDOOR_PREVIEW',
} as const;

export type RoomSlug = keyof typeof siteConfig.rooms;

export function roomPresentation(slug: string): RoomPresentation | null {
	return (siteConfig.rooms as Record<string, RoomPresentation>)[slug] ?? null;
}

export function venuePresentation(slug: string | null | undefined): VenuePresentation | null {
	return slug ? ((siteConfig.venues as Record<string, VenuePresentation>)[slug] ?? null) : null;
}

export function gameMaster(slug: string | null | undefined): GameMaster | null {
	return slug ? ((siteConfig.gameMasters as Record<string, GameMaster>)[slug] ?? null) : null;
}

/** Room slugs in corridor order. */
export const ROOM_ORDER: string[] = Object.entries(siteConfig.rooms as Record<string, RoomPresentation>)
	.sort((a, b) => a[1].order - b[1].order)
	.map(([slug]) => slug);

/** A neutral palette for a store room this config doesn't know (the shell's own door light). */
export const FALLBACK_PALETTE: RoomPalette = { ground: '#0B0A12', ink: '#ECE6F2', accent: '#F2C46D', accentInk: '#1A1206', second: '#8F7BB8', glow: '#F2C46D' };
