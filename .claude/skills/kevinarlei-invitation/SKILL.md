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
  - `[web]` Vite on **http://localhost:2213** (invite) and **http://localhost:2213/admin** (admin); PM2 preview serves
    the admin on its own port 2214 (`ecosystem.config.cjs`)
  - `[api]` `tsx watch src/server/index.ts` on port **3002** (`RSVP_API_PORT`)
- Vite proxies `/api` and `/socket.io` (websocket) to the API, so the frontend always uses relative URLs.
- `npx tsc --noEmit` must pass before calling a change done.
- If `[api]` crashes with `EADDRINUSE :3002`, another node process still holds the port: find it with
  `netstat -ano | grep ":3002 "`, check its command line, stop it, then touch `src/server/index.ts` to restart.
- If Vite serves an empty module (e.g. "does not provide an export named …"), touch that file to refresh its cache.

## Flow

1. **Envelope** (`EnvelopeHero.tsx`) — every visit starts here. Old `#details`-style links are read once on load and
   opened right after the envelope.
2. **Phone** (`< 1024px`): ONE long scroll page, `MobileSite.tsx` (no prev/next). Order: photo hero (names in calligraphy) → save-the-date
   (forest, giant `02 02 27` numerals) → invitation (K|A oval monogram, names, date, venues, officiant) →
   oval-photo countdown → Venues cards + "The Route" map → order of the day (wedding timeline) → Attire guide → Entourage (forest,
   two columns, italic intro line per group) → FAQs → RSVP (candlelit backdrop) → "Always & Forever" footer.
   Big titles use **Italiana** (`font-['Italiana']`); labels are Cormorant caps. Links like `#rsvp` / `?view=rsvp`
   scroll to `m-<section>`.
3. **Desktop** (`>= 1024px`): one long website, `DesktopSite.tsx` (nav: Details, Entourage | K&A | Timeline, RSVP).
- URLs stay clean (no `#`): the current view lives in `history.state` (`goTo()` in `App.tsx`), so Back/Forward work.
- `?view=rsvp` is the principal-sponsor link: skips the envelope and submits with `source = 'qr'`.

## Where things live

| What | File |
|---|---|
| Names, date, venues, timeline, entourage, FAQs | `src/data/weddingData.ts` |
| View switching, envelope → hero → menu | `src/App.tsx` |
| Phone one-page site | `src/components/MobileSite.tsx` |
| Shared `RsvpForm`, `FaqAccordion`, `TimelineIcon`, `DRESS_CODE` | `src/components/SubPages.tsx` |
| Desktop website, `Sprig` ornament | `src/components/DesktopSite.tsx` |
| RSVP admin | `src/AdminApp.tsx` (`admin.html`, served at `/admin`) |
| RSVP API | `src/server/index.ts`, DB pool in `src/server/db.ts` |
| Schema | `database/rsvp_schema.sql` |

The old prev/next story pages and menu hubs (StorySlide, MobileHero, PhotoPage, DetailsPage, InvitationMenuHub,
WeddingDetailsHub, EditDetailsModal, …) were deleted on 2026-11-09; every remaining component is in use.
`GalleryPages.tsx` now only holds the desktop `DesktopPhotoBand` and `ThanksPage`.

## Design rules

- **Phone page (`MobileSite`) is white + green only**: white `#FFFFFF` backgrounds, Forest/Emerald text and accents, Sage for accents on forest. No ivory or gold there (attire swatches are content and stay brown/champagne).
- Colors: Ivory `#F2EBDD`, Sage `#78947F`, Emerald `#185844`, Forest `#102F27`, Antique Gold `#B08A4F`
  (light gold accent `#E6D3AE`). Don't introduce other palettes.
- Fonts (loaded in `index.html`): **The Nautigal** (`font-names`) for the couple names; **Parisienne** for hero taglines; the K&A monogram is Cormorant (serif) with a small script `&`;
  **Oswald** light uppercase with wide tracking for section titles; `font-script` (Alex Brush) for small script
  eyebrows; Cormorant Garamond (`font-serif`) for names/body headings.
- Section headings on desktop: gold script eyebrow + Oswald title + `Sprig`. Diagonal cuts (`Diagonal`) must use the
  neighbouring section's color as `fill`.
- All visible text is **English**. The couple is **Kevin & Arlei**.
- Keep it simple; the user removes decorations that feel busy. Check both phone (390px) and desktop (1440px).

## RSVP data

- Database `rsvp` (`DB_NAME` in `.env`), table `rsvps`. The separate `wedding-invitation` project also uses `rsvp`,
  so don't run both against the same MySQL. Never drop, rename or rewrite existing columns/rows; only add.
- Columns: `id, name, contact, isAttending ('yes'|'no'), timestamp, source ('web'|'qr'), brings_guest, guest_names (JSON array), active (1 = active, 0 = soft deleted)`.
- **Soft delete only**: `DELETE /api/rsvps/:id` sets `active = 0`; `GET /api/rsvps` returns `active = 1`;
  `GET /api/rsvps/archived` + `PATCH /api/rsvps/:id/restore` power the admin Archive.
- No plus-ones: the RSVP form and admin don't ask for or show guests. `brings_guest` / `guest_names` stay in the table
  (null for new RSVPs); the server still validates them only if a client sends `bringsGuest`.
- Socket.IO events from the server: `rsvp:new`, `rsvp:deleted`, `rsvp:restored`. Emit one whenever the API changes rows.

## Testing changes

- Screenshot with headless Edge via `puppeteer-core` (Edge path `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`);
  tap the envelope first (look for the text `TAP TO OPEN`).
- Any test RSVP must be named `TEST …` and deleted afterwards:
  `DELETE FROM rsvp.rsvps WHERE name LIKE 'TEST %';` (via `C:/xampp/mysql/bin/mysql.exe -u root`).
- Stop any test server you start (by PID) so it never holds port 3002.

## Not done yet

- `/admin` has **no login** — anyone with the link sees names and contact numbers. Add auth before going live.
- Content in `weddingData.ts` follows the couple's official details doc (Feb 2 2027, San Vicente de Zaragoza Chapel → Nuan Hall). Guest attire = shades of brown/champagne (`DRESS_CODE`), strictly no plus-ones, adults only.
