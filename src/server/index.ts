// src/server/index.ts — RSVP API (ported from the wedding-invitation project)
import { createServer } from 'http';
import express from 'express';
import { Server } from 'socket.io';
import pool from './db';
import { adminFromCookie, cleanupAuthTables, login, logout, requireAdmin } from './auth';

const app = express();
const httpServer = createServer(app);
// Realtime channel for the admin panel: every saved RSVP is pushed as an `rsvp:new` event
const io = new Server(httpServer, { path: '/socket.io' });
// Only a signed-in admin may open the realtime channel (it carries names and contact numbers)
io.use((socket, next) => {
  adminFromCookie(socket.handshake.headers.cookie)
    .then((admin) => next(admin ? undefined : new Error('unauthorized')))
    .catch(() => next(new Error('unauthorized')));
});
io.on('connection', (socket) => {
  console.log(`Admin connected (${socket.id})`);
});
// 3001 is used by the wedding-invitation backend, so this one defaults to 3002
const port = parseInt(process.env.RSVP_API_PORT || '3002', 10);

app.use(express.json());
// nginx runs on the same machine: trust its X-Forwarded-For / X-Forwarded-Proto (client IP, https)
app.set('trust proxy', 'loopback');

// ---- Admin login (accounts in the `admins` table; add one with `npm run admin:set -- <username>`) ----
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body ?? {};
    const result = await login(req, res, username, password);
    if (!result.ok) return res.status(result.status).json({ error: result.error });
    res.json({ ok: true });
  } catch (error) {
    console.error('Admin login failed:', error);
    res.status(500).json({ error: 'Could not sign in. Please try again.' });
  }
});

app.post('/api/admin/logout', async (req, res) => {
  try {
    await logout(req, res);
    res.json({ ok: true });
  } catch (error) {
    console.error('Admin logout failed:', error);
    res.status(500).json({ error: 'Could not sign out.' });
  }
});

app.get('/api/admin/session', async (req, res) => {
  try {
    const admin = await adminFromCookie(req.headers.cookie);
    res.json({ signedIn: Boolean(admin), username: admin?.username ?? null });
  } catch {
    res.json({ signedIn: false, username: null });
  }
});

cleanupAuthTables();
setInterval(cleanupAuthTables, 60 * 60 * 1000).unref();

// Endpoint to get all RSVPs
app.get('/api/rsvps', requireAdmin, async (_req, res) => {
  try {
    // Soft-deleted rows (active = 0) stay in the table but are hidden
    const [rows] = await pool.query('SELECT * FROM rsvps WHERE active = 1 ORDER BY timestamp DESC');
    res.json(rows);
  } catch (error) {
    console.error('Failed to fetch RSVPs:', error);
    res.status(500).json({ error: 'Failed to retrieve data from the database.' });
  }
});

// Guests a single RSVP may bring (keep in sync with MAX_GUESTS in SubPages.tsx)
const MAX_GUEST_NAMES = 10;
const MAX_GUEST_NAME_LEN = 120;
// One person per guest name (the site has no plus-ones now; only used if a client still sends bringsGuest)
const MULTI_NAME = /[\/&+]|\band\b|,(?!\s*(?:jr|sr|ii|iii|iv)\.?\s*$)/i;

type GuestFields = { brings_guest: string | null; guest_names: string | null } | { error: string };

// Validate the plus-one answer: anyone attending may bring 1..MAX_GUEST_NAMES guests, each with a full name
function readGuests(bringsGuest: unknown, guestNames: unknown): GuestFields {
  if (bringsGuest !== 'yes' && bringsGuest !== 'no') {
    return { error: 'Please choose Yes or No for bringing guests.' };
  }
  if (bringsGuest === 'no') return { brings_guest: 'no', guest_names: null };
  const raw = Array.isArray(guestNames) ? guestNames : [];
  const cleaned = raw
    .map((s: unknown) => String(s).trim())
    .filter(Boolean)
    .slice(0, MAX_GUEST_NAMES)
    .map((s) => s.slice(0, MAX_GUEST_NAME_LEN));
  if (cleaned.length === 0) {
    return { error: "Please enter your guests' full names." };
  }
  if (cleaned.some((n) => MULTI_NAME.test(n))) {
    return { error: 'Please enter one person per guest name.' };
  }
  return { brings_guest: 'yes', guest_names: JSON.stringify(cleaned) };
}

// Endpoint to add a new RSVP
app.post('/api/rsvps', async (req, res) => {
  const { name, contact, isAttending, source, bringsGuest, guestNames } = req.body ?? {};

  if (!name || (isAttending !== 'yes' && isAttending !== 'no')) {
    return res.status(400).json({ error: 'Missing required fields: name and isAttending are required.' });
  }

  const sourceValue = source === 'qr' ? 'qr' : 'web';

  let brings_guest: string | null = null;
  let guest_names: string | null = null;

  if (isAttending === 'yes' && bringsGuest !== undefined) {
    const guests = readGuests(bringsGuest, guestNames);
    if ('error' in guests) return res.status(400).json({ error: guests.error });
    ({ brings_guest, guest_names } = guests);
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO rsvps (name, contact, isAttending, source, brings_guest, guest_names) VALUES (?, ?, ?, ?, ?, ?)',
      [String(name).trim(), contact || null, isAttending, sourceValue, brings_guest, guest_names]
    );
    const insertResult = result as { insertId: number };
    const [rows] = await pool.query('SELECT * FROM rsvps WHERE id = ?', [insertResult.insertId]);
    const saved = (rows as unknown[])[0];
    io.emit('rsvp:new', saved);
    res.status(201).json(saved);
  } catch (error) {
    console.error('Failed to insert RSVP:', error);
    res.status(500).json({ error: 'Failed to save data to the database.' });
  }
});

// Admin edit of an active RSVP; pushes the updated row to every open admin
app.patch('/api/rsvps/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid RSVP id.' });
  }
  const { name, contact, isAttending, bringsGuest, guestNames } = req.body ?? {};
  const cleanName = String(name ?? '').trim();
  if (!cleanName || (isAttending !== 'yes' && isAttending !== 'no')) {
    return res.status(400).json({ error: 'Name and attendance are required.' });
  }

  let brings_guest: string | null = null;
  let guest_names: string | null = null;
  if (isAttending === 'yes' && bringsGuest !== undefined) {
    const guests = readGuests(bringsGuest, guestNames);
    if ('error' in guests) return res.status(400).json({ error: guests.error });
    ({ brings_guest, guest_names } = guests);
  }

  try {
    const [result] = await pool.query(
      'UPDATE rsvps SET name = ?, contact = ?, isAttending = ?, brings_guest = ?, guest_names = ? WHERE id = ? AND active = 1',
      [cleanName, String(contact ?? '').trim() || null, isAttending, brings_guest, guest_names, id]
    );
    if ((result as { affectedRows: number }).affectedRows === 0) {
      return res.status(404).json({ error: 'RSVP not found.' });
    }
    const [rows] = await pool.query('SELECT * FROM rsvps WHERE id = ?', [id]);
    const updated = (rows as unknown[])[0];
    io.emit('rsvp:updated', updated);
    res.json(updated);
  } catch (error) {
    console.error('Failed to update RSVP:', error);
    res.status(500).json({ error: 'Failed to update the RSVP.' });
  }
});

// Soft delete: keep the row, just mark it inactive (active = 0)
app.delete('/api/rsvps/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid RSVP id.' });
  }
  try {
    const [result] = await pool.query('UPDATE rsvps SET active = 0 WHERE id = ? AND active = 1', [id]);
    if ((result as { affectedRows: number }).affectedRows === 0) {
      return res.status(404).json({ error: 'RSVP not found.' });
    }
    io.emit('rsvp:deleted', { id });
    res.json({ id, active: 0 });
  } catch (error) {
    console.error('Failed to delete RSVP:', error);
    res.status(500).json({ error: 'Failed to delete the RSVP.' });
  }
});

// Archive: soft-deleted RSVPs (active = 0), newest first
app.get('/api/rsvps/archived', requireAdmin, async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM rsvps WHERE active = 0 ORDER BY timestamp DESC');
    res.json(rows);
  } catch (error) {
    console.error('Failed to fetch archived RSVPs:', error);
    res.status(500).json({ error: 'Failed to retrieve archived RSVPs.' });
  }
});

// Recover an archived RSVP (active = 1) and push it back to every open admin
app.patch('/api/rsvps/:id/restore', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid RSVP id.' });
  }
  try {
    const [result] = await pool.query('UPDATE rsvps SET active = 1 WHERE id = ? AND active = 0', [id]);
    if ((result as { affectedRows: number }).affectedRows === 0) {
      return res.status(404).json({ error: 'Archived RSVP not found.' });
    }
    const [rows] = await pool.query('SELECT * FROM rsvps WHERE id = ?', [id]);
    const restored = (rows as unknown[])[0];
    io.emit('rsvp:restored', restored);
    res.json(restored);
  } catch (error) {
    console.error('Failed to restore RSVP:', error);
    res.status(500).json({ error: 'Failed to restore the RSVP.' });
  }
});

// Production sets RSVP_API_HOST=127.0.0.1 so the API is only reachable through nginx (the domain).
const host = process.env.RSVP_API_HOST;
const onListen = () => console.log(`RSVP API is running on http://${host || 'localhost'}:${port}`);
if (host) httpServer.listen(port, host, onListen);
else httpServer.listen(port, onListen);
