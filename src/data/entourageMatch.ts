// src/data/entourageMatch.ts — match the static entourage list (weddingData.ts) against RSVPs in the database.
// Used by the admin "Entourage" panel: who in the entourage has answered, and how.
import type { EntourageCategory } from '../types/wedding';

export type EntourageStatus = 'yes' | 'no' | 'pending';

export interface RsvpLike {
  id: number;
  name: string;
  isAttending: 'yes' | 'no';
  timestamp: string;
}

export interface EntouragePerson<R extends RsvpLike = RsvpLike> {
  /** Name as written in weddingData.ts (one person; couples "A & B" are split) */
  name: string;
  role: string;
  category: string;
  status: EntourageStatus;
  /** Latest RSVP that matched this person */
  rsvp?: R;
  /** Same value for two partners; null = not a paired role (bearers, flower girls, best man…) */
  pairKey: string | null;
}

/** One card in the admin: two partners, or one person (with `unpaired` when a paired list has an odd one out). */
export interface EntourageGroup<R extends RsvpLike = RsvpLike> {
  key: string;
  category: string;
  people: EntouragePerson<R>[];
  /** In a paired list but has no partner listed */
  unpaired: boolean;
}

/** Group people as they're shown: partners together, everyone else alone. */
export function groupEntourage<R extends RsvpLike>(people: EntouragePerson<R>[]): EntourageGroup<R>[] {
  const groups: EntourageGroup<R>[] = [];
  const byKey = new Map<string, EntourageGroup<R>>();
  people.forEach((p, i) => {
    if (!p.pairKey) {
      groups.push({ key: `${p.category}|solo|${i}`, category: p.category, people: [p], unpaired: false });
      return;
    }
    const g = byKey.get(p.pairKey);
    if (g) g.people.push(p);
    else {
      const ng: EntourageGroup<R> = { key: p.pairKey, category: p.category, people: [p], unpaired: false };
      byKey.set(p.pairKey, ng);
      groups.push(ng);
    }
  });
  for (const g of byKey.values()) g.unpaired = g.people.length < 2;
  return groups;
}

/** A pair where exactly one partner has answered */
export const partnerMissing = (g: EntourageGroup) =>
  g.people.length === 2 && g.people.filter((p) => p.status !== 'pending').length === 1;

// Honorifics / ranks dropped before comparing ("LTC. Rafael Demafeliz Jr." → rafael demafeliz jr)
const TITLES = new Set([
  'hon', 'honorable', 'mayor', 'gov', 'governor', 'vice', 'cong', 'sen', 'councilor', 'kagawad', 'kap', 'brgy',
  'gen', 'bgen', 'mgen', 'ltgen', 'col', 'ltc', 'maj', 'cpt', 'capt', 'lt', 'sgt', 'pvt', 'ret',
  'dr', 'dra', 'doc', 'atty', 'engr', 'arch', 'prof', 'rev', 'fr', 'judge', 'pastor', 'ptr',
  'mr', 'mrs', 'ms', 'miss', 'mx', 'sir', 'madam', 'maam', 'ma', 'mam',
]);
const SUFFIXES = new Set(['jr', 'sr', 'ii', 'iii', 'iv', 'v']);

interface ParsedName {
  tokens: string[];
  first: string;
  /** Surname, split on hyphens ("Pasion-Santos" → pasion, santos) */
  lastParts: string[];
  suffix: string | null;
}

function tokenize(raw: string): string[] {
  return raw
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // accents (ñ → n, é → e)
    .toLowerCase()
    .replace(/[.'’]/g, '')
    .split(/[^a-z-]+/)
    .filter(Boolean);
}

function parseName(raw: string): ParsedName | null {
  let words = tokenize(raw);
  while (words.length && TITLES.has(words[0].replace(/-/g, ''))) words = words.slice(1);
  let suffix: string | null = null;
  if (words.length && SUFFIXES.has(words[words.length - 1])) suffix = words.pop()!;
  if (words.length < 2) return null; // need at least a first name and a surname
  const last = words[words.length - 1];
  return {
    tokens: words.flatMap((w) => w.split('-')).filter(Boolean),
    first: words[0].split('-')[0],
    lastParts: last.split('-').filter(Boolean),
    suffix,
  };
}

/** "Mike & Celsa Rivera" → ["Mike Rivera", "Celsa Rivera"]; a part without a surname borrows the last one. */
export function splitPeople(raw: string): string[] {
  const parts = raw
    // A comma before Jr./Sr./III is part of the name, not a second person
    .split(/\s*(?:&|\/|\+|\band\b|,(?!\s*(?:jr|sr|ii|iii|iv)\.?\s*$))\s*/i)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length < 2) return parts;
  // Titles don't count as names: "Mr. Mike & Mrs. Celsa Rivera" → "Mr. Mike" still has no surname
  const nameWords = (p: string) => tokenize(p).filter((w) => !TITLES.has(w.replace(/-/g, '')) && !SUFFIXES.has(w));
  const lastWords = nameWords(parts[parts.length - 1]);
  const surname = lastWords.length > 1 ? lastWords[lastWords.length - 1] : '';
  return parts.map((p) => (nameWords(p).length === 1 && surname ? `${p} ${surname}` : p));
}

/** Same person? First name and surname must both appear; middle names and titles may differ. */
export function namesMatch(memberName: string, rsvpName: string): boolean {
  const m = parseName(memberName);
  const r = parseName(rsvpName);
  if (!m || !r) return false;
  if (m.suffix && r.suffix && m.suffix !== r.suffix) return false;
  if (!r.tokens.includes(m.first)) return false;
  return m.lastParts.some((part) => r.tokens.includes(part));
}

/** Every entourage person with their RSVP status (latest matching RSVP wins). */
export function matchEntourage<R extends RsvpLike>(categories: EntourageCategory[], rsvps: R[]): EntouragePerson<R>[] {
  // Each RSVP may name more than one person ("Mike & Celsa Rivera")
  const rsvpPeople = rsvps.flatMap((r) => splitPeople(r.name).map((name) => ({ name, row: r })));
  const people: EntouragePerson<R>[] = [];
  for (const c of categories) {
    c.members.forEach((member, i) => {
      const names = splitPeople(member.name);
      // Partners: "A & B" in one entry, or (paired lists) two entries in a row
      const pairKey = names.length > 1 ? `${c.category}#${i}` : c.paired ? `${c.category}#p${Math.floor(i / 2)}` : null;
      for (const name of names) {
        let latest: R | undefined;
        for (const p of rsvpPeople) {
          if (!namesMatch(name, p.name)) continue;
          if (!latest || new Date(p.row.timestamp).getTime() > new Date(latest.timestamp).getTime()) latest = p.row;
        }
        people.push({ name, role: member.role, category: c.category, status: latest ? latest.isAttending : 'pending', rsvp: latest, pairKey });
      }
    });
  }
  return people;
}
