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
   oval-photo countdown → Entourage (forest, two columns, italic intro line per group) → Venues cards ("The Ceremony"
   first) + "The Route" map → order of the day (wedding timeline) → Attire guide → FAQs → RSVP (candlelit backdrop) → "Always & Forever" footer.
   Big titles use **Italiana** (`font-['Italiana']`); labels are Cormorant caps. Links like `#rsvp` / `?view=rsvp`
   scroll to `m-<section>`.
3. **Desktop** (`>= 1024px`): one long website, `DesktopSite.tsx` (nav: Details, Entourage | K&A | Timeline, RSVP).
   Section order matches the phone: countdown → Entourage → Details (ceremony/reception) → Dress code → Timeline → …
- URLs stay clean (no `#`): the current view lives in `history.state` (`goTo()` in `App.tsx`), so Back/Forward work.
- After an RSVP is sent: phone shows "Returning to the top in 5…" inside the form, desktop shows `ThanksPage` with the
  same 5-second countdown (`RETURN_SECONDS` in SubPages.tsx); both only scroll to the top, so the music keeps playing.
  Both pages re-render every second (wedding countdown): keep callbacks in refs, or timers restart forever.
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
| Admin Entourage panel (RSVP status per entourage name) | `src/AdminEntourage.tsx`, matcher `src/data/entourageMatch.ts` |
| RSVP API | `src/server/index.ts`, DB pool in `src/server/db.ts` |
| Schema | `database/rsvp_schema.sql` |
| Home-screen icons / favicons / manifests (invite: forest K&A "KevinandArlei"; admin: emerald K&A ADMIN "Admin KA") | `public/` + `<head>` of `index.html` / `admin.html` |

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
- Tables: `rsvps` plus the admin login tables (see Production).
- Columns: `id, name, contact, isAttending ('yes'|'no'), timestamp, source ('web'|'qr'), brings_guest, guest_names (JSON array), active (1 = active, 0 = soft deleted)`.
- **Soft delete only**: `DELETE /api/rsvps/:id` sets `active = 0`; `GET /api/rsvps` returns `active = 1`;
  `GET /api/rsvps/archived` + `PATCH /api/rsvps/:id/restore` power the admin Archive.
- No plus-ones: the RSVP form and admin don't ask for or show guests. `brings_guest` / `guest_names` stay in the table
  (null for new RSVPs); the server still validates them only if a client sends `bringsGuest`.
- Admin **Entourage** panel matches `ENTOURAGE_DATA` names to RSVPs client-side (`matchEntourage`): titles
  (Mr./Mrs./Hon./LTC./Dra.…), case, dots and accents are ignored; first name + surname must both appear (middle names
  optional, Jr./III must not conflict); couples "A & B" are split into two people; the latest matching RSVP wins.
  Nicknames ("Jheng" for Jhennifer) or a missing surname won't match. Changing a name in weddingData.ts is enough.
- Partners: `paired: true` on a category (Principal Sponsors, Groomsmen & Bridesmaids) pairs members 1+2, 3+4, … in list
  order, and "A & B" entries are pairs too. **Keep partners next to each other** when editing those lists. The panel's
  "Partner missing" filter = pairs where only one has answered, or an odd one out with no partner.
- Socket.IO events from the server: `rsvp:new`, `rsvp:deleted`, `rsvp:restored`. Emit one whenever the API changes rows.

## Testing changes

- Screenshot with headless Edge via `puppeteer-core` (Edge path `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`);
  tap the envelope first (look for the text `TAP TO OPEN`).
- Any test RSVP must be named `TEST …` and deleted afterwards:
  `DELETE FROM rsvp.rsvps WHERE name LIKE 'TEST %';` (via `C:/xampp/mysql/bin/mysql.exe -u root`).
- Stop any test server you start (by PID) so it never holds port 3002.

## Not done yet

- Content in `weddingData.ts` follows the couple's official details doc (Feb 2 2027, San Vicente de Zaragoza Chapel → Nuan Hall). Guest attire = shades of brown/champagne (`DRESS_CODE`), strictly no plus-ones, adults only.

## Production

- Live at **https://kevinandarlei.com** (+ `www`), nginx site `/etc/nginx/sites-available/kevinandarlei.com`,
  Let's Encrypt cert via certbot (auto-renews). `/` → vite preview :2213, `/api` + `/socket.io` → API :3002.
- Admin panel: **https://admin.kevinandarlei.com** (+ `www.admin`), nginx site `admin.kevinandarlei.com` →
  vite preview :2214 (`ADMIN_ONLY`), with its own `/api` + `/socket.io` → :3002. `kevinandarlei.com/admin` 301s there.
- **Admin login** is in the app: `LoginPage` in `AdminApp.tsx` (one screen, no scroll on any device; "Admin Portal / Kevin and Arlei" title, no monogram) →
  `POST /api/admin/login` (`src/server/auth.ts`). Accounts live in MySQL, no passwords in `.env`:
  `admins` (scrypt hash), `admin_sessions` (cookie `ka_admin` holds a random token, the table only its SHA-256; 7 days),
no lockout and no attempt log (the user asked for both). Manage with `npm run admin:set -- <username>`
  (add / change password, which signs that admin out everywhere; `--disable` / `--enable`) and `npm run admin:list`.
  `requireAdmin` guards every `/api/rsvps` route except the guests' `POST`, and `io.use` refuses sockets without a
  session. Admin fetches go through `adminFetch`, so a 401 drops back to the login page. Any new admin route needs
  `requireAdmin`. The main domain 404s `/api/admin/` and `/socket.io/`.
- **Domain only**: preview ports 2213/2214 and the API (`RSVP_API_HOST=127.0.0.1` in `ecosystem.config.cjs`) bind to
  `127.0.0.1`, and both nginx 443 blocks `return 444` for any Host that isn't their domain (they're nginx's 443
  fallback, so `https://<IP>` would otherwise show the admin). Local dev leaves `RSVP_API_HOST` unset.
- Deploy: `npm run build`, then `pm2 restart KA-invitation-web KA-invitation-admin KA-invitation-api`.
