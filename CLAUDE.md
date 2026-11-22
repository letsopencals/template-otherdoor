# Template conventions

This is a Next.js 15 (App Router) / React 19 storefront template built on
`@opencals/storefront-sdk`. These conventions keep the template fast and
maintainable. They apply to every template in `templates/` — this file is meant
to be copied across them (only the template name / branding differs).

## Data fetching

**RSC-first.** Read data on the server and pass it down. Do NOT fetch cacheable
data in a `useEffect` on the client.

- Server reads go through `lib/server-data.ts` — `React.cache()`-wrapped helpers
  (`getStoreSettings`, `getProducts`, `getProduct`, `getCatalogue`, `getRoomRanges`) that call the SDK directly.
  `React.cache` dedupes calls within a request. Never import `lib/server-data.ts`
  from a `'use client'` file.
- `app/layout.tsx` is an async Server Component: it fetches store settings once
  and seeds `<Providers initialSettings={...}>`. `SettingsProvider` takes the
  value as a prop — it does not fetch.
- Read-only pages (e.g. `app/workshops/page.tsx`) are async Server Components that
  fetch with `lib/server-data.ts` and hand the result to a small `'use client'`
  child as initial props.

**Client reads use SWR, seeded with server data.** For data that genuinely needs
to live on the client (filtering, availability, add-ons, cart), use `useSWR`
against the template's own `/api/*` routes, with `fallbackData` set to the
server-rendered value so there's no loading flash on first paint.

- Shared fetcher: `lib/fetcher.ts`.
- Build the SWR key from its inputs and pass `null` when not ready (e.g. no date
  picked yet) so nothing fetches prematurely. Multiple SWR hooks run in parallel
  — never chain fetches through sequential `useEffect`s.
- `revalidateOnFocus: false` unless you specifically want refocus revalidation.

The `/api/*` routes stay: they are the client/SWR data source and call the SDK
server-side via the `@/lib/opencals` side-effect import.

## Components & files

**Pages compose; components implement.** A `page.tsx` should be: data fetching
(RSC) + layout/composition + wiring. Presentational blocks and interactive
widgets live in `components/`.

- Guideline: any `page.tsx` over ~150 lines, or one that defines a section /
  widget component, gets decomposed into `components/`.
- Group `components/` by route/domain: `components/booking/`, `components/account/`,
  `components/services/`, `components/home/`; shared primitives in `components/ui/`.
  Co-locate a route's private components under a matching subfolder
  (e.g. `components/account/appointment-detail/`).

**Never define a component inside another component** — it remounts on every
parent render. Define at module scope (or a separate file). Module-scope sibling
helpers below a page are fine.

**Use the shared primitives; don't hand-style buttons inline.**
- Buttons are CSS classes in `app/globals.css`: `.btn` (the lit doorway: ivory, the room's light
  under the bottom edge), `.btn-glass` (smoked glass), sizes `.btn-sm` / `.btn-lg`, `.btn-block`.
  Door-shaped corners (10 px top, 4 px bottom), never pills. Links that look like buttons get the
  same classes.
- `components/ui/drawer.tsx`: the one overlay (focus trap, scroll lock): the cart.
- `components/ui/safe-img.tsx` and `components/doors/door-art.tsx` (fallback chain for room art):
  never a broken-image icon, including images that failed before hydration.
- `components/ui/section-head.tsx` + `components/ui/lamp.tsx` (sections whose light switches on),
  `components/pages/page-head.tsx`, `components/ui/faq-cards.tsx`, `components/ui/meters.tsx`.
- Brand: `components/brand/logo.tsx` (`DoorMark` inlines `public/logo-mark.svg` so the slit takes
  `--door`). Never import a motion library.

**Hooks are single-concern.** Split multi-purpose hooks so each has one
responsibility and independent dependencies (see `hooks/use-checkout-questions.ts`,
`hooks/use-payment-providers.ts`, `hooks/use-cart-expiry.ts`, split out of the
booking flow / cart context). A large hook may remain as a thin orchestrator that
composes the smaller ones.

## Re-render hygiene

- **Memoize context provider values** with `useMemo` — an inline `value={{...}}`
  object makes every consumer re-render on each provider render. All contexts here
  (`settings`, `timezone`, `cart`, `checkout`) follow this.
- Hoist static objects (default non-primitive props) to module-level `const`s
  instead of recreating them inline.
- `React.memo` leaf components that take stable props and render often
  (e.g. `components/booking/session-buttons.tsx`, `components/booking/date-strip.tsx`).
- Prefer a ternary (`cond ? <x/> : null`) over `cond && <x/>` for conditional
  rendering, to avoid accidentally rendering `0`/`''`.

## Bundle

- Load heavy / below-the-fold components with `next/dynamic`. Stripe is never
  in the initial bundle: it loads on demand inside
  `components/checkout/checkout-view.tsx`.
- Import directly from module paths; avoid barrel/index re-export files that pull
  in more than you use.

## OTHERDOOR: immersive escape rooms (Edinburgh, GBP, `Europe/London`)

"Pick a door. Leave the world behind." Six private rooms at two venues: **Otherdoor Vaults**
(19 Cowgate: The Jaguar Temple, The Gaslight Affair at No. 9, Protocol Zero) and **Otherdoor Leith**
(54 The Shore: Kepler Station, the 120-minute Epic; The Hôtel Lumière Job; The Clockmaker's
Workshop; plus the two workshops). Seed dataset `escape_rooms` (backend, folder `escape-rooms`).
Design contract: **DESIGN.md**. Room-world contract: **components/worlds/README.md**.

### Data model (`lib/rooms.ts`): derived from the API, keyed by slugs
- **Room** = a product group in the `rooms` collection whose variants are **team sizes**: slug
  `<room>-<n>p`, `variantTitle` "<n> players", price = group price, `maxAttendees: 1`, no staff, one
  shared product pool (any size blocks the room). Availability is read for the smallest-team variant;
  the booking goes to the chosen size's variant with `customAttributes.people`.
- **Workshop** = a product in `workshops`: staff-led, per head, `maxAttendees` = seats.
- Presentation the API doesn't model lives in `lib/site-config.ts`: stats, palettes (`glow` = the
  door light), moods, game-master titles, venue copy, the Hall of Fame **sample**, the door picker,
  the keypad (`code` 2187 → `reward` OTHERDOOR) and the template's world media manifest.
- `lib/doors.ts` (`DoorRoom`, `doorsForMood`), `lib/visit.ts` (one booking as the UI shows it),
  `lib/cart-lines.ts` (cart maths), `lib/history.ts` (upcoming/past, doors opened),
  `lib/order-visits.ts`, `lib/world-props.ts` + `lib/worlds.ts` (the world contract).

### Room worlds (`components/worlds/<slug>/`, contract in `components/worlds/README.md`)
Each built world has its own route file `app/rooms/<slug>/page.tsx` (imports only that world), its
own CSS module and its own display font (`font.ts`): Kepler Station (Michroma), The Jaguar Temple
(Rakkas), The Gaslight Affair at No. 9 (Gloock + Cutive Mono), Protocol Zero (Doto), The Hôtel
Lumière Job (Bowlby One + Shantell Sans), The Clockmaker's Workshop (Caprasimo). A store room with
no world folder falls back to `app/rooms/[slug]` (`_placeholder`). Worlds skin the BookingPanel
only through `--bp-*`; they never restyle its controls. Never copy one world's structure into
another (each has its own layout grammar and motion).

### Availability
- `/api/rooms/availability` (`getRoomRanges`): merged free windows per room, cached 60 s, tag
  `availability`; `lib/sessions.ts` cuts them into sessions on the wall-clock grid
  (`midnight + k × duration`, Europe/London). Workshops: `/api/workshops/availability`.
- `revalidateTag('availability')` after book, cart-item removal, cancel and reschedule.

### Booking, cart, checkout
- Everything goes through `useAddToCart()` (`hooks/use-add-to-cart.ts`): `POST /api/book`, then the
  header flashes and **Your doors** opens (`contexts/cart-ui-context.tsx`).
- Room pages embed the shared **BookingPanel** (`components/booking/booking-panel.tsx`), skinned only
  by `--bp-*`. `/book` is the session board (`components/booking/session-board.tsx`), `/workshops`
  the workshop booker.
- **Totals come from the cart.** The API's `subtotal` is net of offers; the gross is rebuilt with
  `grossSubtotal()`. Matinee 15% (Mon–Thu before 15:00) is automatic; code `OTHERDOOR` 10%.
- **Checkout** (`components/checkout/checkout-view.tsx`): one page (team questions, contact, payment);
  `handleSign` saves customer then answers; routing on the provider's `checkoutMode`; Stripe's key
  comes only from checkout start. 409/402 codes handled in `contexts/checkout-context.tsx`.
- **Thank-you** (`components/thank-you/*`): "The door unlocks". **Account**
  (`components/account/doors-opened.tsx`): "Doors opened"; `/account/appointments/[id]` moves or
  cancels (24 h rule, `lib/change-window.ts`).
- `/preview/thank-you|account|cart` render fixtures (dev, or `OTHERDOOR_PREVIEW=1`).

### Times
Always Edinburgh: `siteConfig.timezone` with `lib/when.ts` (24 h, `en-GB`).

### Auth
Passwordless only: `/login` (email → 6-digit code) and `/link/[token]` magic links. The middleware
refreshes tokens and protects `/account/*`.

### Media
- Home: `public/home/` (`hero.mp4`, `hero-poster.jpg`, `corridor.jpg`, `lobby.jpg`); venues
  `public/images/venue-*.jpg`. Worlds: `public/worlds/<slug>/` with a `MEDIA.md` per folder
  (`hero.mp4`, `hero-poster.jpg`, `key.jpg`, named stills). Paths in `siteConfig.media` and
  `rooms[slug].media`. Store images (key art, interiors, portraits) come from the API and win.
- Missing files fall back to gradients; videos drop back to their poster. `images.unoptimized: true`.

### Gotchas
- The SDK runs with `throwOnError: true`; routes pass errors through `handleApiError`.
- Next 15 `params`/`searchParams` are Promises. Quote bracketed paths in shell commands.
- `backdrop-filter` makes an element the containing block of fixed children: the header's blur is
  on a child layer. Sticky (the panel's total bar, world scroll stages) needs ancestors without
  `overflow: hidden|auto` or transforms; use `overflow: clip`.
- Round computed SVG coordinates; no `Math.random()`/`Date.now()` in render (hydration).

## Verifying changes

- `npm run typecheck`, `npm run lint` and `npm test` (vitest: rooms, sessions,
  doors, visit, history, cart-lines, booking-state, field-errors, guards) must pass.
- `npm run build` must pass before release. Don't `next build` while a
  `next dev` runs in this folder (shared `.next`); build in a copy.
- Smoke test against a seeded `escape_rooms` store (or the mock): the corridor shows six doors and
  Tonight lists sessions; Kepler Station books 6 players at 18:00 into Your doors; checkout with
  pay-at-the-venue lands on "The door unlocks"; the account shows the booking under Coming up.
