# OTHERDOOR: design contract

Immersive escape rooms in Edinburgh. **The brand idea is the door**: every room is a door into
another world. The shell (header, home, booking, cart, checkout, account) is genre-neutral, dark,
rich and modern. All genre lives behind the doors, in the six room worlds at `/rooms/<slug>`, each
with its own palette, display font, layout grammar and motion.

v1 (parchment and treasure-hunt styling) was rejected and is kept
only in the `v0-parchment` tag. Nothing from it survives in the rendering layer.

## The shell

**Mood.** A members' club after midnight crossed with a gallery. Layered darks (blue-black
`#0c0a12`, aubergine `#1f1329`, warm umber `#1e150f`), never pure black; film grain over everything
(an animated SVG-noise overlay at 5.5% opacity); soft volumetric light; smoked glass with metal
hairlines (gradient borders through a mask); generous space; big confident type.

**The one recurring light: the light under a door.** `--door` on `<html>` is a registered colour
property (`@property`, so it animates). It defaults to a warm lamp `#f2c46d`. Whenever a room is in
focus (a door hovered in the corridor, a card in the doors menu, a row in Tonight, a room world
open, the winning door in the picker) the shell borrows that room's `palette.glow` through
`lib/door-light.ts`. The light shows up as:
- the 2 px **slit** under doors, cards and the button edge (`.slit`, `.btn` bottom glow);
- the **label** sliver before every mono label (`.label::before`);
- the **sill** under section heads, which stretches when the section enters the viewport;
- the **pool** of light behind sections (`.lamp::before`) and the vanishing point of the hero;
- the logo's door slit, the header's bottom hairline and the cart count.

Door lights (`palette.glow`, all distinct hues): Jaguar Temple gold `#F0C94A`, Gaslight No. 9 jade
`#6FD3A8`, Protocol Zero alert red `#FF4358`, Kepler Station ion teal `#3ED2D6`, Hôtel Lumière pop
pink `#FF5FA2`, Clockmaker's Workshop copper `#F2A55A`.

**Type.**
- Display: **Funnel Display** (300–700), mixed case, tight tracking (−0.025 to −0.045 em). Big.
- UI: **Mona Sans** (variable).
- Mono: **Spline Sans Mono** for labels, numbers, times and door plates, lowercase/sentence case.
  No letterspaced uppercase labels anywhere in the shell (that is NOIR's voice).
- All three verified unused across `templates/*` and `demos/sites/*` and absent from the ban list.

**Tokens** (`app/globals.css` `@theme`): `night-0…3`, `aubergine`, `umber`, `ink` `#f1ecf4`,
`ink-2` `#c3bacd` (10.5:1 on night-1), `ink-3` `#948aa3` (6.0:1), `line`, `line-2`, `lamp`, `ember`.

**Shapes.** Door-shaped corners: 10 px top, 4 px bottom on buttons, cards and frames (`border-radius:
10px 10px 4px 4px`). Buttons: `.btn` is a lit doorway (ivory fill, the room's light glowing under
the bottom edge); `.btn-glass` is smoked glass with a hairline. Never pills, never square slabs.

**Motion.** No motion library, no fade-up reveals, no parallax kit. The shell's own motion:
doors opening in 3D (`rotateY` from the hinge), light switching on (pools and sills, triggered by
`components/ui/lamp.tsx`; content is never hidden), the door light cross-fading between rooms, the
corridor's FLIP re-order, the flashlight mask, the keypad press and shake, the thank-you unlock.
Every animation has a reduced-motion fallback that shows the finished state.

**Logo.** A door frame and a door leaf ajar (two offset shapes) with the light in the slit and
spilling across the floor, plus the OTHERDOOR wordmark. `public/logo-mark.svg` (and the lockups)
from the media run; `components/brand/logo.tsx` inlines the mark so the slit takes `--door`.

## How this differs from every other template

| | Otherdoor |
|---|---|
| **Navigation** | One header, transparent over heroes and worlds, frosted glass on scroll (the blur lives on a child layer so the menus aren't clipped). "Rooms" opens a full-width **doors menu**: six tall door cards with key art and their light, plus an aside of routes. The cart button is a lit doorway: **Your doors**. Phones get a full-screen menu with a door thumbnail per room. |
| **Home** | **The Corridor**: six physical doors (lacquered leaves, recessed panels, a glazed upper panel showing the room's key art, number plate, year, knob) in a dark hall over the home loop. Hover/focus opens a door from its hinge, plays that world's muted loop inside and spills its light across the floor; the whole shell takes the colour. Phones: a vertical stack of doors, first tap opens, second enters. Mood filters re-order the doors (FLIP). |
| **Section rhythm** | Asymmetric heads (mono number + label, big display title left, lede bottom-right, a sill of light under). Sections are separated by light, not by bands or rules: each "lamp" switches its pool on as it arrives. No eyebrow-pill/3-card grids. |
| **Play** | A **keypad lock** (clues on the doors, in the dark room and in the small print; the code reveals the discount), **"Which door is yours?"** (six mini doors whose light grows with each answer; the winner opens), a **flashlight** room (the cursor's torch reveals words and keypad clues). |
| **Booking** | Plain on purpose (usability rule): on room pages the shared BookingPanel (date strip directly above session buttons, team-size buttons with group price and £pp, extras, total + "Add to your doors" in a sticky bar). `/book`: venue filter + one date strip, one row per room with a door thumbnail and plain session buttons; team size opens inline. Workshops: date strip, sessions, seats stepper. No themed pickers or dials. |
| **Cart** | **Your doors**: a drawer of slim door cards, each with a door-shaped key-art thumb and its leading edge lit in the world's colour; a hold bar of light counting down. |
| **Checkout** | One dark page, top to bottom: the door cards across the top, then 01 Your team (the store's questions as plain labelled fields), 02 Contact, 03 Payment (ledger, code, method radios, Stripe via `next/dynamic`). Beside it, the first door you picked stands open (decoration, not a summary). No step accordion, no sticky summary. |
| **Confirmation** | **The door unlocks**: a lock keys in the booking reference and unlocks, the door swings open onto the room's key art, then "You're in, <team>.", **Arrive by** (call time, 15 min early) in the room's light, room/team/where/what to wear/phones away/extras, calendar, manage, and **Open another door**. Reduced motion: shown open. |
| **Account** | **Doors opened**: every room as a door; the ones you've played stand open on their key art, lit in their colour with the date; the rest stay closed ("3 doors left"). Coming up (door cards with move/cancel under the 24 h rule) and past visits. |
| **Palette / type** | Aubergine-blue-black with a single borrowed light, Funnel Display + Mona Sans + Spline Sans Mono. Not NOIR (black + champagne, extended caps) and not METTLE (rubber + LED, condensed caps). |

## The world system

Contract: `components/worlds/README.md` (props, the `--bp-*` variables, header tones, rules) and
`lib/worlds.ts`. Each room world:
- lives in `components/worlds/<slug>/` and has its own route file `app/rooms/<slug>/page.tsx` (so each world's JS and CSS ship only on its page);
- is **built on cinematic media** (`public/worlds/<slug>/`: `hero.mp4` + `hero-poster.jpg`,
  `key.jpg`, and named stills described in that folder's `MEDIA.md`) with code motion on top
  (canvas, SVG/CSS overlays, scroll choreography); no flat vector scenes as the main imagery;
- has its own display font (one per world, verified unused), palette and interactive moment;
- contains a full-screen hero, a 3–5 scene scroll story, the stats, photos, the game master, the
  booking panel (skinned only with `--bp-*`) and the next-door teaser.

All six are built, one line each (concept · display font · signature interaction):

| Room | Concept | Display | Signature interaction |
|---|---|---|---|
| **The Jaguar Temple** (1936) | A vertical descent from the canopy to the chamber of gold, measured on a plumb line | Rakkas | Leaf curtains part as each layer arrives; a three-face glyph lock slides the photo-real stone door open onto the idol |
| **The Gaslight Affair at No. 9** (1891) | A detective's evidence wall read sideways, from the gaslit street to the warrant | Gloock (+ Cutive Mono) | Red string draws between pinned documents on scroll; a reading glass over the case file reveals hidden ink |
| **Protocol Zero** (2071) | The page is MERIDIAN's interface, decaying from clinical white to black and alarm red | Doto | The AI's typing terminal and wipe countdown; an access prompt (passphrase hidden in the incident log) that shakes on denial and parts the core doors |
| **Kepler Station** (2187, the Epic) | The page is the mission timeline from first contact to the final docking, with hull seams between phases | Michroma | A mission-clock dial for navigation; a ring station you can turn, a cutaway of both decks, a signal decoder, a restore-power board whose lever relights the page, and a press-and-hold airlock before the booking panel |
| **The Hôtel Lumière Job** (1963) | The page is a comic book: issue No. 9, cover to back pages, light newsprint (`headerTone: 'dark'`) | Bowlby One (+ Shantell Sans) | Panels slam in with halftone screens and popping balloons over halftoned stills; a winnable laser grid and a draggable safe dial |
| **The Clockmaker's Workshop** (timeless, family) | The page is a wind-up toy: one mainspring drives every gear train | Caprasimo | Turn the key or scroll to wind it; the cabinet's six compartments open as their gears engage, a cuckoo calls each one, five hidden keys earn the rosette |

The booking panel heading can be set per room (`bookingHeading` in `lib/site-config.ts`) where
the world already titles the section around it.
