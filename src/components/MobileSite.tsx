import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, MapPin } from 'lucide-react';
import { EntourageCategory, TimelineItem } from '../types/wedding';
import { FAQS_DATA, GIFT_NOTE, WEDDING_DETAILS } from '../data/weddingData';
import { directionsUrl, DRESS_CODE, FaqAccordion, GUEST_ATTIRE, RsvpForm, TimelineIcon } from './SubPages';
import { Sprig } from './Sprig';
import churchImg from '../assets/images/CHRURCH.jpg';
// Prenup photos: colonnade walk (portrait) for the hero, city walk (landscape) for the countdown
// Hero: tighter crop of the colonnade walk (nearly square), so the couple reads bigger
import heroCoupleImg from '../assets/images/image0 - Copy.jpeg';
// Countdown: city walk, already cropped close to the couple (portrait)
import countdownCoupleImg from '../assets/images/image2-copy.jpeg';
import tablescapeImg from '../assets/images/wedding_tablescape_candlelight_single.jpg';
// Reception venue photo: Nuan Hall, Nuan Farm & Resort
import nuanHallImg from '../assets/images/NUANHALL.jpg';
import weddingAttireTitleImg from '../assets/images/wedding_attire_hd_forest.png';
// Faded background behind the wedding timeline: the couple from above
import timelineBgImg from '../assets/images/image1-copy.jpeg';
import weddingTimelineTitleImg from '../assets/images/wedding_timeline_emerald.svg';
import entourageTitleImg from '../assets/images/the_entourage_title_ivory.svg';

// Phone (< 1024px) invitation: ONE long page the guest simply scrolls down (no prev/next).
// Look follows the couple's references: forest save-the-date with giant numerals, ivory invitation
// card, oval photo countdown, venue cards, route map, wedding timeline, forest entourage, FAQs, RSVP.
export type MobileSection = 'top' | 'details' | 'timeline' | 'entourage' | 'faqs' | 'rsvp';

const easeOut = [0.16, 1, 0.3, 1] as const;
const reveal = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.9, ease: easeOut },
} as const;
const pageX = 'px-[clamp(1rem,6vw,1.75rem)]';
// Forest green fading to transparent along an ease-out curve: solid at the edge, then tapering off slowly, so
// a photo melts into the green with no visible line where the fade stops
const EASE_FADE = [
  [1, 0], [0.92, 8], [0.8, 18], [0.66, 28], [0.52, 38], [0.39, 48], [0.27, 58], [0.17, 68], [0.09, 78], [0.04, 88], [0, 100],
]
  .map(([a, p]) => `rgba(16,47,39,${a}) ${p}%`)
  .join(', ');
// Soft edge fades for images that sit on the white page (left/right and top/bottom)
const FADE_X = 'linear-gradient(to right, transparent, #000 5%, #000 95%, transparent)';
const FADE_Y = 'linear-gradient(to bottom, transparent, #000 14%, #000 88%, transparent)';
// Tall thin display serif for the big titles and numerals (VENUES, ENTOURAGE, 02 02 27)
const display = "font-['Italiana'] font-normal";
// Small spaced caps used for labels
const caps = 'font-serif font-semibold uppercase tracking-[0.22em]';

const scrollToSection = (id: MobileSection, smooth = true) => {
  if (id === 'top') return window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
  document.getElementById(`m-${id}`)?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
};

// Big section title: thin display caps + a sprig
// `size` overrides the font size (e.g. smaller + nowrap for a title that must stay on one line)
const Title: React.FC<{ children: React.ReactNode; light?: boolean; eyebrow?: string; size?: string; noSprig?: boolean }> = ({
  children,
  light,
  eyebrow,
  size,
  noSprig,
}) => (
  <motion.div {...reveal} className="text-center">
    {eyebrow && (
      <p className={`mb-3 font-serif text-[15px] italic ${light ? 'text-white/85' : 'text-[#185844]'}`}>{eyebrow}</p>
    )}
    <h2 className={`${display} ${size ?? 'text-[clamp(2.9rem,15vw,4rem)]'} uppercase leading-[0.95] tracking-[0.04em] ${light ? 'text-white' : 'text-[#185844]'}`}>
      {children}
    </h2>
    {!noSprig && <Sprig className={`mx-auto mt-4 w-14 ${light ? 'text-[#78947F]' : 'text-[#185844]/70'}`} />}
  </motion.div>
);

// ---------------------------------------------------------------------------------------------
// Route map: a simplified drawing of the real roads, traced from Google Maps directions
// (chapel 2M33+8FG -> Nuan Farm & Resort XMX4+QH: 600 m, about 2 min by car / 8 min on foot).
// North is up. The route leaves San Fernando road right at the chapel, runs south-east, then bends south
// to Nuan. The "Open the route" link builds a Google Maps directions link from the two venue map links.
type RouteStop = { name: string; url: string };
const mapQuery = (url: string) => {
  try {
    return new URL(url).searchParams.get('q') ?? url;
  } catch {
    return url;
  }
};
const ROUTE_PATH = 'M190 92 L222 110 C 260 150, 310 200, 380 250 C 440 290, 510 320, 550 385 C 575 430, 582 480, 576 520 L 562 600';
const PIN = 'M0 22 C -14 8, -16 -2, -16 -6 A 16 16 0 0 1 16 -6 C 16 -2, 14 8, 0 22 Z';

// "What time should I arrive?" answer from the FAQs, one entry per paragraph
const ARRIVAL_NOTE = (FAQS_DATA.find((f) => /arrive/i.test(f.question))?.answer ?? '').split(/\n+/).filter(Boolean);

export const RouteMap: React.FC<{ from: RouteStop; to: RouteStop; wide?: boolean }> = ({ from, to, wide }) => {
  const routeUrl =
    'https://www.google.com/maps/dir/?api=1&travelmode=driving' +
    `&origin=${encodeURIComponent(mapQuery(from.url))}&destination=${encodeURIComponent(mapQuery(to.url))}`;
  const road = '#78947F';
  // Title + "Arrival of guests"
  const heading = (
    <>
      {/* Like the reference: big title, a small bold "Arrival of guests" line, the map, then one paragraph */}
      <Title noSprig>
        Plan your
        <br />
        arrival
      </Title>
      <motion.p {...reveal} className="mt-5 text-center font-serif text-[13px] font-bold uppercase tracking-[0.25em] pl-[0.25em] text-[#185844]">
        Arrival of guests
      </motion.p>

    </>
  );
  const map = (
    <>
      <motion.div {...reveal} className="relative mt-10 border border-[#185844]/25 p-2">
        <div className="relative aspect-[700/660] overflow-hidden bg-white">
          <svg viewBox="0 0 700 660" className="absolute inset-0 h-full w-full" aria-hidden>
            {/* open green land east of the route */}
            <path
              d="M420 -60 L 760 -60 L 760 360 L 585 360 C 560 320, 520 295, 470 270 L 400 225 C 400 120, 410 40, 420 -60 Z"
              fill={road}
              fillOpacity="0.1"
            />
            {/* side streets */}
            <g stroke={road} strokeOpacity="0.16" strokeWidth="9" fill="none" strokeLinecap="round">
              <path d="M60 -40 L -40 60" />
              <path d="M-20 220 C 60 230, 120 250, 178 260" />
              <path d="M152 360 L -20 455" />
              <path d="M150 372 C 300 365, 500 380, 720 425" />
              <path d="M114 500 C 300 505, 500 520, 720 540" />
              <path d="M80 630 C 300 640, 500 650, 720 665" />
              {/* the street the route follows, continuing south past Nuan */}
              <path d="M222 110 C 260 150, 310 200, 380 250 C 440 290, 510 320, 550 385 C 575 430, 582 480, 576 520 L 548 720" />
            </g>
            {/* San Fernando road (main road) */}
            <path d="M270 -80 L 50 740" stroke={road} strokeOpacity="0.26" strokeWidth="22" fill="none" />
            <text
              x="0"
              y="0"
              transform="translate(118 470) rotate(-75)"
              fontSize="15"
              letterSpacing="4"
              fill={road}
              fontFamily="Cormorant Garamond, serif"
              fontWeight="600"
            >
              SAN FERNANDO
            </text>

            {/* the route */}
            <path d={ROUTE_PATH} fill="none" stroke="#185844" strokeOpacity="0.18" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
            <motion.path
              d={ROUTE_PATH}
              fill="none"
              stroke="#185844"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2.2, ease: 'easeInOut', delay: 0.3 }}
            />

            {/* chapel pin (cross) */}
            <g transform="translate(190 48) scale(2)">
              <path d={PIN} fill="#102F27" />
              <path d="M0 -14 V 2 M -5 -9 H 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            </g>
            {/* Nuan pin (heart) */}
            <g transform="translate(562 556) scale(2)">
              <path d={PIN} fill="#185844" />
              <path d="M0 2 C -8 -3, -8 -11, -3.5 -11.5 C -1.5 -11.7, 0 -10, 0 -8.5 C 0 -10, 1.5 -11.7, 3.5 -11.5 C 8 -11, 8 -3, 0 2 Z" fill="white" />
            </g>

            {/* compass */}
            <g transform="translate(650 62)" stroke="#185844" strokeOpacity="0.6" fill="none">
              <circle r="24" strokeWidth="1.5" />
              <path d="M0 -17 L 5.5 0 L 0 17 L -5.5 0 Z" fill="#185844" fillOpacity="0.6" stroke="none" />
            </g>
            <text x="650" y="28" textAnchor="middle" fontSize="15" fill="#185844" fontFamily="Cormorant Garamond, serif">
              N
            </text>
          </svg>

          {/* drive time badge on the route */}
          <div className="absolute left-[57%] top-[30%] rounded-full bg-[#102F27] px-2.5 py-1 font-serif text-[10px] font-semibold uppercase tracking-[0.15em] text-white shadow-sm">
            2 min · 600 m
          </div>

          {/* labels */}
          <div className="absolute left-[33%] top-[3%] max-w-[44%]">
            <p className={`${caps} text-[8.5px] tracking-[0.25em] text-[#185844]/70`}>Ceremony</p>
            <p className="font-serif text-[13px] font-semibold leading-tight text-[#102F27]">{from.name}</p>
          </div>
          <div className="absolute right-[25%] top-[80%] whitespace-nowrap text-right">
            <p className={`${caps} text-[8.5px] tracking-[0.25em] text-[#185844]/70`}>Reception</p>
            <p className="font-serif text-[13px] font-semibold leading-tight text-[#102F27]">{to.name}</p>
          </div>
        </div>
      </motion.div>

    </>
  );
  const note = (
    <>
      {/* The first paragraph of the "What time should I arrive?" FAQ (so the two never disagree), times in bold,
          then a small link that opens the route in Google Maps */}
      <motion.div {...reveal} className="mx-auto mt-8 max-w-[20rem] text-center">
        {ARRIVAL_NOTE[0] && (
          <p className="font-serif text-[15px] leading-relaxed text-[#185844]">
            {ARRIVAL_NOTE[0].split(/(\d{1,2}:\d{2}(?:\s?[AP]M| in the afternoon)?)/).map((part, j) =>
              j % 2 ? (
                <strong key={j} className="font-bold">
                  {part}
                </strong>
              ) : (
                part
              ),
            )}
          </p>
        )}
        <a
          href={routeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`group mt-6 inline-flex items-center gap-2 border-b border-[#185844]/50 pb-1 ${caps} text-[10.5px] tracking-[0.3em] text-[#185844] transition-colors hover:border-[#185844]`}
        >
          Open the route
          <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
        </a>
      </motion.div>
    </>
  );

  // wide (desktop): map on the left, title / arrival note / route link on the right
  if (wide) {
    return (
      <div className="mx-auto mt-28 grid max-w-5xl grid-cols-[1.05fr_1fr] items-center gap-16">
        <div className="[&>div]:mt-0">{map}</div>
        <div className="text-center">
          {heading}
          {note}
        </div>
      </div>
    );
  }
  return (
    <div className="mx-auto mt-24 max-w-sm">
      {heading}
      {map}
      {note}
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// A realistic paint swatch: an irregular brush-stroke dab (edges roughened with SVG turbulence), a soft
// highlight like wet paint, and fine bristle streaks. No outline.
const PaintSwatch: React.FC<{ color: string; id: string; seed: number }> = ({ color, id, seed }) => (
  <svg viewBox="0 0 120 120" className="block h-auto w-full overflow-visible" aria-hidden>
    <defs>
      <filter id={`rough-${id}`} x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed={seed} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="12" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id={`grain-${id}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9 0.06" numOctaves="2" seed={seed + 3} />
        <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.12 0" />
        <feComposite in2="SourceGraphic" operator="in" />
      </filter>
      <radialGradient id={`sheen-${id}`} cx="35%" cy="30%" r="75%">
        <stop offset="0%" stopColor="#fff" stopOpacity="0.22" />
        <stop offset="45%" stopColor="#fff" stopOpacity="0" />
        <stop offset="100%" stopColor="#000" stopOpacity="0.1" />
      </radialGradient>
    </defs>
    <g filter={`url(#rough-${id})`}>
      <path d="M18 62 C 14 34, 40 14, 66 16 C 92 18, 108 38, 104 64 C 100 92, 76 106, 52 102 C 30 98, 21 84, 18 62 Z" fill={color} />
      <path d="M18 62 C 14 34, 40 14, 66 16 C 92 18, 108 38, 104 64 C 100 92, 76 106, 52 102 C 30 98, 21 84, 18 62 Z" fill={`url(#sheen-${id})`} />
      <path d="M18 62 C 14 34, 40 14, 66 16 C 92 18, 108 38, 104 64 C 100 92, 76 106, 52 102 C 30 98, 21 84, 18 62 Z" fill={color} filter={`url(#grain-${id})`} />
    </g>
  </svg>
);

// ---------------------------------------------------------------------------------------------
// Countdown to the ceremony
export const useCountdown = (iso: string) => {
  const target = new Date(iso).getTime();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const diff = Math.max(0, target - now);
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor(diff / 3600000) % 24,
    minutes: Math.floor(diff / 60000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
  };
};

// ---------------------------------------------------------------------------------------------
// Entourage: forest page, two columns meeting at the centre, a soft italic line above each group
const ENTOURAGE_INTRO: Record<string, string> = {
  Parents: 'With love and the blessing of our beloved parents',
  'Principal Sponsors': 'To guide and support us with wisdom and love',
  'Secondary Sponsors': 'To stand beside us in faith and devotion',
  'Best Man': 'To stand as our closest witnesses',
  'Groomsmen & Bridesmaids': 'To walk with us in joy, friendship, and celebration',
  Bearers: 'To carry the symbols of our union',
  'Flower Girls': 'To shower our path with flowers',
};

const Intro: React.FC<{ text?: string }> = ({ text }) =>
  text ? <p className="mb-3 font-serif text-[13px] italic text-white/75">{text}</p> : null;
const GroupHead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  // Sage, the same color as the sprig under "The entourage". Own tracking (not `caps`, whose 0.22em won over
  // 0.16em) so "Parents of the Groom" stays on one line on a 360-390px phone.
  <h3 className="whitespace-nowrap font-serif text-[clamp(9.5px,2.8vw,11px)] font-bold uppercase tracking-[0.16em] text-[#78947F]">{children}</h3>
);
const Name: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="whitespace-nowrap font-serif text-[clamp(10.5px,3.2vw,13px)] uppercase leading-[1.6] tracking-[0.03em] text-white/90">{children}</p>
);

const EntourageBlock: React.FC<{ categories: EntourageCategory[] }> = ({ categories }) => {
  const get = (c: string) => categories.find((g) => g.category === c);
  const parents = get('Parents');
  const sponsors = get('Principal Sponsors');
  const secondary = get('Secondary Sponsors');
  const best = get('Best Man');
  const maid = get('Maid of Honor');
  const pairs = get('Groomsmen & Bridesmaids');
  const bearers = get('Bearers');
  const flower = get('Flower Girls');
  const groomsmen = pairs?.members.filter((m) => m.role === 'Groomsman') ?? [];
  const bridesmaids = pairs?.members.filter((m) => m.role === 'Bridesmaid') ?? [];

  return (
    <div className="mt-10 space-y-11 text-center">
      {parents && (
        <motion.section {...reveal}>
          <Intro text={ENTOURAGE_INTRO.Parents} />
          <div className="grid grid-cols-2 gap-x-4">
            {parents.members.map((m) => (
              <div key={m.role}>
                <GroupHead>{m.role}</GroupHead>
                <div className="mt-1.5">
                  {m.name.split(' & ').map((n) => (
                    <Name key={n}>{n}</Name>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {sponsors && (
        <motion.section {...reveal}>
          <Intro text={ENTOURAGE_INTRO['Principal Sponsors']} />
          <GroupHead>Principal Sponsors</GroupHead>
          <div className="mt-2 grid grid-cols-2 gap-x-2.5">
            {sponsors.members.map((m, i) => (
              <div key={m.name} className={i % 2 ? 'text-left' : 'text-right'}>
                <p className="whitespace-nowrap font-serif text-[clamp(9px,2.75vw,12px)] uppercase leading-[1.75] tracking-[0.01em] text-white/90">{m.name}</p>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {secondary && (
        <motion.section {...reveal}>
          <Intro text={ENTOURAGE_INTRO['Secondary Sponsors']} />
          <GroupHead>Secondary Sponsors</GroupHead>
          <div className="mt-4 space-y-5">
            {secondary.members.map((m) => (
              <div key={m.role}>
                <p className="font-serif text-[13px] italic text-white/80">{m.role}</p>
                <div className="mt-1">
                  {m.name.split(' & ').map((n) => (
                    <Name key={n}>{n}</Name>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {(best || maid) && (
        <motion.section {...reveal}>
          <Intro text={ENTOURAGE_INTRO['Best Man']} />
          <div className="grid grid-cols-2 gap-x-4">
            {[best, maid].map(
              (g) =>
                g && (
                  <div key={g.category}>
                    <GroupHead>{g.category}</GroupHead>
                    <div className="mt-1.5">
                      {g.members.map((m) => (
                        <Name key={m.name}>{m.name}</Name>
                      ))}
                    </div>
                  </div>
                )
            )}
          </div>
        </motion.section>
      )}

      {pairs && (
        <motion.section {...reveal}>
          <Intro text={ENTOURAGE_INTRO['Groomsmen & Bridesmaids']} />
          <div className="grid grid-cols-2 gap-x-4">
            {[
              ['Groomsmen', groomsmen],
              ['Bridesmaids', bridesmaids],
            ].map(([label, list]) => (
              <div key={label as string}>
                <GroupHead>{label as string}</GroupHead>
                <div className="mt-1.5">
                  {(list as typeof groomsmen).map((m) => (
                    <Name key={m.name}>{m.name}</Name>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {bearers && (
        <motion.section {...reveal}>
          <Intro text={ENTOURAGE_INTRO.Bearers} />
          <div className="grid grid-cols-2 gap-x-4 gap-y-5">
            {bearers.members.map((m) => (
              <div key={m.role}>
                <GroupHead>{m.role}</GroupHead>
                <div className="mt-1.5">
                  <Name>{m.name}</Name>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {flower && (
        <motion.section {...reveal}>
          <Intro text={ENTOURAGE_INTRO['Flower Girls']} />
          <GroupHead>Flower Girls</GroupHead>
          <div className="mt-1.5">
            {flower.members.map((m) => (
              <Name key={m.name}>{m.name}</Name>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
export const MobileSite: React.FC<{
  section: MobileSection;
  groomName: string;
  brideName: string;
  weddingDate: string;
  ceremonyTime: string;
  churchName: string;
  churchAddress: string;
  receptionName: string;
  receptionAddress: string;
  mapsChurchUrl: string;
  mapsReceptionUrl: string;
  rsvpDeadline: string;
  timeline: TimelineItem[];
  entourage: EntourageCategory[];
}> = ({
  section,
  groomName,
  brideName,
  weddingDate,
  ceremonyTime,
  churchName,
  churchAddress,
  receptionName,
  receptionAddress,
  mapsChurchUrl,
  mapsReceptionUrl,
  rsvpDeadline,
  timeline,
  entourage,
}) => {
  // Open the section named in the link (#rsvp, the sponsor QR link, ...)
  useEffect(() => {
    if (section === 'top') return;
    const t = window.setTimeout(() => scrollToSection(section, false), 60);
    return () => window.clearTimeout(t);
  }, [section]);

  const date = new Date(weddingDate);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const day = date.getDate();
  const ordinal = day % 10 === 1 && day !== 11 ? 'st' : day % 10 === 2 && day !== 12 ? 'nd' : day % 10 === 3 && day !== 13 ? 'rd' : 'th';
  const cd = useCountdown(weddingDate);

  const venues = [
    { label: 'The Ceremony', name: churchName, address: churchAddress, img: churchImg, url: mapsChurchUrl, time: ceremonyTime },
    { label: 'The Reception', name: receptionName, address: receptionAddress, img: nuanHallImg, url: mapsReceptionUrl, time: 'After the ceremony' },
  ];

  return (
    <div className="bg-white text-[#102F27] lining-nums">
      {/* ===== 0. PHOTO HERO (reference: full-screen couple photo, text laid over them): the photo fills the
          whole screen so the couple stands tall in the middle; names in calligraphy, the tagline, a sprig, then
          the date block (month / weekday - day - time between hairlines / year). Green + white only. ===== */}
      <section className="relative h-[100lvh] min-h-[560px] overflow-hidden bg-[#102F27]">
        <motion.img
          src={heroCoupleImg}
          alt={`${groomName} and ${brideName}`}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1.15 }}
          transition={{ duration: 2.4, ease: easeOut }}
          draggable={false}
          // Zoomed in on the couple, scaled from just above their feet so they grow upward and stay in frame
          style={{ transformOrigin: '50% 82%' }}
          className="absolute inset-0 h-full w-full object-cover object-[50%_center]"
        />
        {/* Soft forest wash so white text reads over the couple, a little darker behind the text column */}
        {/* The stone wall is pale, so the whole photo gets a forest wash, deeper behind the names (upper middle)
            and behind the date block (lower middle), so the white text always reads */}
        <div className="absolute inset-0 bg-[#102F27]/35" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_95%_40%_at_50%_33%,rgba(16,47,39,0.6)_0%,rgba(16,47,39,0.3)_60%,transparent_85%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_18%_at_50%_63%,rgba(16,47,39,0.45)_0%,transparent_80%)]" />
        {/* Photo fades into forest at the top and bottom, the same color as the phone's status bar and toolbar
            (iPhone Safari draws its bars over the page), so the photo runs edge to edge with no hard line */}
        {/* Eased fades (many stops) so the edge of the fade never shows as a line */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-48"
          style={{ background: `linear-gradient(to bottom, ${EASE_FADE})` }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[calc(100lvh-100svh+14rem)]"
          style={{ background: `linear-gradient(to top, ${EASE_FADE})` }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: easeOut }}
          className="relative flex h-[100svh] min-h-[560px] flex-col items-center justify-start px-6 pt-[max(5rem,17svh)] text-center text-white [text-shadow:0_2px_14px_rgba(16,47,39,0.55)]"
        >
          <p className="font-['Parisienne'] text-[1.5rem] text-white">our wedding story</p>
          {/* Ms Madi: the couple's chosen calligraphy for their names */}
          <h1 className="mt-4 font-['Ms_Madi'] font-normal leading-[0.85] drop-shadow-[0_4px_18px_rgba(0,0,0,0.35)] [&>span:not(:nth-child(2))]:!text-[clamp(5.2rem,min(28vw,13svh),7.4rem)]">
            <span className="block text-[clamp(5rem,min(27vw,12.5svh),7rem)]">{groomName}</span>
            <span className="-my-1 block text-[clamp(2.4rem,12vw,3.2rem)] leading-none">&amp;</span>
            <span className="block text-[clamp(5rem,min(27vw,12.5svh),7rem)]">{brideName}</span>
          </h1>
          <p className="mt-4 font-['Parisienne'] text-[1.55rem] text-white/95 drop-shadow">hope you&apos;ll celebrate with us</p>
          <Sprig className="mt-2 w-14 text-white/90" />

          {/* Date block: FEBRUARY / TUESDAY - 2 - AT 3:00 PM / 2027 */}
          <div className="mt-[clamp(2.5rem,7svh,4.5rem)] w-full max-w-[21rem] drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
            <p className="font-['Oswald'] text-[13px] font-light uppercase tracking-[0.4em] pl-[0.4em]">{month}</p>
            <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <p className="border-y border-white/60 py-1.5 font-['Oswald'] text-[11px] font-light uppercase tracking-[0.25em]">{weekday}</p>
              <p className="font-serif text-[3.8rem] font-normal leading-none">{day}</p>
              <p className="border-y border-white/60 py-1.5 font-['Oswald'] text-[11px] font-light uppercase tracking-[0.25em]">
                at {ceremonyTime}
              </p>
            </div>
            <p className="mt-2 font-['Oswald'] text-[13px] font-light uppercase tracking-[0.4em] pl-[0.4em]">{date.getFullYear()}</p>
          </div>
        </motion.div>
        <motion.button
          type="button"
          onClick={() => document.getElementById('m-save')?.scrollIntoView({ behavior: 'smooth' })}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="absolute inset-x-0 bottom-[calc(100lvh-100svh+max(1.25rem,env(safe-area-inset-bottom,0px)))] mx-auto flex w-max flex-col items-center text-white cursor-pointer"
        >
          <span className="font-serif text-[10px] uppercase tracking-[0.4em] pl-[0.4em]">Scroll down</span>
          <motion.span animate={{ y: [0, 5, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
            <ChevronDown className="mt-1 h-4 w-4" />
          </motion.span>
        </motion.button>
      </section>

      {/* ===== 1. SAVE THE DATE, positioned like the reference: "KEVIN + ARLEI" small caps at the top, then the
          date as huge high-contrast Didone numerals (Bodoni Moda, drawn a little taller) stacked on the right side of
          the screen: the solid month, the outlined day shifted slightly right with "Save the
          date" tucked into the open space of its 2, and the solid year running off the bottom of the screen.
          The weekday and time run up the right edge. Rows are placed in em of the numeral size so the composition
          scales as one. Numbers fade in sliding from alternating sides; the small text follows. ===== */}
      <section id="m-save" className="relative h-[100lvh] min-h-[600px] overflow-hidden bg-[#102F27] text-[#F4F1EA]">
        <div className="relative h-[100svh] min-h-[600px]">
          <motion.p
            // slides in from the right while fading in
            initial={{ opacity: 0, x: '30vw' }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, ease: easeOut }}
            className="absolute inset-x-0 top-[9svh] text-center tracking-[0.2em] font-serif text-[12px] font-semibold uppercase pl-[0.2em]"
          >
            {groomName} + {brideName}
          </motion.p>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="absolute inset-x-0 top-[15svh] font-['Bodoni_Moda'] font-normal leading-none lining-nums"
            style={{ fontSize: 'min(62vw, 28svh)' }}
          >
            {[
              { text: mm, right: '6vw', top: '0em', outline: false, delay: 0 },
              { text: dd, right: '2vw', top: '0.93em', outline: true, delay: 0.25 },
              { text: yy, right: '9vw', top: '1.86em', outline: false, delay: 0.5 },
            ].map((row, i) => (
              <motion.div
                key={i}
                variants={{ hidden: { opacity: 0, x: i % 2 ? '16vw' : '-16vw' }, show: { opacity: 1, x: 0 } }}
                transition={{ duration: 1.6, delay: row.delay, ease: easeOut }}
                className="absolute"
                style={{ right: row.right, top: row.top }}
              >
                {/* drawn a little taller than the font's own shape, like the reference */}
                <span
                  className={`inline-block origin-top scale-y-[1.2] tracking-[0.04em] ${
                    row.outline ? 'text-transparent [-webkit-text-stroke:1.2px_#F4F1EA]' : ''
                  }`}
                >
                  {row.text}
                </span>
                {i === 1 && (
                  // tucked into the open space of the day's 2, left of its diagonal (like the reference's 15)
                  <motion.span
                    variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                    transition={{ duration: 1.1, delay: 1.3, ease: easeOut }}
                    className="absolute left-[55%] top-[52%] whitespace-nowrap font-serif text-[9px] font-semibold uppercase leading-[1.8] tracking-[0.22em]"
                  >
                    Save the
                    <br />
                    date
                  </motion.span>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* weekday + time running up the right edge, beside the year */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 1.6 }}
            className="absolute bottom-[6svh] right-[2.5vw] rotate-180 font-serif text-[10px] font-semibold uppercase tracking-[0.35em] text-[#78947F] [writing-mode:vertical-rl]"
          >
            {weekday} &middot; {ceremonyTime}
          </motion.p>
        </div>
      </section>

      {/* ===== 2. THE INVITATION: monogram, names, date, venues. All text emerald (forest reads as black in
          small type); the date / venues / officiant block is bold. ===== */}
      <section id="m-details" className={`scroll-mt-0 ${pageX} pb-20 pt-16 text-center text-[#185844]`}>
        <motion.div {...reveal}>
          {/* K | A monogram in a thin oval */}
          <div className="mx-auto flex h-[6.5rem] w-[5rem] items-center justify-center rounded-[50%] border border-[#185844]/60">
            <span className="font-serif text-[1.9rem] leading-none">
              {groomName[0]}
              <span className="mx-1.5 inline-block h-6 w-px translate-y-0.5 bg-[#185844]" />
              {brideName[0]}
            </span>
          </div>
          <p className="mt-8 font-['Parisienne'] text-[1.6rem]">Always &amp; Forever</p>
          <p className={`mt-6 ${caps} text-[11px]`}>Together with our families,</p>
          <p className={`mt-5 ${caps} text-[11px] leading-[1.9]`}>
            We invite you to
            <br />
            join the wedding of
          </p>
          <h1 className={`mt-7 ${display} text-[clamp(3.2rem,17vw,4.4rem)] uppercase leading-[0.95] tracking-[0.02em]`}>
            {groomName}
            <span className="my-2 block font-['Parisienne'] text-[0.45em] normal-case">and</span>
            {brideName}
          </h1>

          <div className="font-bold">
            <p className="mt-9 font-serif text-[12px] uppercase tracking-[0.16em]">
              On {weekday}, the {day}
              {ordinal} of {month} {date.getFullYear()}
            </p>
            <p className="mt-1 font-serif text-[13px] uppercase tracking-[0.2em]">3:00 in the afternoon</p>

            <p className="mt-7 font-serif text-[12px] uppercase tracking-[0.25em] text-[#78947F]">Ceremony</p>
            <p className="mt-1 font-serif text-[12.5px] uppercase tracking-[0.14em]">{churchName}</p>
            <p className="mt-5 font-serif text-[12px] uppercase tracking-[0.25em] text-[#78947F]">Reception</p>
            <p className="mt-1 font-serif text-[12.5px] uppercase tracking-[0.14em]">
              {receptionName} · Nuan Farm &amp; Resort
            </p>

            <p className="mt-8 font-serif text-[12px] uppercase tracking-[0.25em] text-[#78947F]">Officiating Parish Priest</p>
            <p className="mt-1 font-serif text-[1.15rem] italic">{WEDDING_DETAILS.officiant}</p>
          </div>
        </motion.div>
      </section>

      {/* ===== 3. COUNTDOWN: an edge-to-edge photo cropped close to the couple (4:5), its top melting into the white
          invitation above and its bottom into forest green; the countdown sits on that green in big white numerals
          split by hairlines. The green runs straight on into the Ceremony block below. ===== */}
      <section className="bg-[#102F27] text-center text-white">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-white">
          <motion.img
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: easeOut }}
            src={countdownCoupleImg}
            alt={`${groomName} and ${brideName}`}
            draggable={false}
            // Already a close crop of the couple, about the frame's own shape: no zoom, keep their faces in view
            className="absolute inset-0 h-full w-full object-cover object-[50%_35%]"
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white via-white/50 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[22%] bg-gradient-to-t from-[#102F27] via-[#102F27]/60 to-transparent" />
        </div>

        <motion.div {...reveal} className={`${pageX} pb-4 pt-1`}>
          <p className="mb-5 font-['Parisienne'] text-[1.8rem]">we&rsquo;re getting married in</p>
          <div className="mx-auto grid max-w-sm grid-cols-4">
            {[
              [cd.days, 'Days'],
              [cd.hours, 'Hours'],
              [cd.minutes, 'Minutes'],
              [cd.seconds, 'Seconds'],
            ].map(([v, l], i) => (
              <div key={l} className={`flex flex-col items-center py-1 ${i ? 'border-l border-white/25' : ''}`}>
                <span className={`${display} text-[2.9rem] leading-none tabular-nums lining-nums`}>{String(v).padStart(2, '0')}</span>
                <span className="mt-2 font-['Oswald'] text-[10px] font-light uppercase tracking-[0.25em] pl-[0.25em] text-[#78947F]">{l}</span>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-8 flex max-w-[15rem] items-center gap-3" aria-hidden>
            <span className="h-px flex-1 bg-[#78947F]/40" />
            {/* Two interlocked wedding rings, with a small diamond on one */}
            <svg viewBox="0 0 44 28" className="w-11 text-[#78947F]" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden>
              <circle cx="16" cy="16" r="9" />
              <circle cx="28" cy="16" r="9" />
              <path d="M13.5 6.2 L16 3 L18.5 6.2 L16 7.6 Z" fill="currentColor" strokeLinejoin="round" />
            </svg>
            <span className="h-px flex-1 bg-[#78947F]/40" />
          </div>
        </motion.div>
      </section>

      {/* ===== 4. VENUES (no section title). Ceremony and Reception share one layout: centred Italiana title +
          sprig, the photo with a thin outline frame offset down-left behind it, then the name, time, address and
          a "Get directions" badge. The Ceremony sits on forest green (white text, sage accents), the
          Reception on white (green text). ===== */}
      <section>
        {venues.map((v, i) => {
          const dark = i === 0;
          return (
            <div key={v.label} className={`${pageX} pb-16 pt-16 ${dark ? 'bg-[#102F27] text-white' : ''}`}>
              <motion.article {...reveal} className="mx-auto max-w-sm text-center">
                <Title light={dark} noSprig size="whitespace-nowrap text-[clamp(1.8rem,9.5vw,2.6rem)]">{v.label}</Title>

                {/* Photo with a thin outline offset down-left behind it */}
                <div className="relative ml-4 mr-1 mt-10">
                  <span aria-hidden className={`absolute -left-4 top-4 h-full w-full border ${dark ? 'border-[#78947F]/70' : 'border-[#185844]/40'}`} />
                  <div
                    className={`relative overflow-hidden ${
                      dark ? 'shadow-[0_30px_60px_-24px_rgba(0,0,0,0.6)]' : 'shadow-[0_30px_60px_-30px_rgba(16,47,39,0.45)]'
                    }`}
                  >
                    <motion.img
                      initial={{ scale: 1.1 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 2.4, ease: easeOut }}
                      src={v.img}
                      alt={v.name}
                      className="block aspect-[4/5] w-full object-cover"
                    />
                  </div>
                </div>

                <h4
                  className={`mt-12 ${display} text-[clamp(1.6rem,7.5vw,2rem)] uppercase leading-[1.05] tracking-[0.04em] ${
                    dark ? 'text-white' : 'text-[#185844]'
                  }`}
                >
                  {v.name}
                </h4>
                <p className={`mt-3 ${caps} text-[11px] tracking-[0.3em] pl-[0.3em] ${dark ? 'text-[#78947F]' : 'text-[#185844]'}`}>{v.time}</p>
                {/* Reception address: one bold line, sized to the screen so it never wraps */}
                <p
                  className={`mx-auto mt-2 font-serif italic leading-snug ${
                    dark
                      ? 'max-w-[17rem] text-[14px] text-white/70'
                      : 'whitespace-nowrap text-[clamp(11px,3.4vw,14px)] font-bold text-[#185844]'
                  }`}
                >
                  {v.address}
                </p>
                {/* Get directions: same thin-outlined button on both venues (pin, spaced caps, arrow). Lines and
                    text are white on the forest Ceremony block, emerald on the white Reception block; it fills in
                    on hover/tap. */}
                <a
                  href={directionsUrl(v.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group mt-7 inline-flex items-center gap-3 border px-6 py-3 font-serif text-[11px] font-bold uppercase tracking-[0.3em] transition-colors active:scale-[0.98] ${
                    dark
                      ? 'border-white/60 text-white hover:bg-white hover:text-[#102F27]'
                      : 'border-[#185844]/60 text-[#185844] hover:bg-[#185844] hover:text-white'
                  }`}
                >
                  <MapPin className="h-4 w-4" strokeWidth={1.5} />
                  Get directions
                  <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                </a>
              </motion.article>
            </div>
          );
        })}

        <div className={`${pageX} pb-20`}>
          <RouteMap
            from={{ name: churchName, url: mapsChurchUrl }}
            to={{ name: receptionName, url: mapsReceptionUrl }}
          />
        </div>
      </section>

      {/* ===== 5. ORDER OF THE DAY (wedding timeline) ===== */}
      <section id="m-timeline" className={`relative overflow-hidden ${pageX} pb-20 pt-16`}>
        {/* Faded photo behind the timeline: the couple from above, very light, washed with white and melting into
            the page at the top and bottom so the green text stays readable */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <img
            src={timelineBgImg}
            alt=""
            draggable={false}
            className="h-full w-full object-cover object-[50%_45%] opacity-[0.22] grayscale-[35%]"
            style={{
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, #000 22%, #000 78%, transparent 100%)',
              maskImage: 'linear-gradient(to bottom, transparent 0%, #000 22%, #000 78%, transparent 100%)',
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(255,255,255,0.55)_0%,transparent_80%)]" />
        </div>
        <div className="relative">
        {/* Same hand-lettered "wedding timeline" title image as before, with the couple line under it */}
        <motion.div {...reveal} className="text-center">
          <h3>
            <img
              src={weddingTimelineTitleImg}
              alt="Wedding timeline"
              draggable={false}
              className="mx-auto block h-auto w-full max-w-[26rem] select-none"
            />
          </h3>
          <p className="mt-3 font-sans text-[12px] uppercase tracking-[0.3em] pl-[0.3em] text-[#102F27]">
            {groomName} &amp; {brideName} , {mm}.{dd}.{date.getFullYear()}
          </p>
        </motion.div>
        {/* Same as the desktop timeline: a center rail, events alternate right / left. Each event takes two
            half-rows, so a left event sits between two right ones. */}
        <ol
          className="relative mx-auto mt-8 grid max-w-sm"
          style={{ gridTemplateRows: `repeat(${timeline.length + 1}, 3.1rem)` }}
        >
          <span className="absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 bg-[#78947F]/70" aria-hidden />
          {timeline.map((e, i) => {
            const left = i % 2 === 1;
            const text = (
              <div className={left ? 'text-right' : 'text-left'}>
                <p className="text-[15px] font-semibold leading-tight tracking-[0.1em] text-[#185844]">{e.time}</p>
                <p className="mt-0.5 text-[10px] uppercase leading-snug tracking-[0.14em] text-[#102F27]/70">{e.title}</p>
              </div>
            );
            const icon = <TimelineIcon icon={e.icon} className="h-10 w-10 shrink-0 text-[#78947F]" />;
            return (
              <motion.li
                {...reveal}
                key={e.time}
                className="grid grid-cols-2 items-center"
                style={{ gridRow: `${i + 1} / span 2`, gridColumn: 1 }}
              >
                {left ? (
                  <div className="col-start-1 flex items-center justify-end gap-2">
                    {text}
                    {icon}
                    <span className="h-px w-3 shrink-0 bg-[#78947F]/70" />
                  </div>
                ) : (
                  <div className="col-start-2 flex items-center gap-2">
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
      </section>

      {/* ===== 6. ATTIRE ===== */}
      <section className={`${pageX} pb-20 pt-16 text-center`}>
        {/* Same "Wedding Attire" title image as before */}
        <motion.div {...reveal}>
          <h2>
            {/* The title PNG used as a mask over emerald, so it shows green instead of near-black forest */}
            <span
              role="img"
              aria-label="Wedding Attire"
              className="mx-auto block w-[min(100%,20rem)] aspect-[2051/610] bg-[#185844]"
              style={{
                WebkitMaskImage: `url(${weddingAttireTitleImg})`,
                maskImage: `url(${weddingAttireTitleImg})`,
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
              }}
            />
          </h2>
        </motion.div>
        {/* "Guests" + a short loving note to the ladies and the gentlemen, then the dress code and what to wear */}
        <motion.div {...reveal} className="mx-auto mt-6 max-w-sm">
          {/* Same title style as "The Route" (Italiana caps), without the sprig */}
          <Title noSprig size="text-[clamp(2rem,10vw,2.5rem)]">Guests</Title>
          <p className="mx-auto mt-4 max-w-[20rem] font-serif text-[17px] italic leading-relaxed text-[#185844]/80">
            We can&rsquo;t wait to see you all dressed up. Come in your best and share in the joy of our special day.
          </p>
          <p className={`mt-6 ${caps} text-[12px] tracking-[0.3em] pl-[0.3em] text-[#185844]`}>Formal or Semi-Formal</p>
          <div className="mt-4 space-y-1.5 font-serif text-[14px] text-[#185844]">
            <p>
              <span className="font-bold">Ladies</span> &middot; Filipiniana Inspired Attire
            </p>
            <p>
              <span className="font-bold">Gentlemen</span> &middot; Short or Long Sleeve Barong Tagalog
            </p>
          </div>
        </motion.div>

        {/* The guest attire board, edge to edge; its cream edges fade into the white page. Tap opens it full size. */}
        <div className="-mx-[clamp(1rem,6vw,1.75rem)] mt-6">
          {GUEST_ATTIRE.map((a) => (
            // Outer wrapper fades the left/right edges, the image itself fades top/bottom, so all four sides melt
            <motion.a
              {...reveal}
              key={a.label}
              href={a.img}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
              style={{ WebkitMaskImage: FADE_X, maskImage: FADE_X }}
            >
              {/* Taller frame than the image's own ratio: the figures are enlarged (object-cover crops the empty
                  cream margins at the sides and top), so they read bigger on a phone */}
              <img
                src={a.img}
                alt={a.alt}
                loading="lazy"
                draggable={false}
                className="block aspect-[1.48/1] w-full select-none object-cover object-[50%_70%]"
                style={{ WebkitMaskImage: FADE_Y, maskImage: FADE_Y }}
              />
            </motion.a>
          ))}
        </div>

        {/* Colour palette under the board: realistic paint dabs (no outline) with the colour name below */}
        <motion.div {...reveal} className="mx-auto mt-4 max-w-sm">
          <div className="grid grid-cols-4 gap-2">
            {DRESS_CODE.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.12, ease: easeOut }}
                className="flex flex-col items-center"
              >
                <div className="w-full drop-shadow-[0_6px_8px_rgba(16,47,39,0.18)]" style={{ transform: `rotate(${[-8, 6, -4, 9][i]}deg)` }}>
                  <PaintSwatch color={c.hex} id={`sw${i}`} seed={i * 7 + 2} />
                </div>
                {/* Label in the swatch's own colour, deepened a little so the light ones (Blush) still read on white */}
                <span
                  className="mt-1 whitespace-nowrap font-serif text-[10.5px] font-bold uppercase tracking-[0.12em]"
                  style={{ color: `color-mix(in srgb, ${c.hex} ${[80, 75, 65, 45][i]}%, #5a3a2a)` }}
                >
                  {c.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ===== 7. ENTOURAGE: forest ===== */}
      <section id="m-entourage" className="bg-[#102F27] px-3 pb-20 pt-16 text-white">
        {/* Same hand-lettered "The Entourage" title image as before */}
        <motion.div {...reveal} className="text-center">
          <img
            src={entourageTitleImg}
            alt="The Entourage"
            draggable={false}
            className="mx-auto block h-[clamp(2.5rem,12vw,3.75rem)] w-auto max-w-[min(100%,340px)] select-none object-contain brightness-0 invert"
          />
          <Sprig className="mx-auto mt-4 w-14 text-[#78947F]" />
        </motion.div>
        <EntourageBlock categories={entourage} />
      </section>

      {/* ===== 8. FAQs ===== */}
      <section id="m-faqs" className={`${pageX} pb-20 pt-16`}>
        <Title eyebrow="a few things to know">FAQs</Title>
        <motion.div {...reveal} className="mx-auto mt-6 max-w-md">
          <FaqAccordion />
        </motion.div>
        <p className="mx-auto mt-8 max-w-xs text-center font-serif text-[14px] italic text-[#185844]/70">
          Still have questions? Message us anytime, we&rsquo;re happy to help.
        </p>
      </section>

      {/* ===== 8b. GIFT GUIDE: forest green page after the FAQs, a gift-box line icon, title and the note ===== */}
      <section id="m-gifts" className={`bg-[#102F27] ${pageX} pb-20 pt-16 text-center text-white`}>
        <Title light eyebrow="with gratitude">{GIFT_NOTE.title}</Title>
        <motion.div {...reveal} className="mx-auto mt-8 max-w-[20rem]">
          <svg viewBox="0 0 48 48" className="mx-auto h-14 w-14 text-[#78947F]" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
            <rect x="8" y="20" width="32" height="22" rx="1.5" />
            <rect x="5" y="14" width="38" height="7" rx="1.5" />
            <path d="M24 14v28" />
            <path d="M24 14c-3-6-11-7-11-2s8 2 11 2zM24 14c3-6 11-7 11-2s-8 2-11 2z" />
          </svg>
          <p className="mt-6 font-['Parisienne'] text-[1.7rem] leading-snug text-white">{GIFT_NOTE.lines[0]}</p>
          <div className="mx-auto mt-5 flex max-w-[12rem] items-center gap-3" aria-hidden>
            <span className="h-px flex-1 bg-[#78947F]/40" />
            <span className="h-1.5 w-1.5 rotate-45 bg-[#78947F]" />
            <span className="h-px flex-1 bg-[#78947F]/40" />
          </div>
          <p className="mt-5 font-serif text-[16px] italic leading-relaxed text-white/80">{GIFT_NOTE.lines[1]}</p>
        </motion.div>
      </section>

      {/* ===== 9. RSVP: candlelit backdrop, form on an ivory card ===== */}
      <section id="m-rsvp" className="relative overflow-hidden text-white">
        <img src={tablescapeImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[#102F27]/80" />
        <div className={`relative ${pageX} pb-16 pt-16`}>
          <Title light eyebrow="kindly respond">RSVP</Title>
          <motion.div {...reveal} className="mx-auto mt-5 max-w-sm text-center font-serif text-[15px] leading-relaxed text-white/85">
            <p>Every seat is reserved with love.</p>
            <p className="mt-2">
              Kindly respond by <strong className="font-semibold text-white">{rsvpDeadline}</strong>. Only guests with a confirmed RSVP will be
              accommodated at the venue.
            </p>
            <p className={`mt-3 ${caps} text-[11px] text-white`}>Strictly no plus-ones</p>
          </motion.div>
          <RsvpForm className="mx-auto mt-8 max-w-md rounded-2xl bg-white p-[clamp(1.1rem,5vw,1.5rem)] text-[#102F27] shadow-2xl" />
        </div>
      </section>

      {/* ===== 10. FOOTER (same as desktop): names in Oswald caps, date, back to top. Sage "&" instead of
          the desktop's gold, since the phone page is green + white only ===== */}
      <footer
        className={`bg-[#102F27] ${pageX} pb-[max(3.5rem,calc(env(safe-area-inset-bottom,0px)+2.5rem))] pt-12 text-center text-white`}
      >
        <p className="whitespace-nowrap font-['Oswald'] text-[clamp(1.5rem,7vw,1.9rem)] font-light uppercase tracking-[0.3em] pl-[0.3em]">
          {groomName} <span className="font-script normal-case tracking-normal text-[#78947F]">&amp;</span> {brideName}
        </p>
        <p className="mt-3 font-['Oswald'] text-[12px] font-light uppercase tracking-[0.3em] pl-[0.3em] text-white/70">
          {weekday}, {month} {day}, {date.getFullYear()}
        </p>
        <button
          type="button"
          onClick={() => scrollToSection('top')}
          className="mt-7 font-['Oswald'] text-[11px] font-light uppercase tracking-[0.4em] pl-[0.4em] text-[#78947F] transition-colors hover:text-white cursor-pointer"
        >
          Back to top
        </button>
      </footer>
    </div>
  );
};
