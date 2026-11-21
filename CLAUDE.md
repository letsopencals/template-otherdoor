# Template conventions

This is a Next.js 15 (App Router) / React 19 storefront template built on
`@opencals/storefront-sdk`. These conventions keep the template fast and
maintainable. They apply to every template in `templates/` — this file is meant
to be copied across them (only the template name / branding differs).

## Data fetching

**RSC-first.** Read data on the server and pass it down. Do NOT fetch cacheable
data in a `useEffect` on the client.

- Server reads go through `lib/server-data.ts` — `React.cache()`-wrapped helpers
  (`getStoreSettings`, `getProducts`, `getProduct`) that call the SDK directly.
  `React.cache` dedupes calls within a request. Never import `lib/server-data.ts`
  from a `'use client'` file.
- `app/layout.tsx` is an async Server Component: it fetches store settings once
  and seeds `<Providers initialSettings={...}>`. `SettingsProvider` takes the
  value as a prop — it does not fetch.
- Read-only pages (e.g. `app/coaches/page.tsx`) are async Server Components that
  fetch with `lib/server-data.ts` and hand the result to a small `'use client'`
  child as `initialProducts` / `initialProduct`.

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

**Use the shared UI primitives — don't hand-style buttons/inputs inline.**
- `components/ui/button.tsx`: `<Button variant size fullWidth loading dot>`. Variants:
  `shutter` (night, with the shutter dot), `glow` (the afterglow gradient: Book /
  Add to shot list), `outline`, `light` (on photos and night), `ghost`. Sizes
  `sm|md|lg`. Soft 12px rectangles, never pills. Links that look like buttons use
  `buttonClasses({ variant, size, fullWidth, className })`.
- `components/ui/input.tsx` — `<Input>`, `<Textarea>`, `<Select>`, `<FieldLabel>`.
- `components/ui/choice.tsx` — `<ChoiceRow>`, plain radio-button rows (tier, site, length).
- `components/ui/overlay.tsx` — the one overlay: `kind="drawer"` (the shot list, the
  menu), `kind="sheet"` (cancel dialog) or `kind="full"` (the story viewer). Focus
  trap + scroll lock.
- Motifs live in `components/frame/*` (viewfinder, story ring, grease pencil,
  film edge, slate section head, REC, logo). Never import a motion library.

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
  (e.g. `components/schedule/session-row.tsx`).
- Prefer a ternary (`cond ? <x/> : null`) over `cond && <x/>` for conditional
  rendering, to avoid accidentally rendering `0`/`''`.

## Bundle

- Load heavy / below-the-fold components with `next/dynamic`. Stripe is never
  in the initial bundle: it loads on demand inside
  `components/checkout/release-form.tsx`.
- Import directly from module paths; avoid barrel/index re-export files that pull
  in more than you use.

## AFTERGLOW: content gym (Miami, USD, `America/New_York`)

"You train. We shoot." South Beach (Mirror Hall, the Rooftop, the beach, the
Afterglow Bar) and Wynwood (the Neon Room, the Ring, the Mural Floor, the Studio
Wall, the café). Ten coaches in three tiers and six crew (photographers,
filmmakers, a makeup artist). Weekly classes with **shot add-ons**, shoots with
the crew, physique coaching at 30/60/90 min, glow (saunas, plunge, red light,
compression, glam), bar tables and dated events. Seed dataset `content_gym`
(backend). Design contract: **DESIGN.md** ("Call sheet": viewfinders, story
rings, grease pencil, contact sheet, call sheet, golden hour).

### Data model (`lib/catalog.ts`): derived from the API, keyed by slugs
- **Category** = the product's collection (`ride`, `sculpt`, `flow`, `box`,
  `sweat`, `coaching`, `content`, `glow`, `bar`, `events`). Site copy wins when
  it knows the product (`siteConfig.classes[key].category` /
  `services[key].category`): the Studio Wall sits in the `glow` collection but is
  shown as `content`, and the First Glow Tour is `intro`. The category sets the
  **tone** (colour).
- **Kind**: `event` (events), `class` (a `siteConfig.classes` key, or a
  timetable category with >1 spot and one coach per variant), else `service`
  (booked in the service booker).
- **Class** = product group; each variant is one weekly **series** (class ×
  site × coach), slug `<class-key>-<site>-<coach>` (`glute-lab-south-beach-valentina`).
  Site and coach come from the variant's own `locations` / `staffMembers`. The
  **set** (room) comes from `siteConfig.classes[key].set` (sets aren't API entities).
- **Service** = product group; variants are options (`pt-coach|senior|head` under
  `physique-coaching` via `prefixes: ['pt-']`; `infrared-suite-1/-2`;
  `compression-<site>`; `bar-table-south-beach` / `cafe-table-wynwood` under `bar-table`).
- **People** by staff slug (`siteConfig.people`: role, tier, handle, title, bio).
  Coaches first, then crew.
- **Shots** are add-ons recognised by title (`siteConfig.shots`, `shotMeta(title)`):
  Class Clips, Photo Set, Slow-mo Reel, Raw Camera Roll. Everything else is an extra.

### Availability (never per day or per cell from the client)
- **Schedule** (`getTimetable`, `lib/timetable.ts`): one merged-availability call
  per class series (6 at a time), `unstable_cache` 60 s, tag `availability`.
  **Full inference** as in Tensile/METTLE; Miami local-time keys, so the March and
  November DST switches don't create twins (tests). Each occurrence carries its
  `set` and `golden` (`'morning' | 'evening' | null`): the golden hour it overlaps
  on an **outdoor** set, from `lib/sun.ts` (NOAA sunrise/sunset, tests).
- **Service booker** (`/api/ranges` → `getServiceRanges`): one merged call per
  (variant, person?, site?) across the horizon, cached 60 s with tag
  `availability`. `lib/slots.ts` derives days and start times on the client.
- `revalidateTag('availability')` runs after book, cart-item removal, cancel and
  reschedule (the API routes); the schedule also `router.refresh()`es after a book.

### Booking, the shot list and checkout
- Everything goes through `useAddToShotList()` (`hooks/use-add-to-shot-list.ts`):
  `POST /api/book` per session (UTC slot, `staffMemberId`, `locationId`,
  `numberOfAttendees` (the party size for tables), `addOns`, `people` for partner
  and duo → `customAttributes.people = "2"`), then the header flashes and the
  Shot List drawer opens.
- **Shot List** (`lib/shot-list.ts`, `components/shotlist/*`): the cart as a
  contact sheet, one numbered frame per session with the shots circled. **The
  total and each offer come from the cart.** The API's `subtotal` (cart and
  order) is already net of offers, so the "Sessions & shots" gross is rebuilt from
  the lines' `originalSubtotal` with `grossSubtotal()` (one helper for the shot
  list, checkout and the order page). A frame's price is its session plus its
  add-ons after offers. Zero-amount applied discounts are hidden (Shot on us can
  return 0 on a line with no shots). Crew-shoot copy keys on `isCrewShoot()`:
  `content` services except a `selfShoot` hire (the Studio Wall).
- **Offers**: per line the biggest non-combinable one wins (First glow 40% on a
  first order of classes; Early light 20% on classes starting Mon–Fri 6–8 AM;
  `GLOW15`). **Shot on us** is automatic and combinable: 30% off the shot add-ons
  only. An outranked code shows as "a better offer already applies"
  (`lib/discount-state.ts`).
- **Checkout** (`/checkout`, `components/checkout/release-form.tsx`): the shot
  list as a film strip on top; one release form with *The talent* and *The
  release* (questions; answers sent as `{questionId, question, answer}`) signed
  with one submit (`handleSign` in the checkout context: save-customer, then
  save-answers); then payment (Stripe, pay at the desk, or the no-payment path for
  the free First Glow Tour). Stripe's publishable key comes only from checkout
  start (`paymentData.publishableKey`).
  After start the context routes on the provider's `checkoutMode`: `internal`
  shows the card form, `redirect` follows `redirectUrl`, `manual` (desk, bank
  transfer, invoice) and `none` submit straight away. Checkout 409/402 codes
  (`CART_ALREADY_CHECKED_OUT`, `CART_EXPIRED`, `CHECKOUT_IN_PROGRESS`,
  `PAYMENT_NOT_AUTHORIZED`) are handled in `contexts/checkout-context.tsx`.
- **Waiting bookings** (`lib/booking-state.ts`): a booking waits only when it is
  `pending` with a `pendingReason`; pending without one (auto-confirm still
  running) is confirmed. Submit's `paymentInstructions` reach the call sheet via
  sessionStorage (`components/callsheet/payment-note.tsx`).
- **Thank-you** (`/thank-you`): the call sheet (`components/callsheet/*`) and a
  9:16 story card drawn on a canvas. Without a session it asks for a sign-in code.
- **Account** (`/account`): **Your roll** (`lib/roll.ts`): up next as call sheets,
  past sessions on a contact sheet with an honest delivery state (`editsState`:
  in the edit until the shot turnaround passes, then sent; a shoot always
  delivers). `/account/appointments/[id]` moves (same person and site,
  `ReschedulePicker`) or cancels; orders and settings.
- **Glow Pass** is a preview only ("Coming soon"): no sign-up form; the CTA is the
  free First Glow Tour.

### URLs
- Schedule: `lib/schedule-url.ts` `scheduleHref({ day, site, type, class, coach,
  occ })`; `s=<seriesSlug>@<startISO>` opens that row expanded; `light=golden`
  filters to golden-hour sessions.
- Booker pages: `/shoots|/coaching|/glow|/bar?service=<key>&who=<staff-slug>#book`.
- `/preview/call-sheet` and `/preview/roll` render fixtures (dev, or `AFTERGLOW_PREVIEW=1`).

### Times
Always Miami: everything renders in `siteConfig.timezone` with `lib/when.ts`
(12 h, `en-US`), on the server and in the browser.

### Auth
Passwordless only: `/login` (email → 6-digit code) and `/link/[token]` magic
links. The middleware refreshes tokens and protects `/account/*`.

### Gotchas
- The SDK runs with `throwOnError: true`; routes pass errors through `handleApiError`.
- Next 15 `params`/`searchParams` are Promises.
- Media lives in `public/images/*` and `public/videos/*` (paths in
  `siteConfig.media`, `sets`, `sites[*].images` and `stories`); `SafeImage` hides a
  missing file and the gradient placeholder shows. `images.unoptimized: true`.
- The story viewer and the hero set `muted` through a ref before `play()`, or
  autoplay is blocked.
- Quote bracketed paths in shell commands.

## Verifying changes

- `npm run typecheck`, `npm run lint` and `npm test` (vitest: timetable,
  sun, catalog, slots, roll, guards) must pass.
- `npm run build` must pass before release. Don't `next build` while a
  `next dev` runs in this folder (shared `.next`); build in a copy.
- Smoke test against a seeded `content_gym` store: the schedule shows today's
  sets with spots and some Full rows pointing to "next with space"; the rooftop
  sunset class has a golden-hour badge; a class with a Photo Set and a 60-min
  coaching session land on the shot list; the release form with pay-at-the-desk
  lands on the call sheet; Your roll shows the sessions and moves one.
