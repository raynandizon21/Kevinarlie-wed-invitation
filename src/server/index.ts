// src/server/index.ts — RSVP API (ported from the wedding-invitation project)
import { createServer } from 'http';
import express from 'express';
import { Server } from 'socket.io';
import pool from './db';

const app = express();
const httpServer = createServer(app);
// Realtime channel for the admin panel: every saved RSVP is pushed as an `rsvp:new` event
const io = new Server(httpServer, { path: '/socket.io' });
io.on('connection', (socket) => {
  console.log(`Admin connected (${socket.id})`);
});
// 3001 is used by the wedding-invitation backend, so this one defaults to 3002
const port = parseInt(process.env.RSVP_API_PORT || '3002', 10);

app.use(express.json());

// Endpoint to get all RSVPs
app.get('/api/rsvps', async (_req, res) => {
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
// One person per guest name (keep in sync with MULTI_NAME in SubPages.tsx)
const MULTI_NAME = /[\/&+]|\band\b|,(?!\s*(?:jr|sr|ii|iii|iv)\.?\s*$)/i;

// Endpoint to add a new RSVP
app.post('/api/rsvps', async (req, res) => {
  const { name, contact, isAttending, source, bringsGuest, guestNames } = req.body ?? {};

  if (!name || (isAttending !== 'yes' && isAttending !== 'no')) {
    return res.status(400).json({ error: 'Missing required fields: name and isAttending are required.' });
  }

  const sourceValue = source === 'qr' ? 'qr' : 'web';

  let brings_guest: string | null = null;
  let guest_names: string | null = null;

  // Anyone attending may bring guests (1..MAX_GUEST_NAMES, each with a full name)
  if (isAttending === 'yes' && (bringsGuest !== undefined || sourceValue === 'qr')) {
    if (bringsGuest !== 'yes' && bringsGuest !== 'no') {
      return res.status(400).json({ error: 'Please choose Yes or No for bringing guests.' });
    }
    brings_guest = bringsGuest;
    if (bringsGuest === 'yes') {
      const raw = Array.isArray(guestNames) ? guestNames : [];
      const cleaned = raw
        .map((s: unknown) => String(s).trim())
        .filter(Boolean)
        .slice(0, MAX_GUEST_NAMES)
        .map((s) => s.slice(0, MAX_GUEST_NAME_LEN));
      if (cleaned.length === 0) {
        return res.status(400).json({ error: "Please enter your guests' full names." });
      }
      if (cleaned.some((n) => MULTI_NAME.test(n))) {
        return res.status(400).json({ error: 'Please enter one person per guest name.' });
      }
      guest_names = JSON.stringify(cleaned);
    }
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

// Soft delete: keep the row, just mark it inactive (active = 0)
app.delete('/api/rsvps/:id', async (req, res) => {
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
app.get('/api/rsvps/archived', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM rsvps WHERE active = 0 ORDER BY timestamp DESC');
    res.json(rows);
  } catch (error) {
    console.error('Failed to fetch archived RSVPs:', error);
    res.status(500).json({ error: 'Failed to retrieve archived RSVPs.' });
  }
});

// Recover an archived RSVP (active = 1) and push it back to every open admin
app.patch('/api/rsvps/:id/restore', async (req, res) => {
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

httpServer.listen(port, () => {
  console.log(`RSVP API is running on http://localhost:${port}`);
});
