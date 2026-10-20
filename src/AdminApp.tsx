import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Archive, MoreVertical, Pencil, Plus, RotateCcw, Trash2, X } from 'lucide-react';
import { io } from 'socket.io-client';

// RSVP admin panel (ported from the wedding-invitation project, Kevin & Arlei colors)

interface RsvpRow {
  id: number;
  name: string;
  contact: string | null;
  isAttending: 'yes' | 'no';
  timestamp: string;
  source?: 'web' | 'qr';
  brings_guest?: 'yes' | 'no' | null;
  guest_names?: unknown;
}

/** Guests per page. */
const PAGE_SIZES = [10, 25, 50, 100];
/** Plus-ones one RSVP may bring (same limit as the RSVP form and the server). */
const MAX_GUESTS = 10;
const inputClass =
  'mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-[#102F27] outline-none focus:border-[#185844] focus:ring-2 focus:ring-[#185844]/15';

/** Values in the Edit pop-up. */
interface EditDraft {
  row: RsvpRow;
  name: string;
  contact: string;
  isAttending: 'yes' | 'no';
  guests: string[];
}

// 'plus' = attending RSVPs that bring at least one guest
type StatusFilter = 'all' | 'yes' | 'no' | 'plus';


// Older RSVPs typed several people in one field ("Ana/Ben", "Ana & Ben"): split those into separate guests
const splitTypedNames = (name: string) => name.split(/\s*(?:\/|&)\s*/).map((n) => n.trim()).filter(Boolean);

function parseGuestNames(raw: unknown): string[] {
  let list: unknown[] = [];
  if (Array.isArray(raw)) {
    list = raw;
  } else if (typeof raw === 'string') {
    try {
      const p = JSON.parse(raw) as unknown;
      if (Array.isArray(p)) list = p;
    } catch {
      return [];
    }
  }
  return list.flatMap((s) => splitTypedNames(String(s)));
}

// Plus-ones for any RSVP (guests and sponsors alike), comma-separated
function formatPlusOneGuest(g: RsvpRow): string {
  if (g.brings_guest === 'no') return 'No guest';
  if (g.brings_guest !== 'yes') return '—';
  const names = parseGuestNames(g.guest_names);
  return names.length ? names.join(', ') : '—';
}

// Normalize common PH input like 09xx... to +63 9xx...
function formatContact(raw: unknown): string {
  if (raw === null || raw === undefined) return '';
  const digits = String(raw).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('63')) return `+${digits}`;
  if (digits.startsWith('0')) return `+63${digits.slice(1)}`;
  return `+63${digits}`;
}

const StatusBadge: React.FC<{ attending: boolean; small?: boolean }> = ({ attending, small }) => (
  <span
    className={`inline-flex shrink-0 items-center px-2 py-0.5 rounded-full ${small ? 'text-[9px]' : 'text-[10px]'} font-bold uppercase tracking-wider ${
      attending ? 'bg-[#185844]/10 text-[#185844]' : 'bg-red-100 text-red-800'
    }`}
  >
    {attending ? 'Attending' : 'Declined'}
  </span>
);

// Three-dot row menu (Edit / Delete). Fixed position so the table's overflow never clips it.
const RowMenu: React.FC<{ name: string; onEdit: () => void; onDelete: () => void }> = ({ name, onEdit, onDelete }) => {
  const [pos, setPos] = useState<React.CSSProperties | null>(null);

  useEffect(() => {
    if (!pos) return;
    const close = () => setPos(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
      window.removeEventListener('keydown', onKey);
    };
  }, [pos]);

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (pos) return setPos(null);
    const r = e.currentTarget.getBoundingClientRect();
    const right = window.innerWidth - r.right;
    // Open upward when the row is near the bottom of the screen
    setPos(r.bottom + 110 > window.innerHeight ? { bottom: window.innerHeight - r.top + 4, right } : { top: r.bottom + 4, right });
  };

  const item = 'flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs font-medium transition-colors cursor-pointer';
  return (
    <>
      <button
        type="button"
        onClick={toggle}
        title="Actions"
        aria-label={`Actions for ${name}`}
        aria-haspopup="menu"
        aria-expanded={!!pos}
        className={`rounded-full p-1.5 transition-colors cursor-pointer ${pos ? 'bg-[#F2EBDD] text-[#102F27]' : 'text-stone-400 hover:bg-[#F2EBDD] hover:text-[#102F27]'}`}
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {pos && (
        <>
          <div className="fixed inset-0 z-[80]" onClick={() => setPos(null)} />
          <div
            role="menu"
            style={pos}
            className="fixed z-[81] w-36 overflow-hidden rounded-xl border border-stone-200 bg-white py-1 shadow-[0_8px_30px_rgba(16,47,39,0.15)]"
          >
            <button
              type="button"
              role="menuitem"
              autoFocus
              onClick={() => {
                setPos(null);
                onEdit();
              }}
              className={`${item} text-[#102F27] hover:bg-[#F2EBDD]`}
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setPos(null);
                onDelete();
              }}
              className={`${item} text-[#9B2C2C] hover:bg-red-50`}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default function AdminApp() {
  const [rsvps, setRsvps] = useState<RsvpRow[]>([]);
  const [error, setError] = useState('');
  // RSVP waiting for confirmation in the remove pop-up
  const [pendingDelete, setPendingDelete] = useState<RsvpRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  // Archive (soft-deleted RSVPs) panel
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archived, setArchived] = useState<RsvpRow[]>([]);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  // Edit pop-up
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const attendingRsvpCount = rsvps.filter((g) => g.isAttending === 'yes').length;
  const declinedCount = rsvps.filter((g) => g.isAttending === 'no').length;
  /** Total plus-one guests named by attending RSVPs. */
  const plusOneCount = rsvps
    .filter((g) => g.isAttending === 'yes' && g.brings_guest === 'yes')
    .reduce((sum, g) => sum + parseGuestNames(g.guest_names).length, 0);
  /** Headcount: everyone attending, plus-ones included. */
  const attendingCount = attendingRsvpCount + plusOneCount;

  // Soft delete (sets active = 0 on the server; the row stays in the database)
  const confirmDelete = async () => {
    const g = pendingDelete;
    if (!g) return;
    try {
      setDeleting(true);
      const response = await fetch(`/api/rsvps/${g.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      setRsvps((prev) => prev.filter((r) => r.id !== g.id));
      setPendingDelete(null);
    } catch (err) {
      console.error(err);
      setError('Could not remove that RSVP. Please try again.');
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = (g: RsvpRow) => {
    setEditError('');
    setEditDraft({
      row: g,
      name: g.name,
      contact: g.contact ?? '',
      isAttending: g.isAttending,
      guests: parseGuestNames(g.guest_names),
    });
  };

  const updateGuest = (i: number, value: string) =>
    setEditDraft((d) => (d ? { ...d, guests: d.guests.map((n, j) => (j === i ? value : n)) } : d));

  const saveEdit = async () => {
    const d = editDraft;
    if (!d) return;
    if (!d.name.trim()) return setEditError('Please enter a name.');
    const guests = d.isAttending === 'yes' ? d.guests.map((n) => n.trim()).filter(Boolean) : [];
    try {
      setSaving(true);
      setEditError('');
      const response = await fetch(`/api/rsvps/${d.row.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: d.name,
          contact: d.contact,
          isAttending: d.isAttending,
          bringsGuest: guests.length ? 'yes' : 'no',
          guestNames: guests,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error((data as { error?: string }).error || 'Could not save the changes.');
      const row = data as RsvpRow;
      setRsvps((prev) => prev.map((r) => (r.id === row.id ? row : r)));
      setEditDraft(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Could not save the changes.');
    } finally {
      setSaving(false);
    }
  };

  // Esc closes the open pop-up first, then the archive panel
  useEffect(() => {
    if (!pendingDelete && !archiveOpen && !editDraft) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (pendingDelete) {
        if (!deleting) setPendingDelete(null);
      } else if (editDraft) {
        if (!saving) setEditDraft(null);
      } else {
        setArchiveOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pendingDelete, deleting, archiveOpen, editDraft, saving]);

  const fetchArchived = async () => {
    try {
      setArchiveLoading(true);
      const response = await fetch('/api/rsvps/archived');
      if (!response.ok) throw new Error('Failed to fetch archive');
      setArchived(await response.json());
    } catch (err) {
      console.error(err);
    } finally {
      setArchiveLoading(false);
    }
  };

  // Recover an archived RSVP back into the list (the socket event updates every open admin)
  const restoreRsvp = async (g: RsvpRow) => {
    try {
      setRestoringId(g.id);
      const response = await fetch(`/api/rsvps/${g.id}/restore`, { method: 'PATCH' });
      if (!response.ok) throw new Error('Failed to restore');
      const row = (await response.json()) as RsvpRow;
      setArchived((prev) => prev.filter((r) => r.id !== g.id));
      setRsvps((prev) =>
        (prev.some((r) => r.id === row.id) ? prev : [...prev, row]).sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
      );
    } catch (err) {
      console.error(err);
      setError('Could not restore that RSVP. Please try again.');
    } finally {
      setRestoringId(null);
    }
  };

  const fetchRsvps = async () => {
    try {
      setError('');
      const response = await fetch('/api/rsvps');
      if (!response.ok) throw new Error('Failed to fetch data');
      setRsvps(await response.json());
    } catch (err) {
      console.error(err);
      setError('Could not load guest list. Make sure the RSVP server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Realtime: load the list once, then the server pushes every new RSVP over Socket.IO.
  // On (re)connect the full list is reloaded so nothing is missed while offline.
  useEffect(() => {
    const socket = io({ path: '/socket.io' });
    socket.on('connect', () => {
      fetchRsvps();
    });
    socket.on('rsvp:new', (row: RsvpRow) => {
      setRsvps((prev) => (prev.some((g) => g.id === row.id) ? prev : [row, ...prev]));
    });
    socket.on('rsvp:updated', (row: RsvpRow) => {
      setRsvps((prev) => prev.map((g) => (g.id === row.id ? row : g)));
    });
    socket.on('rsvp:deleted', ({ id }: { id: number }) => {
      setRsvps((prev) => prev.filter((g) => g.id !== id));
      fetchArchived();
    });
    socket.on('rsvp:restored', (row: RsvpRow) => {
      setArchived((prev) => prev.filter((g) => g.id !== row.id));
      setRsvps((prev) =>
        (prev.some((g) => g.id === row.id) ? prev : [...prev, row]).sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
      );
    });
    fetchRsvps();
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, pageSize]);

  const filteredRsvps = rsvps.filter((g) => {
    if (statusFilter === 'plus') {
      if (!(g.isAttending === 'yes' && g.brings_guest === 'yes' && parseGuestNames(g.guest_names).length > 0)) return false;
    } else if (statusFilter !== 'all' && g.isAttending !== statusFilter) return false;
    return true;
  });

  // Plus-ones view: one row per guest name from guest_names, with the RSVP that brought them
  const isPlusView = statusFilter === 'plus';
  const plusOneRows = isPlusView
    ? filteredRsvps.flatMap((host) =>
        parseGuestNames(host.guest_names).map((guest, i) => ({ key: `${host.id}-${i}`, guest, host }))
      )
    : [];
  const listLength = isPlusView ? plusOneRows.length : filteredRsvps.length;

  const totalPages = Math.max(1, Math.ceil(listLength / pageSize));
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const pageStart = (page - 1) * pageSize;
  const displayedRsvps = isPlusView ? [] : filteredRsvps.slice(pageStart, pageStart + pageSize);
  const displayedPlusOnes = plusOneRows.slice(pageStart, pageStart + pageSize);
  const rangeStart = listLength === 0 ? 0 : pageStart + 1;
  const rangeEnd = Math.min(pageStart + pageSize, listLength);
  const formatDate = (ts: string) =>
    ts ? new Date(ts).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' }) : '';

  const statCard = (
    label: string,
    value: number,
    active: boolean,
    onClick?: () => void,
    tone: 'green' | 'red' | 'gold' | 'plain' = 'plain',
    hint?: string
  ) => {
    // Selected card is filled with its color; otherwise white. Only one background class at a time.
    const selected = {
      green: 'border-[#185844] bg-[#185844] text-[#F2EBDD]',
      red: 'border-[#9B2C2C] bg-[#9B2C2C] text-white',
      gold: 'border-[#B08A4F] bg-[#B08A4F] text-white',
      plain: 'border-[#102F27] bg-[#102F27] text-[#F2EBDD]',
    };
    const hover = {
      green: 'hover:border-[#185844]/40',
      red: 'hover:border-[#9B2C2C]/40',
      gold: 'hover:border-[#B08A4F]/50',
      plain: 'hover:border-[#102F27]/30',
    };
    const look = active ? selected[tone] : `border-stone-200 bg-white ${onClick ? hover[tone] : ''}`;
    const Tag = onClick ? 'button' : 'div';
    return (
      <Tag
        {...(onClick ? { type: 'button' as const, onClick, 'aria-pressed': active } : {})}
        className={`rounded-2xl border px-4 py-3 text-left transition-colors ${onClick ? 'cursor-pointer' : ''} ${look}`}
      >
        <p className={`text-[10px] uppercase tracking-[0.25em] ${active ? 'opacity-80' : 'text-stone-500'}`}>{label}</p>
        {/* Cormorant defaults to old-style figures (1 looks like I, 0 like o): force lining digits */}
        <p className="mt-1 font-serif text-3xl lining-nums tabular-nums">{value}</p>
        {hint && <p className={`mt-0.5 text-[10px] ${active ? 'opacity-80' : 'text-stone-500'}`}>{hint}</p>}
      </Tag>
    );
  };

  return (
    <div className="min-h-[100dvh] bg-[#F2EBDD] text-[#102F27] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[#102F27]/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-[clamp(1rem,4vw,1.5rem)] py-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#78947F]">Admin Panel</p>
            <h1 className="font-serif text-xl leading-tight">
              Kevin <span className="font-script text-[#B08A4F]">&amp;</span> Arlei
            </h1>
          </div>
          <button
            type="button"
            onClick={() => {
              setArchiveOpen(true);
              fetchArchived();
            }}
            className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-[#185844] hover:bg-[#F2EBDD] transition-colors cursor-pointer"
          >
            <Archive className="h-4 w-4" aria-hidden />
            <span>Archive</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-[clamp(1rem,4vw,1.5rem)] py-6 space-y-5">
        <h2 className="font-serif text-[clamp(1.75rem,6vw,2.5rem)] leading-none">Guest RSVPs</h2>

        {/* Stats / filters */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {statCard('Total RSVP', rsvps.length, statusFilter === 'all', () => setStatusFilter('all'))}
          {statCard('Attending', attendingCount, statusFilter === 'yes', () => setStatusFilter((f) => (f === 'yes' ? 'all' : 'yes')), 'green', `${attendingRsvpCount} RSVP + ${plusOneCount} plus-one${plusOneCount === 1 ? '' : 's'}`)}
          {statCard('Declined', declinedCount, statusFilter === 'no', () => setStatusFilter((f) => (f === 'no' ? 'all' : 'no')), 'red')}
          {statCard('Plus-ones', plusOneCount, statusFilter === 'plus', () => setStatusFilter((f) => (f === 'plus' ? 'all' : 'plus')), 'gold')}
        </div>

        {/* List */}
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_8px_30px_rgba(16,47,39,0.06)]">
          {/* Desktop table */}
          {/* Only the rows scroll; the column header stays pinned */}
          <div className="hidden sm:block max-h-[60dvh] overflow-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="sticky top-0 z-10 bg-[#F8F4EA] shadow-[inset_0_-1px_0_#e7e5e4]">
                <tr>
                  {(isPlusView ? ['Guest', 'Brought by', 'Contact', 'Date'] : ['Name', 'Status', 'Plus-one', 'Contact', 'Date', '']).map((h) => (
                    <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-stone-600">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {displayedPlusOnes.map(({ key, guest, host }) => (
                  <tr key={key} className="hover:bg-[#F8F4EA]/60 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-[#102F27] whitespace-normal">{guest}</td>
                    <td className="px-4 py-2.5 text-stone-700">{host.name}</td>
                    <td className="px-4 py-2.5 font-mono text-stone-500">{formatContact(host.contact)}</td>
                    <td className="px-4 py-2.5 text-xs text-stone-500">{formatDate(host.timestamp)}</td>
                  </tr>
                ))}
                {displayedRsvps.map((g) => (
                  <tr key={g.id} className="hover:bg-[#F8F4EA]/60 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-[#102F27]">{g.name}</td>
                    <td className="px-4 py-2.5"><StatusBadge attending={g.isAttending === 'yes'} /></td>
                    <td className="px-4 py-2.5 text-xs text-stone-600 whitespace-normal max-w-[12rem]">{formatPlusOneGuest(g)}</td>
                    <td className="px-4 py-2.5 font-mono text-stone-500">{formatContact(g.contact)}</td>
                    <td className="px-4 py-2.5 text-xs text-stone-500">
                      {formatDate(g.timestamp)}
                    </td>
                    <td className="px-2 py-2.5 text-right">
                      <RowMenu name={g.name} onEdit={() => openEdit(g)} onDelete={() => setPendingDelete(g)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="max-h-[60dvh] overflow-y-auto divide-y divide-stone-100 sm:hidden">
            {displayedPlusOnes.map(({ key, guest, host }) => (
              <div key={key} className="px-4 py-3">
                <p className="text-sm font-medium leading-tight">{guest}</p>
                <p className="mt-0.5 text-[10px] text-stone-500">Brought by {host.name}</p>
              </div>
            ))}
            {displayedRsvps.map((g) => (
              <div key={g.id} className="flex items-start justify-between gap-2 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-tight">{g.name}</p>
                  {g.brings_guest === 'yes' && <p className="mt-0.5 text-[10px] text-stone-500">Plus-one: {formatPlusOneGuest(g)}</p>}
                  <p className="mt-0.5 font-mono text-xs text-stone-500">{formatContact(g.contact)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <StatusBadge attending={g.isAttending === 'yes'} small />
                  <RowMenu name={g.name} onEdit={() => openEdit(g)} onDelete={() => setPendingDelete(g)} />
                </div>
              </div>
            ))}
          </div>

          {error && <p className="px-4 py-6 text-center text-xs text-red-600">{error}</p>}
          {!error && !loading && rsvps.length === 0 && (
            <p className="px-4 py-10 text-center text-xs uppercase tracking-widest text-stone-500">No RSVPs yet</p>
          )}
          {rsvps.length > 0 && listLength === 0 && (
            <p className="px-4 py-8 text-center text-xs uppercase tracking-widest text-stone-500">No guests match this filter.</p>
          )}

          {rsvps.length > 0 && (
            <div className="flex flex-col items-center gap-2 border-t border-stone-100 bg-[#F8F4EA]/70 px-4 py-3">
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                <label className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-stone-500">
                  Rows
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[11px] text-stone-700 tabular-nums outline-none focus:border-[#185844] cursor-pointer"
                  >
                    {PAGE_SIZES.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="text-[10px] uppercase tracking-widest text-stone-500 tabular-nums">
                  Showing {rangeStart}–{rangeEnd} of {listLength}{isPlusView ? ' plus-ones' : ''}
                </p>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="rounded-full border border-stone-200 bg-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-700 disabled:opacity-40 hover:bg-[#F2EBDD] cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="min-w-[6rem] text-center text-[10px] uppercase tracking-widest text-stone-500 tabular-nums">
                    Page {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="rounded-full border border-stone-200 bg-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-stone-700 disabled:opacity-40 hover:bg-[#F2EBDD] cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Archive: removed RSVPs with Restore */}
      <AnimatePresence>
        {archiveOpen && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-[#102F27]/50 p-0 sm:p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setArchiveOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="archive-title"
              className="flex max-h-[85dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3 border-b border-stone-100 px-6 py-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-[#78947F]">Removed RSVPs</p>
                  <h3 id="archive-title" className="mt-1 font-serif text-2xl text-[#102F27]">
                    Archive <span className="text-stone-400 tabular-nums">({archived.length})</span>
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setArchiveOpen(false)}
                  aria-label="Close archive"
                  className="rounded-full p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 divide-y divide-stone-100 overflow-y-auto">
                {archived.map((g) => (
                  <div key={g.id} className="flex items-center justify-between gap-3 px-6 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#102F27]">{g.name}</p>
                      <p className="mt-0.5 text-[11px] text-stone-500">
                        {g.isAttending === 'yes' ? 'Attending' : 'Declined'}
                        {parseGuestNames(g.guest_names).length ? ` · +${parseGuestNames(g.guest_names).length} guest(s)` : ''}
                        {' · '}
                        {formatDate(g.timestamp)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => restoreRsvp(g)}
                      disabled={restoringId === g.id}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#185844]/30 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#185844] hover:bg-[#185844] hover:text-white disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      {restoringId === g.id ? 'Restoring…' : 'Restore'}
                    </button>
                  </div>
                ))}
                {!archiveLoading && archived.length === 0 && (
                  <p className="px-6 py-12 text-center text-xs uppercase tracking-widest text-stone-500">The archive is empty</p>
                )}
                {archiveLoading && archived.length === 0 && (
                  <p className="px-6 py-12 text-center text-xs uppercase tracking-widest text-stone-400">Loading…</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit RSVP pop-up */}
      <AnimatePresence>
        {editDraft && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-[#102F27]/50 p-0 sm:p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => !saving && setEditDraft(null)}
          >
            <motion.form
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-title"
              className="flex max-h-[90dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={(e) => {
                e.preventDefault();
                saveEdit();
              }}
            >
              <div className="flex items-center justify-between gap-3 border-b border-stone-100 px-6 py-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-[#78947F]">Edit RSVP</p>
                  <h3 id="edit-title" className="mt-1 font-serif text-2xl leading-tight text-[#102F27]">
                    {editDraft.row.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditDraft(null)}
                  disabled={saving}
                  aria-label="Close"
                  className="rounded-full p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                <label className="block">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-500">Name</span>
                  <input
                    value={editDraft.name}
                    onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                    className={inputClass}
                    autoFocus
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-500">Contact</span>
                  <input
                    value={editDraft.contact}
                    onChange={(e) => setEditDraft({ ...editDraft, contact: e.target.value })}
                    inputMode="tel"
                    className={`${inputClass} font-mono`}
                  />
                </label>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-500">Status</span>
                  <div className="mt-1.5 grid grid-cols-2 gap-2">
                    {(['yes', 'no'] as const).map((v) => {
                      const on = editDraft.isAttending === v;
                      return (
                        <button
                          key={v}
                          type="button"
                          aria-pressed={on}
                          onClick={() => setEditDraft({ ...editDraft, isAttending: v })}
                          className={`rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors cursor-pointer ${
                            on
                              ? v === 'yes'
                                ? 'border-[#185844] bg-[#185844] text-white'
                                : 'border-[#9B2C2C] bg-[#9B2C2C] text-white'
                              : 'border-stone-200 text-stone-600 hover:bg-[#F2EBDD]'
                          }`}
                        >
                          {v === 'yes' ? 'Attending' : 'Declined'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {editDraft.isAttending === 'yes' && (
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-stone-500">
                      Plus-ones <span className="tabular-nums">({editDraft.guests.length}/{MAX_GUESTS})</span>
                    </span>
                    <div className="mt-1.5 space-y-2">
                      {editDraft.guests.map((guest, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input
                            value={guest}
                            onChange={(e) => updateGuest(i, e.target.value)}
                            placeholder={`Guest ${i + 1} full name`}
                            className={`${inputClass} mt-0`}
                          />
                          <button
                            type="button"
                            onClick={() => setEditDraft({ ...editDraft, guests: editDraft.guests.filter((_, j) => j !== i) })}
                            aria-label={`Remove guest ${i + 1}`}
                            className="shrink-0 rounded-full p-2 text-stone-400 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      {editDraft.guests.length === 0 && <p className="text-xs text-stone-500">No plus-ones.</p>}
                      {editDraft.guests.length < MAX_GUESTS && (
                        <button
                          type="button"
                          onClick={() => setEditDraft({ ...editDraft, guests: [...editDraft.guests, ''] })}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#185844]/30 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#185844] hover:bg-[#185844] hover:text-white transition-colors cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add guest
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {editError && <p className="text-xs text-red-600">{editError}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-stone-100 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setEditDraft(null)}
                  disabled={saving}
                  className="rounded-full border border-stone-200 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-600 hover:bg-[#F2EBDD] disabled:opacity-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-[#185844] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white hover:bg-[#102F27] disabled:opacity-60 transition-colors cursor-pointer"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Remove RSVP pop-up */}
      <AnimatePresence>
        {pendingDelete && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#102F27]/50 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => !deleting && setPendingDelete(null)}
          >
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="remove-title"
              className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <Trash2 className="h-5 w-5 text-[#9B2C2C]" />
              </div>
              <p className="mt-4 text-[10px] uppercase tracking-[0.35em] text-[#78947F]">Remove RSVP</p>
              <h3 id="remove-title" className="mt-2 font-serif text-2xl leading-snug text-[#102F27]">
                {pendingDelete.name}
              </h3>
              <p className="mt-2 text-sm text-stone-500">
                This RSVP{parseGuestNames(pendingDelete.guest_names).length ? ' and its plus-ones' : ''} will be moved to the Archive. You can restore it anytime.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  autoFocus
                  onClick={() => setPendingDelete(null)}
                  disabled={deleting}
                  className="rounded-full border border-stone-200 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-600 hover:bg-[#F2EBDD] disabled:opacity-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="rounded-full bg-[#9B2C2C] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white hover:bg-[#7f2323] disabled:opacity-60 transition-colors cursor-pointer"
                >
                  {deleting ? 'Removing…' : 'Remove'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
