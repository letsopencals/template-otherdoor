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
| `presentation` | From `lib/site-config.ts` → `rooms[slug]`: `genre`, `year`, `tagline`, `order` (door number), `difficulty` (1–5), `fear` (0–5), `minAge`, `successRate`, `gameMinutes`, `record`, `minPlayers`, `maxPlayers`, `epic`, `family`, `palette` (`ground, ink, accent, accentInk, second, glow`), `headerTone`, `beats` (story scenes), `wear`, `media` (`loop`, `poster`, `key`, `stills[]`: your files in `public/worlds/<slug>/`) |
| `cover` | Store key art URL (3:4 cinematic poster, `imageUrls[0]`) or `null` |
| `photos` | Store interior photos (3:2), possibly empty |
| `gameMaster` | `{ slug, name, title, bio, image }` or null (`image` null until portraits exist) |
| `next` | The next door: `{ slug, title, tagline, genre, palette, cover, href }` or null |
| `records` | Hall of Fame sample rows `{ team, time, date }` |
| `booking` | The shared **BookingPanel**, already wired for this room. Render it once. |

Everything except `booking` is plain serialisable data, so `index.tsx` may be a Server Component
(recommended: keep the static story server-rendered and put interactive pieces in small
`'use client'` children) or start with `'use client'` itself (a ReactNode prop is fine).

**Worlds are built on cinematic media**, not flat vector scenes. Your media lives in
`public/worlds/<slug>/` (the media run writes `MEDIA.md` there, one line per file): `hero.mp4`
(16:9, 8 s, muted loop) + `hero-poster.jpg` (its first frame), `key.jpg` (3:4 key art, same as the
store's `v2-key-<slug>`), and 4–5 named stills (wide establishing, scene backgrounds, a detail,
sometimes a separable depth layer). Declare them in `presentation.media` (site-config) and
reference them from your world. Code goes on top: canvas, SVG/CSS overlays, scroll choreography.
Hand-made SVG only for UI ornaments and overlays. Every image goes through
`components/ui/safe-img.tsx` or `components/doors/door-art.tsx` (fallback chain), so a missing file
never shows a broken-image icon; a video gets an `onError` that drops back to its poster. Set
`muted` through a ref before `play()`. See `components/worlds/kepler-station/` for the reference
world (hero video, starfield canvas, sticky scroll tracks writing `--p`, HUD SVG).

## The booking panel

- It renders `<section id="book">` (deep links: `/rooms/<slug>?date=YYYY-MM-DD&time=HH:mm&team=4#book`;
  the page reads the query and preselects). Link your hero CTA to `#book`.
- It is plain on purpose (Stan's usability rule): date strip directly above tappable session
  times, team-size buttons with group price and "£x pp", optional extras, and a total bar with
  "Add to your doors" that is `position: sticky; bottom: 0` inside the panel. **Don't** restyle its
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
| `--bp-bg` | `#15121e` | panel background |
| `--bp-ink` | `#f1ecf4` | text (15.9:1) |
| `--bp-muted` | `#a99fb7` | labels, notes (7.3:1 on bg, 6.7:1 on surface) |
| `--bp-line` | `rgba(232,222,255,.14)` | borders, hairlines |
| `--bp-surface` | `#1f1a2a` | idle date / time / team / extra buttons |
| `--bp-surface-ink` | `#f1ecf4` | text on those (14.6:1) |
| `--bp-accent` | ivory `#f4efe8` | selected buttons, the primary button |
| `--bp-accent-ink` | `#120f18` | text on the accent (16.6:1) |
| `--bp-focus` | `var(--door)` | focus ring |
| `--bp-radius` | `10px` | corner radius of the panel and buttons |
| `--bp-font-display` | Funnel Display | the panel heading |
| `--bp-font-ui` | Mona Sans | everything else (keep it a readable UI font) |
| `--bp-shadow` | deep shadow + a faint `--door` glow | panel shadow |
| `--bp-bar-bg` | `#1b1726` | sticky total bar background (muted 7.0:1) |
| `--bp-bar-ink` | `--bp-ink` | sticky total bar text |

Keep contrast at WCAG AA (4.5:1) for text and the selected state; compute it (a 10-line node script
on the hex pairs) rather than eyeballing. Kepler Station's skin is the worked example in its CSS module.

## The shared header

The header is fixed, 72 px tall (`--header-h`), and **transparent over your hero** (with a soft dark
gradient behind it) until the page scrolls, then **frosted dark glass**. Its text tone over the hero
comes from `presentation.headerTone` in `lib/site-config.ts`: `light` (light text, for a dark hero;
all six rooms are `light` today) or `dark` (dark text over a light hero; switch your room to `dark`
only if your hero top is light, e.g. a comic page). Once scrolled it is always the dark glass with
light text. Your hero starts at the very top of the page (under the header): pad its content by
`var(--header-h)`. Never restyle or hide the header from a world.

**Door light.** While your world is open, the shell's `--door` is your `palette.glow` (the header
hairline, the logo slit, focus rings and the cart count take it). Pick a glow that is saturated and
readable on dark; it is also your door's colour in the corridor, the doors menu, the cart and the
account.

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
   (`templates/_skills/build-opencals-template/references/uniqueness.md`; also taken here: the shell's
   Funnel Display, Mona Sans and Spline Sans Mono, Kepler Station's Michroma, and Syne, Outfit,
   Fragment Mono, Cinzel, IM Fell English (SC), Mulish, Courier Prime from siblings and v1).
4. **Reduced motion**: every animation and scroll effect has a `@media (prefers-reduced-motion:
   reduce)` fallback showing the finished state. Nothing essential is only visible mid-animation.
5. **Scroll choreography** with IntersectionObserver (toggle a data attribute, animate in CSS) or
   CSS scroll-driven animations (`animation-timeline: view()/scroll()`, guarded by
   `@supports (animation-timeline: view())` with a static fallback). Throttle pointer effects with
   `requestAnimationFrame`. **No heavy libraries** (GSAP, Framer Motion, Lenis, three.js, Lottie…)
   without asking, and never the sibling templates' motion kit.
6. **Original IP only** (brief): no film or character names, likenesses, logos, recognisable film
   styling; no fedora + bullwhip or deerstalker + pipe silhouettes.
7. **Must contain**: a full-screen hero with the room name (on your hero loop); a scroll story of
   3–5 scenes (the setup, the stakes, what you'll do, inside the room, the team / game master); the
   stats (players, game length, difficulty, fear, age, escape rate); the photos (`photos`, the
   store's interiors); the game master; the booking panel; the next-door teaser (`next`).
8. **Works at 390 px** with no horizontal scroll (`overflow-x: clip` on your root), and on a
   1440 px desktop. Images: `<img>`/`SafeImg`, `loading="lazy"` below the fold (images are
   unoptimised). Sticky scroll tracks: test portrait screens (`max-aspect-ratio: 1/1`) separately.
   Sticky stages need `overflow: clip`, not `hidden`, and must not wrap the booking panel.
9. **Hydration-safe SVG**: round every computed coordinate (`Math.round(n * 100) / 100` or
   `n.toFixed(2)`). Raw `Math.sin/cos` output differs in the last digit between Node and the browser
   and React reports a hydration mismatch. No `Math.random()`/`Date.now()` in render.
10. Checks before you hand back: `npx tsc --noEmit`, `npm run lint`, and the page at 390 and 1440.

## Adding a world

1. Create `components/worlds/<slug>/index.tsx` with
   `export default function MyWorld(props: RoomWorldProps) { … }` (replace the placeholder).
2. If the slug is new, add `'<slug>': dynamic(() => import('./<slug>'))` to `registry.tsx` and the
   room's presentation to `lib/site-config.ts` → `rooms` (palette, headerTone, stats, beats).
3. Render `{props.booking}` once and set the `--bp-*` variables on your root.

A store room with no registry entry falls back to `_placeholder/placeholder-world.tsx` (the generic
world in the dark shell, lit by the room's glow, using `media.poster`).

## Status

| Room | World |
|---|---|
| `kepler-station` | Built (Michroma; reference implementation) |
| `jaguar-temple`, `gaslight-no-9`, `protocol-zero`, `hotel-lumiere`, `clockmakers-workshop` | Generic world until built (v1 drafts in the `v0-parchment` tag, for story ideas only) |
