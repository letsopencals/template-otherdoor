# Otherdoor: Next.js Immersive Escape Rooms Template

A production-ready booking website for an escape-room company with several themed rooms. Built with **Next.js 15**, **Tailwind CSS v4** and the **Opencals Storefront SDK**.

**[View Live Demo →](https://template-otherdoor.vercel.app)**

"Pick a door. Leave the world behind." Otherdoor is a dark, modern, genre-neutral shell around six rooms that each look like a different film: a jungle temple in 1936, a gaslit Victorian study, a rogue-AI lab in 2071, a derelict space station in 2187, a Riviera heist and a family clockwork workshop. It runs in **Edinburgh** (GBP, `Europe/London`) at two venues, Otherdoor Vaults under the Old Town and Otherdoor Leith on the Shore. It has:

- **the Corridor**: six doors on the home page that open onto each room's video loop when you hover (tap on phones), with mood filters, live "Tonight" sessions, a "which door is yours?" picker, a flashlight room and a **keypad lock** that hides a discount code;
- a **room world** per room at `/rooms/<slug>` with its own design, built on cinematic video and stills (Kepler Station: a parallax starfield, a scroll-driven docking approach, airlock doors and HUD overlays);
- **team-size pricing**: rooms are booked by the whole team, with the group price and the price per head on every button;
- **Your doors** (the cart), a **one-page checkout**, **"The door unlocks"** confirmation and **"Doors opened"** in the account;
- lockpicking and cipher **workshops** priced per head.

MIT licensed: clone it, rebrand it, ship it.

---

## Get Started in 3 Steps

### 1. Create an Opencals account

Sign up at **[app.opencals.com](https://app.opencals.com)** and create a **Dev Store** in the **United Kingdom** (prices in GBP). When it asks for a dataset, choose **Otherdoor** (seed dataset `escape_rooms`). It seeds your store with:

- the two venues and six rooms, each one product with a variant per team size (`<room>-<n>p`) sharing a product pool, so any booking blocks the room;
- the schedules on each room's session grid (90-minute visits, 120 minutes for Kepler Station);
- two workshops (Lockpicking 101, Ciphers & Secret Inks) and six game masters with portraits;
- the extras (team portrait, escape on film, victory bottle, Lobby sharing board, costume rail, birthday ceremony);
- the checkout questions (team name, occasion, experience, anything we should know);
- the discounts (Matinee 15% Monday to Thursday before 15:00, and the code `OTHERDOOR`, once per email).

### 2. Get your API key

In the Opencals dashboard, go to **User Account Settings** and generate a **private storefront key** (`spk_`). The template calls the API from its server, so the key stays secret, and it forwards each visitor's IP so visitors get their own rate limits. A public key (`sfk_`) also works, but then all visitors share your server's limits.

### 3. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fletsopencals%2Ftemplate-otherdoor&env=OPENCALS_API_KEY,AUTH_SECRET&envDescription=API%20key%20from%20your%20Opencals%20dashboard%20and%20a%20random%20secret%20for%20auth&project-name=otherdoor&repository-name=template-otherdoor)

| Variable | Value |
|----------|-------|
| `OPENCALS_API_KEY` | Your private storefront key (starts with `spk_`) |
| `AUTH_SECRET` | Any random string, used for session encryption |
| `NEXT_PUBLIC_SITE_URL` | *(optional)* Your domain, for the sitemap, canonical URLs and Open Graph |

Card payments use the Stripe account connected to your store; the key comes from the checkout API, so there's no Stripe variable to set.

---

## What's Included

### The Corridor (home)
Six doors in a dark hall over a video of the corridor. Each door is a lacquered leaf with a frosted transom, its number and its year; hover or focus one and it swings open from the hinge onto that room's muted loop, its light spills across the floor and the whole site takes its colour. Mood filters (the past, the future, family, hardest, scariest) re-order the corridor. Then: Tonight (the next free sessions per room, live), how it works, "Which door is yours?", the flashlight room, the keypad lock, both venues, the game masters, the Hall of Fame (**sample records**, labelled as such), groups and the FAQ.

### Room worlds (`/rooms/<slug>`)
Every room has its own landing page with its own palette, display font, layout and motion, on top of a hero loop and world stills in `public/worlds/<slug>/`. Each has the story in scenes, the stats, interior photos, the game master, the booking panel and a teaser for the next door. **Kepler Station** is the reference world; the other five use the generic world until they are built. See `components/worlds/README.md` to build one.

### Booking
The booking panel is plain on purpose: the date strip sits right above the session times, team sizes show the group price and the price per head, extras are checkboxes, and the total with "Add to your doors" stays in view. `/book` lists every room's sessions for a day with a venue filter; `/workshops` books seats.

### Your doors, checkout, confirmation, account
- **Your doors**: the cart as slim door cards edged in each room's colour, with the hold countdown.
- **Checkout**: one page (your team, contact, payment), with Stripe, pay at the venue or bank transfer as the store allows.
- **The door unlocks**: the booking reference keys into a lock, the door opens onto the room, then the arrive-by time (15 minutes early), the venue and how to get there, what to wear, the phones-away note, calendar links and the next door.
- **Doors opened**: upcoming bookings (move or cancel up to 24 hours before), every room as a door (played ones open and lit with the date) and past visits.

### Passwordless accounts
Sign in with a 6-digit code by email or a magic link from the booking email. No passwords.

---

## The Escape-Room Model

| Concept | In the store |
|---|---|
| Room | A product group in the `rooms` collection; one variant per team size (`jaguar-temple-4p`, "4 players", the group price), `maxAttendees: 1`, no staff, all variants in one product pool |
| Visit length | The variant duration (briefing + game + debrief); sessions start on the `midnight + k × duration` grid |
| Workshop | A product in the `workshops` collection, staff-led, priced per head, seats = max attendees |
| Team name | A checkout question; it appears on the confirmation |
| Venue | A location (`otherdoor-vaults`, `otherdoor-leith`) |

Stats (difficulty, fear, escape rate, record), palettes and the world media aren't API fields: they live in `lib/site-config.ts`.

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v4 + CSS modules |
| Fonts | next/font: Funnel Display, Mona Sans, Spline Sans Mono (+ one per room world: Michroma for Kepler Station) |
| Motion | CSS, canvas and scroll-driven CSS variables; no motion library |
| Data | SWR (client) + React Server Components |
| Payments | Stripe Elements |
| Auth | NextAuth.js v5 |
| Tests | Vitest |
| API | Opencals Storefront SDK |

---

## Local Development

```bash
git clone https://github.com/letsopencals/template-otherdoor.git
cd template-otherdoor
npm install
cp .env.example .env.local   # set OPENCALS_API_KEY and AUTH_SECRET
npm run dev
```

Checks: `npm run typecheck`, `npm run lint` and `npm test` (the catalogue parser, the session grid, the corridor moods, bookings, the account history, cart maths and the API guards). `/preview/thank-you`, `/preview/account` and `/preview/cart` show the post-booking screens with sample data in development.

---

## Customization

- **`lib/site-config.ts`** holds everything the API has no field for: the name and copy, each room's stats, palette and door light, moods, venue copy, game-master titles, the Hall of Fame sample, the door picker, the keypad code and the media paths.
- **The store holds the bookable data**: rooms and team-size prices, workshops, game masters, venues, availability, extras, questions and discounts.
- **Theme**: tokens in `app/globals.css`; the design contract is **`DESIGN.md`**.
- **Imagery**: key art, interior photos, portraits and the logo come from your store. The home loop, corridor and lobby stills and each world's video and stills live in `public/` (see each folder's `MEDIA.md`). A missing file falls back to a gradient.

---

## Other templates

| Template | Industry | Demo |
|---|---|---|
| [HAAR](https://github.com/letsopencals/template-haar) | Hair salon | [template-haar.vercel.app](https://template-haar.vercel.app) |
| [Frisør](https://github.com/letsopencals/template-frisor) | Barbershop | [template-frisor-sage.vercel.app](https://template-frisor-sage.vercel.app) |
| [Clear Care](https://github.com/letsopencals/template-clarity) | Medical clinic | [template-clarity.vercel.app](https://template-clarity.vercel.app) |
| [VOLT](https://github.com/letsopencals/template-volt) | Padel & squash clubs | [template-volt.vercel.app](https://template-volt.vercel.app) |
| [NOIR Drive](https://github.com/letsopencals/template-noir) | Car rental | [template-noir.vercel.app](https://template-noir.vercel.app) |
| [Fluently](https://github.com/letsopencals/template-fluently) | Language school | [template-fluently.vercel.app](https://template-fluently.vercel.app) |
| [Bali Villa Rentals](https://github.com/letsopencals/template-bali-villas) | Villa rentals | [template-bali-villas.vercel.app](https://template-bali-villas.vercel.app) |
| [Tensile](https://github.com/letsopencals/template-reformer) | Reformer Pilates | [template-reformer.vercel.app](https://template-reformer.vercel.app) |
| [Alba Dental](https://github.com/letsopencals/template-alba) | Dental clinic | [template-alba.vercel.app](https://template-alba.vercel.app) |
| [Gable](https://github.com/letsopencals/template-gable) | Coworking | [template-gable.vercel.app](https://template-gable.vercel.app) |
| [Afterglow](https://github.com/letsopencals/template-afterglow) | Content gym | [template-afterglow.vercel.app](https://template-afterglow.vercel.app) |
| [METTLE](https://github.com/letsopencals/template-mettle) | Boutique gym | [template-mettle.vercel.app](https://template-mettle.vercel.app) |

---

## License

MIT
