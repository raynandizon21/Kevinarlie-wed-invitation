import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Check, ChevronLeft, ChevronDown, Navigation, Plus, X } from 'lucide-react';
import { EntourageCategory, TimelineItem } from '../types/wedding';
import { getRsvpSourceForSubmit } from '../rsvpSource';
import { FAQS_DATA } from '../data/weddingData';
import { Sprig } from './Sprig';
import jardinVenueImg from '../assets/images/jardin_venue_1791676573787.jpg';
import churchImg from '../assets/images/CHRURCH.jpg';
// Left half of the original two-photo image, so there's no seam line down the middle
import tablescapeImg from '../assets/images/wedding_tablescape_candlelight_single.jpg';
import entourageTitleImg from '../assets/images/the_entourage_title_ivory.svg';
import weddingTimelineTitleImg from '../assets/images/wedding_timeline_emerald.svg';
import meadowCoupleImg from '../assets/images/wedding_couple_meadow_1791602914531.jpg';
// From WEDDING-ATTIRE-HD.png: recolored to forest on a transparent background (2051px wide, sharp on any phone)
import weddingAttireTitleImg from '../assets/images/wedding_attire_hd_forest.png';

// Mobile story pages: each has its own look (photo cover, emerald, forest, arch photo, photo backdrop)
// so the pages don't feel the same. Shared pieces below.

const easeOut = [0.16, 1, 0.3, 1] as const;
// Sections fade up as they scroll into view
const reveal = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.8, ease: easeOut },
} as const;
const pageX = 'px-[clamp(1rem,5vw,1.5rem)]';
const belowBack = 'pt-[max(4.5rem,calc(env(safe-area-inset-top,0px)+3.5rem))]';

// Plain Back link (no chip) that stays at the top-left while the page scrolls
export const BackChip: React.FC<{ onBack: () => void; light?: boolean }> = ({ onBack, light = false }) => (
  <div className="sticky top-0 z-20 h-0">
    <button
      type="button"
      onClick={onBack}
      className={`absolute left-[clamp(0.5rem,3vw,1rem)] top-[max(0.75rem,env(safe-area-inset-top,0px))] flex items-center px-2 py-2 text-[10px] uppercase tracking-[0.25em] transition-colors cursor-pointer ${
        light ? 'text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.45)] hover:text-[#E6D3AE]' : 'text-[#102F27] hover:text-[#B08A4F]'
      }`}
    >
      <ChevronLeft className="mr-0.5 h-3.5 w-3.5" /> Back
    </button>
  </div>
);

// Script eyebrow + tall Oswald title + sprig (same voice as the hero)
const StoryHeading: React.FC<{ eyebrow?: string; children: React.ReactNode; light?: boolean; className?: string }> = ({
  eyebrow,
  children,
  light = false,
  className = '',
}) => (
  <div className={`text-center ${className}`}>
    {eyebrow && <p className={`mb-2 font-['Parisienne'] text-[1.7rem] leading-none ${light ? 'text-[#E6D3AE]' : 'text-[#B08A4F]'}`}>{eyebrow}</p>}
    <h2
      className={`font-['Oswald'] text-[clamp(1.9rem,9.5vw,2.6rem)] font-light uppercase leading-[1.15] tracking-[0.25em] pl-[0.25em] ${
        light ? 'text-white' : 'text-[#102F27]'
      }`}
    >
      {children}
    </h2>
    <Sprig className={`mx-auto mt-3 w-14 ${light ? 'text-white/80' : 'text-[#185844]/70'}`} />
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
    { label: 'Ceremony', name: churchName, address: churchAddress, img: churchImg, url: mapsChurchUrl, time: ceremonyTime },
    { label: 'Reception', name: receptionName, address: receptionAddress, img: tablescapeImg, url: mapsReceptionUrl },
  ];

  // One ivory page: the two venues as polaroids beside their details, then the dress code
  return (
    <div className="min-h-[100dvh] bg-[#F2EBDD] text-[#102F27]">
      <BackChip onBack={onBack} />
      <div className={`${pageX} ${belowBack} pb-6`}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: easeOut }}
        >
          {/* One line like the desktop heading, sized to fit the phone width */}
          <div className="text-center">
            <h2 className="whitespace-nowrap font-['Oswald'] text-[clamp(1.05rem,5.6vw,1.6rem)] font-light uppercase tracking-[0.22em] pl-[0.22em] text-[#102F27]">
              Ceremony &amp; Reception
            </h2>
            <Sprig className="mx-auto mt-3 w-14 text-[#185844]/70" />
          </div>
        </motion.div>

        {/* Venues: a tilted landscape polaroid (whole photo, same as desktop) beside the details, sides swapping for the reception */}
        <div className="mx-auto mt-10 max-w-sm space-y-12">
          {venues.map((v, i) => {
            const flip = i % 2 === 1;
            return (
              <motion.div key={v.label} {...reveal} className={`flex items-center gap-4 ${flip ? 'flex-row-reverse text-right' : ''}`}>
                <div
                  className={`w-[52%] shrink-0 bg-white p-1.5 pb-0.5 shadow-[0_10px_25px_rgba(16,47,39,0.15)] ${flip ? 'rotate-3' : '-rotate-3'}`}
                >
                  <img src={v.img} alt={v.name} className="block aspect-[4/3] w-full object-cover" />
                  {/* Same voice as the "Ceremony & Reception" title: light Oswald caps in forest */}
                  <p className="pb-2 pt-2 pl-[0.22em] text-center font-['Oswald'] text-[10px] font-light uppercase leading-none tracking-[0.22em] text-[#102F27]">
                    The {v.label}
                  </p>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-serif text-[1.3rem] leading-[1.15]">{v.name}</h3>
                  {v.time && (
                    <p className="mt-2 font-['Oswald'] text-sm font-light uppercase tracking-[0.25em] text-[#185844]">{v.time}</p>
                  )}
                  <p className="mt-2 text-[11px] leading-relaxed text-stone-500">{v.address}</p>
                  <a
                    href={v.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 border-b border-[#B08A4F]/60 pb-0.5 font-['Oswald'] text-[10px] font-light uppercase tracking-[0.3em] text-[#185844] transition-colors hover:text-[#B08A4F]"
                  >
                    <Navigation className="h-3 w-3" />
                    Directions
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Dress code, like a printed "Wedding Attire" card: script + spaced caps title, a short note,
            then the palette as a row of arches */}
        <motion.div {...reveal} className="mx-auto mt-16 max-w-sm text-center">
          <h3>
            <img
              src={weddingAttireTitleImg}
              alt="Wedding Attire"
              draggable={false}
              className="mx-auto block h-auto w-[min(100%,20rem)] select-none"
            />
          </h3>
          <p className="mx-auto mt-5 max-w-[20rem] font-serif text-[15px] leading-relaxed text-[#102F27]/80">
            We would love to see you dressed in formal attire in the colors of our day. Kindly avoid white and ivory.
          </p>
          <div className="mt-6 grid grid-cols-4 gap-2">
            {DRESS_CODE.map((c) => (
              <div key={c.name} className="flex min-w-0 flex-col items-center">
                <div className="aspect-[3/4] w-full rounded-t-full shadow-[0_6px_14px_rgba(16,47,39,0.15)]" style={{ backgroundColor: c.hex }} />
                <span className="mt-2 font-['Oswald'] text-[9px] font-light uppercase tracking-[0.2em] text-[#102F27]/70">{c.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// --- TIMELINE: printed "wedding timeline" card (script title with flourish lines, center rail,
// alternating line icons). One screen, no scrolling: sizes follow the screen height (dvh).
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

export const TimelinePage: React.FC<{
  onBack: () => void;
  timeline: TimelineItem[];
  coupleLine?: string;
  /** Shown under the rail inside the one-screen layout (e.g. the story's Next cue) */
  footer?: React.ReactNode;
}> = ({ onBack, timeline, coupleLine, footer }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.6, ease: 'easeInOut' }}
    className="relative isolate flex h-[100dvh] w-full flex-col overflow-hidden bg-[#F2EBDD] text-[#102F27] pt-[max(1rem,env(safe-area-inset-top,0px))] pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]"
  >
    {/* Faint couple photo behind the top part of the page. It fades in from ivory at the very top (the
        phone status bar is ivory, so there's no hard edge there) and fades out around the 6:00 PM row,
        leaving the rest of the timeline on plain ivory */}
    <img
      src={meadowCoupleImg}
      alt=""
      aria-hidden
      draggable={false}
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover object-[60%_center] opacity-[0.3] grayscale-[30%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_16%,black_40%,transparent_58%)]"
    />
    <button
      type="button"
      onClick={onBack}
      className="ml-[clamp(1rem,5vw,1.5rem)] flex shrink-0 items-center self-start text-xs uppercase tracking-widest hover:text-[#B08A4F] transition-colors cursor-pointer"
    >
      <ChevronLeft className="w-4 h-4 mr-1" /> Back
    </button>

    {/* Hand-lettered title (wedding_timeline.png, recolored emerald); its flourish lines run to the screen edges */}
    <img
      src={weddingTimelineTitleImg}
      alt="Wedding timeline"
      draggable={false}
      className="mx-auto mt-[0.5dvh] block h-auto w-full max-w-[28rem] max-h-[24dvh] shrink-0 object-contain select-none"
    />
    {coupleLine && (
      <p className="shrink-0 mt-[1.4dvh] text-center text-[clamp(0.7rem,1.7dvh,0.85rem)] uppercase tracking-[0.3em] pl-[0.3em]">
        {coupleLine}
      </p>
    )}

    {/* Center rail; events are staggered: each takes two half-rows, so a left event sits between two right ones */}
    <div className="mt-[2dvh] flex min-h-0 flex-1 justify-center">
    <ol
      className="relative grid h-full w-full max-w-sm px-[clamp(1rem,5vw,1.5rem)]"
      style={{ gridTemplateRows: `repeat(${timeline.length + 1}, minmax(0, 1fr))`, maxHeight: `${(timeline.length + 1) * 5}rem` }}
    >
      <span className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-[#78947F]/70" />
      {timeline.map((e, i) => {
        const Icon = TIMELINE_ICONS[e.icon] ?? RingsIcon;
        const left = i % 2 === 1;
        const text = (
          <div className={left ? 'text-right' : 'text-left'}>
            <p className="text-[clamp(0.72rem,2dvh,0.95rem)] font-semibold tracking-[0.12em] text-[#185844]">{e.time}</p>
            <p className="mt-[0.3dvh] text-[clamp(0.62rem,1.7dvh,0.8rem)] uppercase leading-snug tracking-[0.16em] text-[#102F27]/70">
              {e.title}
            </p>
          </div>
        );
        const icon = <Icon className="h-[clamp(2.4rem,6.6dvh,3.5rem)] w-[clamp(2.4rem,6.6dvh,3.5rem)] shrink-0 text-[#78947F]" />;
        return (
          <motion.li
            key={e.time}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-2 items-center"
            style={{ gridRow: `${i + 1} / span 2`, gridColumn: 1 }}
          >
            {left ? (
              <div className="col-start-1 flex items-center justify-end gap-2.5">
                {text}
                {icon}
                <span className="h-px w-3 shrink-0 bg-[#78947F]/70" />
              </div>
            ) : (
              <div className="col-start-2 flex items-center gap-2.5">
                <span className="h-px w-3 shrink-0 bg-[#78947F]/70" />
                {icon}
                {text}
              </div>
            )}
          </motion.li>
        );
      })}
    </ol>
    </div>
    {footer}
  </motion.div>
);

// --- ENTOURAGE: forest page, gold headings, ivory names ---
export const EntouragePage: React.FC<{ onBack: () => void; categories: EntourageCategory[] }> = ({
  onBack,
  categories,
}) => (
  <div className="min-h-[100dvh] bg-[#102F27] text-[#F2EBDD]">
    <BackChip onBack={onBack} light />
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.3, ease: easeOut }}
      className={`${pageX} ${belowBack} text-center`}
    >
      <img
        src={entourageTitleImg}
        alt="The Entourage"
        className="mx-auto block h-[clamp(2.5rem,12vw,3.75rem)] w-auto max-w-[min(100%,340px)] object-contain"
      />
      <Sprig className="mx-auto mt-4 w-14 text-[#B08A4F]" />
    </motion.div>

    <div className={`mt-10 space-y-10 ${pageX} pb-8 text-center`}>
      {categories.map((group) => (
        <motion.section key={group.category} {...reveal}>
          <h3 className="font-['Oswald'] text-xs font-light uppercase tracking-[0.4em] pl-[0.4em] text-[#B08A4F]">
            {group.category.split('(')[0].trim()}
          </h3>
          <span className="mx-auto mt-2 block h-px w-10 bg-[#B08A4F]/50" />
          {/* Same as desktop: bigger groups go two columns (sponsor pairs, groomsman beside bridesmaid) */}
          {/* Two columns meet at the centre: left column right-aligned, right column left-aligned */}
          <div className={group.members.length > 3 ? 'mt-4 grid grid-cols-2 gap-x-5 gap-y-2' : 'mt-4 space-y-1.5'}>
            {group.members.map((m, i) => (
              <div
                key={`${m.role}-${m.name}`}
                className={`${group.showRoles ? 'pt-1.5' : ''} ${group.members.length > 3 ? (i % 2 ? 'text-left' : 'text-right') : ''}`}
              >
                {group.showRoles && (
                  <p className="text-[9px] uppercase tracking-[0.3em] text-[#E6D3AE]/70">{m.role}</p>
                )}
                <p className={`font-serif leading-snug ${group.members.length > 3 ? 'text-[15px]' : 'text-lg'}`}>{m.name}</p>
              </div>
            ))}
          </div>
        </motion.section>
      ))}
    </div>
  </div>
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
      checked ? 'border-[#185844] bg-[#185844] text-white' : 'border-stone-200 bg-white/70 text-[#102F27] hover:border-[#185844]/50'
    } ${locked ? 'pointer-events-none opacity-70' : ''}`}
  >
    <input type="radio" name={name} disabled={locked} checked={checked} onChange={onChange} className="sr-only" />
    {children}
  </label>
);

export const RsvpForm: React.FC<{
  /** Mobile: called 2s after submit (popup shown). Desktop: omitted, thank-you shows inline. */
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
    const t = window.setTimeout(onDone, 2000);
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
    'w-full rounded-xl border border-stone-200 bg-white/70 px-3.5 py-2.5 text-base text-[#102F27] focus:outline-none focus:ring-2 focus:ring-[#185844]/25 focus:border-[#185844] placeholder:text-stone-400 disabled:opacity-60';
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
            Contact Number <span className="normal-case tracking-normal text-stone-400">(optional)</span>
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
                onChange={() => {
                  setIsAttending(value);
                  if (value === 'no') {
                    setBringsGuest('');
                    setGuestNames(['']);
                  }
                }}
              >
                {label}
              </Choice>
            ))}
          </div>
        </div>

        {/* Plus-ones: anyone attending can bring 1..MAX_GUESTS named guests */}
        {showPlusOne && (
          <div className="space-y-2">
            <p className={labelClass}>Will you bring any guests?</p>
            <div className="grid grid-cols-2 gap-2">
              {(['yes', 'no'] as const).map((value) => (
                <Choice
                  key={value}
                  locked={locked}
                  name="brings-guest"
                  checked={bringsGuest === value}
                  onChange={() => {
                    setBringsGuest(value);
                    if (value === 'no') setGuestNames(['']);
                  }}
                >
                  {value === 'yes' ? 'Yes' : 'No'}
                </Choice>
              ))}
            </div>
            {bringsGuest === 'yes' && (
              <div className="space-y-2 pt-2">
                <p className={labelClass}>
                  Guest full name{guestNames.length > 1 ? 's' : ''}{' '}
                  <span className="normal-case tracking-normal text-stone-400">({guestNames.length}/{MAX_GUESTS})</span>
                </p>
                {guestNames.map((guest, i) => (
                  <div key={i}>
                    {/* Number on the left, remove (x) inside the field so the input keeps the full width */}
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#B08A4F] tabular-nums">
                        {i + 1}.
                      </span>
                      <input
                        type="text"
                        value={guest}
                        onChange={(e) => setGuestName(i, e.target.value)}
                        disabled={locked}
                        placeholder="Full name"
                        aria-label={`Guest ${i + 1} full name`}
                        className={`${inputClass} pl-8 ${guestNames.length > 1 ? 'pr-10' : ''}`}
                      />
                      {guestNames.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeGuest(i)}
                          disabled={locked}
                          aria-label={`Remove guest ${i + 1}`}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full p-2 text-stone-400 hover:text-red-700 transition-colors cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {MULTI_NAME.test(guest) && (
                      <p className="mt-1 pl-1 text-[11px] text-red-600">One person per field. Use “Add another guest” for the next person.</p>
                    )}
                  </div>
                ))}
                {guestNames.length < MAX_GUESTS && (
                  <button
                    type="button"
                    onClick={addGuest}
                    disabled={locked}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#185844]/35 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#185844] hover:bg-white/60 transition-colors cursor-pointer"
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-30 flex items-center justify-center bg-[#102F27]/60 px-6 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut }}
            className="w-full max-w-xs rounded-[1.75rem] bg-[#FBF8F1] px-6 pb-7 pt-8 text-center text-[#102F27] shadow-2xl"
          >
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#185844] text-[#F2EBDD]">
              <Check className="h-6 w-6" strokeWidth={2} />
            </span>
            <p className="mt-4 font-['Parisienne'] text-[2.4rem] leading-none">Thank you!</p>
            <p className="mt-2 font-['Oswald'] text-[11px] font-light uppercase tracking-[0.35em] pl-[0.35em] text-[#B08A4F]">Response sent</p>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

// --- RSVP: candlelit photo backdrop with the form on an ivory card ---
export const RsvpPage: React.FC<{
  onBack: () => void;
  /** Called 2s after a successful submit (the gallery comes next) */
  onDone: () => void;
  rsvpDeadline: string;
}> = ({ onBack, onDone, rsvpDeadline }) => (
  <div className="relative min-h-[100dvh] overflow-hidden text-white">
    <img src={tablescapeImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
    <div className="absolute inset-0 bg-[#102F27]/75" />
    <BackChip onBack={onBack} light />
    <div className={`relative ${pageX} ${belowBack} pb-[max(2.5rem,env(safe-area-inset-bottom,0px))]`}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3, ease: easeOut }}
      >
        <StoryHeading eyebrow="kindly respond" light>
          Will you
          <br />
          join us?
        </StoryHeading>
        <p className="mt-4 text-center font-['Oswald'] text-[11px] font-light uppercase tracking-[0.4em] pl-[0.4em] text-white/75">
          by {rsvpDeadline}
        </p>
      </motion.div>
      <RsvpForm onDone={onDone} className="mx-auto mt-7 max-w-md rounded-[1.75rem] bg-[#F2EBDD] p-[clamp(1.1rem,5vw,1.5rem)] text-[#102F27] shadow-2xl" />
    </div>
  </div>
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

// --- FAQS: forest band with thin gold diagonals at the top, an ivory card overlapping it with
// "+ FAQs" and an accordion (round +/- toggles). Numbered answer lines ("1. …") show as steps.
const FaqAnswer: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n').filter(Boolean);
  const isStep = (l: string) => /^\d+\.\s/.test(l);
  const steps = lines.filter(isStep);
  return (
    <div className="text-[14px] leading-[1.7] text-[#102F27]/75">
      {lines
        .filter((l) => !isStep(l))
        .map((l) => (
          <p key={l}>{l}</p>
        ))}
      {steps.length > 0 && (
        <ol className="mt-2.5 space-y-2">
          {steps.map((l, i) => (
            <li key={l} className="flex gap-2.5">
              <span className="w-3 shrink-0 font-serif text-[1.05rem] font-semibold italic leading-[1.45] text-[#B08A4F] lining-nums">{i + 1}</span>
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
    <ul className="mt-5 divide-y divide-[#B08A4F]/20 border-t border-[#B08A4F]/20">
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
                <span className="absolute h-[1.5px] w-3 rounded-full bg-[#F2EBDD]" />
                <span
                  className={`absolute h-3 w-[1.5px] rounded-full bg-[#F2EBDD] transition-transform duration-300 ${isOpen ? 'scale-y-0' : 'scale-y-100'}`}
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

export const FaqPage: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="relative min-h-[100dvh] bg-[#F2EBDD] text-[#102F27]">
    {/* Forest band with two thin gold diagonals */}
    <div aria-hidden className="absolute inset-x-0 top-0 h-[clamp(17rem,40dvh,22rem)] overflow-hidden bg-[#102F27]">
      <span className="absolute right-[22%] -top-10 h-[130%] w-[2px] origin-top rotate-[32deg] bg-gradient-to-b from-[#B08A4F] via-[#B08A4F]/70 to-transparent" />
      <span className="absolute right-[12%] -top-10 h-[130%] w-px origin-top rotate-[32deg] bg-gradient-to-b from-[#E6D3AE]/80 via-[#E6D3AE]/40 to-transparent" />
      <Sprig className="absolute right-[clamp(1rem,5vw,1.5rem)] top-[max(1.1rem,env(safe-area-inset-top,0px))] w-14 text-[#E6D3AE]/60" />
    </div>
    <BackChip onBack={onBack} light />

    <div className={`relative mx-auto max-w-md ${pageX} pb-6 pt-[max(8.5rem,calc(env(safe-area-inset-top,0px)+7.5rem))]`}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.2, ease: easeOut }}
        className="rounded-[1.75rem] bg-[#FBF8F1] px-[clamp(1.25rem,6vw,1.75rem)] pb-3 pt-7 shadow-[0_24px_50px_-24px_rgba(16,47,39,0.45)]"
      >
        <h2 className="flex items-center gap-2.5">
          <Plus className="h-6 w-6 text-[#B08A4F]" strokeWidth={2.25} aria-hidden />
          <span className="font-serif text-[2.1rem] font-semibold leading-none text-[#102F27]">FAQs</span>
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-[#102F27]/60">A few answers to help you plan for our day.</p>
        <FaqAccordion />
      </motion.div>

      <motion.p {...reveal} className="mx-auto mt-7 max-w-[17rem] text-balance text-center text-[13px] leading-relaxed text-[#102F27]/60">
        Still have questions? Message us anytime, we&rsquo;re happy to help.
      </motion.p>
    </div>
  </div>
);
