import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Plus } from 'lucide-react';
import { EntourageCategory, TimelineItem } from '../types/wedding';
import { GIFT_NOTE, WEDDING_DETAILS } from '../data/weddingData';
import { directionsUrl, DRESS_CODE, FaqAccordion, GUEST_ATTIRE, RsvpForm, TimelineIcon } from './SubPages';
import { DesktopPhotoBand, ThanksPage } from './GalleryPages';
import { Sprig } from './Sprig';
import { RouteMap, useCountdown } from './MobileSite';
import churchImg from '../assets/images/CHRURCH.jpg';
// Prenup photo: city walk (landscape), fits the full-width hero
import heroCoupleImg from '../assets/images/image2.jpeg';
// Left half of the original two-photo image, so there's no seam line down the middle
import tablescapeImg from '../assets/images/wedding_tablescape_candlelight_single.jpg';
// Reception venue photo: Nuan Hall, Nuan Farm & Resort
import nuanHallImg from '../assets/images/NUANHALL.jpg';
import entourageTitleImg from '../assets/images/the_entourage_title.svg';
// Faded background behind the wedding timeline: the couple from above
import timelineBgImg from '../assets/images/image1-copy.jpeg';
import weddingTimelineTitleImg from '../assets/images/wedding_timeline_emerald.svg';
import weddingAttireTitleImg from '../assets/images/wedding_attire_hd_forest.png';


// Desktop (lg+) website version of the invitation: one long, sectioned page.
// Same order as the phone story: Details, photo, Timeline, photo, Entourage, photo, FAQs, RSVP.
export type DesktopSection = 'top' | 'details' | 'timeline' | 'entourage' | 'faqs' | 'rsvp';

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
} as const;

const NAV_LEFT: Array<{ id: DesktopSection; label: string }> = [
  { id: 'details', label: 'Details' },
  { id: 'timeline', label: 'Timeline' },
];
const NAV_RIGHT: Array<{ id: DesktopSection; label: string }> = [
  { id: 'entourage', label: 'Entourage' },
  { id: 'faqs', label: 'FAQs' },
  { id: 'rsvp', label: 'RSVP' },
];

export { Sprig };

const scrollToSection = (id: DesktopSection, smooth = true) => {
  const behavior: ScrollBehavior = smooth ? 'smooth' : 'auto';
  if (id === 'top') {
    window.scrollTo({ top: 0, behavior });
  } else {
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior, block: 'start' });
  }
};

// Section title: tall uppercase Oswald + leaf sprig (optional gold script line above)
const SectionHeading: React.FC<{ eyebrow?: string; title: string }> = ({ eyebrow, title }) => (
  <motion.div {...reveal} className="mb-16 text-center">
    {eyebrow && <p className="mb-2 font-script text-3xl text-[#B08A4F]">{eyebrow}</p>}
    <h2 className="font-['Oswald'] text-[clamp(2.25rem,3.6vw,3.25rem)] font-light uppercase tracking-[0.35em] text-[#102F27]">
      {title}
    </h2>
    <Sprig className="mx-auto mt-4 w-16 text-[#185844]/70" />
  </motion.div>
);

// Slanted edge like the bottom of the hero; `fill` is the color of the neighbouring section
const Diagonal: React.FC<{ edge: 'top' | 'bottom'; fill: string }> = ({ edge, fill }) => (
  <svg
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
    aria-hidden
    className={`absolute inset-x-0 h-20 w-full ${edge === 'top' ? 'top-0' : 'bottom-0'}`}
  >
    <path d={edge === 'top' ? 'M0,0 L100,0 L100,15 L0,100 Z' : 'M0,100 L100,100 L100,0 Z'} fill={fill} />
  </svg>
);

interface DesktopSiteProps {
  section: DesktopSection;
  groomName: string;
  brideName: string;
  displayDate: string;
  ceremonyTime: string;
  churchName: string;
  churchAddress: string;
  receptionName: string;
  receptionAddress: string;
  mapsChurchUrl: string;
  mapsReceptionUrl: string;
  rsvpDeadline: string;
  timeline: TimelineItem[];
  /** "Kevin & Arlei , 02.02.2027" line under the timeline title (same as mobile) */
  timelineCoupleLine: string;
  entourage: EntourageCategory[];
}

export const DesktopSite: React.FC<DesktopSiteProps> = ({
  section,
  groomName,
  brideName,
  displayDate,
  ceremonyTime,
  churchName,
  churchAddress,
  receptionName,
  receptionAddress,
  mapsChurchUrl,
  mapsReceptionUrl,
  rsvpDeadline,
  timeline,
  timelineCoupleLine,
  entourage,
}) => {
  // Jump to the section named in the URL (e.g. #rsvp): instantly on first load, smoothly afterwards
  const isFirstScroll = useRef(true);
  useEffect(() => {
    const smooth = !isFirstScroll.current;
    isFirstScroll.current = false;
    const t = window.setTimeout(() => scrollToSection(section, smooth), 50);
    return () => window.clearTimeout(t);
  }, [section]);

  // Nav is transparent over the hero photo and turns white once the page scrolls
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  // After an RSVP: the popup, then a full-screen thank-you; "Back to the beginning" (or 8s) returns to the top
  // with a fresh form
  const [showThanks, setShowThanks] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const restart = () => {
    setShowThanks(false);
    setFormKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const navText = `text-[12px] uppercase tracking-[0.22em] ${scrolled ? 'text-[#102F27]/75' : 'text-white'}`;
  const navLink = 'py-2 hover:opacity-70 transition-opacity cursor-pointer';

  // Countdown to the ceremony, from the shared wedding data
  const cd = useCountdown(WEDDING_DETAILS.weddingDate);

  const venues = [
    { label: 'Ceremony', name: churchName, address: churchAddress, time: ceremonyTime, img: churchImg, url: mapsChurchUrl, note: `Officiated by ${WEDDING_DETAILS.officiant}` },
    { label: 'Reception', name: receptionName, address: receptionAddress, time: 'After the ceremony', img: nuanHallImg, url: mapsReceptionUrl, note: '' },
  ];

  return (
    <div className="min-h-screen bg-[#F2EBDD] text-[#102F27] selection:bg-[#185844] selection:text-[#F2EBDD]">
      {/* ================= NAV (links split around a center monogram; white once scrolled) ================= */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-white/95 shadow-[0_10px_30px_rgba(16,47,39,0.08)] backdrop-blur-xl' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-10 px-10">
          <nav className={`flex justify-end gap-10 ${navText}`}>
            {NAV_LEFT.map((n) => (
              <button key={n.id} type="button" onClick={() => scrollToSection(n.id)} className={navLink}>
                {n.label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => scrollToSection('top')}
            aria-label="Back to top"
            className={`relative flex flex-col items-center justify-center bg-white shadow-[0_10px_30px_rgba(0,0,0,0.12)] transition-all duration-500 cursor-pointer ${
              scrolled ? 'my-2 h-14 w-14' : 'mt-5 h-24 w-24'
            }`}
          >
            {/* Classic serif monogram: K & A with a small script ampersand */}
            <span className={`font-serif font-medium text-[#B08A4F] leading-none whitespace-nowrap transition-all duration-500 ${scrolled ? 'text-[1.35rem]' : 'text-[2.2rem]'}`}>
              {groomName[0]}
              <span className="px-[0.1em] align-[0.15em] font-script text-[0.45em] font-normal">&amp;</span>
              {brideName[0]}
            </span>
            {!scrolled && <Sprig className="absolute -right-7 -top-3 w-12 text-white/90" />}
          </button>

          <nav className={`flex gap-10 ${navText}`}>
            {NAV_RIGHT.map((n) => (
              <button key={n.id} type="button" onClick={() => scrollToSection(n.id)} className={navLink}>
                {n.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ================= HERO (full-bleed photo, centered names) ================= */}
      <section className="relative h-screen min-h-[640px] overflow-hidden">
        <motion.img
          src={heroCoupleImg}
          alt={`${groomName} and ${brideName}`}
          // Zoomed in from the right so the passer-by at the photo's bottom-left edge is cropped out
          initial={{ scale: 1.32 }}
          animate={{ scale: 1.22 }}
          transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: '88% 85%' }}
          className="absolute inset-0 h-full w-full object-cover object-[center_85%]"
        />
        <div className="absolute inset-0 bg-[#102F27]/25" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_50%,rgba(16,47,39,0.5)_0%,transparent_60%)]" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/35 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative h-full text-white"
        >
          {/* Names are centred on the dark bridge (about 75% across at any width), so the couple
              (left of centre in the photo) stays clear and the block never hugs the screen edge */}
          <div className="absolute left-[75%] top-[54%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center whitespace-nowrap text-center">
          <p className="font-['Parisienne'] text-[2rem] text-white/95 drop-shadow">our wedding story</p>
          {/* Couple names in calligraphy */}
          <h1 className="mt-6 font-names font-normal leading-[0.95] drop-shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
            <span className="block text-[clamp(5.5rem,10vw,9rem)]">{groomName}</span>
            {/* Small calligraphy ampersand so it doesn't compete with the script names */}
            <span className="block my-1 font-script text-[clamp(2.5rem,3.6vw,3.3rem)] text-[#E6D3AE]">&amp;</span>
            <span className="block text-[clamp(5.5rem,10vw,9rem)]">{brideName}</span>
          </h1>
          <p className="mt-4 font-['Parisienne'] text-[2rem] text-white/95 drop-shadow">hope you&apos;ll celebrate with us</p>
          <Sprig className="mt-5 w-20 text-white/85" />
          </div>
        </motion.div>

        {/* Diagonal cut into the next section */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-28 w-full" aria-hidden>
          <path d="M0,100 L0,35 L58,100 Z" fill="#FFFFFF" />
          <path d="M0,100 L100,25 L100,100 Z" fill="#F2EBDD" />
        </svg>
      </section>

      {/* ================= INVITATION LINE ================= */}
      <section className="pb-24 pt-16 text-center">
        <motion.div {...reveal}>
          <p className="font-['Oswald'] text-[2rem] font-light uppercase tracking-[0.6em] text-[#102F27]">Invite You</p>
          <p className="my-2 font-script text-3xl text-[#B08A4F]">to</p>
          <p className="font-['Oswald'] text-[2rem] font-light uppercase tracking-[0.6em] text-[#102F27]">Join in the Celebration</p>
          <Sprig className="mx-auto mt-4 w-16 text-[#185844]/70" />
          <p className="mt-8 text-xs uppercase tracking-[0.45em] text-[#185844]">
            {displayDate} · {ceremonyTime}
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.45em] text-[#78947F]">{churchName}</p>
          <div className="mt-10 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => scrollToSection('details')}
              className="border border-[#102F27]/40 px-9 py-3.5 font-['Oswald'] text-xs font-light uppercase tracking-[0.4em] text-[#102F27] hover:bg-[#102F27] hover:text-white transition-colors cursor-pointer"
            >
              View Details
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('rsvp')}
              className="border border-[#185844] bg-[#185844] px-9 py-3.5 font-['Oswald'] text-xs font-light uppercase tracking-[0.4em] text-white hover:bg-[#102F27] transition-colors cursor-pointer"
            >
              RSVP
            </button>
          </div>
        </motion.div>
      </section>

      {/* ================= COUNTDOWN (same as the phone) ================= */}
      <section className="bg-[#102F27] py-16 text-center text-white">
        <motion.div {...reveal}>
          <p className="font-['Parisienne'] text-[2.2rem]">we&rsquo;re getting married in</p>
          <div className="mx-auto mt-6 grid max-w-2xl grid-cols-4">
            {[
              [cd.days, 'Days'],
              [cd.hours, 'Hours'],
              [cd.minutes, 'Minutes'],
              [cd.seconds, 'Seconds'],
            ].map(([v, l], i) => (
              <div key={l} className={`flex flex-col items-center ${i ? 'border-l border-white/25' : ''}`}>
                <span className="font-['Italiana'] text-6xl leading-none tabular-nums lining-nums">{String(v).padStart(2, '0')}</span>
                <span className="mt-3 font-['Oswald'] text-xs font-light uppercase tracking-[0.3em] text-[#78947F]">{l}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ================= DETAILS ================= */}
      <section id="section-details" className="scroll-mt-20 bg-white pb-28 pt-24">
        <div className="mx-auto max-w-6xl px-10">
          <SectionHeading title="Ceremony & Reception" />

          <div className="grid grid-cols-2 gap-16">
            {venues.map((v, i) => (
              <motion.div key={v.label} {...reveal} transition={{ ...reveal.transition, delay: i * 0.12 }} className="group text-center">
                <div className="relative mx-auto w-full">
                  <div className="absolute inset-0 translate-x-4 translate-y-4 border border-[#B08A4F]/50" />
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={v.img} alt={v.name} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-[1.04]" />
                  </div>
                </div>
                <p className="mt-12 font-['Oswald'] text-sm font-light uppercase tracking-[0.5em] text-[#B08A4F]">{v.label}</p>
                <h3 className="mt-3 font-serif text-3xl text-[#102F27]">{v.name}</h3>
                <p className="mt-3 text-sm text-stone-500">{v.address}</p>
                {v.time && <p className="mt-2 font-['Oswald'] text-base font-light uppercase tracking-[0.3em] text-[#185844]">{v.time}</p>}
                {v.note && <p className="mt-2 font-serif text-lg italic text-[#102F27]/75">{v.note}</p>}
                <a
                  href={directionsUrl(v.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-7 inline-flex items-center gap-3 border border-[#185844]/60 px-7 py-3.5 font-serif text-xs font-bold uppercase tracking-[0.3em] text-[#185844] transition-colors hover:bg-[#185844] hover:text-white"
                >
                  {/* same outlined button as the phone */}
                  <MapPin className="h-4 w-4" strokeWidth={1.5} />
                  Get directions
                  <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                </a>
              </motion.div>
            ))}
          </div>

          {/* Plan your arrival: same route map + arrival time as the phone */}
          <RouteMap wide from={{ name: churchName, url: mapsChurchUrl }} to={{ name: receptionName, url: mapsReceptionUrl }} />
        </div>
      </section>

      {/* ================= DRESS CODE ("Wedding Attire" card, same as mobile) ================= */}
      <section className="bg-[#F2EBDD] py-28">
        <motion.div {...reveal} className="mx-auto max-w-3xl px-10 text-center">
          <h2>
            {/* The title PNG used as a mask over emerald, so it shows green instead of near-black forest */}
            <span
              role="img"
              aria-label="Wedding Attire"
              className="mx-auto block w-[30rem] max-w-full aspect-[2051/610] bg-[#185844]"
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
          {/* Same words as the phone */}
          <p className="mt-8 font-['Oswald'] text-3xl font-light uppercase tracking-[0.35em] text-[#185844]">Guests</p>
          <p className="mx-auto mt-4 max-w-xl font-serif text-xl italic leading-relaxed text-[#185844]/80">
            We can&rsquo;t wait to see you all dressed up. Come in your best and share in the joy of our special day.
          </p>
          <p className="mt-8 font-serif text-sm font-semibold uppercase tracking-[0.3em] text-[#185844]">Formal or Semi-Formal</p>
          <div className="mt-4 space-y-1.5 font-serif text-lg text-[#185844]">
            <p>
              <span className="font-bold">Ladies</span> &middot; Filipiniana Inspired Attire
            </p>
            <p>
              <span className="font-bold">Gentlemen</span> &middot; Short or Long Sleeve Barong Tagalog
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-2xl grid-cols-4 gap-5">
            {DRESS_CODE.map((c, i) => (
              <motion.div
                key={c.name}
                {...reveal}
                transition={{ ...reveal.transition, delay: i * 0.1 }}
                className="flex min-w-0 flex-col items-center"
              >
                <div
                  className="aspect-[3/4] w-full rounded-t-full shadow-[0_10px_24px_rgba(16,47,39,0.15)]"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="mt-4 font-['Oswald'] text-xs font-light uppercase tracking-[0.3em] text-[#102F27]/70">{c.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
        {/* Guest attire board (all looks in one image) */}
        <div className="mx-auto mt-16 max-w-5xl px-10">
          {GUEST_ATTIRE.map((a, i) => (
            <motion.figure
              {...reveal}
              transition={{ ...reveal.transition, delay: i * 0.15 }}
              key={a.label}
              className="text-center"
            >
              {/* Cream board: all four edges fade into the ivory section (outer = left/right, image = top/bottom) */}
              <a
                href={a.img}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
                style={{
                  WebkitMaskImage: 'linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)',
                  maskImage: 'linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)',
                }}
              >
                <img
                  src={a.img}
                  alt={a.alt}
                  loading="lazy"
                  className="block w-full mix-blend-multiply"
                  style={{
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent, #000 12%, #000 90%, transparent)',
                    maskImage: 'linear-gradient(to bottom, transparent, #000 12%, #000 90%, transparent)',
                  }}
                />
              </a>
            </motion.figure>
          ))}
        </div>
      </section>

      {/* ================= TIMELINE ================= */}
      <section id="section-timeline" className="relative scroll-mt-20 overflow-hidden bg-white pb-28 pt-20">
        {/* Faded photo behind the timeline: the couple from above, very light, washed with white and melting into
            the page at the top and bottom so the green text stays readable */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <img
            src={timelineBgImg}
            alt=""
            draggable={false}
            className="h-full w-full object-cover object-[50%_40%] opacity-[0.22] grayscale-[35%]"
            style={{
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, #000 22%, #000 78%, transparent 100%)',
              maskImage: 'linear-gradient(to bottom, transparent 0%, #000 22%, #000 78%, transparent 100%)',
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(255,255,255,0.55)_0%,transparent_80%)]" />
        </div>
        <div className="relative mx-auto max-w-5xl px-10 text-[#102F27]">
          {/* Same design as the mobile Timeline page: hand-lettered title, couple line, center rail with line icons */}
          <motion.div {...reveal} className="text-center">
            <img
              src={weddingTimelineTitleImg}
              alt="Wedding timeline"
              draggable={false}
              className="mx-auto block h-auto w-full max-w-[34rem] select-none"
            />
            <p className="mt-4 text-sm uppercase tracking-[0.3em] pl-[0.3em]">{timelineCoupleLine}</p>
          </motion.div>

          {/* Events are staggered: each takes two half-rows, so a left event sits between two right ones */}
          <ol
            className="relative mx-auto mt-14 grid max-w-2xl"
            style={{ gridTemplateRows: `repeat(${timeline.length + 1}, 3.75rem)` }}
          >
            <span className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-[#78947F]/70" />
            {timeline.map((e, i) => {
              const left = i % 2 === 1;
              const text = (
                <div className={left ? 'text-right' : 'text-left'}>
                  <p className="text-lg font-semibold tracking-[0.12em] text-[#185844]">{e.time}</p>
                  <p className="mt-0.5 text-sm uppercase leading-snug tracking-[0.16em] text-[#102F27]/70">{e.title}</p>
                </div>
              );
              const icon = <TimelineIcon icon={e.icon} className="h-16 w-16 shrink-0 text-[#78947F]" />;
              return (
                <motion.li
                  key={e.time}
                  {...reveal}
                  transition={{ ...reveal.transition, delay: i * 0.08 }}
                  className="grid grid-cols-2 items-center"
                  style={{ gridRow: `${i + 1} / span 2`, gridColumn: 1 }}
                >
                  {left ? (
                    <div className="col-start-1 flex items-center justify-end gap-4">
                      {text}
                      {icon}
                      <span className="h-px w-5 shrink-0 bg-[#78947F]/70" />
                    </div>
                  ) : (
                    <div className="col-start-2 flex items-center gap-4">
                      <span className="h-px w-5 shrink-0 bg-[#78947F]/70" />
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

      {/* ================= ENTOURAGE (wedding-program style) ================= */}
      <section id="section-entourage" className="scroll-mt-20 bg-white pb-28 pt-24">
        <div className="mx-auto max-w-3xl px-10 text-center">
          <motion.div {...reveal}>
            <img src={entourageTitleImg} alt="The Entourage" className="mx-auto h-16 w-auto object-contain" />
          </motion.div>

          <div className="mt-14">
            {entourage.map((group, i) => (
              <motion.div key={group.category} {...reveal}>
                {i > 0 && (
                  <div className="my-12 flex items-center justify-center gap-3" aria-hidden>
                    <span className="h-px w-16 bg-[#B08A4F]/40" />
                    <span className="h-1.5 w-1.5 rotate-45 bg-[#B08A4F]/70" />
                    <span className="h-px w-16 bg-[#B08A4F]/40" />
                  </div>
                )}
                <h3 className="font-['Oswald'] text-sm font-light uppercase tracking-[0.45em] text-[#B08A4F]">
                  {group.category.split('(')[0].trim()}
                </h3>
                <div
                  className={`mx-auto mt-5 grid gap-y-2 ${
                    group.members.length > 3 ? 'max-w-2xl grid-cols-2 gap-x-10' : 'grid-cols-1'
                  }`}
                >
                  {/* Two columns meet at the centre: left column right-aligned, right column left-aligned */}
                  {group.members.map((m, i) => (
                    <div
                      key={`${m.role}-${m.name}`}
                      className={`${group.showRoles ? 'pt-2' : ''} ${group.members.length > 3 ? (i % 2 ? 'text-left' : 'text-right') : ''}`}
                    >
                      {group.showRoles && (
                        <p className="text-[10px] uppercase tracking-[0.3em] text-[#78947F]">{m.role}</p>
                      )}
                      <p className="font-serif text-2xl leading-snug text-[#102F27]">{m.name}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <DesktopPhotoBand photo={2} groomName={groomName} brideName={brideName} />

      {/* ================= FAQS (same as the phone page: forest band with gold diagonals, ivory card) ================= */}
      <section id="section-faqs" className="scroll-mt-20 relative bg-[#F2EBDD] pb-28">
        <div aria-hidden className="absolute inset-x-0 top-0 h-80 overflow-hidden bg-[#102F27]">
          <span className="absolute right-[30%] -top-10 h-[150%] w-[2px] origin-top rotate-[32deg] bg-gradient-to-b from-[#B08A4F] via-[#B08A4F]/70 to-transparent" />
          <span className="absolute right-[22%] -top-10 h-[150%] w-px origin-top rotate-[32deg] bg-gradient-to-b from-[#E6D3AE]/80 via-[#E6D3AE]/40 to-transparent" />
        </div>
        <div className="relative mx-auto max-w-3xl px-10 pt-24">
          <motion.div {...reveal} className="rounded-[2rem] bg-[#FBF8F1] px-12 pb-6 pt-11 shadow-[0_30px_60px_-30px_rgba(16,47,39,0.45)]">
            <h2 className="flex items-center gap-3">
              <Plus className="h-8 w-8 text-[#B08A4F]" strokeWidth={2.25} aria-hidden />
              <span className="font-serif text-5xl font-semibold leading-none text-[#102F27]">FAQs</span>
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[#102F27]/60">A few answers to help you plan for our day.</p>
            <FaqAccordion />
          </motion.div>
          <p className="mt-9 text-center text-sm text-[#102F27]/60">Still have questions? Message us anytime, we&rsquo;re happy to help.</p>
        </div>
      </section>

      {/* ================= GIFT GUIDE (forest band after the FAQs) ================= */}
      <section className="bg-[#102F27] py-24 text-center text-white">
        <motion.div {...reveal} className="mx-auto max-w-3xl px-10">
          <p className="font-script text-3xl text-[#E6D3AE]">with gratitude</p>
          <h2 className="mt-2 font-['Oswald'] text-4xl font-light uppercase tracking-[0.35em]">{GIFT_NOTE.title}</h2>
          <Sprig className="mx-auto mt-4 w-16 text-[#78947F]" />
          <p className="mt-8 font-['Parisienne'] text-[2.2rem] leading-snug">{GIFT_NOTE.lines[0]}</p>
          <p className="mx-auto mt-4 max-w-xl font-serif text-xl italic leading-relaxed text-white/80">{GIFT_NOTE.lines[1]}</p>
        </motion.div>
      </section>

      {/* ================= RSVP (photo band) ================= */}
      <section id="section-rsvp" className="scroll-mt-20 relative overflow-hidden py-36">
        <img src={tablescapeImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[#102F27]/75" />
        <Diagonal edge="top" fill="#102F27" />
        <div className="relative mx-auto grid max-w-6xl grid-cols-2 items-center gap-20 px-10">
          <motion.div {...reveal} className="text-center text-white">
            <p className="font-script text-3xl text-[#E6D3AE]">kindly respond</p>
            <h2 className="mt-2 font-['Oswald'] text-[clamp(2.75rem,4.5vw,4rem)] font-light uppercase leading-tight tracking-[0.25em]">
              Will you
              <br />
              join us?
            </h2>
            <Sprig className="mx-auto mt-5 w-16 text-white/80" />
            {/* Same note as the phone page */}
            <p className="mx-auto mt-5 max-w-sm font-serif text-lg leading-relaxed text-white/85">
              Every seat is reserved with love. Kindly respond by <strong className="font-semibold text-white">{rsvpDeadline}</strong>. Only
              guests with a confirmed RSVP will be accommodated at the venue.
            </p>
            <p className="mt-4 font-['Oswald'] text-sm font-light uppercase tracking-[0.4em] text-white">Strictly no plus-ones</p>
          </motion.div>
          <motion.div {...reveal} className="bg-white p-10 shadow-2xl">
            <p className="mb-6 text-center font-['Oswald'] text-lg font-light uppercase tracking-[0.45em] text-[#102F27]">RSVP</p>
            <RsvpForm key={formKey} onDone={() => setShowThanks(true)} />
          </motion.div>
        </div>
        <Diagonal edge="bottom" fill="#102F27" />
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-[#102F27] pb-16 pt-10 text-center text-white">
        <div className="mx-auto flex h-20 w-20 items-center justify-center bg-white">
          <span className="font-serif font-medium text-[1.9rem] leading-none whitespace-nowrap text-[#B08A4F]">
            {groomName[0]}
            <span className="px-[0.1em] align-[0.15em] font-script text-[0.45em] font-normal">&amp;</span>
            {brideName[0]}
          </span>
        </div>
        <p className="mt-8 font-['Oswald'] text-3xl font-light uppercase tracking-[0.35em]">
          {groomName} <span className="font-script normal-case tracking-normal text-[#E6D3AE]">&amp;</span> {brideName}
        </p>
        <p className="mt-3 font-['Oswald'] text-sm font-light uppercase tracking-[0.4em] text-white/70">{displayDate}</p>
        <button
          type="button"
          onClick={() => scrollToSection('top')}
          className="mt-8 font-['Oswald'] text-xs font-light uppercase tracking-[0.4em] text-[#78947F] hover:text-white transition-colors cursor-pointer"
        >
          Back to top
        </button>
      </footer>

      {showThanks && (
        <div className="fixed inset-0 z-[70] overflow-y-auto">
          <ThanksPage
            onRestart={restart}
            groomName={groomName}
            brideName={brideName}
            displayDate={displayDate}
            autoReturn
          />
        </div>
      )}
    </div>
  );
};
