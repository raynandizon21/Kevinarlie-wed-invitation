import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Check, Clock, Search, X } from 'lucide-react';
import { ENTOURAGE_DATA } from './data/weddingData';
import {
  groupEntourage,
  matchEntourage,
  partnerMissing,
  type EntourageGroup,
  type EntouragePerson,
  type EntourageStatus,
  type RsvpLike,
} from './data/entourageMatch';

// Admin "Entourage" panel: every name from weddingData.ts, colored by their RSVP
// (green = attending, red = declined, gray = no reply yet). Partners share one card, so a pair where only one
// has answered (or someone with no partner listed) stands out. Updates live with the RSVP list.

type Filter = 'all' | EntourageStatus | 'partner';

const LOOK: Record<EntourageStatus, { row: string; icon: string; label: string }> = {
  yes: { row: 'bg-[#185844]/[0.07] text-[#185844]', icon: 'bg-[#185844] text-white', label: 'Attending' },
  no: { row: 'bg-red-50 text-[#9B2C2C]', icon: 'bg-[#9B2C2C] text-white', label: 'Declined' },
  pending: { row: 'bg-white text-stone-600', icon: 'bg-stone-100 text-stone-400', label: 'No reply yet' },
};

const StatusIcon: React.FC<{ status: EntourageStatus; small?: boolean }> = ({ status, small }) => {
  const Icon = status === 'yes' ? Check : status === 'no' ? X : Clock;
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full ${small ? 'h-5 w-5' : 'h-6 w-6'} ${LOOK[status].icon}`}
      aria-label={LOOK[status].label}
    >
      <Icon className={small ? 'h-3 w-3' : 'h-3.5 w-3.5'} strokeWidth={2.5} />
    </span>
  );
};

const NAME_COLOR: Record<EntourageStatus, string> = { yes: 'text-[#185844]', no: 'text-[#9B2C2C]', pending: 'text-stone-600' };
const LABEL_COLOR: Record<EntourageStatus, string> = { yes: 'text-[#185844]', no: 'text-[#9B2C2C]', pending: 'text-stone-400' };

// One person per line: badge, name, and their status on the right
const NameLine: React.FC<{ p: EntouragePerson }> = ({ p }) => (
  <p className="flex items-center gap-2.5">
    <StatusIcon status={p.status} small />
    <span className={`min-w-0 flex-1 truncate text-sm font-medium leading-tight ${NAME_COLOR[p.status]}`}>{p.name}</span>
    <span className={`shrink-0 text-[9.5px] font-semibold uppercase tracking-wider ${LABEL_COLOR[p.status]}`}>{LOOK[p.status].label}</span>
  </p>
);

// A card body for one person or a couple: names (with status on the right), then a small line for the role
// and which RSVP matched, only when there is something to say
const PeopleRows: React.FC<{ people: EntouragePerson[]; showRole: boolean }> = ({ people, showRole }) => {
  const [a, b] = people;
  const same = !b || a.status === b.status;
  const role = showRole && (!b || a.role === b.role) ? a.role : '';
  const replies = people.filter((p) => p.rsvp).map((p) => `“${p.rsvp!.name}”`);
  return (
    <div className={`space-y-1 px-3 py-2 ${same ? LOOK[a.status].row : 'bg-white'}`}>
      {people.map((p) => (
        <NameLine key={p.name} p={p} />
      ))}
      {(role || replies.length > 0) && (
        // Lines up under the names (badge 1.25rem + gap 0.625rem)
        <p className="truncate pl-[1.875rem] text-[10px] text-stone-500">
          {role && <span className="uppercase tracking-wider">{role}</span>}
          {role && replies.length > 0 && ' · '}
          {replies.length > 0 && `RSVP ${replies.join(', ')}`}
        </p>
      )}
    </div>
  );
};

// Partners in one card; gold edge + note when only one of them has answered or the partner is missing
const GroupCard: React.FC<{ g: EntourageGroup; showRoles: boolean }> = ({ g, showRoles }) => {
  const missing = partnerMissing(g);
  const flagged = missing || g.unpaired;
  return (
    <li
      className={`relative overflow-hidden rounded-xl border ${
        flagged ? `border-[#B08A4F] ring-1 ring-[#B08A4F]/30` : 'border-[#185844]/15'
      }`}
    >
      <PeopleRows people={g.people} showRole={showRoles} />
      {flagged && (
        <p className={`border-t border-[#B08A4F]/30 bg-[#FBF6EC] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#B08A4F]`}>
          {g.unpaired ? 'No partner listed' : `Waiting on ${g.people.find((p) => p.status === 'pending')!.name}`}
        </p>
      )}
    </li>
  );
};

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function AdminEntourage<R extends RsvpLike>({ rsvps, onClose }: { rsvps: R[]; onClose: () => void }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const people = useMemo(() => matchEntourage(ENTOURAGE_DATA, rsvps), [rsvps]);
  const groups = useMemo(() => groupEntourage(people), [people]);
  const count = (s: EntourageStatus) => people.filter((p) => p.status === s).length;
  const needsPartner = (g: EntourageGroup) => partnerMissing(g) || g.unpaired;
  const q = normalize(query.trim());

  // A pair stays together: it shows when either partner fits the filter / search
  const visible = groups.filter((g) => {
    const fits =
      filter === 'all' ? true : filter === 'partner' ? needsPartner(g) : g.people.some((p) => p.status === filter);
    const found = !q || g.people.some((p) => normalize(`${p.name} ${p.role} ${p.rsvp?.name ?? ''}`).includes(q));
    return fits && found;
  });

  const chips: [Filter, string, number, string][] = [
    ['all', 'All', people.length, 'border-[#102F27] bg-[#102F27] text-[#F2EBDD]'],
    ['yes', 'Attending', count('yes'), 'border-[#185844] bg-[#185844] text-white'],
    ['no', 'Declined', count('no'), 'border-[#9B2C2C] bg-[#9B2C2C] text-white'],
    ['pending', 'No reply', count('pending'), 'border-stone-500 bg-stone-500 text-white'],
    ['partner', 'Partner missing', groups.filter(needsPartner).length, `border-[#B08A4F] bg-[#B08A4F] text-white`],
  ];

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-[#102F27]/65 p-0 sm:items-center sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="entourage-title"
        className="flex h-[100dvh] w-full max-w-5xl transform-gpu flex-col overflow-hidden bg-white shadow-2xl sm:h-[85dvh] sm:rounded-3xl"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 px-[clamp(1rem,4vw,1.5rem)] pb-3 pt-[max(1rem,env(safe-area-inset-top))]">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#78947F]">Wedding party</p>
            <h3 id="entourage-title" className="mt-1 font-serif text-2xl text-[#102F27]">
              Entourage <span className="text-stone-400 lining-nums tabular-nums">({people.length})</span>
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close entourage"
            className="rounded-full p-2 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-800 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="shrink-0 space-y-2.5 px-[clamp(1rem,4vw,1.5rem)] pb-3">
          {/* Counts double as filters; on phones the last one wraps to its own row */}
          <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5 sm:gap-2">
            {chips.map(([key, label, n, on]) => {
              const active = filter === key;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter((f) => (f === key && key !== 'all' ? 'all' : key))}
                  className={`min-w-0 rounded-xl border px-2 py-1.5 text-left transition-colors cursor-pointer sm:rounded-2xl sm:px-3.5 sm:py-2 ${
                    key === 'partner' ? 'col-span-4 flex items-baseline justify-between gap-2 sm:col-span-1 sm:block' : ''
                  } ${active ? on : 'border-[#185844]/15 bg-white hover:border-[#102F27]/30'}`}
                >
                  <p
                    className={`truncate text-[8.5px] uppercase tracking-[0.06em] sm:text-[10px] sm:tracking-[0.2em] ${
                      active ? 'opacity-80' : key === 'partner' ? `text-[#B08A4F]` : 'text-stone-500'
                    }`}
                  >
                    {label}
                  </p>
                  <p className="font-serif text-xl leading-tight lining-nums tabular-nums sm:text-2xl">{n}</p>
                </button>
              );
            })}
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or role"
              aria-label="Search name or role"
              className="w-full rounded-full border border-[#185844]/15 bg-white py-2 pl-10 pr-4 text-base text-[#102F27] outline-none placeholder:text-stone-400 focus:border-[#185844] focus:ring-2 focus:ring-[#185844]/15 sm:text-sm"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-[clamp(1rem,4vw,1.5rem)] pb-[max(1rem,env(safe-area-inset-bottom))]">
          {ENTOURAGE_DATA.map((c) => {
            const shown = visible.filter((g) => g.category === c.category);
            if (!shown.length) return null;
            const all = people.filter((p) => p.category === c.category);
            const yes = all.filter((p) => p.status === 'yes').length;
            const no = all.filter((p) => p.status === 'no').length;
            const catGroups = groups.filter((g) => g.category === c.category);
            const pairs = catGroups.filter((g) => g.people.length === 2).length;
            const flagged = catGroups.filter(needsPartner).length;
            return (
              <section key={c.category} className="pb-5">
                <div className="sticky top-0 z-10 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 border-b border-[#185844]/10 bg-white pb-1.5 pt-2">
                  <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#185844]">
                    {c.category}
                    {pairs > 0 && (
                      <span className="ml-2 font-normal normal-case tracking-normal text-stone-400">
                        {pairs} {pairs === 1 ? 'pair' : 'pairs'}
                      </span>
                    )}
                  </h4>
                  <p className="text-[10px] uppercase tracking-wider text-stone-500 tabular-nums">
                    <span className="text-[#185844]">{yes} yes</span>
                    <span className="mx-1.5 text-stone-300">·</span>
                    <span className="text-[#9B2C2C]">{no} no</span>
                    <span className="mx-1.5 text-stone-300">·</span>
                    {all.length - yes - no} waiting
                    {flagged > 0 && (
                      <>
                        <span className="mx-1.5 text-stone-300">·</span>
                        <span className={`font-semibold text-[#B08A4F]`}>{flagged} partner missing</span>
                      </>
                    )}
                  </p>
                </div>
                <ul className="mt-2.5 grid grid-cols-1 items-start gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {shown.map((g) => (
                    <GroupCard key={g.key} g={g} showRoles={Boolean(c.showRoles)} />
                  ))}
                </ul>
              </section>
            );
          })}
          {visible.length === 0 && (
            <p className="grid place-items-center px-4 py-12 text-center text-xs uppercase tracking-widest text-stone-500">
              {q ? `No results for “${query.trim()}”.` : filter === 'partner' ? 'Every pair is complete.' : 'Nobody here for this filter.'}
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
