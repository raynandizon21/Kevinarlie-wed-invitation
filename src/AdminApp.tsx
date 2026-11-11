import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Archive, Check, ChevronDown, ChevronLeft, ChevronRight, Eye, EyeOff, LogOut, MoreVertical, Pencil, RotateCcw, Search, Trash2, Users, X } from 'lucide-react';
import { io } from 'socket.io-client';
import AdminEntourage from './AdminEntourage';

// RSVP admin panel (ported from the wedding-invitation project, Kevin & Arlei colors)

interface RsvpRow {
  id: number;
  name: string;
  contact: string | null;
  isAttending: 'yes' | 'no';
  timestamp: string;
  source?: 'web' | 'qr';
}

/** Guests per page. */
// 0 = All (one page with every row)
const PAGE_SIZES = [10, 25, 50, 100, 0];
const inputClass =
  'mt-1.5 w-full rounded-xl border border-[#185844]/15 bg-white px-3.5 py-2.5 text-sm text-[#102F27] outline-none focus:border-[#185844] focus:ring-2 focus:ring-[#185844]/15';

/** Values in the Edit pop-up. */
interface EditDraft {
  row: RsvpRow;
  name: string;
  contact: string;
  isAttending: 'yes' | 'no';
}

type StatusFilter = 'all' | 'yes' | 'no';

// Normalize common PH input like 09xx... to +63 9xx...
function formatContact(raw: unknown): string {
  if (raw === null || raw === undefined) return '';
  const digits = String(raw).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('63')) return `+${digits}`;
  if (digits.startsWith('0')) return `+63${digits.slice(1)}`;
  return `+63${digits}`;
}

// Search: name or contact number (09… and +639… both match)
function matchesQuery(g: RsvpRow, q: string): boolean {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  if (g.name.toLowerCase().includes(s)) return true;
  const digits = s.replace(/\D/g, '').replace(/^0/, '');
  return digits.length >= 3 && formatContact(g.contact).replace(/\D/g, '').includes(digits);
}

// Page / rows-per-page state for a list of `total` items; goes back to page 1 when `resetKey` changes
function usePager(total: number, resetKey: string) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  useEffect(() => setPage(1), [resetKey, pageSize]);
  const perPage = pageSize || Math.max(1, total);
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  useEffect(() => setPage((p) => Math.min(p, totalPages)), [totalPages]);
  const start = (page - 1) * perPage;
  return { page, setPage, pageSize, setPageSize, totalPages, total, start, end: Math.min(start + perPage, total) };
}

const SearchBox: React.FC<{ value: string; onChange: (v: string) => void; placeholder: string }> = ({ value, onChange, placeholder }) => (
  <div className="relative">
    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden />
    {/* 16px text on phones so iOS doesn't zoom in on focus */}
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      className="w-full rounded-full border border-[#185844]/15 bg-white py-2 pl-10 pr-9 text-base text-[#102F27] outline-none placeholder:text-stone-400 focus:border-[#185844] focus:ring-2 focus:ring-[#185844]/15 sm:text-sm [&::-webkit-search-cancel-button]:hidden"
    />
    {value && (
      <button
        type="button"
        onClick={() => onChange('')}
        aria-label="Clear search"
        className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700 cursor-pointer"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    )}
  </div>
);

// Rows picker, "1–10 of 100" and ‹ page › in one row
const Pager: React.FC<{ pager: ReturnType<typeof usePager>; suffix?: string }> = ({ pager, suffix = '' }) => {
  const { page, setPage, pageSize, setPageSize, totalPages, total, start, end } = pager;
  const arrow =
    'grid h-7 w-7 place-items-center rounded-full border border-[#185844]/15 bg-white text-stone-700 disabled:opacity-40 hover:bg-[#E9F1EC] cursor-pointer';
  return (
    <div className="flex shrink-0 items-center justify-between gap-2 border-t border-[#185844]/10 bg-[#F3F7F4] px-3 py-2 sm:px-4">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-stone-500">
        Rows
        <RowsPicker value={pageSize} onChange={setPageSize} />
      </div>
      <p className="truncate text-[10px] uppercase tracking-wider text-stone-500 tabular-nums">
        {total === 0 ? 0 : start + 1}–{end} of {total}
        {suffix}
      </p>
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} aria-label="Previous page" className={arrow}>
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="min-w-[2.75rem] text-center text-[10px] uppercase tracking-wider text-stone-500 tabular-nums">
          {page}/{totalPages}
        </span>
        <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} aria-label="Next page" className={arrow}>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// `iconOnly` on phone cards, so the status badge still fits beside the name
const RestoreButton: React.FC<{ busy: boolean; onClick: () => void; iconOnly?: boolean }> = ({ busy, onClick, iconOnly }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={busy}
    title="Restore"
    aria-label="Restore"
    className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-[#185844]/30 text-[#185844] hover:bg-[#185844] hover:text-white disabled:opacity-50 transition-colors cursor-pointer ${
      iconOnly ? 'h-8 w-8' : 'px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]'
    }`}
  >
    <RotateCcw className={`${iconOnly ? 'h-3.5 w-3.5' : 'h-3 w-3'} ${busy ? 'animate-spin' : ''}`} />
    {!iconOnly && (busy ? 'Restoring…' : 'Restore')}
  </button>
);

const StatusBadge: React.FC<{ attending: boolean; small?: boolean }> = ({ attending, small }) => (
  <span
    className={`inline-flex shrink-0 items-center px-2 py-0.5 rounded-full ${small ? 'text-[9px]' : 'text-[10px]'} font-bold uppercase tracking-wider ${
      attending ? 'bg-[#185844]/10 text-[#185844]' : 'bg-red-100 text-red-800'
    }`}
  >
    {attending ? 'Attending' : 'Declined'}
  </span>
);

// Rows-per-page picker. A small custom menu instead of <select>, whose native iOS picker is huge.
const RowsPicker: React.FC<{ value: number; onChange: (n: number) => void }> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Rows per page"
        className="flex items-center gap-1 rounded-full border border-[#185844]/15 bg-white py-1 pl-2.5 pr-1.5 text-[11px] text-stone-700 tabular-nums hover:border-[#185844]/40 cursor-pointer"
      >
        {value || 'All'}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-[80]" onClick={() => setOpen(false)} />
          {/* Opens upward: the pager sits at the bottom of the list */}
          <ul
            role="listbox"
            className="absolute bottom-full left-0 z-[81] mb-1.5 w-20 overflow-hidden rounded-xl border border-[#185844]/15 bg-white py-1 shadow-[0_8px_30px_rgba(16,47,39,0.15)]"
          >
            {PAGE_SIZES.map((n) => (
              <li key={n}>
                <button
                  type="button"
                  role="option"
                  aria-selected={n === value}
                  onClick={() => {
                    onChange(n);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-xs tabular-nums transition-colors cursor-pointer hover:bg-[#E9F1EC] ${
                    n === value ? 'font-semibold text-[#185844]' : 'text-stone-700'
                  }`}
                >
                  {n || 'All'}
                  {n === value && <Check className="h-3 w-3" />}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

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
        className={`rounded-full p-1.5 transition-colors cursor-pointer ${pos ? 'bg-[#E9F1EC] text-[#102F27]' : 'text-stone-400 hover:bg-[#E9F1EC] hover:text-[#102F27]'}`}
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {pos && (
        <>
          <div className="fixed inset-0 z-[80]" onClick={() => setPos(null)} />
          <div
            role="menu"
            style={pos}
            className="fixed z-[81] w-36 overflow-hidden rounded-xl border border-[#185844]/15 bg-white py-1 shadow-[0_8px_30px_rgba(16,47,39,0.15)]"
          >
            <button
              type="button"
              role="menuitem"
              autoFocus
              onClick={() => {
                setPos(null);
                onEdit();
              }}
              className={`${item} text-[#102F27] hover:bg-[#E9F1EC]`}
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

// Every admin API call: a 401 means the session expired, so go back to the login page
class SignedOut extends Error {}
async function adminFetch(url: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(url, init);
  if (response.status === 401) throw new SignedOut();
  return response;
}

type AuthState = 'checking' | 'signedOut' | 'signedIn';

export default function AdminApp() {
  const [auth, setAuth] = useState<AuthState>('checking');

  useEffect(() => {
    fetch('/api/admin/session')
      .then((r) => r.json())
      .then((d: { signedIn?: boolean }) => setAuth(d.signedIn ? 'signedIn' : 'signedOut'))
      .catch(() => setAuth('signedOut'));
  }, []);

  const signOut = async () => {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => undefined);
    setAuth('signedOut');
  };

  if (auth === 'checking') return <div className="h-[100dvh] bg-white" />;
  if (auth === 'signedOut') return <LoginPage onSignedIn={() => setAuth('signedIn')} />;
  return <AdminPanel onSignOut={signOut} onExpired={() => setAuth('signedOut')} />;
}

// Field with its label inside the box; the label shrinks to the top once there's text
const LoginField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete: string;
  autoFocus?: boolean;
  trailing?: React.ReactNode;
}> = ({ label, value, onChange, type = 'text', autoComplete, autoFocus, trailing }) => (
  <label className="relative block">
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoComplete={autoComplete}
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      autoFocus={autoFocus}
      placeholder=" "
      className={`peer h-[clamp(2.9rem,7.5dvh,3.4rem)] w-full rounded-2xl border border-[#185844]/20 bg-white px-4 pb-1.5 pt-5 text-base text-[#102F27] outline-none transition-colors focus:border-[#185844] focus:ring-2 focus:ring-[#185844]/15 ${trailing ? 'pr-12' : ''}`}
    />
    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-stone-400 transition-all peer-focus:top-[0.95rem] peer-focus:text-[11px] peer-[:not(:placeholder-shown)]:top-[0.95rem] peer-[:not(:placeholder-shown)]:text-[11px]">
      {label}
    </span>
    {trailing}
  </label>
);

const LoginPage: React.FC<{ onSignedIn: () => void }> = ({ onSignedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return setError('Please enter your username and password.');
    try {
      setBusy(true);
      setError('');
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      if (response.ok) return onSignedIn();
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      setError(data.error || 'Could not sign in. Please try again.');
      setPassword('');
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    // Full-screen, app-style: "Admin Portal / Kevin and Arlei" title over the form, fits one screen without scrolling
    <div className="flex h-[100dvh] flex-col items-center justify-center overflow-hidden bg-white px-5 pb-[max(clamp(0.5rem,2.5dvh,1.25rem),env(safe-area-inset-bottom))] pt-[max(clamp(0.5rem,2dvh,0.9rem),env(safe-area-inset-top))] text-[#102F27] font-sans">
      <motion.form
        onSubmit={submit}
        noValidate
        className="flex min-h-0 w-full max-w-[22rem] flex-1 flex-col justify-center py-[clamp(0.5rem,4dvh,2.5rem)]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* Title in place of a logo */}
        <div className="mb-[clamp(1rem,7dvh,3.5rem)] shrink-0 text-center">
          <h1 className="font-serif text-[clamp(1.75rem,5.5dvh,2.5rem)] leading-none text-[#102F27]">Admin Portal</h1>
          <p className="mt-[clamp(0.25rem,1dvh,0.5rem)] text-[clamp(0.625rem,1.5dvh,0.75rem)] font-semibold uppercase tracking-[0.3em] text-[#78947F]">
            Kevin and Arlei
          </p>
        </div>

        <div className="space-y-[clamp(0.375rem,1.3dvh,0.625rem)]">
          <LoginField label="Username" value={username} onChange={setUsername} autoComplete="username" autoFocus />
          <LoginField
            label="Password"
            value={password}
            onChange={setPassword}
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            trailing={
              password && (
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-stone-400 hover:bg-[#E9F1EC] hover:text-[#185844] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                </button>
              )
            }
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="mt-[clamp(0.5rem,1.5dvh,0.75rem)] h-[clamp(2.75rem,6.5dvh,3rem)] w-full shrink-0 rounded-full bg-[#185844] text-[15px] font-semibold text-white hover:bg-[#102F27] disabled:opacity-60 transition-colors cursor-pointer"
        >
          {busy ? 'Logging in…' : 'Log in'}
        </button>

        {error && (
          <p role="alert" className="mt-[clamp(0.5rem,2dvh,1rem)] text-center text-sm text-red-600">
            {error}
          </p>
        )}
      </motion.form>

    </div>
  );
};

function AdminPanel({ onSignOut, onExpired }: { onSignOut: () => void; onExpired: () => void }) {
  const [rsvps, setRsvps] = useState<RsvpRow[]>([]);
  const [error, setError] = useState('');
  // RSVP waiting for confirmation in the remove pop-up
  const [pendingDelete, setPendingDelete] = useState<RsvpRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  // Archive (soft-deleted RSVPs) panel
  const [archiveOpen, setArchiveOpen] = useState(false);
  // Entourage panel (names from weddingData.ts, colored by their RSVP)
  const [entourageOpen, setEntourageOpen] = useState(false);
  const [archived, setArchived] = useState<RsvpRow[]>([]);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [query, setQuery] = useState('');
  const [archiveQuery, setArchiveQuery] = useState('');
  const [archiveFilter, setArchiveFilter] = useState<'all' | 'yes' | 'no'>('all');
  // Edit pop-up
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const attendingCount = rsvps.filter((g) => g.isAttending === 'yes').length;
  const declinedCount = rsvps.filter((g) => g.isAttending === 'no').length;

  // Soft delete (sets active = 0 on the server; the row stays in the database)
  const confirmDelete = async () => {
    const g = pendingDelete;
    if (!g) return;
    try {
      setDeleting(true);
      const response = await adminFetch(`/api/rsvps/${g.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      setRsvps((prev) => prev.filter((r) => r.id !== g.id));
      setPendingDelete(null);
    } catch (err) {
      if (err instanceof SignedOut) return onExpired();
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
    });
  };

  const saveEdit = async () => {
    const d = editDraft;
    if (!d) return;
    if (!d.name.trim()) return setEditError('Please enter a name.');
    try {
      setSaving(true);
      setEditError('');
      const response = await adminFetch(`/api/rsvps/${d.row.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: d.name,
          contact: d.contact,
          isAttending: d.isAttending,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error((data as { error?: string }).error || 'Could not save the changes.');
      const row = data as RsvpRow;
      setRsvps((prev) => prev.map((r) => (r.id === row.id ? row : r)));
      setEditDraft(null);
    } catch (err) {
      if (err instanceof SignedOut) return onExpired();
      setEditError(err instanceof Error ? err.message : 'Could not save the changes.');
    } finally {
      setSaving(false);
    }
  };

  // Pop-up backdrops are a plain tint, no backdrop-blur: blurring the whole page behind the archive table
  // made every hover/scroll repaint the blur, so it flickered and lagged
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
      const response = await adminFetch('/api/rsvps/archived');
      if (!response.ok) throw new Error('Failed to fetch archive');
      setArchived(await response.json());
    } catch (err) {
      if (err instanceof SignedOut) return onExpired();
      console.error(err);
    } finally {
      setArchiveLoading(false);
    }
  };

  // Recover an archived RSVP back into the list (the socket event updates every open admin)
  const restoreRsvp = async (g: RsvpRow) => {
    try {
      setRestoringId(g.id);
      const response = await adminFetch(`/api/rsvps/${g.id}/restore`, { method: 'PATCH' });
      if (!response.ok) throw new Error('Failed to restore');
      const row = (await response.json()) as RsvpRow;
      setArchived((prev) => prev.filter((r) => r.id !== g.id));
      setRsvps((prev) =>
        (prev.some((r) => r.id === row.id) ? prev : [...prev, row]).sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
      );
    } catch (err) {
      if (err instanceof SignedOut) return onExpired();
      console.error(err);
      setError('Could not restore that RSVP. Please try again.');
    } finally {
      setRestoringId(null);
    }
  };

  const fetchRsvps = async () => {
    try {
      setError('');
      const response = await adminFetch('/api/rsvps');
      if (!response.ok) throw new Error('Failed to fetch data');
      setRsvps(await response.json());
    } catch (err) {
      if (err instanceof SignedOut) return onExpired();
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
    // The server refuses the socket when the session has expired
    socket.on('connect_error', (err) => {
      if (err.message === 'unauthorized') onExpired();
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

  const filteredRsvps = rsvps.filter(
    (g) => (statusFilter === 'all' || g.isAttending === statusFilter) && matchesQuery(g, query)
  );
  const listLength = filteredRsvps.length;

  const pager = usePager(listLength, `${statusFilter}|${query}`);
  const displayedRsvps = filteredRsvps.slice(pager.start, pager.end);

  const filteredArchived = archived.filter(
    (g) => (archiveFilter === 'all' || g.isAttending === archiveFilter) && matchesQuery(g, archiveQuery)
  );
  const archivePager = usePager(filteredArchived.length, `${archiveFilter}|${archiveQuery}`);
  const displayedArchived = filteredArchived.slice(archivePager.start, archivePager.end);

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
    const look = active ? selected[tone] : `border-[#185844]/15 bg-white ${onClick ? hover[tone] : ''}`;
    const Tag = onClick ? 'button' : 'div';
    return (
      <Tag
        {...(onClick ? { type: 'button' as const, onClick, 'aria-pressed': active } : {})}
        className={`min-w-0 rounded-xl border px-2.5 py-2 text-left transition-colors sm:rounded-2xl sm:px-4 sm:py-3 ${onClick ? 'cursor-pointer' : ''} ${look}`}
      >
        <p className={`truncate text-[8.5px] uppercase tracking-[0.06em] sm:text-[10px] sm:tracking-[0.25em] ${active ? 'opacity-80' : 'text-stone-500'}`}>
          {/* "Total RSVP" doesn't fit four across on a phone */}
          {label === 'Total RSVP' ? <><span className="sm:hidden">Total</span><span className="hidden sm:inline">{label}</span></> : label}
        </p>
        {/* Cormorant defaults to old-style figures (1 looks like I, 0 like o): force lining digits */}
        <p className="mt-0.5 font-serif text-2xl leading-none lining-nums tabular-nums sm:mt-1 sm:text-3xl">{value}</p>
        {hint && <p className={`mt-1 hidden truncate text-[10px] sm:block ${active ? 'opacity-80' : 'text-stone-500'}`}>{hint}</p>}
      </Tag>
    );
  };

  return (
    // Fits the screen exactly on any device: header, stats and pager stay put, only the list scrolls
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-white text-[#102F27] font-sans">
      <main className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col gap-3 px-[clamp(0.75rem,4vw,1.5rem)] py-3 sm:gap-4 sm:py-5">
        <div className="flex shrink-0 items-center justify-between gap-3">
          <h2 className="font-serif text-[clamp(1.4rem,5vw,2.25rem)] leading-none">Guest RSVPs</h2>
          <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Icon-only on phones so the header fits on one line */}
          <button
            type="button"
            onClick={() => setEntourageOpen(true)}
            aria-label="Entourage"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-[#185844] bg-[#185844] px-2.5 text-[10px] font-semibold uppercase tracking-widest text-white transition-colors hover:border-[#102F27] hover:bg-[#102F27] cursor-pointer sm:px-3.5 sm:text-[11px]"
          >
            <Users className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Entourage</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setArchiveOpen(true);
              fetchArchived();
            }}
            aria-label="Archive"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-[#185844]/30 bg-white px-2.5 text-[10px] font-semibold uppercase tracking-widest text-[#185844] transition-colors hover:bg-[#185844] hover:text-white cursor-pointer sm:px-3.5 sm:text-[11px]"
          >
            <Archive className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Archive</span>
          </button>
          <button
            type="button"
            onClick={onSignOut}
            title="Sign out"
            aria-label="Sign out"
            className="grid h-9 w-9 place-items-center rounded-full border border-[#185844]/15 bg-white text-stone-500 hover:border-[#9B2C2C]/40 hover:text-[#9B2C2C] transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" aria-hidden />
          </button>
          </div>
        </div>

        {/* Stats / filters */}
        <div className="grid shrink-0 grid-cols-3 gap-2 sm:gap-3">
          {statCard('Total RSVP', rsvps.length, statusFilter === 'all', () => setStatusFilter('all'))}
          {statCard('Attending', attendingCount, statusFilter === 'yes', () => setStatusFilter((f) => (f === 'yes' ? 'all' : 'yes')), 'green')}
          {statCard('Declined', declinedCount, statusFilter === 'no', () => setStatusFilter((f) => (f === 'no' ? 'all' : 'no')), 'red')}
        </div>

        <div className="shrink-0">
          <SearchBox value={query} onChange={setQuery} placeholder="Search name or contact" />
        </div>

        {/* List */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#185844]/15 bg-white shadow-[0_8px_30px_rgba(16,47,39,0.06)]">
          {/* Desktop table */}
          {/* Only the rows scroll; the column header stays pinned */}
          <div className={`hidden min-h-0 overflow-auto sm:block ${listLength ? 'flex-1' : ''}`}>
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="sticky top-0 z-10 bg-[#E9F1EC] shadow-[inset_0_-1px_0_rgba(24,88,68,0.18)]">
                <tr>
                  {['Name', 'Status', 'Contact', 'Date', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#185844]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#185844]/10">
                {displayedRsvps.map((g) => (
                  <tr key={g.id} className="hover:bg-[#185844]/[0.04] transition-colors">
                    <td className="px-4 py-2.5 font-medium text-[#102F27]">{g.name}</td>
                    <td className="px-4 py-2.5"><StatusBadge attending={g.isAttending === 'yes'} /></td>
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
          <div className={`min-h-0 overflow-y-auto divide-y divide-[#185844]/10 sm:hidden ${listLength ? 'flex-1' : ''}`}>
            {displayedRsvps.map((g) => (
              <div key={g.id} className="flex items-start justify-between gap-2 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-tight">{g.name}</p>
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
            <p className="grid flex-1 place-items-center px-4 py-10 text-center text-xs uppercase tracking-widest text-stone-500">No RSVPs yet</p>
          )}
          {rsvps.length > 0 && listLength === 0 && (
            <p className="grid flex-1 place-items-center px-4 py-8 text-center text-xs uppercase tracking-widest text-stone-500">{query.trim() ? `No results for “${query.trim()}”.` : 'No guests match this filter.'}</p>
          )}

          {rsvps.length > 0 && <Pager pager={pager} />}
        </div>
      </main>

      {/* Entourage: who in the wedding party has answered */}
      <AnimatePresence>
        {entourageOpen && <AdminEntourage rsvps={rsvps} onClose={() => setEntourageOpen(false)} />}
      </AnimatePresence>

      {/* Archive: removed RSVPs with Restore */}
      <AnimatePresence>
        {archiveOpen && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-[#102F27]/65 p-0 sm:p-4"
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
              className="flex h-[100dvh] w-full max-w-5xl transform-gpu flex-col overflow-hidden sm:h-[85dvh] sm:rounded-3xl bg-white shadow-2xl"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex shrink-0 items-center justify-between gap-3 px-[clamp(1rem,4vw,1.5rem)] pb-3 pt-[max(1rem,env(safe-area-inset-top))]">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-[#78947F]">Removed RSVPs</p>
                  <h3 id="archive-title" className="mt-1 font-serif text-2xl text-[#102F27]">
                    Archive <span className="text-stone-400 lining-nums tabular-nums">({archived.length})</span>
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

              <div className="shrink-0 px-[clamp(1rem,4vw,1.5rem)] pb-3">
                <SearchBox value={archiveQuery} onChange={setArchiveQuery} placeholder="Search name or contact" />
                {/* Status filter chips with counts */}
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {(
                    [
                      ['all', 'All', archived.length],
                      ['yes', 'Attending', archived.filter((g) => g.isAttending === 'yes').length],
                      ['no', 'Declined', archived.filter((g) => g.isAttending === 'no').length],
                    ] as const
                  ).map(([key, label, count]) => {
                    const active = archiveFilter === key;
                    const on = key === 'yes' ? 'border-[#185844] bg-[#185844] text-white' : key === 'no' ? 'border-[#9B2C2C] bg-[#9B2C2C] text-white' : 'border-[#102F27] bg-[#102F27] text-[#F2EBDD]';
                    return (
                      <button
                        key={key}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setArchiveFilter(key)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                          active ? on : 'border-[#185844]/15 bg-white text-stone-600 hover:border-[#102F27]/30'
                        }`}
                      >
                        {label}
                        <span className={`tabular-nums ${active ? 'opacity-80' : 'text-stone-400'}`}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Same layout as the main list: table on wider screens, cards on phones */}
              <div className="mx-[clamp(0.75rem,4vw,1.5rem)] mb-[max(0.75rem,env(safe-area-inset-bottom))] flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#185844]/15 bg-white shadow-[0_8px_30px_rgba(16,47,39,0.06)] sm:mb-5">
                <div className={`hidden min-h-0 overflow-auto sm:block ${filteredArchived.length ? 'flex-1' : ''}`}>
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="sticky top-0 z-10 bg-[#E9F1EC] shadow-[inset_0_-1px_0_rgba(24,88,68,0.18)]">
                      <tr>
                        {['Name', 'Status', 'Contact', 'Date', ''].map((h) => (
                          <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-[#185844]">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#185844]/10">
                      {displayedArchived.map((g) => (
                        <tr key={g.id} className="hover:bg-[#185844]/[0.04] transition-colors">
                          <td className="px-4 py-2.5 font-medium text-[#102F27]">{g.name}</td>
                          <td className="px-4 py-2.5"><StatusBadge attending={g.isAttending === 'yes'} /></td>
                          <td className="px-4 py-2.5 font-mono text-stone-500">{formatContact(g.contact)}</td>
                          <td className="px-4 py-2.5 text-xs text-stone-500">{formatDate(g.timestamp)}</td>
                          <td className="px-3 py-2.5 text-right">
                            <RestoreButton busy={restoringId === g.id} onClick={() => restoreRsvp(g)} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className={`min-h-0 overflow-y-auto divide-y divide-[#185844]/10 sm:hidden ${filteredArchived.length ? 'flex-1' : ''}`}>
                  {displayedArchived.map((g) => (
                    <div key={g.id} className="flex items-start justify-between gap-2 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        {/* Status right after the name */}
                        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium leading-tight">
                          {g.name}
                          <StatusBadge attending={g.isAttending === 'yes'} small />
                        </p>
                        <p className="mt-0.5 font-mono text-xs text-stone-500">{formatContact(g.contact)}</p>
                      </div>
                      <div className="flex shrink-0 self-center">
                        <RestoreButton busy={restoringId === g.id} onClick={() => restoreRsvp(g)} iconOnly />
                      </div>
                    </div>
                  ))}
                </div>

                {!archiveLoading && archived.length === 0 && (
                  <p className="grid flex-1 place-items-center px-6 py-12 text-center text-xs uppercase tracking-widest text-stone-500">The archive is empty</p>
                )}
                {archiveLoading && archived.length === 0 && (
                  <p className="grid flex-1 place-items-center px-6 py-12 text-center text-xs uppercase tracking-widest text-stone-400">Loading…</p>
                )}
                {archived.length > 0 && filteredArchived.length === 0 && (
                  <p className="grid flex-1 place-items-center px-4 py-8 text-center text-xs uppercase tracking-widest text-stone-500">{archiveQuery.trim() ? `No results for “${archiveQuery.trim()}”.` : 'Nothing here for this filter.'}</p>
                )}
                {archived.length > 0 && <Pager pager={archivePager} />}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit RSVP pop-up */}
      <AnimatePresence>
        {editDraft && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-[#102F27]/65 p-0 sm:p-4"
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
                              : 'border-[#185844]/15 text-stone-600 hover:bg-[#E9F1EC]'
                          }`}
                        >
                          {v === 'yes' ? 'Attending' : 'Declined'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {editError && <p className="text-xs text-red-600">{editError}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-stone-100 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setEditDraft(null)}
                  disabled={saving}
                  className="rounded-full border border-[#185844]/15 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-600 hover:bg-[#E9F1EC] disabled:opacity-50 transition-colors cursor-pointer"
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
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#102F27]/65 p-4"
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
                This RSVP will be moved to the Archive. You can restore it anytime.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  autoFocus
                  onClick={() => setPendingDelete(null)}
                  disabled={deleting}
                  className="rounded-full border border-[#185844]/15 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-600 hover:bg-[#E9F1EC] disabled:opacity-50 transition-colors cursor-pointer"
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
