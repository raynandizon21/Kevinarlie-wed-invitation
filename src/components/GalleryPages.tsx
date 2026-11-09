import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sprig } from './Sprig';
import { BackChip } from './SubPages';
import { NextCue } from './StorySlide';
// Placeholder photos: swap these for the prenup photos
import meadowCoupleImg from '../assets/images/wedding_couple_meadow_1791602914531.jpg';
import jardinVenueImg from '../assets/images/jardin_venue_1791676573787.jpg';
import tablescapeImg from '../assets/images/wedding_tablescape_candlelight_single.jpg';

/**
 * One photo between story pages: after Details, after Timeline, after Entourage (in that order).
 * Same idea on each (framed photo + big script line) but its own design, named by its page color:
 * 'ivory' = photo left with a gold frame offset to the right, text top-right
 * 'sage' = phone: groom & bride photos tilted across a forest band (ivory page); desktop: photo centered
 * 'forest' = photo right with a gold frame offset to the left, text top-left
 * This is an invitation, so the lines look ahead to the wedding.
 */
export type PhotoLayout = 'ivory' | 'sage' | 'forest';
export const STORY_PHOTOS: { src: string; caption: string; layout: PhotoLayout; position?: string }[] = [
  { src: jardinVenueImg, caption: 'Our love story', layout: 'ivory' },
  { src: tablescapeImg, caption: 'Hand in Hand', layout: 'sage' },
  { src: meadowCoupleImg, caption: 'Always & Forever', layout: 'forest', position: '60% center' },
];
const PAGE_BG: Record<PhotoLayout, string> = {
  ivory: 'bg-[#F2EBDD] text-[#102F27]',
  sage: 'bg-[#F2EBDD] text-[#102F27]',
  forest: 'bg-[#102F27] text-white',
};
const easeOut = [0.16, 1, 0.3, 1] as const;
/** Fine gold diamond lattice across the emerald band on the groom & bride page */
const BAND_PATTERN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'><path d='M14 0 L28 14 L14 28 L0 14 Z' fill='none' stroke='%23B08A4F' stroke-opacity='0.45' stroke-width='0.8'/><circle cx='14' cy='14' r='1.3' fill='%23E6D3AE' fill-opacity='0.55'/></svg>")`;
/** How long each photo shows on its own before the Next cue appears */
const PHOTO_MS = 4000;

// Slow zoom-out on every photo
const KenBurns: React.FC<{ src: string; alt: string; position?: string; className?: string }> = ({ src, alt, position, className = '' }) => (
  <motion.img
    src={src}
    alt={alt}
    initial={{ scale: 1.15 }}
    animate={{ scale: 1 }}
    transition={{ duration: 6, ease: easeOut }}
    draggable={false}
    style={{ objectPosition: position ?? 'center' }}
    className={`pointer-events-none h-full w-full object-cover ${className}`}
  />
);

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1.1, delay, ease: easeOut },
});
const slideIn = (fromX: number) => ({
  initial: { opacity: 0, x: fromX },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 1.1, delay: 0.15, ease: easeOut },
});

// --- PHOTO: a photo between pages. The Next cue fades in after PHOTO_MS (a swipe still moves on).
export const PhotoPage: React.FC<{
  photo: number;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  groomName: string;
  brideName: string;
}> = ({ photo, onBack, onNext, nextLabel, groomName, brideName }) => {
  const slide = STORY_PHOTOS[photo] ?? STORY_PHOTOS[0];
  const dark = slide.layout === 'forest'; // light text on forest
  const [showCue, setShowCue] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setShowCue(true), PHOTO_MS);
    return () => window.clearTimeout(t);
  }, []);

  const namesLine = (
    <p
      className={`font-['Oswald'] text-[11px] font-light uppercase tracking-[0.45em] ${
        slide.layout === 'sage' ? 'text-[#F2EBDD]' : dark ? 'text-[#E6D3AE]' : 'text-[#B08A4F]'
      }`}
    >
      {groomName} &amp; {brideName}
    </p>
  );
  // Space is kept for the cue so nothing shifts when it appears
  const cue = nextLabel && (
    <motion.div
      initial={false}
      animate={{ opacity: showCue ? 1 : 0, y: showCue ? 0 : 8 }}
      transition={{ duration: 0.8, ease: easeOut }}
      className={`relative z-20 mt-6 ${showCue ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!showCue}
    >
      <NextCue label={nextLabel} onNext={onNext} light={dark} />
    </motion.div>
  );
  const page = 'pointer-events-none absolute inset-0 z-10 flex flex-col pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] pt-16';

  return (
    <div className={`relative h-[100dvh] overflow-hidden ${PAGE_BG[slide.layout]}`}>
      <div className="relative z-20">
        <BackChip onBack={onBack} light={dark} />
      </div>

      {slide.layout === 'ivory' && (
        <div className={`${page} px-[clamp(1.5rem,8vw,2.25rem)]`}>
          <motion.div {...fadeUp(0.3)} className="text-right">
            <div className="flex justify-end">{namesLine}</div>
            <p className="ml-auto mt-3 max-w-[15rem] font-names text-[clamp(3.2rem,16vw,4.1rem)] leading-[1.05] text-[#102F27]">
              {slide.caption}
            </p>
          </motion.div>
          {/* Photo left, gold outline offset to the right */}
          <motion.div {...slideIn(-24)} className="relative mt-7 min-h-0 flex-1 self-start" style={{ width: 'min(100%, 19rem)' }}>
            <span className="absolute -right-3 top-3 h-full w-full border border-[#B08A4F]/70" />
            <div className="relative h-full overflow-hidden shadow-[0_24px_50px_-24px_rgba(16,47,39,0.55)]">
              <KenBurns src={slide.src} alt={slide.caption} position={slide.position} />
            </div>
          </motion.div>
          {cue}
        </div>
      )}

      {slide.layout === 'sage' && (
        <>
          {/* Groom & bride: ivory page, forest band across the middle, two tilted white-framed photos overlapping on it */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <Sprig className="absolute right-4 top-14 w-24 rotate-[160deg] text-[#78947F]/60" />
            <Sprig className="absolute bottom-16 left-3 w-24 -rotate-12 text-[#78947F]/60" />
            {/* Emerald band: fine gold lattice, double gold lines top and bottom */}
            <div
              className="absolute inset-x-0 top-[44%] h-[10%] bg-[#185844]"
              style={{ backgroundImage: BAND_PATTERN, backgroundSize: '28px 28px' }}
            >
              <span className="absolute inset-x-0 top-1 h-px bg-[#B08A4F]" />
              <span className="absolute inset-x-0 top-2 h-px bg-[#B08A4F]/50" />
              <span className="absolute inset-x-0 bottom-2 h-px bg-[#B08A4F]/50" />
              <span className="absolute inset-x-0 bottom-1 h-px bg-[#B08A4F]" />
            </div>
          </div>
          <div className={`${page} px-[clamp(1.25rem,6vw,2rem)]`}>
            <div className="relative min-h-0 flex-1">
              {/* Groom: photo top-left, name to its right */}
              <motion.div
                initial={{ opacity: 0, x: -30, rotate: -12 }}
                animate={{ opacity: 1, x: 0, rotate: -7 }}
                transition={{ duration: 1.2, delay: 0.15, ease: easeOut }}
                className="absolute left-[3%] top-[9%] h-[40%] w-[54%] bg-white p-1.5 shadow-[0_18px_30px_-12px_rgba(16,47,39,0.55)]"
              >
                <div className="h-full overflow-hidden">
                  <KenBurns src={meadowCoupleImg} alt={groomName} position="82% center" />
                </div>
              </motion.div>
              <motion.div {...fadeUp(0.5)} className="absolute right-[4%] top-[25%] w-[36%]">
                <p className="font-['Oswald'] text-[10px] font-light uppercase tracking-[0.35em] text-[#B08A4F]">Groom</p>
                <p className="font-names text-[clamp(2.6rem,13vw,3.3rem)] leading-none text-[#185844]">{groomName}</p>
              </motion.div>

              {/* Bride: photo bottom-right, name to its left */}
              <motion.div
                initial={{ opacity: 0, x: 30, rotate: 12 }}
                animate={{ opacity: 1, x: 0, rotate: 6 }}
                transition={{ duration: 1.2, delay: 0.35, ease: easeOut }}
                className="absolute right-[3%] top-[43%] z-10 h-[40%] w-[54%] bg-white p-1.5 shadow-[0_18px_30px_-12px_rgba(16,47,39,0.55)]"
              >
                <div className="h-full overflow-hidden">
                  <KenBurns src={meadowCoupleImg} alt={brideName} position="28% center" />
                </div>
              </motion.div>
              <motion.div {...fadeUp(0.7)} className="absolute left-[4%] top-[58%] w-[36%] text-right">
                <p className="font-['Oswald'] text-[10px] font-light uppercase tracking-[0.35em] text-[#B08A4F]">Bride</p>
                <p className="font-names text-[clamp(2.6rem,13vw,3.3rem)] leading-none text-[#185844]">{brideName}</p>
              </motion.div>
            </div>
            {cue}
          </div>
        </>
      )}

      {slide.layout === 'forest' && (
        <div className={`${page} px-[clamp(1.5rem,8vw,2.25rem)]`}>
          <motion.div {...fadeUp(0.3)}>
            {namesLine}
            <p className="mt-3 max-w-[16rem] font-names text-[clamp(3.2rem,16vw,4.1rem)] leading-[1.05] text-white">{slide.caption}</p>
          </motion.div>
          {/* Photo right, gold outline offset to the left */}
          <motion.div {...slideIn(24)} className="relative mt-7 min-h-0 flex-1 self-end" style={{ width: 'min(100%, 19rem)' }}>
            <span className="absolute -left-3 top-3 h-full w-full border border-[#B08A4F]/70" />
            <div className="relative h-full overflow-hidden shadow-[0_24px_50px_-20px_rgba(0,0,0,0.6)]">
              <KenBurns src={slide.src} alt={slide.caption} position={slide.position} />
            </div>
          </motion.div>
          {cue}
        </div>
      )}
    </div>
  );
};

// --- DESKTOP: the same three photos as wide bands between the website sections, same layouts
// (ivory: photo left / sage: photo centered / forest: photo right). They animate in on scroll.
const inView = (delay = 0, x = 0) => ({
  initial: { opacity: 0, y: x ? 0 : 24, x },
  whileInView: { opacity: 1, y: 0, x: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 1.1, delay, ease: easeOut },
});
const DesktopPhoto: React.FC<{ src: string; alt: string; position?: string; className?: string }> = ({ src, alt, position, className = '' }) => (
  <div className={`relative overflow-hidden ${className}`}>
    <motion.img
      src={src}
      alt={alt}
      initial={{ scale: 1.12 }}
      whileInView={{ scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 6, ease: easeOut }}
      draggable={false}
      style={{ objectPosition: position ?? 'center' }}
      className="h-full w-full object-cover"
    />
  </div>
);

export const DesktopPhotoBand: React.FC<{ photo: number; groomName: string; brideName: string }> = ({ photo, groomName, brideName }) => {
  const slide = STORY_PHOTOS[photo] ?? STORY_PHOTOS[0];
  const names = (tone: string) => (
    <p className={`font-['Oswald'] text-xs font-light uppercase tracking-[0.5em] ${tone}`}>
      {groomName} &amp; {brideName}
    </p>
  );
  const script = (tone: string, extra = '') => (
    <p className={`mt-4 font-names text-[clamp(4rem,6.2vw,5.6rem)] leading-[1.05] ${tone} ${extra}`}>{slide.caption}</p>
  );

  if (slide.layout === 'sage') {
    return (
      <section className="bg-[#78947F] py-28 text-center text-white">
        <motion.div {...inView()}>
          {names('text-[#F2EBDD]')}
          {script('text-white')}
        </motion.div>
        <motion.div {...inView(0.15)} className="relative mx-auto mt-14 w-[min(56rem,80vw)]">
          <span className="absolute -inset-4 border border-[#F2EBDD]/70" />
          <DesktopPhoto src={slide.src} alt={slide.caption} position={slide.position} className="aspect-[16/9] shadow-[0_30px_60px_-30px_rgba(16,47,39,0.7)]" />
        </motion.div>
      </section>
    );
  }

  const ivory = slide.layout === 'ivory';
  return (
    <section className={ivory ? 'bg-[#F2EBDD] py-28 text-[#102F27]' : 'bg-[#102F27] py-28 text-white'}>
      <div className="mx-auto grid max-w-6xl grid-cols-[1.15fr_1fr] items-center gap-20 px-10">
        <motion.div {...inView(0.1, ivory ? -32 : 32)} className={`relative ${ivory ? '' : 'order-2'}`}>
          {/* gold outline offset away from the text */}
          <span className={`absolute top-5 h-full w-full border border-[#B08A4F]/70 ${ivory ? 'left-5' : '-left-5'}`} />
          <DesktopPhoto
            src={slide.src}
            alt={slide.caption}
            position={slide.position}
            className={`aspect-[4/5] ${ivory ? 'shadow-[0_30px_60px_-30px_rgba(16,47,39,0.55)]' : 'shadow-[0_30px_60px_-24px_rgba(0,0,0,0.6)]'}`}
          />
        </motion.div>
        <motion.div {...inView(0.25)} className={ivory ? 'text-right' : 'order-1'}>
          {names(ivory ? 'text-[#B08A4F]' : 'text-[#E6D3AE]')}
          {script(ivory ? 'text-[#102F27]' : 'text-white', ivory ? 'ml-auto max-w-[24rem]' : 'max-w-[24rem]')}
          <Sprig className={`mt-6 w-16 ${ivory ? 'ml-auto text-[#185844]/70' : 'text-[#E6D3AE]/70'}`} />
        </motion.div>
      </div>
    </section>
  );
};

// --- CLOSING: thank-you note, then back to the start. After the RSVP it returns on its own.
export const ThanksPage: React.FC<{
  onRestart: () => void;
  groomName: string;
  brideName: string;
  displayDate: string;
  autoReturn?: boolean;
}> = ({ onRestart, groomName, brideName, displayDate, autoReturn = false }) => {
  useEffect(() => {
    if (!autoReturn) return;
    const t = window.setTimeout(onRestart, 8000);
    return () => window.clearTimeout(t);
  }, [autoReturn, onRestart]);

  return (
    <div className="relative min-h-[100dvh] bg-[#F2EBDD] text-[#102F27]">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.3, ease: easeOut }}
        className="mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center px-[clamp(1.25rem,6vw,1.75rem)] py-20 text-center"
      >
        <Sprig className="w-14 text-[#B08A4F]" />
        <h2 className="mt-4 font-['Parisienne'] text-[clamp(3.6rem,18vw,4.6rem)] leading-none">Thank you</h2>
        <p className="mt-5 font-['Oswald'] text-[13px] font-light uppercase leading-[1.9] tracking-[0.35em] pl-[0.35em] text-[#B08A4F]">
          We can&rsquo;t wait to
          <br />
          celebrate with you
        </p>
        <p className="mt-5 max-w-[19rem] text-balance font-serif text-[1.15rem] leading-[1.6] text-[#102F27]/85">
          Your love and presence mean the world to us. See you on our special day!
        </p>
        <div className="mt-8 flex items-center gap-3">
          <span className="h-px w-8 bg-[#B08A4F]/50" />
          <p className="font-names text-[1.9rem] leading-none">
            {groomName} <span className="font-script text-[0.7em] text-[#B08A4F]">&amp;</span> {brideName}
          </p>
          <span className="h-px w-8 bg-[#B08A4F]/50" />
        </div>
        <p className="mt-2 font-['Oswald'] text-[11px] font-light uppercase tracking-[0.4em] pl-[0.4em] text-[#102F27]/70">{displayDate}</p>

        <button
          type="button"
          onClick={onRestart}
          className="mt-10 rounded-full border border-[#185844]/40 px-6 py-2.5 font-['Oswald'] text-[11px] font-light uppercase tracking-[0.35em] pl-[calc(1.5rem+0.35em)] text-[#185844] transition-colors hover:bg-[#185844] hover:text-[#F2EBDD] cursor-pointer"
        >
          Back to the beginning
        </button>
      </motion.div>
    </div>
  );
};
