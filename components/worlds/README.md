# Room worlds: the contract

Each room page `/rooms/<slug>` is its own immersive landing page with its own design. The shell
(header, footer, booking behaviour, data) is shared; everything between the header and the footer
is the world's.

```
app/rooms/[slug]/page.tsx      reads the store, builds the props, wires the BookingPanel
components/worlds/registry.tsx slug → next/dynamic(() => import('./<slug>'))
components/worlds/<slug>/      YOUR FOLDER: index.tsx (default export) + CSS module + art
lib/worlds.ts                  RoomWorldProps (the types below) + the --bp-* variable list
lib/world-props.ts             how the props are built (store + lib/site-config.ts)
```

## Props (`RoomWorldProps`, `lib/worlds.ts`)

| Prop | What |
|---|---|
| `room` | From the store: `slug`, `title`, `description` (~120-word setup), `visitMinutes`, `options` (team sizes: `{ productId, slug, size, price, perHead }`, smallest first), `fromPrice`, `fromPriceLabel` ("£70"), `venue` (`{ slug, name, short, address, postcode, lat, lng, href }` or null) |
| `presentation` | From `lib/site-config.ts` → `rooms[slug]`: `genre`, `year`, `tagline`, `volume`, `difficulty` (1–5), `fear` (0–5), `minAge`, `successRate`, `gameMinutes`, `record`, `minPlayers`, `maxPlayers`, `epic`, `family`, `palette` (`ground, ink, accent, accentInk, second, spine, foil`), `headerTone`, `beats` (story scenes), `wear` |
| `cover` | Store cover art URL (3:4 illustrated) or `null` |
| `photos` | Store interior photos (3:2), possibly empty |
| `gameMaster` | `{ slug, name, title, bio, image }` or null (`image` null until portraits exist) |
| `next` | The next volume: `{ slug, title, tagline, genre, palette, cover, href }` or null |
| `records` | Hall of Fame sample rows `{ team, time, date }` |
| `booking` | The shared **BookingPanel**, already wired for this room. Render it once. |

Everything except `booking` is plain serialisable data, so `index.tsx` may be a Server Component
(recommended: keep the static story server-rendered and put interactive pieces in small
`'use client'` children) or start with `'use client'` itself (a ReactNode prop is fine).

**No photos exist yet** (Gemini credits). The world must look finished with hand-made SVG/CSS
illustration alone. Use `cover`/`photos` when present, through `components/ui/safe-img.tsx`
(`<SafeImg src alt fallback={<YourSvg/>} />`), so a missing or failing image never shows a
broken-image icon.

## The booking panel

- It renders `<section id="book">` (deep links: `/rooms/<slug>?date=YYYY-MM-DD&time=HH:mm&team=4#book`;
  the page reads the query and preselects). Link your hero CTA to `#book`.
- It is plain on purpose (Stan's usability rule): date strip directly above tappable session
  times, team-size buttons with group price and "£x pp", optional extras, and a total bar with
  "Add to satchel" that is `position: sticky; bottom: 0` inside the panel. **Don't** restyle its
  internals, wrap its controls in themed pickers, or add dials. Frame it however you like (a
  brass plate, a case file, a comic panel), around it.
- **Placement:** put it in normal document flow, ideally in a two-column section (story left,
  panel right, min ~420 px wide on desktop; full width on phones). Sticky needs that **no ancestor
  between the panel and the page has `overflow: hidden | auto | scroll`** (use `overflow: clip` to
  crop art instead: it doesn't create a scroll container), and no ancestor with `transform`,
  `filter` or `contain` on the panel's own column. Don't portal it: it would lose your variables.
- **Skin it only with these CSS variables**, set on any ancestor (your world root). Every one has a
  house-style fallback:

| Variable | Default | Used for |
|---|---|---|
| `--bp-bg` | vellum `#fbf6ea` | panel background |
| `--bp-ink` | `#15201b` | text |
| `--bp-muted` | `#6f5a3e` | labels, notes |
| `--bp-line` | sepia 35% | borders, hairlines |
| `--bp-surface` | parchment `#f4ead5` | idle date / time / team / extra buttons |
| `--bp-surface-ink` | `#15201b` | text on those |
| `--bp-accent` | ink green `#1e3a30` | selected buttons, the primary button |
| `--bp-accent-ink` | `#fbf6ea` | text on the accent |
| `--bp-focus` | patina `#2f6f6a` | focus ring |
| `--bp-radius` | `4px` | corner radius of the panel and buttons |
| `--bp-font-display` | IM Fell English | the panel heading |
| `--bp-font-ui` | Mulish | everything else (keep it a readable UI font) |
| `--bp-shadow` | paper shadow | panel shadow |
| `--bp-bar-bg` | `--bp-bg` | sticky total bar background |
| `--bp-bar-ink` | `--bp-ink` | sticky total bar text |

Keep contrast at WCAG AA (4.5:1) for text and the selected state.

## The shared header

The header is fixed, 72 px tall (`--header-h`), and **transparent over your hero** until the page
scrolls, then solid vellum. Its text tone comes from `presentation.headerTone` in
`lib/site-config.ts`: `light` (cream text, for a dark hero) or `dark` (ink text, for a light hero).
Your hero starts at the very top of the page (under the header): pad its content by
`var(--header-h)`. Never restyle or hide the header from a world.

## Rules

1. **Own folder only**: `components/worlds/<slug>/**`. Plus one line in `registry.tsx` if you add a
   world for a new slug. Don't edit `app/globals.css`, the shell, `lib/*` or another world. If you
   need a contract change, ask.
2. **Own styles**: a CSS module (`*.module.css`) or classes scoped under your world root. No global
   selectors (`:global(body)`, `html`, bare element selectors outside your root). Tailwind utilities
   are available but your look should live in your module.
3. **One extra Google font per world**, loaded inside the world with `next/font/google` (e.g. in
   `components/worlds/<slug>/font.ts`), exposed as a CSS variable on your root. Check it is unused
   across `templates/*` and `demos/sites/*` and not in the ban list
   (`templates/_skills/build-opencals-template/references/uniqueness.md`; also Syne, Outfit, Fragment
   Mono, Cinzel, IM Fell English (SC), Mulish, Courier Prime are taken by the shell or siblings).
4. **Reduced motion**: every animation and scroll effect has a `@media (prefers-reduced-motion:
   reduce)` fallback showing the finished state. Nothing essential is only visible mid-animation.
5. **Scroll choreography** with IntersectionObserver (toggle a data attribute, animate in CSS) or
   CSS scroll-driven animations (`animation-timeline: view()/scroll()`, guarded by
   `@supports (animation-timeline: view())` with a static fallback). Throttle pointer effects with
   `requestAnimationFrame`. **No heavy libraries** (GSAP, Framer Motion, Lenis, three.js, Lottie…)
   without asking, and never the sibling templates' motion kit.
6. **Original IP only** (brief): no film or character names, likenesses, logos, recognisable film
   styling; no fedora + bullwhip or deerstalker + pipe silhouettes.
7. **Must contain**: a full-screen hero with the room name; a scroll story of 3–5 scenes (the setup,
   the stakes, what you'll do, inside the room, the team / game master); the stats (players, game
   length, difficulty, fear, age, escape rate); the photos when they exist; the booking panel; the
   next-room teaser (`next`).
8. **Works at 390 px** with no horizontal scroll (`overflow-x: clip` on your root), and on a
   1440 px desktop. Images: `<img>`/`SafeImg`, `loading="lazy"` below the fold (images are
   unoptimised; size art in SVG, not bitmaps).
9. Checks before you hand back: `npx tsc --noEmit`, `npm run lint`, and the page at 390 and 1440.

## Adding a world

1. Create `components/worlds/<slug>/index.tsx` with
   `export default function MyWorld(props: RoomWorldProps) { … }` (replace the placeholder).
2. If the slug is new, add `'<slug>': dynamic(() => import('./<slug>'))` to `registry.tsx` and the
   room's presentation to `lib/site-config.ts` → `rooms` (palette, headerTone, stats, beats).
3. Render `{props.booking}` once and set the `--bp-*` variables on your root.

A store room with no world folder falls back to `_placeholder/placeholder-world.tsx`.
