import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Navigation } from 'lucide-react';
import { EntourageCategory, TimelineItem } from '../types/wedding';
import { DRESS_CODE, RsvpForm } from './SubPages';
import jardinVenueImg from '../assets/images/jardin_venue_1791676573787.jpg';
import meadowCoupleImg from '../assets/images/wedding_couple_meadow_1791602914531.jpg';
import tablescapeImg from '../assets/images/wedding_tablescape_candlelight_1791602927298.jpg';
import entourageTitleImg from '../assets/images/the_entourage_title.svg';


// Desktop (lg+) website version of the invitation: one long, sectioned page.
export type DesktopSection = 'top' | 'details' | 'timeline' | 'entourage' | 'rsvp';

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
} as const;

const NAV_LEFT: Array<{ id: DesktopSection; label: string }> = [
  { id: 'details', label: 'Details' },
  { id: 'entourage', label: 'Entourage' },
];
const NAV_RIGHT: Array<{ id: DesktopSection; label: string }> = [
  { id: 'timeline', label: 'Timeline' },
  { id: 'rsvp', label: 'RSVP' },
];

// Small botanical sprig used around the monogram and under the hero names
export const Sprig: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 80 40" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" className={className} aria-hidden>
    <path d="M6 30 C 26 22, 46 20, 74 10" />
    <path d="M20 25 C 18 17, 22 12, 27 10 C 28 16, 25 21, 20 25 Z" />
    <path d="M32 22 C 34 14, 40 11, 45 11 C 43 17, 38 21, 32 22 Z" />
    <path d="M28 24 C 30 30, 36 33, 41 33 C 39 28, 34 25, 28 24 Z" />
    <path d="M46 18 C 49 24, 55 26, 60 25 C 57 20, 52 18, 46 18 Z" />
    <path d="M52 16 C 54 10, 59 7, 64 7 C 62 12, 58 15, 52 16 Z" />
  </svg>
);

const scrollToSection = (id: DesktopSection, smooth = true) => {
  const behavior: ScrollBehavior = smooth ? 'smooth' : 'auto';
  if (id === 'top') {
    window.scrollTo({ top: 0, behavior });
  } else {
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior, block: 'start' });
  }
};

// Section title in the hero's style: gold script line + tall uppercase Oswald + leaf sprig
const SectionHeading: React.FC<{ eyebrow: string; title: string }> = ({ eyebrow, title }) => (
  <motion.div {...reveal} className="mb-16 text-center">
    <p className="font-script text-3xl text-[#B08A4F]">{eyebrow}</p>
    <h2 className="mt-2 font-['Oswald'] text-[clamp(2.25rem,3.6vw,3.25rem)] font-light uppercase tracking-[0.35em] text-[#102F27]">
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
  const navText = `text-[12px] uppercase tracking-[0.22em] ${scrolled ? 'text-[#102F27]/75' : 'text-white'}`;
  const navLink = 'py-2 hover:opacity-70 transition-opacity cursor-pointer';

  const venues = [
    { label: 'Ceremony', name: churchName, address: churchAddress, time: ceremonyTime, img: jardinVenueImg, url: mapsChurchUrl },
    { label: 'Reception', name: receptionName, address: receptionAddress, img: tablescapeImg, url: mapsReceptionUrl },
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
            <span className={`font-['Parisienne'] text-[#B08A4F] leading-none whitespace-nowrap transition-all duration-500 ${scrolled ? 'text-lg' : 'text-[1.9rem]'}`}>
              {groomName[0]}
              <span className="text-[0.6em] px-0.5">&amp;</span>
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
          src={meadowCoupleImg}
          alt={`${groomName} and ${brideName}`}
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 h-full w-full object-cover object-[center_40%]"
        />
        <div className="absolute inset-0 bg-[#102F27]/25" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,47,39,0.45)_0%,transparent_65%)]" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/35 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex h-full flex-col items-center justify-center px-6 pt-16 text-center text-white"
        >
          <p className="font-['Parisienne'] text-[2rem] text-white/95 drop-shadow">our wedding story</p>
          {/* Couple names in calligraphy */}
          <h1 className="mt-6 font-['Parisienne'] font-normal leading-[0.95] drop-shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
            <span className="block text-[clamp(5.5rem,10vw,9rem)]">{groomName}</span>
            <span className="block -my-3 text-[clamp(3rem,5vw,4.5rem)] text-[#E6D3AE]">&amp;</span>
            <span className="block text-[clamp(5.5rem,10vw,9rem)]">{brideName}</span>
          </h1>
          <p className="mt-4 font-['Parisienne'] text-[2rem] text-white/95 drop-shadow">hope you&apos;ll celebrate with us</p>
          <Sprig className="mt-5 w-20 text-white/85" />
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
          <p className="mt-8 text-xs uppercase tracking-[0.45em] text-[#185844]">{displayDate}</p>
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

      {/* ================= DETAILS ================= */}
      <section id="section-details" className="scroll-mt-20 bg-white pb-28 pt-24">
        <div className="mx-auto max-w-6xl px-10">
          <SectionHeading eyebrow="when & where" title="Ceremony & Reception" />

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
                <a
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 border-b border-[#185844]/40 pb-1 font-['Oswald'] text-xs font-light uppercase tracking-[0.4em] text-[#185844] hover:border-[#185844] transition-colors"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  Get directions
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= DRESS CODE (photo band) ================= */}
      <section className="relative overflow-hidden py-32">
        <img src={jardinVenueImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[#102F27]/70" />
        <Diagonal edge="top" fill="#FFFFFF" />
        <motion.div {...reveal} className="relative text-center text-white">
          <p className="font-script text-3xl text-[#E6D3AE]">formal attire</p>
          <h2 className="mt-2 font-['Oswald'] text-[clamp(2.5rem,4vw,3.5rem)] font-light uppercase tracking-[0.35em]">Dress Code</h2>
          <Sprig className="mx-auto mt-4 w-16 text-white/80" />
          <div className="mt-12 flex items-start justify-center gap-16">
            {DRESS_CODE.map((c) => (
              <div key={c.name} className="flex flex-col items-center gap-5">
                <div className="rounded-full border border-white/50 p-2">
                  <div className="h-20 w-20 rounded-full" style={{ backgroundColor: c.hex }} />
                </div>
                <span className="font-['Oswald'] text-xs font-light uppercase tracking-[0.35em]">{c.name}</span>
              </div>
            ))}
          </div>
          <p className="mt-10 font-script text-2xl text-white/80">kindly avoid white &amp; ivory</p>
        </motion.div>
        <Diagonal edge="bottom" fill="#FFFFFF" />
      </section>

      {/* ================= ENTOURAGE (wedding-program style) ================= */}
      <section id="section-entourage" className="scroll-mt-20 bg-white pb-28 pt-24">
        <div className="mx-auto max-w-3xl px-10 text-center">
          <motion.div {...reveal}>
            <p className="font-script text-3xl text-[#B08A4F]">the wedding party</p>
            <img src={entourageTitleImg} alt="The Entourage" className="mx-auto mt-2 h-16 w-auto object-contain" />
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
                    group.members.length > 3 ? 'max-w-2xl grid-cols-2 gap-x-14' : 'grid-cols-1'
                  }`}
                >
                  {group.members.map((m) => (
                    <p key={`${m.role}-${m.name}`} className="font-serif text-2xl leading-snug text-[#102F27]">
                      {m.name}
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TIMELINE ================= */}
      <section id="section-timeline" className="scroll-mt-20 bg-[#F2EBDD] pb-28 pt-20">
        <div className="mx-auto max-w-5xl px-10">
          <SectionHeading eyebrow="the day" title="Event Timeline" />

          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-[#B08A4F]/50" />
            <div className="space-y-14">
              {timeline.map((e, i) => {
                const left = i % 2 === 0;
                return (
                  <motion.div key={e.time} {...reveal} className="relative grid grid-cols-2 gap-20">
                    <span className="absolute left-1/2 top-1 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-[#B08A4F]/60 bg-[#F2EBDD]">
                      <span className="h-2 w-2 rounded-full bg-[#B08A4F]" />
                    </span>
                    <div className={left ? 'text-right' : 'col-start-2'}>
                      <p className="font-['Oswald'] text-base font-light uppercase tracking-[0.35em] text-[#B08A4F]">{e.time}</p>
                      <p className="mt-1 font-['Oswald'] text-2xl font-light uppercase tracking-[0.2em] text-[#102F27]">{e.title}</p>
                      {e.location && <p className="mt-2 text-sm text-stone-500">{e.location}</p>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ================= RSVP (photo band) ================= */}
      <section id="section-rsvp" className="scroll-mt-20 relative overflow-hidden py-36">
        <img src={tablescapeImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[#102F27]/75" />
        <Diagonal edge="top" fill="#F2EBDD" />
        <div className="relative mx-auto grid max-w-6xl grid-cols-2 items-center gap-20 px-10">
          <motion.div {...reveal} className="text-center text-white">
            <p className="font-script text-3xl text-[#E6D3AE]">kindly respond</p>
            <h2 className="mt-2 font-['Oswald'] text-[clamp(2.75rem,4.5vw,4rem)] font-light uppercase leading-tight tracking-[0.25em]">
              Will you
              <br />
              join us?
            </h2>
            <Sprig className="mx-auto mt-5 w-16 text-white/80" />
            <p className="mt-5 font-['Oswald'] text-sm font-light uppercase tracking-[0.4em] text-white/75">by {rsvpDeadline}</p>
          </motion.div>
          <motion.div {...reveal} className="bg-white p-10 shadow-2xl">
            <p className="mb-6 text-center font-['Oswald'] text-lg font-light uppercase tracking-[0.45em] text-[#102F27]">RSVP</p>
            <RsvpForm />
          </motion.div>
        </div>
        <Diagonal edge="bottom" fill="#102F27" />
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-[#102F27] pb-16 pt-10 text-center text-white">
        <div className="mx-auto flex h-20 w-20 items-center justify-center bg-white">
          <span className="font-['Parisienne'] text-[1.7rem] leading-none whitespace-nowrap text-[#B08A4F]">
            {groomName[0]}
            <span className="text-[0.6em] px-0.5">&amp;</span>
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
    </div>
  );
};
