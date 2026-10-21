---
name: kevinarlei-invitation
description: How the Kevin & Arlei wedding invitation is built and how to change it safely. Use when editing any page, card, color, font, the RSVP form, the admin panel, the RSVP server/database, or when running, testing or deploying this project.
---

# Kevin & Arlei wedding invitation

React 19 + Vite + Tailwind v4 + `motion`, with an Express + Socket.IO RSVP API on MySQL.
The person working on this writes in Taglish; reply the same way.

## Run

- MySQL (XAMPP) must be running on `localhost:3306`.
- `npm run dev` starts both processes:
  - `[web]` Vite on **http://localhost:3213** (invite) and **http://localhost:3213/admin** (admin)
  - `[api]` `tsx watch src/server/index.ts` on port **3002** (`RSVP_API_PORT`)
- Vite proxies `/api` and `/socket.io` (websocket) to the API, so the frontend always uses relative URLs.
- `npx tsc --noEmit` must pass before calling a change done.
- If `[api]` crashes with `EADDRINUSE :3002`, another node process still holds the port: find it with
  `netstat -ano | grep ":3002 "`, check its command line, stop it, then touch `src/server/index.ts` to restart.
- If Vite serves an empty module (e.g. "does not provide an export named …"), touch that file to refresh its cache.

## Flow

1. **Envelope** (`EnvelopeHero.tsx`) — every visit starts here. Old `#details`-style links are read once on load and
   opened right after the envelope.
2. **Phone** (`< 1024px`): a full-screen **story** in `App.tsx`: MobileHero → Details → Timeline → Entourage → FAQs → RSVP
   (order in `STORY`). Each page is a `StorySlide` (`StorySlide.tsx`) with its own scroll; swipe up at the bottom or tap
   "Next ·" (or swipe left/right) to move. No cards menu anymore.
   Each step has its own transition (`STORY_KIND` in `App.tsx`, variants in `StorySlide.tsx`: rise, push, zoom,
   circle, wipe) and each page its own look: Details = ivory, each venue a tilted polaroid beside its details (sides alternate), small dress-code section, Timeline = ivory,
   Entourage = forest page, FAQs = text-only header + numbered questions, RSVP = candlelit photo backdrop. Keep them different from each other.
3. **Desktop** (`>= 1024px`): one long website, `DesktopSite.tsx` (nav: Details, Entourage | K&A | Timeline, RSVP).
- URLs stay clean (no `#`): the current view lives in `history.state` (`goTo()` in `App.tsx`), so Back/Forward work.
- `?view=rsvp` is the principal-sponsor link: skips the envelope and submits with `source = 'qr'`.

## Where things live

| What | File |
|---|---|
| Names, date, venues, timeline, entourage, FAQs | `src/data/weddingData.ts` |
| View switching, envelope → hero → menu | `src/App.tsx` |
| Mobile pages, shared `RsvpForm`, `FaqList`, `DRESS_CODE` | `src/components/SubPages.tsx` |
| Desktop website, `Sprig` ornament | `src/components/DesktopSite.tsx` |
| RSVP admin | `src/AdminApp.tsx` (`admin.html`, served at `/admin`) |
| RSVP API | `src/server/index.ts`, DB pool in `src/server/db.ts` |
| Schema | `database/rsvp_schema.sql` |

`InvitationMenuHub`, `CardsHub`, `WeddingDetailsHub`, `RsvpSection`, `EventTimeline`, `FaqSection`, `ColorPaletteSection`, `VenuesSection`,
`EntourageSection`, `WeddingCountdown`, `DetailsHero`, `TopNavigation` are **unused leftovers** — don't edit them
expecting a visible change.

## Design rules

- Colors: Ivory `#F2EBDD`, Sage `#78947F`, Emerald `#185844`, Forest `#102F27`, Antique Gold `#B08A4F`
  (light gold accent `#E6D3AE`). Don't introduce other palettes.
- Fonts (loaded in `index.html`): **Parisienne** for the couple names, hero taglines and the K&A monogram;
  **Oswald** light uppercase with wide tracking for section titles; `font-script` (Alex Brush) for small script
  eyebrows; Cormorant Garamond (`font-serif`) for names/body headings.
- Section headings on desktop: gold script eyebrow + Oswald title + `Sprig`. Diagonal cuts (`Diagonal`) must use the
  neighbouring section's color as `fill`.
- All visible text is **English**. The couple is **Kevin & Arlei**.
- Keep it simple; the user removes decorations that feel busy. Check both phone (390px) and desktop (1440px).

## RSVP data

- Database `rsvp`, table `rsvps` — **shared with the separate `wedding-invitation` project** (Reb & Arielle).
  Never drop, rename or rewrite existing columns/rows; only add.
- Columns: `id, name, contact, isAttending ('yes'|'no'), timestamp, source ('web'|'qr'), brings_guest, guest_names (JSON array), active (1 = active, 0 = soft deleted)`.
- **Soft delete only**: `DELETE /api/rsvps/:id` sets `active = 0`; `GET /api/rsvps` returns `active = 1`;
  `GET /api/rsvps/archived` + `PATCH /api/rsvps/:id/restore` power the admin Archive.
- Plus-ones: anyone attending can add 1–10 guests, one person per field. `MULTI_NAME` (kept identical in
  `SubPages.tsx` and `server/index.ts`) rejects `/ & + , and` but allows `, Jr.` / `, III`.
  The admin also splits old combined names for display only — don't "fix" them in the DB.
- Socket.IO events from the server: `rsvp:new`, `rsvp:deleted`, `rsvp:restored`. Emit one whenever the API changes rows.

## Testing changes

- Screenshot with headless Edge via `puppeteer-core` (Edge path `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`);
  tap the envelope first (look for the text `TAP TO OPEN`).
- Any test RSVP must be named `TEST …` and deleted afterwards:
  `DELETE FROM rsvp.rsvps WHERE name LIKE 'TEST %';` (via `C:/xampp/mysql/bin/mysql.exe -u root`).
- Stop any test server you start (by PID) so it never holds port 3002.

## Not done yet

- `/admin` has **no login** — anyone with the link sees names and contact numbers. Add auth before going live.
- Wedding date/venue/entourage in `weddingData.ts` are still sample data (Dec 14, 2025, Jardin de Josefina).
