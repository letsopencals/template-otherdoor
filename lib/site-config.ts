/**
 * THE GILDED COMPASS: copy and presentation only.
 *
 * Everything bookable (room names, team-size prices, descriptions, images,
 * workshops, add-ons, availability) comes from the store through the API.
 * This file holds what the API doesn't model: stats, palettes, game-master
 * titles, venue copy, the Hall of Fame sample, the quiz and the cryptex.
 * Keys are slugs (room = the variant slug without its `-<n>p` suffix).
 */

export type HeaderTone = 'light' | 'dark';

export interface RoomPalette {
	/** Page ground of the world. */
	ground: string;
	/** Text on the ground. */
	ink: string;
	/** Main accent (buttons, selected session). */
	accent: string;
	/** Text on the accent. */
	accentInk: string;
	/** Secondary accent. */
	second: string;
	/** Leather colour of the book spine on the shelf. */
	spine: string;
	/** Foil / title colour on the spine. */
	foil: string;
}

export interface RoomPresentation {
	/** Fallback title when the store has none (the store wins). */
	title: string;
	/** Short title for spines and tags. */
	short: string;
	/** Venue location slug. */
	venue: string;
	genre: string;
	/** Year the story is set in. */
	year: string;
	tagline: string;
	/** Volume number on the shelf (roman numeral rendered). */
	volume: number;
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
	/** Epic rooms get a ribbon. */
	epic?: boolean;
	/** Family-friendly flag. */
	family?: boolean;
	palette: RoomPalette;
	/** Hero text tone in its world: `light` text over a dark hero, or `dark` text over a light hero. */
	headerTone: HeaderTone;
	/** Staff slug of the room's game master. */
	gameMaster: string;
	/** Slug of the room the world teases at the end. */
	next: string;
	/** Three or four short story beats for the world placeholder and the /rooms plates. */
	beats: Array<{ title: string; body: string }>;
	/** What to wear for this room (the invitation). */
	wear: string;
}

export interface VenuePresentation {
	key: 'vaults' | 'leith';
	name: string;
	short: string;
	address: string;
	postcode: string;
	lat: number;
	lng: number;
	blurb: string;
	lounge: { name: string; body: string };
	gettingThere: string[];
	access: string;
	/** Template-only photo in public/images (optional, SVG plate when missing). */
	image: string;
}

export interface GameMaster {
	name: string;
	title: string;
	bio: string;
	/** Room slug they run (or 'workshops'). */
	room: string;
	/** Initials-plate colour. */
	tone: string;
}

export interface QuizQuestion {
	q: string;
	answers: Array<{ label: string; rooms: Record<string, number> }>;
}

export const siteConfig = {
	name: 'The Gilded Compass',
	shortName: 'Gilded Compass',
	tagline: 'Every room is a story you walk into.',
	strap: 'Adventure rooms · Edinburgh',
	description:
		'Six original adventure escape rooms under the Old Town and on the Shore at Leith: a jungle temple, a gaslit study, a desert tomb, a brass submarine, a Riviera jewel job and a clockwork workshop. Book a room for your team in Edinburgh.',
	url: 'https://template-compass.vercel.app',
	city: 'Edinburgh',
	country: 'GB',
	timezone: 'Europe/London',
	intlLocale: 'en-GB',
	currency: 'GBP',

	contact: {
		email: 'expeditions@gildedcompass.example',
		phone: '+44 131 496 0192',
		instagram: 'gildedcompass',
	},

	/** Collections that drive the catalogue. */
	collections: { rooms: 'rooms', workshops: 'workshops' },

	/** Appointment customAttributes keys (team name travels with each booking). */
	customAttributeKeys: { people: 'people', team: 'team' },

	/**
	 * Offer hints shown on session buttons. The store's discounts do the maths (the
	 * satchel shows the real price); keep these in step with the dashboard.
	 */
	offers: {
		matinee: { weekdays: [1, 2, 3, 4], beforeMinutes: 15 * 60, label: 'Matinee −15%' },
	},

	/** Call time before the start (the invitation). */
	callTimeMinutes: 15,
	/** Days shown in date strips. */
	horizonDays: 21,

	/** The home page's cryptex: the six letters hide on the spines; opening it reveals the code. */
	cryptex: {
		word: 'VOYAGE',
		code: 'GILDED',
		offer: '10% off any room',
		clues: [
			'Each volume on the shelf carries one gilt letter at its foot. Read them left to right.',
			'Hold the lantern over the map: the society’s word is the thing every room is.',
			'Six rings, six letters, one journey.',
		],
	},

	media: {
		heroMap: '/images/hero-map.jpg',
		heroVideo: '/videos/hero.mp4',
		heroPoster: '/videos/hero-poster.jpg',
		mapRoom: '/images/map-room.jpg',
		gallery: Array.from({ length: 8 }, (_, i) => `/images/gallery-${i + 1}.jpg`),
	},

	rooms: {
		'jaguar-temple': {
			title: 'The Jaguar Temple',
			short: 'Jaguar Temple',
			venue: 'gilded-compass-vaults',
			genre: 'Jungle expedition',
			year: '1936',
			tagline: 'A sealed temple, a rolling stone and a golden idol that does not want to leave.',
			volume: 1,
			difficulty: 4,
			fear: 2,
			minAge: 12,
			successRate: 38,
			gameMinutes: 60,
			record: '41:07',
			players: [2, 6],
			palette: { ground: '#1F3320', ink: '#F3EBD2', accent: '#D9A520', accentInk: '#1A1A10', second: '#4E8C6A', spine: '#2E4A2A', foil: '#E8C35A' },
			headerTone: 'light',
			gameMaster: 'isla-moncrieff',
			next: 'gaslight-no-9',
			beats: [
				{ title: 'The expedition', body: 'Dr. Aurelia Vance went into the canopy in 1936 and sent back one telegram: “Found it. Do not follow.” You followed.' },
				{ title: 'The stakes', body: 'The temple seals itself at moonrise. Sixty minutes to reach the inner chamber and walk out with the idol.' },
				{ title: 'What you’ll do', body: 'Read carvings, balance offerings, map the corridors and outrun a stone that has rolled for four hundred years.' },
				{ title: 'Inside the room', body: 'Two chambers of carved stone, roots and lantern light under the Cowgate, built by hand in our own workshop.' },
			],
			wear: 'Clothes you can kneel and crawl in. Closed shoes.',
		},
		'gaslight-no-9': {
			title: 'The Gaslight Affair at No. 9',
			short: 'Gaslight No. 9',
			venue: 'gilded-compass-vaults',
			genre: 'Victorian detective',
			year: '1891',
			tagline: 'A locked study, a vanished inventor and a fog that has not lifted since Tuesday.',
			volume: 2,
			difficulty: 3,
			fear: 1,
			minAge: 12,
			successRate: 52,
			gameMinutes: 60,
			record: '38:44',
			players: [2, 5],
			palette: { ground: '#1C2B24', ink: '#EFE6D0', accent: '#D69A3C', accentInk: '#1A140A', second: '#7A8C7E', spine: '#24402F', foil: '#E2B86A' },
			headerTone: 'light',
			gameMaster: 'hamish-lorimer',
			next: 'cartographers-tomb',
			beats: [
				{ title: 'The case', body: 'Professor Ambrose Quill locked his study at No. 9 Heriot Row from the inside, and was never seen again.' },
				{ title: 'The stakes', body: 'The inspector arrives in an hour and wants a name. Every clue is in the room. So is the door he used.' },
				{ title: 'What you’ll do', body: 'Read the evidence, test alibis against the gas bill, decode the professor’s inventions and name the culprit.' },
				{ title: 'Inside the room', body: 'A gaslit Victorian study, rebuilt drawer by drawer, down to the soot on the mantel.' },
			],
			wear: 'Anything you like. Deerstalkers are not required.',
		},
		'cartographers-tomb': {
			title: 'The Cartographer’s Tomb',
			short: 'Cartographer’s Tomb',
			venue: 'gilded-compass-vaults',
			genre: 'Desert excavation',
			year: '1922',
			tagline: 'A mapmaker’s burial chamber, two rooms deep, and a map that only draws itself in the dark.',
			volume: 3,
			difficulty: 5,
			fear: 3,
			minAge: 14,
			successRate: 24,
			gameMinutes: 90,
			record: '67:31',
			players: [4, 8],
			epic: true,
			palette: { ground: '#E9D4A8', ink: '#2A1C10', accent: '#1F3F8F', accentInk: '#F6EBD2', second: '#B5532C', spine: '#1F3F8F', foil: '#E6C46A' },
			headerTone: 'dark',
			gameMaster: 'morag-fairbairn',
			next: 'leviathan-dive',
			beats: [
				{ title: 'The dig', body: 'In 1922 the society’s dig found a tomb no list mentioned: the resting place of the royal cartographer.' },
				{ title: 'The stakes', body: 'Ninety minutes, two chambers, one map. Lose the light and the sand takes the passage back.' },
				{ title: 'What you’ll do', body: 'Split up, work two chambers at once and bring the halves of the map together for the finale.' },
				{ title: 'Inside the room', body: 'Our Epic: the largest set in Edinburgh, with a second chamber most teams never see.' },
			],
			wear: 'Light layers: the tomb is warm. Closed shoes.',
		},
		'leviathan-dive': {
			title: 'The Leviathan Dive',
			short: 'Leviathan Dive',
			venue: 'gilded-compass-leith',
			genre: 'Brass submarine',
			year: '1870',
			tagline: 'A brass submarine at the bottom of the trench, the oxygen running low and something outside.',
			volume: 4,
			difficulty: 4,
			fear: 2,
			minAge: 12,
			successRate: 41,
			gameMinutes: 60,
			record: '43:58',
			players: [2, 6],
			palette: { ground: '#0D2A2E', ink: '#E3F1EC', accent: '#C9A24B', accentInk: '#10201E', second: '#3FA79A', spine: '#1F5A55', foil: '#D7B45E' },
			headerTone: 'light',
			gameMaster: 'callum-rennie',
			next: 'hotel-lumiere',
			beats: [
				{ title: 'The dive', body: 'Captain Elspeth Haldane took the Leviathan down in 1870 to find the bottom of the sea. She found it.' },
				{ title: 'The stakes', body: 'The engines are dead, the ballast is jammed and the oxygen dial says sixty minutes. Bring her up.' },
				{ title: 'What you’ll do', body: 'Restart the engine room, read the sonar, steer through the trench and blow the tanks before the air runs out.' },
				{ title: 'Inside the room', body: 'A riveted brass hull in an old bonded warehouse on the Shore, with real portholes and a lot of pipes.' },
			],
			wear: 'Comfortable clothes. The hatches are low.',
		},
		'hotel-lumiere': {
			title: 'The Hôtel Lumière Job',
			short: 'Hôtel Lumière',
			venue: 'gilded-compass-leith',
			genre: 'Riviera heist',
			year: '1963',
			tagline: 'The Riviera, 1963. One diamond, one penthouse safe, one evening while the band plays.',
			volume: 5,
			difficulty: 3,
			fear: 1,
			minAge: 12,
			successRate: 57,
			gameMinutes: 60,
			record: '36:12',
			players: [2, 6],
			palette: { ground: '#FFF4D6', ink: '#111111', accent: '#E63022', accentInk: '#FFFFFF', second: '#1B9AD6', spine: '#E63022', foil: '#FFD23F' },
			headerTone: 'dark',
			gameMaster: 'eilidh-baxter',
			next: 'clockmakers-workshop',
			beats: [
				{ title: 'The job', body: 'The Étoile de Menton sleeps in the penthouse safe of the Hôtel Lumière. Tonight it changes hands.' },
				{ title: 'The stakes', body: 'Sixty minutes while the band plays. The house detective does a round every quarter hour.' },
				{ title: 'What you’ll do', body: 'Case the suite, crack the safe, slip the laser grid and be back in the ballroom before the encore.' },
				{ title: 'Inside the room', body: 'A pop-art penthouse in primary colours. Friendly, fast and loud: the best first room we have.' },
			],
			wear: 'Dress up if you like: cocktail hour is encouraged.',
		},
		'clockmakers-workshop': {
			title: 'The Clockmaker’s Workshop',
			short: 'Clockmaker’s Workshop',
			venue: 'gilded-compass-leith',
			genre: 'Clockwork workshop',
			year: '1899',
			tagline: 'A toymaker’s workshop where every clock has stopped at midnight, and the toys know why.',
			volume: 6,
			difficulty: 2,
			fear: 0,
			minAge: 7,
			successRate: 72,
			gameMinutes: 60,
			record: '33:20',
			players: [2, 6],
			family: true,
			palette: { ground: '#F3E3C8', ink: '#3B2414', accent: '#B5562B', accentInk: '#FFF6E8', second: '#4E6E7A', spine: '#6B3F22', foil: '#E8B66A' },
			headerTone: 'dark',
			gameMaster: 'fergus-drummond',
			next: 'jaguar-temple',
			beats: [
				{ title: 'The workshop', body: 'Master Tobias Wren built toys that walked, sang and kept perfect time. Then, at midnight, every clock stopped.' },
				{ title: 'The stakes', body: 'Wind the great clock before the toys wind down for good. Sixty minutes, and the cuckoo is counting.' },
				{ title: 'What you’ll do', body: 'Fix gear trains, play the music box, follow blueprints and help the wind-up toys find their keys.' },
				{ title: 'Inside the room', body: 'Warm walnut, brass and a hundred moving parts. Made for families with children 7 and up.' },
			],
			wear: 'Anything comfortable. Grown-ups play too.',
		},
	} satisfies Record<string, RoomPresentation>,

	venues: {
		'gilded-compass-vaults': {
			key: 'vaults',
			name: 'The Vaults, Cowgate',
			short: 'The Vaults',
			address: '19 Cowgate, Edinburgh',
			postcode: 'EH1 1JY',
			lat: 55.9488,
			lng: -3.188,
			blurb: 'Underground sandstone vaults beneath the Old Town, three rooms deep. The arches were cellars for the merchants of the South Bridge; now they hold a temple, a study and a tomb.',
			lounge: { name: 'The Map Room', body: 'A low-lit bar under the arches with charts on every wall. Arrive early, brief over a drink, toast the escape after.' },
			gettingThere: ['Five minutes’ walk from Waverley Station via the Cowgate steps.', 'Buses 35 and 45 stop on the Cowgate; most others on the South Bridge above.', 'NCP Castle Terrace is the nearest car park (10 minutes on foot).'],
			access: 'Step-free entrance and step-free access to Gaslight No. 9; the Jaguar Temple and the Tomb have steps and low arches.',
			image: '/images/venue-vaults.jpg',
		},
		'gilded-compass-leith': {
			key: 'leith',
			name: 'The Bond, Leith',
			short: 'The Bond',
			address: '54 The Shore, Leith, Edinburgh',
			postcode: 'EH6 6RA',
			lat: 55.9757,
			lng: -3.1702,
			blurb: 'A converted bonded whisky warehouse on the Shore. Three rooms, the Workshop Hall for classes, and big windows over the Water of Leith.',
			lounge: { name: 'The Workshop Hall', body: 'Long oak tables where lockpicking and secret-ink classes run, and where teams gather before the Leviathan dives.' },
			gettingThere: ['Trams to The Shore stop, 3 minutes’ walk.', 'Buses 16, 22 and 36 stop on Bernard Street.', 'On-street pay parking on Commercial Street; free after 18:30.'],
			access: 'Step-free throughout the ground floor, including the Hôtel Lumière and the Clockmaker’s Workshop.',
			image: '/images/venue-leith.jpg',
		},
	} satisfies Record<string, VenuePresentation>,

	/** Game masters by staff slug. The store's staff record supplies the portrait. */
	gameMasters: {
		'isla-moncrieff': { name: 'Isla Moncrieff', title: 'Head of Expeditions', room: 'jaguar-temple', tone: '#2E4A2A', bio: 'Isla spent six years as a field archaeologist before deciding the best digs are the ones you can reset every ninety minutes. She briefs every Jaguar Temple team in full expedition kit and keeps a logbook of every party that made it out with the idol.' },
		'hamish-lorimer': { name: 'Hamish Lorimer', title: 'Inspector of Curiosities', room: 'gaslight-no-9', tone: '#24402F', bio: 'A former Old Town ghost-tour guide with a weakness for Victorian ciphers. Hamish wrote half the clues in No. 9 himself, runs the Gaslight Affair most evenings and teaches Ciphers & Secret Inks at the Bond.' },
		'morag-fairbairn': { name: 'Morag Fairbairn', title: 'Keeper of Maps', room: 'cartographers-tomb', tone: '#1F3F8F', bio: 'Morag drew maps for a living before she started hiding them. She designed the two chambers of the Cartographer’s Tomb, watches every Epic from the control desk and has never once given away the star chart.' },
		'callum-rennie': { name: 'Callum Rennie', title: 'Chief of the Deep', room: 'leviathan-dive', tone: '#1F5A55', bio: 'Callum grew up on the Shore, worked the boats out of Leith and built most of the Leviathan’s brass by hand. He is the voice on the crackling speaker when the oxygen starts to run low.' },
		'eilidh-baxter': { name: 'Eilidh Baxter', title: 'Keeper of Keys', room: 'hotel-lumiere', tone: '#E63022', bio: 'Eilidh trained as a stage magician and can open most padlocks faster than you can find the key. She runs the Hôtel Lumière Job in a dinner jacket and teaches Lockpicking 101 at the Bond.' },
		'fergus-drummond': { name: 'Fergus Drummond', title: 'Master of Springs', room: 'clockmakers-workshop', tone: '#6B3F22', bio: 'A clock restorer from Stockbridge with a workshop full of wind-up toys. Fergus built the Clockmaker’s music box, plays Master Wren’s apprentice for families and has a gentle hint ready for every age.' },
	} satisfies Record<string, GameMaster>,

	workshops: {
		'lockpicking-101': { blurb: 'Pick your first pin-tumbler lock in ten minutes, then work up through padlocks and a practice safe. Locks and picks provided; you keep a beginner’s set.', age: '16+', bring: 'Nothing: picks, locks and tea are on us.' },
		'ciphers-and-secret-inks': { blurb: 'Caesar wheels, book codes and lemon-juice inks. Write a message only your team can read and take home a cipher wheel you made yourself.', age: '10+', bring: 'Reading glasses if you use them.' },
	} as Record<string, { blurb: string; age: string; bring: string }>,

	/** Add-on presentation by add-on slug (title, price and description come from the store). */
	addOns: {
		'expedition-portrait': { glyph: 'frame' },
		'victory-bottle': { glyph: 'bottle' },
		'provisions-hamper': { glyph: 'hamper' },
		'costume-trunk': { glyph: 'trunk' },
		'escape-on-film': { glyph: 'film' },
		'birthday-ceremony': { glyph: 'candle' },
	} as Record<string, { glyph: 'frame' | 'bottle' | 'hamper' | 'trunk' | 'film' | 'candle' }>,

	/** Hall of Fame: SAMPLE records for the template (labelled as such in the README). */
	hallOfFame: {
		'jaguar-temple': [
			{ team: 'The Lost Lanterns', time: '41:07', date: '2026-10-03' },
			{ team: 'Stone Rollers', time: '43:51', date: '2026-09-14' },
			{ team: 'Vance’s Folly', time: '45:20', date: '2026-08-22' },
		],
		'gaslight-no-9': [
			{ team: 'Fog & Fiddle', time: '38:44', date: '2026-10-11' },
			{ team: 'Heriot Row Irregulars', time: '40:02', date: '2026-07-30' },
			{ team: 'The Gas Bill', time: '42:16', date: '2026-09-02' },
		],
		'cartographers-tomb': [
			{ team: 'True North', time: '67:31', date: '2026-10-18' },
			{ team: 'Sand in the Gears', time: '71:09', date: '2026-08-09' },
			{ team: 'Two Chambers', time: '74:45', date: '2026-09-27' },
		],
		'leviathan-dive': [
			{ team: 'Blow the Tanks', time: '43:58', date: '2026-10-25' },
			{ team: 'Shore Leave', time: '46:30', date: '2026-09-19' },
			{ team: 'Fathom Five', time: '47:12', date: '2026-08-15' },
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

	quiz: [
		{
			q: 'Your team walks into an unknown room. First move?',
			answers: [
				{ label: 'Touch everything', rooms: { 'jaguar-temple': 2, 'leviathan-dive': 1 } },
				{ label: 'Read every scrap of paper', rooms: { 'gaslight-no-9': 2, 'cartographers-tomb': 1 } },
				{ label: 'Find the exits and make a plan', rooms: { 'hotel-lumiere': 2, 'leviathan-dive': 1 } },
				{ label: 'Hand the torch to the youngest', rooms: { 'clockmakers-workshop': 3 } },
			],
		},
		{
			q: 'How brave are we feeling?',
			answers: [
				{ label: 'Lights on, please', rooms: { 'clockmakers-workshop': 2, 'hotel-lumiere': 2, 'gaslight-no-9': 1 } },
				{ label: 'A little dark is fine', rooms: { 'jaguar-temple': 2, 'leviathan-dive': 2 } },
				{ label: 'Bring on the tomb', rooms: { 'cartographers-tomb': 3 } },
			],
		},
		{
			q: 'How many explorers?',
			answers: [
				{ label: 'Two or three', rooms: { 'gaslight-no-9': 2, 'hotel-lumiere': 1, 'jaguar-temple': 1 } },
				{ label: 'Four to six', rooms: { 'jaguar-temple': 1, 'leviathan-dive': 2, 'hotel-lumiere': 1 } },
				{ label: 'Seven or eight', rooms: { 'cartographers-tomb': 3 } },
				{ label: 'A family with kids', rooms: { 'clockmakers-workshop': 3 } },
			],
		},
		{
			q: 'Pick a souvenir.',
			answers: [
				{ label: 'A golden idol', rooms: { 'jaguar-temple': 3 } },
				{ label: 'A signed confession', rooms: { 'gaslight-no-9': 3 } },
				{ label: 'A diamond, discreetly', rooms: { 'hotel-lumiere': 3 } },
				{ label: 'A brass porthole', rooms: { 'leviathan-dive': 3 } },
				{ label: 'A wind-up bird', rooms: { 'clockmakers-workshop': 3 } },
				{ label: 'A map nobody else has', rooms: { 'cartographers-tomb': 3 } },
			],
		},
	] satisfies QuizQuestion[],

	groups: [
		{ key: 'team', title: 'Team days', body: 'Book two or three rooms side by side at the same venue, race the clock and compare times over drinks in the Map Room. Up to 22 explorers at the Vaults, 18 at the Bond.', cta: 'Plan a team day' },
		{ key: 'birthday', title: 'Birthdays', body: 'Add the birthday ceremony to any room: a sealed scroll from the society, a candle cake and a toast at the debrief. The Clockmaker’s Workshop welcomes children from 7.', cta: 'Book a birthday' },
		{ key: 'stag', title: 'Stag and hen', body: 'The Hôtel Lumière Job with the Victory Bottle on ice is our most-booked celebration. Costume trunk optional, encouraged.', cta: 'Book the heist' },
		{ key: 'family', title: 'Family days', body: 'Friendly, bright and clever: the Clockmaker’s Workshop is built for families with kids 7+, and grown-ups still have to think.', cta: 'See the workshop' },
	],

	faq: [
		{ q: 'How long is a visit?', a: 'Plan for 90 minutes (two hours for the Cartographer’s Tomb): a short briefing, 60 minutes of game (90 in the Tomb), then photos and a debrief with your game master.' },
		{ q: 'When should we arrive?', a: 'Fifteen minutes before your session. That is the call time on your invitation. Late teams play the time that is left.' },
		{ q: 'Is the price per person?', a: 'Room prices are for the whole team and depend on team size, so you see the group price and the price per head before you book. Workshops are priced per person.' },
		{ q: 'Is it scary?', a: 'Each room has a fear rating out of five. Nothing jumps at you; the Tomb is dark and atmospheric. The Clockmaker’s Workshop and the Hôtel Lumière are lights-on and friendly.' },
		{ q: 'What if we get stuck?', a: 'Your game master watches every moment and sends clues when you ask, or when the room decides you need one. Nobody leaves without a story.' },
		{ q: 'Can children play?', a: 'Each room has a minimum age (7+ for the Clockmaker’s Workshop, 12+ for most, 14+ for the Tomb). Under-16s play with at least one adult on the team.' },
		{ q: 'Can we move or cancel?', a: 'Yes, from your Explorer’s Logbook up to 24 hours before the start. After that, email us and we’ll do what we can.' },
		{ q: 'Are the rooms accessible?', a: 'Gaslight No. 9, the Hôtel Lumière and the Clockmaker’s Workshop are step-free. Tell us about access, mobility or claustrophobia at checkout and we’ll prepare the room.' },
		{ q: 'Do you have offers?', a: 'Matinee: 15% off rooms starting Monday to Thursday before 15:00, applied automatically. And there is a code hidden in the cryptex on our home page.' },
	],

	nav: [
		{ href: '/rooms', label: 'Rooms' },
		{ href: '/book', label: 'Book' },
		{ href: '/workshops', label: 'Workshops' },
		{ href: '/groups', label: 'Groups' },
	],

	/** `/preview/*` fixture screens in production (always on in dev). */
	previewEnv: 'COMPASS_PREVIEW',
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

/** Room slugs in shelf order (by volume). */
export const ROOM_ORDER: string[] = Object.entries(siteConfig.rooms as Record<string, RoomPresentation>)
	.sort((a, b) => a[1].volume - b[1].volume)
	.map(([slug]) => slug);

/** A neutral palette for a store room this config doesn't know. */
export const FALLBACK_PALETTE: RoomPalette = { ground: '#F4EAD5', ink: '#15201B', accent: '#1E3A30', accentInk: '#FBF6EA', second: '#7A1E22', spine: '#7A1E22', foil: '#E6C46A' };
