/**
 * Kepler Station's own copy: the mission phases (the page's navigation), the
 * station modules (hotspots on the turnable station), the rooms of the two decks
 * (the cutaway), the commander's last transmission (the decoder) and the power
 * grid (the restore-power puzzle). Everything the store does not model lives
 * here so the station, the cutaway and the mission dial read one source.
 *
 * Story facts follow the store's room description: high orbit over a gas giant,
 * silent for nineteen days, the shuttle latched to the outer ring, a habitation
 * deck (logs, lockers, the commander's last message) and a command deck (systems
 * back one by one, then the final docking sequence).
 */

export interface Phase {
	id: string;
	n: string;
	label: string;
	/** Share of the mission clock at which this phase starts (0–1 of game minutes). */
	at: number;
}

export const PHASES: Phase[] = [
	{ id: 'k-contact', n: '00', label: 'Contact', at: 0 },
	{ id: 'k-approach', n: '01', label: 'Approach', at: 0.05 },
	{ id: 'k-dock', n: '02', label: 'Hard dock', at: 0.12 },
	{ id: 'k-decks', n: '03', label: 'The two decks', at: 0.2 },
	{ id: 'k-habitation', n: '04', label: 'Deck 1 · Habitation', at: 0.3 },
	{ id: 'k-command', n: '05', label: 'Deck 2 · Command', at: 0.58 },
	{ id: 'k-final', n: '06', label: 'Final docking', at: 0.86 },
];

/** "T+42:10" for a share of the mission clock. */
export function met(share: number, gameMinutes: number): string {
	const total = Math.max(0, Math.min(1, share)) * gameMinutes * 60;
	const m = Math.floor(total / 60);
	const s = Math.floor(total % 60);
	return `T+${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/* ------------------------------------------------------------ The station */

export type ModuleKind = 'dock' | 'hab' | 'hydro' | 'breach' | 'command' | 'comms';

export interface StationModule {
	id: ModuleKind;
	name: string;
	code: string;
	note: string;
	/** Ring modules: index on the 32-segment ring. Hub parts: null. */
	segment: number | null;
}

/** The ring has 32 hull segments; these are the ones with a story. */
export const RING_SEGMENTS = 32;

export const MODULES: StationModule[] = [
	{
		id: 'dock',
		name: 'Docking port 3',
		code: 'RING · SEG 00',
		segment: 0,
		note: 'Where your shuttle latches on. The clamps hold, the inner hatch is jammed half-way and someone has scratched numbers into the frame. That is your way in.',
	},
	{
		id: 'hydro',
		name: 'Hydroponics',
		code: 'RING · SEG 08',
		segment: 8,
		note: 'Lettuce, soy and a lemon tree somebody smuggled aboard. The air scrubbers draw through these beds, so when the plants go, the air goes after them.',
	},
	{
		id: 'breach',
		name: 'Segment 13, breached',
		code: 'RING · SEG 13',
		segment: 13,
		note: 'Something punched through the outer hull. The bulkheads held and the debris trail still points back the way you came. Nobody on the logs mentions it.',
	},
	{
		id: 'hab',
		name: 'Habitation ring',
		code: 'RING · SEG 21',
		segment: 21,
		note: 'Bunks, lockers, the galley. Nineteen days of crew life left exactly where it stopped: a mug on the table, a log still recording. Deck 1 starts here.',
	},
	{
		id: 'command',
		name: 'Command spindle',
		code: 'HUB · DRUM A',
		segment: null,
		note: 'The hub. Navigation, reactor controls and the docking computer, which has not answered since the beacon woke. Deck 2 is in here.',
	},
	{
		id: 'comms',
		name: 'Comms mast',
		code: 'HUB · MAST',
		segment: null,
		note: 'Still transmitting on a loop, 418.7 on the band. Someone set it to repeat before the station went quiet. Remember the number.',
	},
];

/* ------------------------------------------------------------ The two decks (cutaway) */

export interface DeckRoom {
	id: string;
	deck: 1 | 2;
	name: string;
	short: string;
	/** Room rectangle in the cutaway's 1200 × 640 viewBox. */
	x: number;
	w: number;
	/** What you do there. */
	does: string;
	puzzles: string[];
	crew: string;
}

export const DECK_TOP = { y: 150, h: 170 };
export const DECK_LOW = { y: 350, h: 170 };

export const ROOMS: DeckRoom[] = [
	{
		id: 'airlock',
		deck: 1,
		name: 'Airlock 3',
		short: 'Airlock',
		x: 120,
		w: 210,
		does: 'Your shuttle’s side of the story. The inner hatch has jammed half-way and the cycle panel wants a sequence nobody gave you.',
		puzzles: ['Read the scratches on the hatch frame', 'Cycle the airlock with the whole crew inside'],
		crew: 'Everyone, together',
	},
	{
		id: 'quarters',
		deck: 1,
		name: 'Crew quarters',
		short: 'Quarters',
		x: 330,
		w: 230,
		does: 'Eight bunks, eight lockers and eight personal logs. Each one tells part of what happened on day nineteen, and none of them agree.',
		puzzles: ['Match each log to its bunk', 'Open the lockers in the order the logs were recorded'],
		crew: '2–3 of you',
	},
	{
		id: 'galley',
		deck: 1,
		name: 'Galley',
		short: 'Galley',
		x: 640,
		w: 200,
		does: 'The ration computer still counts portions for a crew of nine. Work out who the ninth was and the ladder hatch to Deck 2 unlocks.',
		puzzles: ['Balance the ration ledger', 'Find the ninth name'],
		crew: '2 of you',
	},
	{
		id: 'comms',
		deck: 1,
		name: 'Comms booth',
		short: 'Comms',
		x: 840,
		w: 220,
		does: 'The commander’s last message is in here, buried in static. Tune the receiver and listen to what she told her crew to do.',
		puzzles: ['Tune the band to the beacon', 'Relay the commander’s orders to Deck 2'],
		crew: '1–2 of you, on headsets',
	},
	{
		id: 'reactor',
		deck: 2,
		name: 'Reactor',
		short: 'Reactor',
		x: 120,
		w: 250,
		does: 'Idling at four percent. Route power through the junctions by hand while somebody on Deck 1 reads you the schematic over the radio.',
		puzzles: ['Route the conduits from the core', 'Throw the main bus lever'],
		crew: '2 of you, plus a voice upstairs',
	},
	{
		id: 'life',
		deck: 2,
		name: 'Life support',
		short: 'Life support',
		x: 370,
		w: 210,
		does: 'Scrubbers, filters and a gauge that will not stop blinking. Bring it back and the station breathes again. Leave it and the clock gets shorter.',
		puzzles: ['Swap the spent filter cartridges', 'Purge the scrubbers in sequence'],
		crew: '2–3 of you',
	},
	{
		id: 'nav',
		deck: 2,
		name: 'Navigation',
		short: 'Nav',
		x: 660,
		w: 190,
		does: 'Star charts, a dead autopilot and the commander’s chair. Plot the approach to the docking window from the numbers the crew left behind.',
		puzzles: ['Plot the approach on the chart table', 'Wake the docking computer'],
		crew: '2 of you',
	},
	{
		id: 'bridge',
		deck: 2,
		name: 'Bridge',
		short: 'Bridge',
		x: 850,
		w: 230,
		does: 'The finale. Both decks enter the docking sequence at once, call and answer over the comms, while the window counts down on the main screen.',
		puzzles: ['Fly the final docking sequence', 'Get everyone back to the shuttle'],
		crew: 'The whole crew, both decks',
	},
];

/** The order the lights fail as you scroll past the cutaway (room ids). */
export const FAIL_ORDER = ['life', 'reactor', 'galley', 'quarters', 'nav', 'comms', 'bridge', 'airlock'];

/* ------------------------------------------------------------ The commander's last transmission */

export const BEACON = { min: 400, max: 440, target: 418.7, tolerance: 0.35, step: 0.05 };

export const TRANSMISSION = {
	from: 'Cmdr. Ines Adeyemi-Ross',
	stamp: 'KPLR-7 · DAY 19 · 03:12 STATION TIME',
	lines: [
		'Kepler, this is the commander. If you can hear this, the beacon worked.',
		'Do not trust the docking computer. It has been counting down to a window that is not there.',
		'Bring Deck 2 back by hand, junction by junction. Life support first.',
		'Then everyone to the bridge. The real window opens once.',
		'Leave nobody on the ring.',
	],
};

/* ------------------------------------------------------------ The power grid */

/** Connection bits: north, east, south, west. */
export const N = 1;
export const E = 2;
export const S = 4;
export const W = 8;

export const GRID = { cols: 5, rows: 3, source: { col: 0, row: 1 }, sink: { col: 4, row: 1 } };

/**
 * The solved grid, row by row (bitmasks). The live route from the reactor (west
 * of row 1) to life support (east of row 1) runs through nine conduits; the other
 * six are decoys.
 */
export const GRID_SOLVED: number[][] = [
	[E | S | W, S | E, W | E, W | S, S | W],
	[E | W, W | N, N | E | S, N | S, S | E],
	[N | E, W | E, W | N, N | E, W | N],
];

/** Quarter turns applied to each tile to scramble it (odd for straights so none starts solved). */
export const GRID_SCRAMBLE: number[][] = [
	[1, 2, 1, 3, 2],
	[1, 3, 2, 1, 2],
	[2, 3, 1, 2, 1],
];
