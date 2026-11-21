/**
 * AFTERGLOW: brand copy and gym knowledge for the template.
 *
 * Business data (classes, prices, capacities, coaches and crew, sites, add-ons,
 * logo and banner) loads from the Opencals storefront API. This file holds only
 * what the API has no field for: the category → tone mapping, which set (room)
 * each class runs on, crew roles and handles, site copy, the shot add-on
 * deliverables and the Glow Pass preview. A gym that forks the template
 * rewrites this file and keeps the code.
 *
 * Lookups are keyed by API slugs: collection slugs (categories), location slugs
 * (sites), staff slugs (people), add-on titles (shots) and the class key that
 * `lib/catalog.ts` derives from variant slugs (`glute-lab-south-beach-valentina`
 * → `glute-lab`). Anything the API returns that has no entry here still renders.
 *
 * Every number on the site (spots left, prices, sessions this week) comes from
 * the API. Don't put made-up stats here.
 */

/* ------------------------------------------------------------------ Types */

/** Category gel colours: the 3px edge on set cards and the story-ring seed. */
export type Tone = 'ride' | 'sculpt' | 'flow' | 'box' | 'sweat' | 'coaching' | 'content' | 'glow' | 'bar' | 'events';

/** How a category's products are booked. */
export type CategoryMode = 'timetable' | 'booker' | 'events';

export interface CategoryMeta {
	label: string;
	tone: Tone;
	mode: CategoryMode;
	/** Where the category is booked. */
	href: string;
	tagline: string;
	blurb: string;
}

export type SetKey = 'rooftop' | 'mirror-hall' | 'beach' | 'neon-room' | 'ring' | 'mural-floor' | 'studio-wall';

export interface SetMeta {
	name: string;
	/** Site key (`south-beach`, `wynwood`). */
	site: string;
	/** Outdoor sets get the golden-hour badge. */
	outdoor: boolean;
	light: string;
	blurb: string;
	image: string;
	/** Camera readout on the set photo. */
	readout: string;
}

export interface ClassMeta {
	/** Category (collection slug). The collection wins when the API has it. */
	category: string;
	short: string;
	set: SetKey;
	/** 1 (easy) – 5 (all out). */
	intensity: 1 | 2 | 3 | 4 | 5;
	level: string;
	tagline: string;
	/** What the crew shoots in this class (shown next to the shot add-ons). */
	shotNote: string;
	whatToBring: string[];
	/** Wardrobe note for the call sheet. */
	wardrobe: string;
}

export interface ServiceMeta {
	/** Extra slug prefixes that belong to this service (`pt-` → physique-coaching). */
	prefixes?: string[];
	/** Category (collection slug). Site copy wins over the API's collection. */
	category: string;
	short: string;
	tagline: string;
	/** Bullet points for the service card ("what you get"). */
	includes: string[];
	/** Minutes between suggested start times (default 30). */
	startStep?: number;
	/** Lengths offered (minutes) for custom-duration products. */
	lengths?: number[];
	whatToBring?: string[];
	wardrobe?: string;
	/** Partner sessions: one booking for two people (customAttributes.people = "2"). */
	people?: 2;
	/** Tables: the party size is the number of attendees. */
	party?: boolean;
	set?: SetKey;
	/** What the person you choose is called on this service ("Photographer", "Coach"). */
	whoLabel?: string;
	/** A `content` service the customer shoots themselves (the Studio Wall hire): no crew, no edits. */
	selfShoot?: true;
}

export type Role = 'coach' | 'photographer' | 'videographer' | 'makeup';

export interface PersonMeta {
	role: Role;
	tier?: 'coach' | 'senior' | 'head';
	handle: string;
	title: string;
	bio: string;
	specialties: string[];
	/** Category slugs a coach leads with. */
	categories: string[];
	quote: string;
}

export type ShotKind = 'clips' | 'photos' | 'reel' | 'roll';

export interface ShotMeta {
	kind: ShotKind;
	label: string;
	deliverable: string;
	/** "3 × 9:16 clips", "10 edits". */
	spec: string;
	eta: string;
}

export interface SiteMeta {
	key: string;
	name: string;
	nickname: string;
	neighborhood: string;
	blurb: string;
	transit: string;
	parking: string;
	hours: string;
	sets: SetKey[];
	facilities: string[];
	images: string[];
}

export interface StoryMeta {
	key: string;
	label: string;
	/** Ring thumbnail. */
	thumb: string;
	clips: Array<{ video: string; poster: string; caption: string; cta?: { label: string; href: string } }>;
}

/* ------------------------------------------------------------------ Config */

export const siteConfig = {
	name: 'Afterglow',
	tagline: 'Train. Glow. Get the shot.',
	description:
		'A content gym in Miami. Rhythm rides, glute lab, rooftop yoga and boxing in South Beach and Wynwood, with an in-house crew that photographs and films you while you train. You train. We shoot.',
	url: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
	locale: 'en_US',
	/** BCP 47 locale for Intl formatting. */
	intlLocale: 'en-US',
	country: 'US',
	/** Fallbacks only; the store's settings win when they load. */
	currency: 'USD',
	/** Every time on the site renders in this zone, on the server and in the browser. */
	timezone: 'America/New_York',

	contact: {
		email: 'hello@afterglow.club',
		phone: '+1 (305) 555-0147',
		hours: 'Mon–Fri 6 AM–10 PM · Sat 8 AM–11 PM · Sun 8 AM–7 PM',
		instagram: 'https://instagram.com/afterglow.club',
		instagramHandle: '@afterglow.club',
	},

	/** The promise, in three frames (home). */
	promise: [
		{ n: '01', title: 'Book the class. Circle the shot.', body: 'Pick a class and add the shots you want: clips, a photo set, a slow-mo reel or the whole camera roll.' },
		{ n: '02', title: 'Train. Forget the camera.', body: 'The crew shoots from the edges of the set while you train. No phone propped on a water bottle, no asking a stranger.' },
		{ n: '03', title: 'Edits land in 48 hours.', body: 'Graded, cropped for stories and feed, sent to your inbox. Post them, or keep them for yourself.' },
	],

	/** Template media in public/. Missing files fall back to the gradient placeholder. */
	media: {
		heroVideo: '/videos/hero.mp4',
		heroVideoVertical: '/videos/stories/story-mirror-shoot.mp4',
		heroPoster: '/videos/hero-poster.jpg',
		pass: '/images/hero/glow-pass.jpg',
		bar: '/images/sets/bar.jpg',
		crew: '/images/gallery/shoot-bts.jpg',
		shoots: '/images/hero/we-shoot.jpg',
		categories: {
			ride: '/images/sets/neon-room.jpg',
			sculpt: '/images/sets/mirror-hall.jpg',
			flow: '/images/sets/rooftop.jpg',
			box: '/images/sets/ring.jpg',
			sweat: '/images/sets/mural-floor.jpg',
			coaching: '/images/classes/pt-senior.jpg',
			content: '/images/sets/studio-wall.jpg',
			glow: '/images/classes/infrared-suite-1.jpg',
			bar: '/images/sets/bar.jpg',
			events: '/images/classes/event-sunset-sessions.jpg',
		} as Record<string, string>,
	},

	/** Location `type` values from the API. */
	locationTypes: {
		online: 'online',
		physical: 'physical',
		delivery: 'delivery',
	},

	/** Categories by collection slug, in display order. */
	categories: {
		ride: {
			label: 'Ride',
			tone: 'ride',
			mode: 'timetable',
			href: '/schedule?type=ride',
			tagline: 'On the beat, in the dark.',
			blurb: 'Rhythm Ride, Climb & Sprint and the Friday and Saturday Ride After Dark in the Neon Room, Wynwood.',
		},
		sculpt: {
			label: 'Sculpt',
			tone: 'sculpt',
			mode: 'timetable',
			href: '/schedule?type=sculpt',
			tagline: 'Shape, built in front of the arched mirrors.',
			blurb: 'Glute Lab, Sculpt & Tone, Abs Club and small-group barbell strength in Mirror Hall, South Beach.',
		},
		flow: {
			label: 'Flow',
			tone: 'flow',
			mode: 'timetable',
			href: '/schedule?type=flow',
			tagline: 'Strong, slow, and timed to the light.',
			blurb: 'Sunset Rooftop Yoga, Pilates Burn, Barre Glow and Stretch & Glow, on the roof and in Mirror Hall.',
		},
		box: {
			label: 'Box',
			tone: 'box',
			mode: 'timetable',
			href: '/schedule?type=box',
			tagline: 'Pink lights, real rounds.',
			blurb: 'Boxing Basics, Shadowbox Glow and Ring Rounds in the Ring, Wynwood. Gloves and wraps at the desk.',
		},
		sweat: {
			label: 'Sweat',
			tone: 'sweat',
			mode: 'timetable',
			href: '/schedule?type=sweat',
			tagline: 'Strobes, choreography and sand.',
			blurb: 'Strobe HIIT and Dance Cardio on the Mural Floor, and the Sunrise Beach Run from Lummus Park.',
		},
		coaching: {
			label: 'Coaching',
			tone: 'coaching',
			mode: 'booker',
			href: '/coaching',
			tagline: 'One coach, your physique.',
			blurb: 'Physique coaching 1:1 for 30, 60 or 90 minutes with a coach, senior coach or head coach, and partner training for two.',
		},
		content: {
			label: 'Shoots',
			tone: 'content',
			mode: 'booker',
			href: '/shoots',
			tagline: 'The crew, the set and an hour that is all about you.',
			blurb: 'Golden-hour shoots on the roof, gym glam in Mirror Hall, reels, transformation sets, duo shoots and full creator brand days.',
		},
		glow: {
			label: 'Glow',
			tone: 'glow',
			mode: 'booker',
			href: '/glow',
			tagline: 'Heat, ice, red light and a touch-up.',
			blurb: 'Rooftop infrared suites, the cold plunge, the red light pod, the compression lounge and twenty-minute glam with Zoe.',
		},
		bar: {
			label: 'Bar',
			tone: 'bar',
			mode: 'booker',
			href: '/bar',
			tagline: 'Matcha, açaí and a table after class.',
			blurb: 'The Afterglow Bar on Collins and the café in Wynwood. Book a table for after class, and add drinks to any booking.',
		},
		events: {
			label: 'Events',
			tone: 'events',
			mode: 'events',
			href: '/bar#events',
			tagline: 'Sunset sessions, creator nights, run club brunch.',
			blurb: 'Dated nights and mornings: a DJ on the roof at sunset, a creator night in Wynwood and a run that ends in brunch.',
		},
	} satisfies Record<string, CategoryMeta>,

	/** Categories whose products run as weekly group classes on the schedule. */
	timetableCategories: ['ride', 'sculpt', 'flow', 'box', 'sweat'],

	/** The sets (rooms) the classes run on. Not API entities. */
	sets: {
		'neon-room': {
			name: 'Neon Room',
			site: 'wynwood',
			outdoor: false,
			light: 'Neon, lasers, strobe on the drop',
			blurb: 'Twenty-four bikes on a tiered floor, a lighting rig that runs with the playlist and a podium the crew shoots from.',
			image: '/images/sets/neon-room.jpg',
			readout: 'ISO 3200 · 1/250 · f1.8',
		},
		ring: {
			name: 'The Ring',
			site: 'wynwood',
			outdoor: false,
			light: 'Pink ring lights, haze',
			blurb: 'A full-size ring under pink lights, a bag wall and a lot of haze. Gloves and wraps at the desk.',
			image: '/images/sets/ring.jpg',
			readout: 'ISO 1600 · 1/500 · f2.0',
		},
		'mural-floor': {
			name: 'Mural Floor',
			site: 'wynwood',
			outdoor: false,
			light: 'Daylight through the roll-up door, strobes after dark',
			blurb: 'The open floor under the warehouse murals, with the roll-up door open on good days.',
			image: '/images/sets/mural-floor.jpg',
			readout: 'ISO 800 · 1/320 · f2.8',
		},
		'studio-wall': {
			name: 'Studio Wall',
			site: 'wynwood',
			outdoor: false,
			light: 'Cyc wall, strobes, colour gels',
			blurb: 'A white cyc wall and a rack of backdrops, lit by Mia. Hire it, or book a shoot on it.',
			image: '/images/sets/studio-wall.jpg',
			readout: 'ISO 100 · 1/160 · f8',
		},
		rooftop: {
			name: 'The Rooftop',
			site: 'south-beach',
			outdoor: true,
			light: 'Golden hour, ocean breeze',
			blurb: 'Teak deck, pastel parapets and a view over the Deco rooftops to the ocean. The best light of the day happens here.',
			image: '/images/sets/rooftop.jpg',
			readout: 'ISO 100 · 1/1000 · f2.8',
		},
		'mirror-hall': {
			name: 'Mirror Hall',
			site: 'south-beach',
			outdoor: false,
			light: 'Arched mirrors, terrazzo, soft daylight',
			blurb: 'Five arched mirrors, a terrazzo floor and racks in Miami pastel. Glute Lab lives here.',
			image: '/images/sets/mirror-hall.jpg',
			readout: 'ISO 400 · 1/250 · f2.2',
		},
		beach: {
			name: 'Lummus Park Beach',
			site: 'south-beach',
			outdoor: true,
			light: 'Sunrise over the Atlantic',
			blurb: 'The sand in front of the lifeguard towers, two blocks from the gym. Sunrise runs start here.',
			image: '/images/gallery/beach-run.jpg',
			readout: 'ISO 200 · 1/2000 · f4',
		},
	} satisfies Record<SetKey, SetMeta>,

	/** Class copy by class key. Order = order within a set on the schedule. */
	classes: {
		'rhythm-ride': {
			category: 'ride',
			short: 'Rhythm Ride',
			set: 'neon-room',
			intensity: 4,
			level: 'All levels',
			tagline: 'On the bike, on the beat, in the dark.',
			shotNote: 'Shot from the podium: the climb, the choreography and the final sprint under the strobes.',
			whatToBring: ['Water', 'Cycling shoes (or borrow a pair)', 'A towel'],
			wardrobe: 'Bright colours read best under neon. Avoid black head to toe.',
		},
		'ride-after-dark': {
			category: 'ride',
			short: 'After Dark',
			set: 'neon-room',
			intensity: 4,
			level: 'All levels',
			tagline: 'A party ride with lasers and a live mix.',
			shotNote: 'Wide shots of the whole room on the drop, plus close-ups when the lasers hit.',
			whatToBring: ['Water', 'Something to change into for after'],
			wardrobe: 'Dress for going out after. Metallics and white glow under the lasers.',
		},
		'climb-sprint': {
			category: 'ride',
			short: 'Climb & Sprint',
			set: 'neon-room',
			intensity: 5,
			level: 'Some riding',
			tagline: 'Heavy climbs, all-out sprints.',
			shotNote: 'The final sprint in slow motion is the one everybody posts.',
			whatToBring: ['Water', 'Cycling shoes', 'A towel'],
			wardrobe: 'Fitted tops; loose fabric blurs at 120 fps.',
		},
		'glute-lab': {
			category: 'sculpt',
			short: 'Glute Lab',
			set: 'mirror-hall',
			intensity: 4,
			level: 'All levels',
			tagline: 'Built for shape, in front of the arched mirrors.',
			shotNote: 'Side angles on hip thrusts and split squats, and the mirror shot at the end.',
			whatToBring: ['Water', 'Training shoes', 'A booty band if you have a favourite'],
			wardrobe: 'Seamless sets photograph best. Solid colours over prints.',
		},
		'sculpt-tone': {
			category: 'sculpt',
			short: 'Sculpt & Tone',
			set: 'mirror-hall',
			intensity: 3,
			level: 'All levels',
			tagline: 'Dumbbells, tempo, head to toe.',
			shotNote: 'Tempo reps in the mirrors and a slow pan across the room.',
			whatToBring: ['Water', 'Training shoes'],
			wardrobe: 'Two looks if you want variety in the photo set: one light, one dark.',
		},
		'abs-club': {
			category: 'sculpt',
			short: 'Abs Club',
			set: 'mirror-hall',
			intensity: 4,
			level: 'All levels',
			tagline: 'Thirty minutes of core.',
			shotNote: 'Overhead and floor-level angles; great for a short reel.',
			whatToBring: ['Water'],
			wardrobe: 'A cropped top if you want the work to show.',
		},
		'mirror-strength': {
			category: 'sculpt',
			short: 'Mirror Strength',
			set: 'mirror-hall',
			intensity: 4,
			level: 'Some lifting',
			tagline: 'Small-group barbell strength.',
			shotNote: 'Chalk, the bar and your best set of the day, shot low.',
			whatToBring: ['Water', 'Flat shoes', 'Lifting belt (optional)'],
			wardrobe: 'Neutral tones look great against the pastel racks.',
		},
		'sunset-yoga': {
			category: 'flow',
			short: 'Sunset Yoga',
			set: 'rooftop',
			intensity: 2,
			level: 'All levels',
			tagline: 'The last pose lands on the light.',
			shotNote: 'Silhouettes against the sky in golden hour, and a wide of the deck.',
			whatToBring: ['Water', 'A layer for after'],
			wardrobe: 'Earth tones and white glow in golden hour. Barefoot.',
		},
		'pilates-burn': {
			category: 'flow',
			short: 'Pilates Burn',
			set: 'mirror-hall',
			intensity: 3,
			level: 'All levels',
			tagline: 'Slow, precise and very hard.',
			shotNote: 'Long lines and clean shapes, shot through the arches.',
			whatToBring: ['Grip socks', 'Water'],
			wardrobe: 'Monochrome sets; grip socks in a matching colour.',
		},
		'barre-glow': {
			category: 'flow',
			short: 'Barre Glow',
			set: 'mirror-hall',
			intensity: 3,
			level: 'All levels',
			tagline: 'Small moves, high reps, serious shake.',
			shotNote: 'The barre line in the mirrors, and close-ups of the pulse.',
			whatToBring: ['Grip socks', 'Water'],
			wardrobe: 'Soft pastels match the room.',
		},
		'stretch-glow': {
			category: 'flow',
			short: 'Stretch & Glow',
			set: 'rooftop',
			intensity: 1,
			level: 'All levels',
			tagline: 'Thirty minutes of long, slow stretching.',
			shotNote: 'Morning light on the deck; calm, slow frames.',
			whatToBring: ['Water'],
			wardrobe: 'Anything comfortable. Light colours in morning sun.',
		},
		'shadowbox-glow': {
			category: 'box',
			short: 'Shadowbox Glow',
			set: 'ring',
			intensity: 4,
			level: 'All levels',
			tagline: 'Combinations to the beat, under pink lights.',
			shotNote: 'Combinations in slow motion through the haze, and the bag wall.',
			whatToBring: ['Water', 'Wraps (or borrow)', 'Gloves (or borrow)'],
			wardrobe: 'White or neon reads best in the haze.',
		},
		'ring-rounds': {
			category: 'box',
			short: 'Ring Rounds',
			set: 'ring',
			intensity: 5,
			level: 'Some boxing',
			tagline: 'Padwork and rounds, fight-camp style.',
			shotNote: 'Padwork in the ring, from the corner. The sweat is real.',
			whatToBring: ['Water', 'Wraps', 'Gloves', 'Mouthguard'],
			wardrobe: 'Sports bra or vest; nothing loose.',
		},
		'boxing-basics': {
			category: 'box',
			short: 'Boxing Basics',
			set: 'ring',
			intensity: 3,
			level: 'Beginners',
			tagline: 'Stance, jab, cross. Start here.',
			shotNote: 'Your first combinations, from the ring apron.',
			whatToBring: ['Water'],
			wardrobe: 'Anything you can move in. We lend gloves and wraps.',
		},
		'strobe-hiit': {
			category: 'sweat',
			short: 'Strobe HIIT',
			set: 'mural-floor',
			intensity: 5,
			level: 'All levels',
			tagline: 'Intervals in front of the murals.',
			shotNote: 'Jumps frozen mid-air against the murals.',
			whatToBring: ['Water', 'Training shoes', 'A towel'],
			wardrobe: 'Bold colours against the murals. Tie hair back for jumps.',
		},
		'dance-cardio': {
			category: 'sweat',
			short: 'Dance Cardio',
			set: 'mural-floor',
			intensity: 3,
			level: 'All levels',
			tagline: 'Choreography you learn in one class.',
			shotNote: 'The full routine from the front, cut to the song.',
			whatToBring: ['Water', 'Trainers you can turn in'],
			wardrobe: 'Something with movement: a skirt over shorts, an oversized tee.',
		},
		'sunrise-run': {
			category: 'sweat',
			short: 'Sunrise Run',
			set: 'beach',
			intensity: 3,
			level: 'All paces',
			tagline: 'Five kilometres on the sand at first light.',
			shotNote: 'The pack at the lifeguard towers with the sun coming up.',
			whatToBring: ['Water', 'Running shoes', 'Sunscreen'],
			wardrobe: 'Bright colours against the blue hour.',
		},
	} satisfies Record<string, ClassMeta>,

	/** Service copy by service key (product group key or prefix). */
	services: {
		'physique-coaching': {
			prefixes: ['pt-'],
			category: 'coaching',
			short: 'Physique Coaching',
			tagline: 'One coach, one plan, one body to build.',
			includes: ['A plan for the session and the weeks after', 'Form checks on every set', 'Add the crew for progress photos'],
			startStep: 30,
			lengths: [30, 60, 90],
			whatToBring: ['Water', 'Training shoes', 'Your goals'],
			wardrobe: 'Whatever you train best in.',
			whoLabel: 'Coach',
		},
		'partner-training': {
			category: 'coaching',
			short: 'Partner Training',
			tagline: 'Two people, one coach, one hour.',
			includes: ['Sixty minutes for two', 'A shared plan with separate weights', 'Duo shots if you add the crew'],
			startStep: 30,
			people: 2,
			whatToBring: ['Water', 'Your training partner'],
			wardrobe: 'Coordinate if you want the duo shots to pop.',
			whoLabel: 'Coach',
		},
		'golden-hour-shoot': {
			category: 'content',
			short: 'Golden Hour Shoot',
			tagline: 'Forty-five minutes on the roof in the best light of the day.',
			includes: ['20 edited photos', '2 vertical clips', 'Two looks on the rooftop set'],
			startStep: 15,
			set: 'rooftop',
			whatToBring: ['Two looks', 'Water'],
			wardrobe: 'Two looks. Earth tones, white and gold glow in golden hour.',
			whoLabel: 'Photographer',
		},
		'gym-glam-shoot': {
			category: 'content',
			short: 'Gym Glam Shoot',
			tagline: 'Mirror Hall, the arches and you, lit properly.',
			includes: ['15 edited photos', 'One look change', 'Mirror and rack setups'],
			startStep: 30,
			set: 'mirror-hall',
			whatToBring: ['Two training looks', 'Water'],
			wardrobe: 'Matching sets. Pastels or monochrome against the terrazzo.',
			whoLabel: 'Photographer',
		},
		'reel-in-an-hour': {
			category: 'content',
			short: 'Reel in an Hour',
			tagline: 'Hook, shot list, shoot, edit. Post it tonight.',
			includes: ['One finished 30-second reel', 'Three hooks to choose from', 'Raw clips for later'],
			startStep: 30,
			whatToBring: ['Two looks', 'An idea (or we bring one)'],
			wardrobe: 'Two looks with contrast for the transition.',
			whoLabel: 'Videographer',
		},
		'transformation-shoot': {
			category: 'content',
			short: 'Transformation',
			tagline: 'A consistent before, a proud after.',
			includes: ['A matched set of poses and lighting', '12 edited photos', 'We save your setup for next time'],
			startStep: 30,
			whatToBring: ['The same outfit you will wear for the after', 'Water'],
			wardrobe: 'Keep it simple and repeatable: the same set each time.',
			whoLabel: 'Photographer',
		},
		'duo-shoot': {
			category: 'content',
			short: 'Duo Shoot',
			tagline: 'You and your training partner (or your partner).',
			includes: ['25 edited photos', 'Two sets', 'A short duo reel'],
			startStep: 30,
			people: 2,
			whatToBring: ['Two looks each', 'Water'],
			wardrobe: 'Coordinate colours, don’t match exactly.',
			whoLabel: 'Photographer',
		},
		'creator-brand-day': {
			category: 'content',
			short: 'Creator Brand Day',
			tagline: 'Three hours, the Studio Wall and a crew of creators.',
			includes: ['A pre-shoot call to plan the shot list', '40 edited photos and 4 reels', 'Studio Wall, backdrops and lighting'],
			startStep: 60,
			set: 'studio-wall',
			whatToBring: ['Up to five looks', 'Products, if it’s a brand shoot'],
			wardrobe: 'Bring more than you think you need.',
			whoLabel: 'Lead creator',
		},
		'studio-wall-hire': {
			category: 'content',
			short: 'Studio Wall Hire',
			tagline: 'The cyc wall and the lights, for your own crew.',
			includes: ['The white cyc and the backdrop rack', 'Strobes and gels set up', 'An hour, or up to four'],
			startStep: 60,
			lengths: [60, 120, 180, 240],
			set: 'studio-wall',
			selfShoot: true,
			whatToBring: ['Your camera and your crew'],
		},
		'infrared-sauna': {
			category: 'glow',
			short: 'Infrared Suite',
			tagline: 'A private suite with a glass wall over the rooftops.',
			includes: ['Towels and an electrolyte shot', 'Forty minutes, or eighty', 'Private suite for one'],
			startStep: 20,
			lengths: [40, 80],
			whatToBring: ['Swimwear', 'Water'],
		},
		'cold-plunge': {
			category: 'glow',
			short: 'Cold Plunge',
			tagline: 'Two pools at 45 °F, next to the saunas.',
			includes: ['Twenty minutes for a few rounds', 'Robes and towels'],
			startStep: 20,
			whatToBring: ['Swimwear'],
		},
		'red-light-pod': {
			category: 'glow',
			short: 'Red Light Pod',
			tagline: 'Lie down, close your eyes, glow.',
			includes: ['Twenty minutes, full body', 'Eye protection provided'],
			startStep: 20,
		},
		'compression-lounge': {
			prefixes: ['compression-'],
			category: 'glow',
			short: 'Compression Lounge',
			tagline: 'Boots on, mocktail in hand.',
			includes: ['Thirty minutes in the compression boots', 'A recovery mocktail'],
			startStep: 30,
		},
		'glam-touch-up': {
			category: 'glow',
			short: 'Glam Touch-up',
			tagline: 'Twenty minutes with Zoe before a shoot or a class with the crew.',
			includes: ['Sweat-proof base and brows', 'A glow that survives the Neon Room'],
			startStep: 20,
			whoLabel: 'Artist',
		},
		'first-glow-tour': {
			category: 'intro',
			short: 'First Glow Tour',
			tagline: 'Free: the sets, the bar, how the crew works, and a test shot.',
			includes: ['A 20-minute walk through the sets', 'A test shot on the set you like best', 'No card needed'],
			startStep: 20,
			whoLabel: 'Your guide',
		},
		'bar-table': {
			prefixes: ['bar-table-', 'cafe-table-'],
			category: 'bar',
			short: 'Bar Table',
			tagline: 'A table for after class. The kitchen opens at 7 AM.',
			includes: ['A table for 45 minutes', 'Order at the table', 'The deposit comes off your bill'],
			startStep: 15,
			party: true,
		},
	} satisfies Record<string, ServiceMeta>,

	/** Event copy by product slug. */
	events: {
		'event-sunset-sessions': {
			tagline: 'A DJ on the roof, a flow at sunset and the bar open after.',
			whatToBring: ['Something to change into', 'A layer for after dark'],
		},
		'event-creator-night': {
			tagline: 'Panels, portfolio reviews and a shoot wall in Wynwood.',
			whatToBring: ['Your handle', 'Business cards, if you still have them'],
		},
		'event-run-club-brunch': {
			tagline: 'Five kilometres on the beach, then brunch at the bar.',
			whatToBring: ['Running shoes', 'An appetite'],
		},
	} as Record<string, { tagline: string; whatToBring: string[] }>,

	/** Shot add-ons by add-on title (slugified). Deliverables shown in booking and on the call sheet. */
	shots: {
		'class-clips': { kind: 'clips', label: 'Class Clips', deliverable: 'Three edited vertical clips of you in class', spec: '3 × 9:16 clips', eta: '48 h' },
		'photo-set': { kind: 'photos', label: 'Photo Set', deliverable: 'Ten edited photos, cropped for feed and stories', spec: '10 edits', eta: '48 h' },
		'slow-mo-reel': { kind: 'reel', label: 'Slow-mo Reel', deliverable: 'One cinematic 15-second reel, cut to the playlist', spec: '1 × 15 s reel', eta: '48 h' },
		'raw-camera-roll': { kind: 'roll', label: 'Raw Camera Roll', deliverable: 'Every frame the crew took of you, unedited', spec: 'All frames', eta: '24 h' },
	} satisfies Record<string, ShotMeta>,

	/** People by staff slug (a leading `staff-` is ignored). */
	people: {
		'valentina-cruz': {
			role: 'coach',
			tier: 'head',
			handle: '@valentina.lifts',
			title: 'Head coach · Physique',
			bio: 'Competed in bikini for six years and now coaches physique: progressive overload, honest food advice and form that looks as good as it works.',
			specialties: ['Glutes', 'Physique', 'Strength'],
			categories: ['sculpt', 'coaching'],
			quote: 'Pretty and strong are not two different goals.',
		},
		'dante-rivers': {
			role: 'coach',
			tier: 'head',
			handle: '@danteinthering',
			title: 'Head coach · Boxing',
			bio: 'Golden Gloves finalist. Dante runs the Ring like a fight camp with better lighting: footwork first, then combinations, then rounds.',
			specialties: ['Boxing', 'Conditioning'],
			categories: ['box', 'coaching'],
			quote: 'Hands up. Chin down. Smile for Theo.',
		},
		'marcus-bell': {
			role: 'coach',
			tier: 'senior',
			handle: '@marcusrides',
			title: 'Senior coach · Ride',
			bio: 'Ex-DJ who traded the booth for the bike. Marcus builds every Rhythm Ride playlist himself.',
			specialties: ['Rhythm Ride', 'Conditioning'],
			categories: ['ride'],
			quote: 'If you’re off the beat, the lights will tell you.',
		},
		'isabella-moreau': {
			role: 'coach',
			tier: 'senior',
			handle: '@isabella.moves',
			title: 'Senior coach · Pilates & yoga',
			bio: 'Classically trained Pilates teacher from Montréal. Slow, precise, very hard, and the Saturday sunset flow.',
			specialties: ['Pilates', 'Yoga', 'Mobility'],
			categories: ['flow'],
			quote: 'Slower. No, slower.',
		},
		'luca-romano': {
			role: 'coach',
			tier: 'senior',
			handle: '@luca.strength',
			title: 'Senior coach · Strength',
			bio: 'Sports-science degree and a soft spot for the deadlift. Mirror Hall Strength and the lunchtime Abs Club.',
			specialties: ['Strength', 'Abs', 'Physique'],
			categories: ['sculpt', 'coaching'],
			quote: 'Chalk is a lifestyle.',
		},
		'kiara-johnson': {
			role: 'coach',
			tier: 'coach',
			handle: '@kiaradances',
			title: 'Coach · Dance & HIIT',
			bio: 'Toured as a backup dancer. Choreography you can learn in one class and still feel cool doing.',
			specialties: ['Dance Cardio', 'HIIT'],
			categories: ['sweat'],
			quote: 'Five, six, seven, eight, and smile.',
		},
		'sofia-herrera': {
			role: 'coach',
			tier: 'coach',
			handle: '@sofia.sunsetflow',
			title: 'Coach · Rooftop yoga',
			bio: 'Grew up in Little Havana. Strong, warm classes, timed so the last pose lands on the light.',
			specialties: ['Yoga', 'Stretch'],
			categories: ['flow'],
			quote: 'The sun is the only teacher I wait for.',
		},
		'jaylen-brooks': {
			role: 'coach',
			tier: 'coach',
			handle: '@jaylenbrooks',
			title: 'Coach · Ride & HIIT',
			bio: 'Former college sprinter. The climbs, the Saturday Ride After Dark, and the loudest person in any room.',
			specialties: ['Rhythm Ride', 'HIIT'],
			categories: ['ride', 'sweat'],
			quote: 'Turn it up. No, more.',
		},
		'amara-diallo': {
			role: 'coach',
			tier: 'coach',
			handle: '@amara.barre',
			title: 'Coach · Barre & sculpt',
			bio: 'Ballet in Dakar and Paris, barre in Miami. Small movements, high reps, serious shake.',
			specialties: ['Barre', 'Sculpt'],
			categories: ['flow', 'sculpt'],
			quote: 'The shake means it’s working.',
		},
		'nico-alvarez': {
			role: 'coach',
			tier: 'coach',
			handle: '@nico.runs.miami',
			title: 'Coach · Running & boxing',
			bio: 'Every Miami Marathon since 2016. Still thinks 6:45 AM is a reasonable time to meet.',
			specialties: ['Boxing', 'Running'],
			categories: ['sweat', 'box'],
			quote: 'Sunrise waits for no one.',
		},
		'ava-lin': {
			role: 'photographer',
			handle: '@avalin.shoots',
			title: 'Photographer · Golden hour',
			bio: 'Shot lookbooks in New York before moving south for the light. Ava runs the rooftop golden-hour shoots.',
			specialties: ['Golden hour', 'Portraits'],
			categories: ['content'],
			quote: 'Give me twenty minutes before sunset and I’ll give you your profile picture.',
		},
		'theo-marsh': {
			role: 'videographer',
			handle: '@theomarsh.film',
			title: 'Videographer · Reels',
			bio: 'Music-video director turned in-house filmmaker. The slow-mo reels in the Neon Room and the Ring, cut to the playlist.',
			specialties: ['Reels', 'Slow motion'],
			categories: ['content'],
			quote: '120 frames a second. Every drop of sweat counts.',
		},
		'camila-reyes': {
			role: 'photographer',
			handle: '@camilareyes.photo',
			title: 'Photographer · Fitness',
			bio: 'Ten years of sports photography. She knows the angle that makes a hip thrust look as hard as it was.',
			specialties: ['Fitness', 'Transformation'],
			categories: ['content'],
			quote: 'Low angle, high effort.',
		},
		'jordan-price': {
			role: 'videographer',
			handle: '@jordanprice.creates',
			title: 'Creator lead',
			bio: 'Built two creator brands from zero. Reel in an Hour and Creator Brand Days: hooks, shot lists, same-night edits.',
			specialties: ['Reels', 'Creator content'],
			categories: ['content'],
			quote: 'The first second is the whole video.',
		},
		'mia-santos': {
			role: 'photographer',
			handle: '@miasantos.studio',
			title: 'Photographer · Studio',
			bio: 'Editorial and studio photographer who lit the Studio Wall herself. Duo sessions and backdrops in Wynwood.',
			specialties: ['Studio', 'Editorial'],
			categories: ['content'],
			quote: 'Light is the outfit.',
		},
		'zoe-laurent': {
			role: 'makeup',
			handle: '@zoelaurent.glam',
			title: 'Makeup artist',
			bio: 'Makeup for shoots and stages. Twenty-minute sweat-proof glam that survives a class and the lights.',
			specialties: ['Sweat-proof glam'],
			categories: ['glow'],
			quote: 'Glow, not shine.',
		},
	} satisfies Record<string, PersonMeta>,

	/** Sites by location slug. */
	sites: {
		'afterglow-south-beach': {
			key: 'south-beach',
			name: 'Afterglow South Beach',
			nickname: 'South Beach',
			neighborhood: 'Collins Ave, Miami Beach',
			blurb: 'A 1938 Art Deco building on Collins: Mirror Hall on the ground floor, the Afterglow Bar on the corner, and the Rooftop with two infrared suites and the plunge pools. Two blocks from the beach.',
			transit: 'Two blocks from Lummus Park. Citi Bike dock at 14th and Collins; the South Beach Loop trolley stops outside.',
			parking: 'Municipal garage on 13th St (7th St garage on weekends). We validate two hours at the bar.',
			hours: 'Mon–Fri 6 AM–10 PM · Sat 7 AM–10 PM · Sun 8 AM–7 PM',
			sets: ['rooftop', 'mirror-hall', 'beach'],
			facilities: ['Rooftop deck', 'Mirror Hall', '2 infrared suites', 'Cold plunge pools', 'Afterglow Bar', 'Showers with Dyson dryers'],
			images: ['/images/sites/south-beach.jpg', '/images/sets/rooftop.jpg', '/images/sets/mirror-hall.jpg'],
		},
		'afterglow-wynwood': {
			key: 'wynwood',
			name: 'Afterglow Wynwood',
			nickname: 'Wynwood',
			neighborhood: 'NW 2nd Ave, Wynwood',
			blurb: 'A mural-wrapped warehouse off NW 2nd Ave: the Neon Room, the Ring under pink lights, the Mural Floor, the Studio Wall and the café by the roll-up door.',
			transit: 'Ten minutes from the Brightline at MiamiCentral; the Wynwood trolley stops on NW 2nd Ave.',
			parking: 'Street parking on NW 25th St and the Wynwood garage at 2621 NW 2nd Ave.',
			hours: 'Mon–Fri 6 AM–11 PM · Sat 8 AM–11 PM · Sun 9 AM–6 PM',
			sets: ['neon-room', 'ring', 'mural-floor', 'studio-wall'],
			facilities: ['Neon Room (24 bikes)', 'The Ring', 'Mural Floor', 'Studio Wall', 'Red light pod', 'Café'],
			images: ['/images/sites/wynwood.jpg', '/images/sets/neon-room.jpg', '/images/sets/ring.jpg'],
		},
	} satisfies Record<string, SiteMeta>,

	/** The story rings on home: short vertical clips from the sets. */
	stories: [
		{
			key: 'neon-room',
			label: 'Neon Room',
			thumb: '/images/stories/story-neon-ride.jpg',
			clips: [{ video: '/videos/stories/story-neon-ride.mp4', poster: '/images/stories/story-neon-ride.jpg', caption: 'Rhythm Ride, 6 PM. Twenty-four bikes, one playlist.', cta: { label: 'Book a ride', href: '/schedule?type=ride' } }],
		},
		{
			key: 'rooftop',
			label: 'Rooftop',
			thumb: '/images/stories/story-rooftop-yoga.jpg',
			clips: [{ video: '/videos/stories/story-rooftop-yoga.mp4', poster: '/images/stories/story-rooftop-yoga.jpg', caption: 'Sunset Rooftop Yoga. The last pose lands on the light.', cta: { label: 'Book sunset yoga', href: '/schedule?type=flow' } }],
		},
		{
			key: 'ring',
			label: 'The Ring',
			thumb: '/images/stories/story-ring.jpg',
			clips: [{ video: '/videos/stories/story-ring.mp4', poster: '/images/stories/story-ring.jpg', caption: 'Shadowbox Glow. Pink lights, haze, real rounds.', cta: { label: 'Book boxing', href: '/schedule?type=box' } }],
		},
		{
			key: 'mirror-hall',
			label: 'Mirror Hall',
			thumb: '/images/stories/story-mirror-shoot.jpg',
			clips: [{ video: '/videos/stories/story-mirror-shoot.mp4', poster: '/images/stories/story-mirror-shoot.jpg', caption: 'Glute Lab, shot by Camila. Edits in 48 hours.', cta: { label: 'Book Glute Lab', href: '/schedule?type=sculpt' } }],
		},
		{
			key: 'bar',
			label: 'The Bar',
			thumb: '/images/stories/story-bar-matcha.jpg',
			clips: [{ video: '/videos/stories/story-bar-matcha.mp4', poster: '/images/stories/story-bar-matcha.jpg', caption: 'Matcha protein, poured after the 7 AM.', cta: { label: 'Book a table', href: '/bar' } }],
		},
		{
			key: 'beach',
			label: 'Sunrise run',
			thumb: '/images/stories/story-beach-run.jpg',
			clips: [{ video: '/videos/stories/story-beach-run.mp4', poster: '/images/stories/story-beach-run.jpg', caption: 'Sunrise Beach Run from Lummus Park. 6:45 AM, every Wednesday and weekend.', cta: { label: 'Join the run', href: '/schedule?type=sweat' } }],
		},
		{
			key: 'crew',
			label: 'The Crew',
			thumb: '/images/stories/story-studio-wall.jpg',
			clips: [{ video: '/videos/stories/story-studio-wall.mp4', poster: '/images/stories/story-studio-wall.jpg', caption: 'Reel in an Hour on the Studio Wall. Two looks, one cut, ready to post.', cta: { label: 'Book a shoot', href: '/shoots' } }],
		},
	] satisfies StoryMeta[],

	/** The Glow Pass: a preview only. Memberships aren't on sale yet. */
	glowPass: {
		status: 'Coming soon',
		name: 'The Glow Pass',
		priceHint: 'From $289 / month',
		headline: 'Unlimited classes. Four shoots a month. One pass.',
		perks: [
			'Unlimited classes at both sites',
			'Four content sessions a month (clips, photo set or reel)',
			'Priority booking for Ride After Dark and Sunset Sessions',
			'10% off the bar',
			'A bring-a-friend pass every month',
		],
		note: 'Passes aren’t on sale yet. Book the free First Glow Tour and we’ll tell you first when they are.',
	},

	/** A code to mention in copy (it lives in the store). */
	promoCode: 'GLOW15',

	/** Intro offer copy (the discount itself is automatic). */
	introOffer: {
		percent: 40,
		headline: '40% off your first class',
		body: 'Your first order of classes is 40% off, applied at checkout. Shot add-ons are 30% off, always.',
	},

	/** The free intro, by service key. */
	introService: 'first-glow-tour',

	/** "Early light": the automatic weekday discount on early classes (by class start, local time). */
	offPeak: { weekdays: [1, 2, 3, 4, 5], from: '06:00', to: '08:00', label: 'Early light −20%' },

	/** Spots left at or below this read "going fast". */
	lowSeatsThreshold: 3,

	policies: {
		bookingWindowDays: 28,
		changeHours: 12,
	},

	/** Minutes before start that a Join link opens (online sessions; none at launch). */
	joinWindowMinutes: 10,

	/** Golden hour length (minutes) for the schedule badge. */
	goldenHourMinutes: 60,

	/** Fallback coordinates for the sun calculation when a location has none. */
	geo: { latitude: 25.7826, longitude: -80.1341 },

	/** Appointment `customAttributes` keys the template writes. */
	customAttributeKeys: {
		/** "1" or "2": partner and duo sessions are one booking for two people. */
		people: 'people',
	},

	tones: {
		ride: { hex: '#FF3EA5', ink: '#FFFFFF' },
		sculpt: { hex: '#FF8A5B', ink: '#120E1A' },
		flow: { hex: '#F4A93B', ink: '#120E1A' },
		box: { hex: '#6A4BFF', ink: '#FFFFFF' },
		sweat: { hex: '#00C2A8', ink: '#120E1A' },
		coaching: { hex: '#120E1A', ink: '#FFF4EA' },
		content: { hex: '#FF5E8A', ink: '#FFFFFF' },
		glow: { hex: '#8E7CFF', ink: '#FFFFFF' },
		bar: { hex: '#B5651D', ink: '#FFFFFF' },
		events: { hex: '#F4A93B', ink: '#120E1A' },
	} satisfies Record<Tone, { hex: string; ink: string }>,

	nav: [
		{ label: 'Schedule', href: '/schedule' },
		{ label: 'Shoots', href: '/shoots' },
		{ label: 'Coaching', href: '/coaching' },
		{ label: 'Glow', href: '/glow' },
		{ label: 'Bar', href: '/bar' },
		{ label: 'Crew', href: '/crew' },
	],

	footerNav: [
		{ label: 'Glow Pass', href: '/glow-pass' },
		{ label: 'First Glow Tour', href: '/shoots?service=first-glow-tour#book' },
		{ label: 'South Beach', href: '/sites/south-beach' },
		{ label: 'Wynwood', href: '/sites/wynwood' },
	],
};

export type SiteConfig = typeof siteConfig;

/* ------------------------------------------------------------------ Lookups */

export function categoryMeta(slug: string | null | undefined): CategoryMeta | null {
	if (!slug) return null;
	return (siteConfig.categories as Record<string, CategoryMeta>)[slug] ?? null;
}

export function classMeta(classKey: string | null | undefined): ClassMeta | null {
	if (!classKey) return null;
	return (siteConfig.classes as Record<string, ClassMeta>)[classKey] ?? null;
}

export function serviceMeta(key: string | null | undefined): ServiceMeta | null {
	if (!key) return null;
	return (siteConfig.services as Record<string, ServiceMeta>)[key] ?? null;
}

/** A session the Afterglow crew shoots end to end: a `content` service, except one hired to shoot yourself. */
export function isCrewShoot(category: string | null | undefined, offeringKey: string | null | undefined): boolean {
	return category === 'content' && !serviceMeta(offeringKey)?.selfShoot;
}

export function setMeta(key: string | null | undefined): (SetMeta & { key: SetKey }) | null {
	if (!key) return null;
	const meta = (siteConfig.sets as Record<string, SetMeta>)[key];
	return meta ? { ...meta, key: key as SetKey } : null;
}

export function siteMeta(locationSlug: string | null | undefined): SiteMeta | null {
	if (!locationSlug) return null;
	return (siteConfig.sites as Record<string, SiteMeta>)[locationSlug] ?? null;
}

export function siteMetaByKey(key: string | null | undefined): (SiteMeta & { slug: string }) | null {
	if (!key) return null;
	for (const [slug, meta] of Object.entries(siteConfig.sites as Record<string, SiteMeta>)) if (meta.key === key) return { ...meta, slug };
	return null;
}

/** Person copy by staff slug (a leading `staff-` is ignored). */
export function coachMeta(staffSlug: string | null | undefined): PersonMeta | null {
	if (!staffSlug) return null;
	const all = siteConfig.people as Record<string, PersonMeta>;
	return all[staffSlug] ?? all[staffSlug.replace(/^staff-/, '')] ?? null;
}

export function slugifyTitle(s: string): string {
	return s
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/** Shot copy for an add-on (by its title), or null when the add-on isn't a shot. */
export function shotMeta(addOnTitle: string | null | undefined): ShotMeta | null {
	if (!addOnTitle) return null;
	return (siteConfig.shots as Record<string, ShotMeta>)[slugifyTitle(addOnTitle)] ?? null;
}

export function toneHex(tone: Tone): string {
	return siteConfig.tones[tone]?.hex ?? siteConfig.tones.content.hex;
}

/** The tone for a category slug (content when unknown). */
export function toneFor(category: string | null | undefined): Tone {
	if (category === 'intro') return 'content';
	return categoryMeta(category)?.tone ?? 'content';
}
