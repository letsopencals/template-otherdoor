# THE GILDED COMPASS: design contract

"Every room is a story you walk into." A gilded explorers' society in Edinburgh. The site is its
**library and cabinet of curiosities**: each room is an illustrated adventure **volume** on a shelf,
and opening a volume walks you into that room's own world.

Light-first and warm, never black-minimal: parchment and vellum paper, ink-green and oxblood bands,
gold-leaf foil, engraved rules, marbled endpapers, wax seals, brass instruments and maps.

## Tokens

| Token | Value | Use |
|---|---|---|
| `--parchment` | `#F4EAD5` | page ground |
| `--vellum` | `#FBF6EA` | cards, solid header, letter paper |
| `--ink-green` | `#1E3A30` | bands, primary buttons |
| `--deep-ink` | `#15201B` | text, footer |
| `--oxblood` | `#7A1E22` | seals, accents, prices on tags |
| `--gold` | `#C8A04A` | foil (`--foil` gradient: `#8C6A24 → #E9CF86 → #B88A35 → #F3E2A6 → #9A7430`) |
| `--patina` | `#2F6F6A` | links, focus, free sessions |
| `--sepia` | `#8A6A43` | engraved rules, hairlines, captions |

Type (all verified unused in `templates/*` and `demos/sites/*`, Nov 2026):
- **IM Fell English** (`--font-display`): headlines, room titles, the letter.
- **IM Fell English SC** (`--font-engraved`): small-caps engraved labels, chapter folios, nav.
- **Mulish** (`--font-ui`): body, buttons, forms, every booking control.
- **Courier Prime** (`--font-type`): typewritten notes, references, codes, call times.

Shapes: buttons are **bevelled plates** (a 2px inset gold hairline on ink green, square corners with
3px clipped corners via `clip-path`), never pills. Cards are paper with a deckle shadow and an
engraved double rule, never rounded with offset shadows.

## Motion vocabulary (all original to this template)

Pointer lantern (radial CSS mask that reveals an SVG invisible-ink layer), spring-swung compass
needle, book spines that slide out of the shelf, foil sheen that follows the pointer
(`--sheen-x` custom property on a linear-gradient), cryptex rings that rotate letter by letter,
ink-bleed reveals (an SVG `feTurbulence` + `feDisplacementMap` mask animated once on intersection),
dotted-route drawing for the quiz path, wax seal cracking, envelope flap and letter unfold, passport
stamps pressing in. Everything respects `prefers-reduced-motion` (lantern becomes a static reveal,
the seal shows broken, the letter shows open). No animation libraries, no Lenis, no motion kit.

## Pages

- **Home**: lantern map hero (compass needle, tagline, "Open a volume" + "Plan an expedition") →
  the Shelf (six spines) → Tonight's expeditions (live next sessions, plain buttons) → Which room are
  you? (path quiz on a map) → the Cryptex (code `GILDED`) → Hall of Fame (record ledger) → the two
  houses (Vaults, Bond) → game masters (cabinet cards) → groups band → FAQ (index-card accordion).
- **/rooms**: the full shelf, then one catalogue "plate" per room with stats and a link into its world.
- **/rooms/[slug]**: the room world (see below).
- **/book** "Plan an expedition": venue tabs, date strip, one row per room with plain session
  buttons; tapping a time opens team size + add-ons inline with the total and "Add to satchel".
- **/workshops**: two workshops, date strip, sessions with seats left, seats stepper, per-head price.
- **/venues/[slug]**, **/groups**, **/faq**: content pages in the house style.
- **The Satchel** (drawer): each booking is a **luggage tag** strung on a strap.
- **/checkout** "Letter of Passage": one page letter. Satchel tags clipped along the top, then the
  letter: team name and questions written into the letter's lines, then the bearer's details, then
  payment. One primary action per section, no accordion, no sticky summary card.
- **/thank-you**: the **sealed invitation**: envelope + wax seal, tap breaks the seal, the letter
  unfolds with team, room, date, call time (15 min before), venue + map + getting there, what to
  wear, phones-away note, add to calendar, manage, "book your next volume".
- **/account** "The Explorer's Logbook": upcoming expeditions (move/cancel within the 24 h rule),
  the **passport page** (one stamp slot per room from the store's room groups; played rooms inked
  with the date, the rest outlined: "4 volumes left"), past expeditions.
- **/login**, **/preview/[screen]** (invitation, logbook, satchel fixtures).

## How this differs from every other template

- **Navigation model.** A top header that is transparent over the home hero and over every room
  world, solid vellum on scroll, whose "Rooms" item pulls a **shelf of book spines** down from the
  header instead of a menu list. The satchel is a leather bag icon with a brass count. No other
  template navigates by a shelf of objects; no mega-menu, no side rail, no bottom bar.
- **Section rhythm.** Chapters, not sections: each band opens with an engraved small-caps folio
  ("Chapter III · The Shelf") between double rules, and bands are separated by **marbled endpaper
  strips** (SVG turbulence). Paper bands alternate with ink-green and oxblood cloth bands. There is
  no eyebrow-pill → H2 → three-card grid anywhere.
- **Booking interaction.** Classic and plain (date strip directly above tappable time buttons,
  team-size buttons with group price and "£x pp", total and the primary action always in view). The
  difference is the model, not the controls: one row per **room** with its colour spine, team size is
  chosen after the time, and every room world embeds the same panel skinned by its CSS variables.
- **Cart.** The Satchel: luggage tags on a strap (room, date, session, team, add-ons, price), not a
  contact sheet, day sheet, barbell or list of cards.
- **Checkout.** A **Letter of Passage**: the questions are lines of a letter in IM Fell with the
  answers written in, the satchel tags clipped above. Not a release form, not a step accordion with a
  sticky summary.
- **Confirmation artifact.** A sealed envelope with a wax seal that breaks and unfolds into an
  invitation. Not a ticket, call sheet, race bib, day-sheet printout or flippable card.
- **Account.** The Explorer's Logbook with a **passport of room stamps**, not a roll, training log,
  week plan or ticket.

Banned and absent: every font, motion and page shape in the ban list
(`templates/_skills/build-opencals-template/references/uniqueness.md`), plus Afterglow (Syne,
Outfit, Fragment Mono; story rings, viewfinder, contact sheet, call sheet, release form, "Your
roll") and METTLE (day lanes, barbell cart, race bib, training log, plate colours, LED readouts).

## The room worlds (`/rooms/[slug]`)

Each room page is its own immersive landing page. Only the shared header, the booking panel's
behaviour and the footer are common; the contract lives in `components/worlds/README.md`.

| Room | World | Palette | Signature moments |
|---|---|---|---|
| The Jaguar Temple | 1936 jungle expedition | moss `#2E4A2A`, jade, gold `#D9A520`, stone | lianas swing down, monstera leaves part, fireflies and mist, the carved door grinds open (scroll-scrubbed) on the golden idol, a rolling-stone run |
| The Gaslight Affair at No. 9 | 1891 Victorian detective | bottle green, amber, soot, paper | drifting fog, gas-lamp flicker, the evidence board pins its cards with red string, a magnifier over a newspaper, typewritten case file, rain on glass |
| The Cartographer's Tomb (Epic) | 1922 desert excavation | sand, lapis `#1F3F8F`, gold, terracotta | drifting sand, a torch beam over original reliefs, a map unrolls on scroll, the sarcophagus lid slides, two chambers |
| The Leviathan Dive | 1870 brass submarine | verdigris, brass, abyss | scroll = descent: a fathom gauge, teal to abyss, rivets, a porthole, bubbles, sonar ping, the oxygen dial, a tentacle passing |
| The Hôtel Lumière Job | 1963 Riviera heist, comic book | pop red `#E63022`, cyan, yellow, Riviera blue, ink | comic panels sliding in with halftone, balloons, original sound effects, a laser grid you scroll through, crew cards, a safe dial (this world only) |
| The Clockmaker's Workshop | clockwork toymaker, family 7+ | walnut, copper, brass | gears turning with scroll, a cuckoo popping at section change, wind-up toys, a music-box drum, blueprints |

Until the world agents land, every slug renders a placeholder world (themed hero + story + the
booking panel) so each route works.
