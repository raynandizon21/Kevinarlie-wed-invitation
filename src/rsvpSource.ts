/** Session key: how the guest reached RSVP — `web` (invite) vs `qr` (principal sponsor QR link). */
const RSVP_SOURCE_SESSION_KEY = 'kevinarlei_rsvp_source';

export type RsvpSubmitSource = 'web' | 'qr';

/** True when the URL is the sponsor QR deep link (`?view=rsvp` or `?rsvp=1`). */
export function isRsvpQrLink(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('view') === 'rsvp' || params.get('rsvp') === '1';
}

function setSource(value: RsvpSubmitSource): void {
  try {
    sessionStorage.setItem(RSVP_SOURCE_SESSION_KEY, value);
  } catch {
    /* ignore */
  }
}

/** Call once on load: QR deep link => `qr`, anything else => `web`. */
export function initRsvpSource(): void {
  if (typeof window === 'undefined') return;
  setSource(isRsvpQrLink() ? 'qr' : 'web');
}

/** Call when a guest opens RSVP from the invite menu. */
export function markRsvpSourceWeb(): void {
  setSource('web');
}

/** Value to send with POST /api/rsvps (defaults to web). */
export function getRsvpSourceForSubmit(): RsvpSubmitSource {
  if (typeof window === 'undefined') return 'web';
  try {
    const v = sessionStorage.getItem(RSVP_SOURCE_SESSION_KEY);
    if (v === 'qr' || v === 'web') return v;
  } catch {
    /* ignore */
  }
  return isRsvpQrLink() ? 'qr' : 'web';
}

/**
 * Full URL encoded in the admin QR (invite site + RSVP deep link).
 * Set `VITE_PUBLIC_INVITE_URL` when the invite is hosted on a different origin.
 */
export function getPublicInviteRsvpUrl(): string {
  const explicit = import.meta.env.VITE_PUBLIC_INVITE_URL?.trim();
  if (explicit) return `${explicit.replace(/\/$/, '')}/?view=rsvp`;
  return `${window.location.origin}/?view=rsvp`;
}
