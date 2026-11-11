import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { TimelineItem } from '../types/wedding';
import { getRsvpSourceForSubmit } from '../rsvpSource';
import { FAQS_DATA } from '../data/weddingData';
// One illustrated board with every guest look (men and women together), on a soft cream background
import guestEnsembleImg from '../assets/images/Elegant Wedding Guest Ensemble.png';

// Pieces shared by the phone page (MobileSite) and the desktop site (DesktopSite):
// attire boards + colors, timeline icons, the RSVP form and the FAQ accordion.

const easeOut = [0.16, 1, 0.3, 1] as const;

// Google Maps directions link to a venue. With no origin given, Google Maps starts from the guest's current
// location, so tapping it opens turn-by-turn directions straight to the venue. Takes the venue's map link
// (https://maps.google.com/?q=...) and reuses its search text as the destination.
export const directionsUrl = (mapUrl: string) => {
  let dest = mapUrl;
  try {
    dest = new URL(mapUrl).searchParams.get('q') ?? mapUrl;
  } catch {
    /* not a URL: use as is */
  }
  return `https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=${encodeURIComponent(dest)}`;
};

// Guest attire inspiration board, shown under the dress code on phone and desktop
export const GUEST_ATTIRE = [
  {
    label: 'Guests',
    img: guestEnsembleImg,
    alt: 'Guest attire: Filipiniana inspired dresses and suits for the ladies, short or long sleeve Barong Tagalog for the gentlemen',
  },
];

// Guest attire colors, taken from the swatches on the couple's attire boards
export const DRESS_CODE = [
  { name: 'Caramel', hex: '#C19980' },
  { name: 'Nude', hex: '#D3AA94' },
  { name: 'Dusty Rose', hex: '#D3B7AC' },
  { name: 'Blush', hex: '#EDD5C7' },
];

// Hand-drawn style line icons (48x48, stroke = currentColor) matching the printed timeline reference
type LineIconProps = { className?: string };
const LineIcon: React.FC<LineIconProps & { children: React.ReactNode }> = ({ className, children }) => (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    {children}
  </svg>
);
const burst = (cx: number, cy: number, r: number, n: number, inner = r * 0.35) =>
  Array.from({ length: n }, (_, k) => {
    const t = (k / n) * Math.PI * 2;
    return <path key={k} d={`M${cx + Math.cos(t) * inner} ${cy + Math.sin(t) * inner} L${cx + Math.cos(t) * r} ${cy + Math.sin(t) * r}`} />;
  });

const RingsIcon: React.FC<LineIconProps> = ({ className }) => (
  <LineIcon className={className}>
    <circle cx="18" cy="30" r="10" /><circle cx="18" cy="30" r="7.5" />
    <circle cx="30" cy="30" r="10" /><circle cx="30" cy="30" r="7.5" />
    <path d="M26 13 L28 10 H34 L36 13 L31 18 Z M26 13 H36 M29 10 L31 18 M33 10 L31 18" />
  </LineIcon>
);
const CameraIcon: React.FC<LineIconProps> = ({ className }) => (
  <LineIcon className={className}>
    <rect x="6" y="15" width="36" height="24" rx="3" />
    <path d="M17 15 L20 10 H28 L31 15" />
    <circle cx="24" cy="27" r="7.5" /><circle cx="24" cy="27" r="4.5" />
    <path d="M10 15 V12 H14 V15 M35 19 H38" />
  </LineIcon>
);
const DinnerIcon: React.FC<LineIconProps> = ({ className }) => (
  <LineIcon className={className}>
    <circle cx="24" cy="24" r="11" /><circle cx="24" cy="24" r="8" />
    <path d="M6 10 V17 M8.5 10 V17 M11 10 V17 M6 17 Q8.5 21 11 17 M8.5 19 V38" />
    <path d="M41 38 V24 M41 10 Q37 14 37 22 Q37 24 41 24 Z" />
  </LineIcon>
);
const CakeIcon: React.FC<LineIconProps> = ({ className }) => (
  <LineIcon className={className}>
    <path d="M24 6 V12 M24 6 Q22.5 4 24 2.5 Q25.5 4 24 6" />
    <rect x="16" y="12" width="16" height="8" rx="1" />
    <rect x="11" y="20" width="26" height="9" rx="1" />
    <rect x="7" y="29" width="34" height="10" rx="1" />
    <path d="M16 15.5 Q18 17.5 20 15.5 T24 15.5 T28 15.5 T32 15.5 M11 23.5 Q13.5 26 16 23.5 T21 23.5 T26 23.5 T31 23.5 T37 23.5 M7 33 Q10 35.5 13 33 T19 33 T25 33 T31 33 T37 33 T41 33 M4 42 H44" />
  </LineIcon>
);
const NoteIcon: React.FC<LineIconProps> = ({ className }) => (
  <LineIcon className={className}>
    <ellipse cx="17" cy="36" rx="5" ry="3.8" transform="rotate(-20 17 36)" />
    <path d="M21.5 34.5 V8 Q24 14 31 16 Q37 18 34 26" />
    <path d="M21.5 15 Q25 20 31 22" />
  </LineIcon>
);
const BuffetIcon: React.FC<LineIconProps> = ({ className }) => (
  <LineIcon className={className}>
    <path d="M9 33 A15 15 0 0 1 39 33 Z" />
    <circle cx="24" cy="15.5" r="2" />
    <path d="M5 33 H43 M8 37 H40 M15 26 A9 9 0 0 1 20 21" />
  </LineIcon>
);
const FireworksIcon: React.FC<LineIconProps> = ({ className }) => (
  <LineIcon className={className}>
    {burst(22, 15, 11, 14)}
    {burst(37, 25, 7, 10)}
    {burst(12, 31, 6, 9)}
    <path d="M22 26 Q21 34 23 44 M37 32 Q36 38 37 44 M12 37 Q12 41 13 44" />
  </LineIcon>
);
const CarriageIcon: React.FC<LineIconProps> = ({ className }) => (
  <LineIcon className={className}>
    <rect x="11" y="7" width="26" height="31" rx="4" />
    <rect x="14.5" y="11" width="19" height="12" rx="1.5" />
    <circle cx="17" cy="31" r="2" /><circle cx="31" cy="31" r="2" />
    <path d="M21 31 H27 M11 14 H8 V20 M37 14 H40 V20 M14 38 V42 H18 V38 M30 38 V42 H34 V38" />
  </LineIcon>
);

const AssemblyIcon: React.FC<LineIconProps> = ({ className }) => (
  <LineIcon className={className}>
    <circle cx="24" cy="15" r="5.5" />
    <path d="M13 38 Q13 25 24 25 Q35 25 35 38" />
    <circle cx="10.5" cy="19" r="4" /><circle cx="37.5" cy="19" r="4" />
    <path d="M3 35 Q3 26.5 10.5 26.5 Q13.5 26.5 15.5 28 M45 35 Q45 26.5 37.5 26.5 Q34.5 26.5 32.5 28 M3 41 H45" />
  </LineIcon>
);

const TIMELINE_ICONS: Record<TimelineItem['icon'], React.FC<LineIconProps>> = {
  rings: RingsIcon,
  camera: CameraIcon,
  dinner: DinnerIcon,
  cake: CakeIcon,
  dance: NoteIcon,
  buffet: BuffetIcon,
  fireworks: FireworksIcon,
  carriage: CarriageIcon,
  church: RingsIcon,
  cocktail: DinnerIcon,
  party: NoteIcon,
  assembly: AssemblyIcon,
};

/** Line icon for a timeline event (shared with the desktop timeline). */
export const TimelineIcon: React.FC<LineIconProps & { icon: TimelineItem['icon'] }> = ({ icon, className }) => {
  const Icon = TIMELINE_ICONS[icon] ?? RingsIcon;
  return <Icon className={className} />;
};

// --- RSVP form (shared by the mobile RSVP page and the desktop site) ---
// Saves to the RSVP API (/api/rsvps), same flow as the wedding-invitation project:
// guests from the invite submit as `web`; principal sponsors from the QR link submit as `qr`.
// No plus-ones: each guest RSVPs for themselves.
type GuestChoice = '' | 'yes' | 'no';

// Big tap-friendly choice for the RSVP form (a styled radio)
const Choice: React.FC<{ name: string; checked: boolean; locked: boolean; onChange: () => void; children: React.ReactNode }> = ({
  name,
  checked,
  locked,
  onChange,
  children,
}) => (
  <label
    className={`flex min-h-[3rem] cursor-pointer items-center justify-center rounded-xl border px-2 py-2 text-center text-[11px] font-medium uppercase leading-snug tracking-[0.15em] transition-colors ${
      checked ? 'border-[#185844] bg-[#185844] text-white' : 'border-[#78947F]/35 bg-white/70 text-[#102F27] hover:border-[#185844]/50'
    } ${locked ? 'pointer-events-none opacity-70' : ''}`}
  >
    <input type="radio" name={name} disabled={locked} checked={checked} onChange={onChange} className="sr-only" />
    {children}
  </label>
);

/** Countdown after an RSVP before the page goes back to the beginning */
export const RETURN_SECONDS = 5;

export const RsvpForm: React.FC<{
  /** Mobile: called 2s after submit (popup shown). Desktop: omitted, thank-you shows inline. */
  onDone?: () => void;
  /** Inline thank-you only: called after a RETURN_SECONDS countdown (phone page scrolls back to the top) */
  onReturn?: () => void;
  className?: string;
}> = ({ onDone, onReturn, className = '' }) => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [isAttending, setIsAttending] = useState<GuestChoice>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  // Seconds left before onReturn; null = no countdown running
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  // Latest onReturn in a ref: the phone page re-renders every second (wedding countdown), which must not
  // restart this countdown
  const onReturnRef = useRef(onReturn);
  onReturnRef.current = onReturn;
  const hasInlineReturn = !onDone && Boolean(onReturn);

  // Start once, when the RSVP is sent
  useEffect(() => {
    if (submitted && hasInlineReturn) setSecondsLeft(RETURN_SECONDS);
  }, [submitted, hasInlineReturn]);
  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      setSecondsLeft(null);
      onReturnRef.current?.();
      return;
    }
    const t = window.setTimeout(() => setSecondsLeft((s) => (s === null ? null : s - 1)), 1000);
    return () => window.clearTimeout(t);
  }, [secondsLeft]);

  // Same ref trick for onDone (the desktop page also re-renders every second; that used to restart this
  // 2-second timer forever, so the thank-you page never came)
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const hasOnDone = Boolean(onDone);
  useEffect(() => {
    if (!submitted || !hasOnDone) return;
    const t = window.setTimeout(() => onDoneRef.current?.(), 2000);
    return () => window.clearTimeout(t);
  }, [submitted, hasOnDone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !isAttending) {
      setError('Please enter your full name and choose attendance.');
      return;
    }

    const source = getRsvpSourceForSubmit();
    const body = { name: name.trim(), contact: contact.trim(), isAttending, source };

    try {
      setSubmitting(true);
      // Relative URL so it works on real phones (Vite proxies /api to the RSVP server)
      const response = await fetch('/api/rsvps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || `Request failed with status ${response.status}`);
      }

      setSubmitted(true);
    } catch (err) {
      console.error('Failed to submit RSVP:', err);
      setError(err instanceof Error ? err.message : 'Sorry, there was an error submitting your RSVP. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const locked = submitted || submitting;
  // 16px text on inputs so iPhones don't zoom in while typing
  const inputClass =
    'w-full rounded-xl border border-[#78947F]/35 bg-white/70 px-3.5 py-2.5 text-base text-[#102F27] focus:outline-none focus:ring-2 focus:ring-[#185844]/25 focus:border-[#185844] placeholder:text-[#78947F]/70 disabled:opacity-60';
  const labelClass = 'block text-[10px] uppercase tracking-[0.25em] text-[#78947F]';

  return (
    <>
      <form onSubmit={handleSubmit} className={`space-y-5 ${className}`}>
        <div className="space-y-1.5">
          <label className={labelClass}>Full Name</label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Your name" autoComplete="name" disabled={locked} />
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>
            Contact Number <span className="normal-case tracking-normal text-[#78947F]/80">(optional)</span>
          </label>
          <input type="tel" inputMode="tel" value={contact} onChange={(e) => setContact(e.target.value)} className={inputClass} placeholder="09xx xxx xxxx" autoComplete="tel" disabled={locked} />
        </div>

        <div className="space-y-2">
          <p className={labelClass}>Kindly let us know</p>
          <div className="grid grid-cols-2 gap-2">
            {([
              ['yes', 'Accepts with pleasure'],
              ['no', 'Declines with regret'],
            ] as const).map(([value, label]) => (
              <Choice
                locked={locked}
                key={value}
                name="attendance"
                checked={isAttending === value}
                onChange={() => setIsAttending(value)}
              >
                {label}
              </Choice>
            ))}
          </div>
        </div>

        {error && <p className="-mt-1 text-center text-[11px] font-semibold text-[#185844]">{error}</p>}

        {submitted && !onDone ? (
          <div className="rounded-2xl bg-[#185844]/5 border border-[#185844]/20 px-5 py-5 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-[#78947F] mb-1">Thank you</p>
            <p className="font-serif text-2xl text-[#102F27]">Response sent</p>
            {secondsLeft !== null && (
              <p className="mt-2 text-[11px] text-[#78947F]" aria-live="polite">
                Returning to the top in <span className="font-semibold tabular-nums text-[#185844]">{secondsLeft}</span>…
              </p>
            )}
          </div>
        ) : (
          <button
            type="submit"
            disabled={!isAttending || locked}
            className="mt-4 w-full inline-flex items-center justify-center rounded-full bg-[#185844] px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-md hover:bg-[#102F27] disabled:bg-[#78947F]/45 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {submitting || submitted ? 'Submitting…' : 'Submit RSVP'}
          </button>
        )}
      </form>

      {submitted && onDone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-30 flex items-center justify-center bg-[#102F27]/60 px-6 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut }}
            className="w-full max-w-xs rounded-[1.75rem] bg-white px-6 pb-7 pt-8 text-center text-[#102F27] shadow-2xl"
          >
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#185844] text-white">
              <Check className="h-6 w-6" strokeWidth={2} />
            </span>
            <p className="mt-4 font-['Parisienne'] text-[2.4rem] leading-none">Thank you!</p>
            <p className="mt-2 font-['Oswald'] text-[11px] font-light uppercase tracking-[0.35em] pl-[0.35em] text-[#185844]">Response sent</p>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

// --- FAQS: forest band with thin gold diagonals at the top, an ivory card overlapping it with
// "+ FAQs" and an accordion (round +/- toggles). Numbered answer lines ("1. …") show as steps.
const FaqAnswer: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n').filter(Boolean);
  const isStep = (l: string) => /^\d+\.\s/.test(l);
  const steps = lines.filter(isStep);
  return (
    <div className="text-[14px] leading-[1.7] text-[#102F27]/75 [&>p+p]:mt-2.5">
      {lines
        .filter((l) => !isStep(l))
        .map((l) => (
          <p key={l}>{l}</p>
        ))}
      {steps.length > 0 && (
        <ol className="mt-2.5 space-y-2">
          {steps.map((l, i) => (
            <li key={l} className="flex gap-2.5">
              <span className="w-3 shrink-0 font-serif text-[1.05rem] font-semibold italic leading-[1.45] text-[#185844] lining-nums">{i + 1}</span>
              <span>{l.replace(/^\d+\.\s*/, '')}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export const FaqAccordion: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <ul className="mt-5 divide-y divide-[#185844]/15 border-t border-[#185844]/15">
      {FAQS_DATA.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <li key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 py-[1.1rem] text-left cursor-pointer"
            >
              <span className="font-serif text-[1.15rem] font-semibold leading-snug text-[#102F27]">{item.question}</span>
              <span
                aria-hidden
                className={`relative grid h-7 w-7 shrink-0 place-items-center rounded-full transition-colors duration-300 ${
                  isOpen ? 'bg-[#102F27]' : 'bg-[#185844]'
                }`}
              >
                <span className="absolute h-[1.5px] w-3 rounded-full bg-white" />
                <span
                  className={`absolute h-3 w-[1.5px] rounded-full bg-white transition-transform duration-300 ${isOpen ? 'scale-y-0' : 'scale-y-100'}`}
                />
              </span>
            </button>
            <motion.div
              initial={false}
              animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
              transition={{ duration: 0.35, ease: easeOut }}
              className="overflow-hidden"
            >
              <div className="pb-5 pr-9">
                <FaqAnswer text={item.answer} />
              </div>
            </motion.div>
          </li>
        );
      })}
    </ul>
  );
};
