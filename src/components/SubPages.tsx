import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { ChevronLeft, ChevronDown, Navigation, Plus, X } from 'lucide-react';
import { EntourageCategory, TimelineItem } from '../types/wedding';
import { getRsvpSourceForSubmit } from '../rsvpSource';
import { FAQS_DATA } from '../data/weddingData';
import jardinVenueImg from '../assets/images/jardin_venue_1791676573787.jpg';
import tablescapeImg from '../assets/images/wedding_tablescape_candlelight_1791602927298.jpg';
import entourageTitleImg from '../assets/images/the_entourage_title.png';

// Page layout copied from the wedding-invitation templates (sticky Back + centered column),
// widened on desktop so it fits both mobile and large screens.
const PageShell: React.FC<{ onBack: () => void; wide?: boolean; dark?: boolean; children: React.ReactNode }> = ({
  onBack,
  wide = false,
  dark = false,
  children,
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5, ease: 'easeInOut' }}
    className={`min-h-[100dvh] w-full overflow-x-hidden ${
      dark
        ? 'bg-[#185844] text-[#F2EBDD]'
        : 'bg-[#F2EBDD] text-[#102F27]'
    }`}
  >
    <div className={`sticky top-0 z-20 backdrop-blur-sm ${dark ? 'bg-[#185844]/95' : 'bg-[#F2EBDD]/95'} px-[clamp(1rem,4vw,1.5rem)] pt-[max(1.25rem,env(safe-area-inset-top,0px))] pb-2`}>
      <div className={`mx-auto w-full ${wide ? 'max-w-md md:max-w-3xl' : 'max-w-md md:max-w-xl'}`}>
        <button
          type="button"
          onClick={onBack}
          className={`flex items-center text-xs uppercase tracking-widest hover:text-[#B08A4F] transition-colors cursor-pointer ${
            dark ? 'text-[#F2EBDD]' : 'text-[#102F27]'
          }`}
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </button>
      </div>
    </div>
    <div className="px-[clamp(1rem,4vw,1.5rem)] pt-2 pb-[max(5rem,env(safe-area-inset-bottom,0px)+4rem)]">
      <div className={`mx-auto min-w-0 w-full ${wide ? 'max-w-md md:max-w-3xl' : 'max-w-md md:max-w-xl'}`}>
        {children}
      </div>
    </div>
  </motion.div>
);

const PageTitle: React.FC<{ children: React.ReactNode; sub?: string }> = ({ children, sub }) => (
  <div className="mb-8 text-center">
    <h2 className="font-serif text-[clamp(1.75rem,6vw,2.25rem)] font-semibold uppercase tracking-wide text-[#102F27] leading-tight">
      {children}
    </h2>
    {sub && <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-[#78947F]">{sub}</p>}
  </div>
);

// --- DETAILS: Ceremony & Reception + Dress Code ---
interface DetailsPageProps {
  onBack: () => void;
  ceremonyTime: string;
  churchName: string;
  churchAddress: string;
  receptionName: string;
  receptionAddress: string;
  mapsChurchUrl: string;
  mapsReceptionUrl: string;
}

export const DRESS_CODE = [
  { name: 'Sage', hex: '#78947F' },
  { name: 'Emerald', hex: '#185844' },
  { name: 'Forest', hex: '#102F27' },
  { name: 'Antique Gold', hex: '#B08A4F' },
];

export const DetailsPage: React.FC<DetailsPageProps> = ({
  onBack,
  ceremonyTime,
  churchName,
  churchAddress,
  receptionName,
  receptionAddress,
  mapsChurchUrl,
  mapsReceptionUrl,
}) => {
  const venues = [
    { label: 'Ceremony', name: churchName, address: churchAddress, img: jardinVenueImg, url: mapsChurchUrl, accent: 'border-[#B08A4F]', time: ceremonyTime },
    { label: 'Reception', name: receptionName, address: receptionAddress, img: tablescapeImg, url: mapsReceptionUrl, accent: 'border-[#185844]' },
  ];

  return (
    <PageShell onBack={onBack} wide>
      <PageTitle>Ceremony &amp; Reception</PageTitle>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6 mb-12">
        {venues.map((v) => (
          <div key={v.label} className="flex flex-col rounded-2xl bg-white p-4 shadow-[0_8px_30px_rgba(16,47,39,0.06)]">
            <h3 className={`font-serif text-xl text-[#102F27] mb-3 border-l-2 ${v.accent} pl-2`}>{v.label}</h3>
            <img src={v.img} alt={v.name} className="w-full aspect-[4/3] object-cover rounded-xl mb-3" />
            <p className="text-sm text-[#102F27] leading-relaxed mb-4">
              <strong>{v.name}</strong>
              <br />
              {v.address}
              {v.time && (
                <>
                  <br />
                  {v.time}
                </>
              )}
            </p>
            <a
              href={v.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border border-stone-200 bg-white text-[#102F27] hover:border-[#185844] transition-colors text-sm font-medium"
            >
              <Navigation className="w-4 h-4 text-[#185844]" />
              Get directions
            </a>
          </div>
        ))}
      </div>

      {/* Dress Code */}
      <div className="flex flex-col items-center text-center pt-8 border-t border-[#102F27]/10">
        <h2 className="font-serif text-3xl text-[#102F27] mb-2">Dress Code</h2>
        <p className="text-[11px] uppercase tracking-[0.25em] text-[#78947F] mb-8">Formal attire</p>
        <div className="grid grid-cols-4 gap-3 sm:gap-8 w-full max-w-md">
          {DRESS_CODE.map((c) => (
            <div key={c.name} className="flex flex-col items-center gap-3 min-w-0">
              <div
                className="w-full max-w-16 aspect-square rounded-full shadow-md border border-black/10"
                style={{ backgroundColor: c.hex }}
              />
              <span className="uppercase tracking-widest text-[10px] font-medium text-[#102F27]">{c.name}</span>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
};

// --- TIMELINE: printed wedding-program look inside a gold arch.
// One screen, no scrolling: sizes follow the screen height (dvh) so it fits any phone.
export const TimelinePage: React.FC<{ onBack: () => void; timeline: TimelineItem[] }> = ({ onBack, timeline }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.6, ease: 'easeInOut' }}
    className="flex h-[100dvh] w-full flex-col overflow-hidden bg-[#F2EBDD] text-[#102F27] px-[clamp(1rem,5vw,1.5rem)] pt-[max(1rem,env(safe-area-inset-top,0px))] pb-[max(1.25rem,env(safe-area-inset-bottom,0px))]"
  >
    <button
      type="button"
      onClick={onBack}
      className="flex shrink-0 items-center self-start text-xs uppercase tracking-widest hover:text-[#B08A4F] transition-colors cursor-pointer"
    >
      <ChevronLeft className="w-4 h-4 mr-1" /> Back
    </button>

    {/* Gold arch (outer line + faint inner line) framing the whole program */}
    <div className="relative mx-auto mt-[1.5dvh] flex w-full max-w-[22rem] min-h-0 flex-1 flex-col rounded-t-[999px] border border-[#B08A4F]/55 px-[clamp(1rem,5vw,1.75rem)] pb-[2.5dvh] pt-[clamp(2.25rem,9dvh,6rem)]">
      <div className="pointer-events-none absolute inset-[6px] rounded-t-[999px] border border-[#B08A4F]/20" />

      <div className="relative shrink-0 text-center">
        <p className="font-['Parisienne'] text-[clamp(1.5rem,4dvh,2.2rem)] leading-none text-[#B08A4F]">the day</p>
        <h2 className="mt-[0.8dvh] font-['Oswald'] text-[clamp(1rem,2.6dvh,1.35rem)] font-light uppercase tracking-[0.42em] pl-[0.42em]">
          Order of Events
        </h2>
      </div>

      <ol className="relative mt-[2.2dvh] flex min-h-0 flex-1 flex-col items-center justify-evenly text-center">
        {timeline.map((e, i) => (
          <React.Fragment key={e.time}>
            {i > 0 && (
              <li aria-hidden className="flex items-center gap-2 py-[0.4dvh]">
                <span className="h-px w-6 bg-[#B08A4F]/40" />
                <span className="h-1 w-1 rotate-45 bg-[#B08A4F]/80" />
                <span className="h-px w-6 bg-[#B08A4F]/40" />
              </li>
            )}
            <motion.li
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="font-['Parisienne'] text-[clamp(1.05rem,3dvh,1.75rem)] leading-none text-[#B08A4F]">
                {e.time.toLowerCase()}
              </p>
              <p className="mt-[0.6dvh] font-['Oswald'] text-[clamp(0.72rem,1.85dvh,0.98rem)] font-light uppercase tracking-[0.26em] pl-[0.26em]">
                {e.title}
              </p>
              <p className="mt-[0.3dvh] font-serif italic text-[clamp(0.72rem,1.75dvh,0.95rem)] text-stone-500">{e.location}</p>
            </motion.li>
          </React.Fragment>
        ))}
      </ol>
    </div>
  </motion.div>
);

// --- ENTOURAGE ---
export const EntouragePage: React.FC<{ onBack: () => void; categories: EntourageCategory[] }> = ({
  onBack,
  categories,
}) => (
  <PageShell onBack={onBack}>
    <div className="mb-9 text-center">
      <img
        src={entourageTitleImg}
        alt="The Entourage"
        className="mx-auto block h-[clamp(2.25rem,11vw,3.75rem)] w-auto max-w-[min(100%,340px)] object-contain"
      />
    </div>
    <div className="text-center flex flex-col gap-10">
      {categories.map((group) => (
        <div key={group.category}>
          <h3 className="font-sans text-sm font-bold tracking-[0.2em] text-[#102F27] uppercase mb-3">
            {group.category.split('(')[0].trim()}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            {group.members.map((m) => (
              <p key={`${m.role}-${m.name}`} className="font-sans text-xs tracking-widest text-[#185844] uppercase leading-relaxed">
                {m.name}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  </PageShell>
);

// --- RSVP form (shared by the mobile RSVP page and the desktop site) ---
// Saves to the RSVP API (/api/rsvps), same flow as the wedding-invitation project:
// guests from the invite submit as `web`; principal sponsors from the QR link submit as `qr`.
// Anyone attending can bring guests (1..MAX_GUESTS), each with a full name.
type GuestChoice = '' | 'yes' | 'no';
const MAX_GUESTS = 10;
// One person per guest field: "Ana / Ben", "Ana & Ben", "Ana, Ben", "Ana and Ben" are rejected ("Roxas, Jr." is fine)
// (keep in sync with MULTI_NAME in src/server/index.ts)
const MULTI_NAME = /[\/&+]|\band\b|,(?!\s*(?:jr|sr|ii|iii|iv)\.?\s*$)/i;

export const RsvpForm: React.FC<{
  /** Mobile: called 3s after submit (popup shown). Desktop: omitted, thank-you shows inline. */
  onDone?: () => void;
  className?: string;
}> = ({ onDone, className = '' }) => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [isAttending, setIsAttending] = useState<GuestChoice>('');
  const [bringsGuest, setBringsGuest] = useState<GuestChoice>('');
  const [guestNames, setGuestNames] = useState<string[]>(['']);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const showPlusOne = isAttending === 'yes';
  const setGuestName = (i: number, value: string) => setGuestNames((prev) => prev.map((n, j) => (j === i ? value : n)));
  const addGuest = () => setGuestNames((prev) => (prev.length < MAX_GUESTS ? [...prev, ''] : prev));
  const removeGuest = (i: number) => setGuestNames((prev) => (prev.length > 1 ? prev.filter((_, j) => j !== i) : ['']));

  useEffect(() => {
    if (!submitted || !onDone) return;
    const t = window.setTimeout(onDone, 3000);
    return () => window.clearTimeout(t);
  }, [submitted, onDone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !isAttending) {
      setError('Please enter your full name and choose attendance.');
      return;
    }

    const source = getRsvpSourceForSubmit();
    const body: Record<string, unknown> = { name: name.trim(), contact: contact.trim(), isAttending, source };

    if (isAttending === 'yes') {
      if (bringsGuest !== 'yes' && bringsGuest !== 'no') {
        setError('Please choose Yes or No for bringing guests.');
        return;
      }
      body.bringsGuest = bringsGuest;
      if (bringsGuest === 'yes') {
        if (guestNames.some((n) => !n.trim())) {
          setError("Please enter each guest's full name (or remove the empty one).");
          return;
        }
        if (guestNames.some((n) => MULTI_NAME.test(n))) {
          setError('Please enter one person per field. Tap "Add another guest" for each extra person.');
          return;
        }
        body.guestNames = guestNames.map((n) => n.trim());
      }
    }

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
      if (isAttending === 'yes') {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 }, colors: ['#185844', '#78947F', '#B08A4F', '#F2EBDD'] });
      }
    } catch (err) {
      console.error('Failed to submit RSVP:', err);
      setError(err instanceof Error ? err.message : 'Sorry, there was an error submitting your RSVP. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const locked = submitted || submitting;
  const inputClass =
    'w-full rounded-xl border border-stone-200 bg-[#F2EBDD]/40 px-3 py-2.5 text-sm text-[#102F27] focus:outline-none focus:ring-2 focus:ring-[#185844]/30 focus:border-[#185844] placeholder:text-stone-400';
  const radioClass = 'w-4 h-4 mt-0.5 shrink-0 accent-[#185844]';
  const optionText = 'uppercase tracking-[0.2em] text-xs';

  return (
    <>
      <form onSubmit={handleSubmit} className={`space-y-5 ${className}`}>
        <div className="space-y-1">
          <label className="block text-xs uppercase tracking-[0.25em] text-[#78947F]">Full Name</label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Your name" disabled={locked} />
        </div>

        <div className="space-y-1">
          <label className="block text-xs uppercase tracking-[0.25em] text-[#78947F]">
            Contact Number <span className="normal-case tracking-normal text-stone-400">(optional)</span>
          </label>
          <input type="tel" value={contact} onChange={(e) => setContact(e.target.value)} className={inputClass} placeholder="09xx xxx xxxx" disabled={locked} />
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.25em] text-[#78947F]">Kindly let us know</p>
          <div className="flex flex-col gap-3 min-[400px]:flex-row min-[400px]:items-center min-[400px]:gap-4">
            {([
              ['yes', 'Accepts with pleasure'],
              ['no', 'Declines with regret'],
            ] as const).map(([value, label]) => (
              <label key={value} className="inline-flex items-start gap-2 text-sm text-[#102F27] cursor-pointer">
                <input
                  type="radio"
                  name="attendance"
                  disabled={locked}
                  className={radioClass}
                  checked={isAttending === value}
                  onChange={() => {
                    setIsAttending(value);
                    if (value === 'no') {
                      setBringsGuest('');
                      setGuestNames(['']);
                    }
                  }}
                />
                <span className={optionText}>{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Plus-ones: anyone attending can bring 1..MAX_GUESTS named guests */}
        {showPlusOne && (
          <div className="rounded-xl border border-[#185844]/15 bg-[#F2EBDD]/50 p-4 space-y-3">
            <p className="text-xs uppercase tracking-[0.25em] text-[#78947F]">Will you bring any guests?</p>
            <div className="flex items-center gap-6">
              {(['yes', 'no'] as const).map((value) => (
                <label key={value} className="inline-flex items-start gap-2 text-sm text-[#102F27] cursor-pointer">
                  <input
                    type="radio"
                    name="brings-guest"
                    disabled={locked}
                    className={radioClass}
                    checked={bringsGuest === value}
                    onChange={() => {
                      setBringsGuest(value);
                      if (value === 'no') setGuestNames(['']);
                    }}
                  />
                  <span className={optionText}>{value === 'yes' ? 'Yes' : 'No'}</span>
                </label>
              ))}
            </div>
            {bringsGuest === 'yes' && (
              <div className="space-y-2 pt-2 border-t border-[#185844]/10">
                <label className="block text-[10px] uppercase tracking-[0.25em] text-[#78947F]">
                  Guest full name{guestNames.length > 1 ? 's' : ''}
                </label>
                {guestNames.map((guest, i) => (
                  <div key={i} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={guest}
                      onChange={(e) => setGuestName(i, e.target.value)}
                      disabled={locked}
                      placeholder={`Guest ${i + 1} full name`}
                      aria-label={`Guest ${i + 1} full name`}
                      className={inputClass}
                    />
                    {guestNames.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeGuest(i)}
                        disabled={locked}
                        aria-label={`Remove guest ${i + 1}`}
                        className="shrink-0 rounded-full p-2 text-stone-400 hover:bg-white hover:text-red-700 transition-colors cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {MULTI_NAME.test(guest) && (
                    <p className="pl-1 text-[11px] text-red-600">One person per field. Use “Add another guest” for the next person.</p>
                  )}
                  </div>
                ))}
                {guestNames.length < MAX_GUESTS && (
                  <button
                    type="button"
                    onClick={addGuest}
                    disabled={locked}
                    className="inline-flex items-center gap-1.5 pt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#185844] hover:text-[#102F27] transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add another guest
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {error && <p className="text-red-500 text-[11px] text-center -mt-1">{error}</p>}

        {submitted && !onDone ? (
          <div className="rounded-2xl bg-[#185844]/5 border border-[#185844]/20 px-5 py-5 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-[#78947F] mb-1">Thank you</p>
            <p className="font-serif text-2xl text-[#102F27]">Response sent</p>
          </div>
        ) : (
          <button
            type="submit"
            disabled={!isAttending || locked}
            className="mt-4 w-full inline-flex items-center justify-center rounded-full bg-[#185844] px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-md hover:bg-[#102F27] disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {submitting || submitted ? 'Submitting…' : 'Submit RSVP'}
          </button>
        )}
      </form>

      {submitted && onDone && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-6">
          <div className="w-full max-w-xs rounded-3xl bg-white px-6 py-8 text-center shadow-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-[#78947F] mb-2">Thank you</p>
            <p className="font-serif text-2xl text-[#102F27]">Response sent</p>
          </div>
        </div>
      )}
    </>
  );
};

// --- RSVP ---
export const RsvpPage: React.FC<{
  onBack: () => void;
  rsvpDeadline: string;
}> = ({ onBack, rsvpDeadline }) => (
  <PageShell onBack={onBack}>
    <PageTitle sub={`by ${rsvpDeadline}`}>RSVP</PageTitle>
    <RsvpForm onDone={onBack} className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(16,47,39,0.06)]" />
  </PageShell>
);

// --- FAQ accordion (shared by the mobile FAQ page and the desktop site) ---
export const FaqList: React.FC<{ variant?: 'cards' | 'flat' }> = ({ variant = 'cards' }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const flat = variant === 'flat';

  return (
    <div className={flat ? 'border-t border-[#B08A4F]/30' : 'space-y-3'}>
      {FAQS_DATA.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={item.question}
            className={flat ? 'border-b border-[#B08A4F]/30' : 'rounded-2xl bg-white shadow-[0_8px_30px_rgba(16,47,39,0.05)] overflow-hidden'}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className={`w-full flex items-center justify-between gap-3 text-left cursor-pointer ${flat ? 'py-6' : 'py-4 px-5'}`}
            >
              <span className={flat ? 'font-serif text-xl text-[#102F27]' : 'font-serif text-base lg:text-lg text-[#102F27]'}>
                {item.question}
              </span>
              <ChevronDown className={`w-4 h-4 shrink-0 text-[#B08A4F] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
              <div className={flat ? 'pb-6 pr-10 text-sm text-stone-600 leading-relaxed' : 'px-5 pb-5 text-sm text-stone-600 leading-relaxed'}>
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// --- FAQS ---
export const FaqPage: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <PageShell onBack={onBack}>
    <PageTitle>FAQs</PageTitle>
    <FaqList />
  </PageShell>
);
