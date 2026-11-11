// src/server/auth.ts — admin login backed by MySQL (tables: admins, admin_sessions)
import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import pool from './db';

export const SESSION_COOKIE = 'ka_admin';
const SESSION_DAYS = 7;
const SESSION_MS = SESSION_DAYS * 24 * 60 * 60 * 1000;
// ---- Password hashing (scrypt, stored as "scrypt$N$r$p$salt$hash") ----
const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };

function scrypt(password: string, salt: Buffer, keylen: number, opts: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scryptCb(password, salt, keylen, { ...opts, maxmem: 64 * 1024 * 1024 }, (err, key) => (err ? reject(err) : resolve(key)))
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const { N, r, p, keylen } = SCRYPT;
  const key = await scrypt(password, salt, keylen, { N, r, p });
  return ['scrypt', N, r, p, salt.toString('base64'), key.toString('base64')].join('$');
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, N, r, p, salt, hash] = stored.split('$');
  if (algo !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64');
  const key = await scrypt(password, Buffer.from(salt, 'base64'), expected.length, { N: +N, r: +r, p: +p });
  return key.length === expected.length && timingSafeEqual(key, expected);
}

// Compared against when the username doesn't exist, so a wrong username takes as long as a wrong password
let dummyHash: Promise<string> | null = null;
const getDummyHash = () => (dummyHash ??= hashPassword(randomBytes(16).toString('hex')));

// ---- Sessions ----
const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

export interface AdminUser {
  id: number;
  username: string;
}

function readCookie(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return undefined;
}

/** The signed-in admin for this Cookie header, or null. */
export async function adminFromCookie(cookieHeader: string | undefined): Promise<AdminUser | null> {
  const token = readCookie(cookieHeader, SESSION_COOKIE);
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const [rows] = await pool.query(
    `SELECT a.id, a.username FROM admin_sessions s JOIN admins a ON a.id = s.admin_id
     WHERE s.token_hash = ? AND s.expires_at > NOW() AND a.active = 1 LIMIT 1`,
    [sha256(token)]
  );
  return ((rows as AdminUser[])[0]) ?? null;
}

const cookieOptions = (req: Request) => ({ httpOnly: true, sameSite: 'strict' as const, secure: req.secure, path: '/' });

// ---- Login / logout ----
export type LoginResult = { ok: true } | { ok: false; status: number; error: string };

export async function login(req: Request, res: Response, username: unknown, password: unknown): Promise<LoginResult> {
  // No lockout and no attempt log (by request)
  const ip = (req.ip || 'unknown').slice(0, 64);
  const user = String(username ?? '').trim().slice(0, 60);
  const pass = String(password ?? '');

  const [rows] = await pool.query('SELECT id, username, password_hash FROM admins WHERE username = ? AND active = 1 LIMIT 1', [user]);
  const admin = (rows as (AdminUser & { password_hash: string })[])[0];
  const valid = admin ? await verifyPassword(pass, admin.password_hash) : (await verifyPassword(pass, await getDummyHash()), false);

  if (!valid || !admin) return { ok: false, status: 401, error: 'Incorrect username or password.' };

  const token = randomBytes(32).toString('base64url');
  await pool.query(
    'INSERT INTO admin_sessions (admin_id, token_hash, expires_at, ip, user_agent) VALUES (?, ?, ?, ?, ?)',
    [admin.id, sha256(token), new Date(Date.now() + SESSION_MS), ip, String(req.headers['user-agent'] ?? '').slice(0, 255) || null]
  );
  await pool.query('UPDATE admins SET last_login_at = NOW() WHERE id = ?', [admin.id]);
  res.cookie(SESSION_COOKIE, token, { ...cookieOptions(req), maxAge: SESSION_MS });
  return { ok: true };
}

export async function logout(req: Request, res: Response) {
  const token = readCookie(req.headers.cookie, SESSION_COOKIE);
  if (token) await pool.query('DELETE FROM admin_sessions WHERE token_hash = ?', [sha256(token)]);
  res.clearCookie(SESSION_COOKIE, cookieOptions(req));
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    if (await adminFromCookie(req.headers.cookie)) return next();
    res.status(401).json({ error: 'Please sign in.' });
  } catch (error) {
    console.error('Admin session check failed:', error);
    res.status(500).json({ error: 'Could not check your session.' });
  }
}

/** Drop expired sessions (runs at start-up and hourly). */
export async function cleanupAuthTables() {
  try {
    await pool.query('DELETE FROM admin_sessions WHERE expires_at <= NOW()');
  } catch (error) {
    console.error('Admin auth cleanup failed:', error);
  }
}
