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
 * 'sage' = photo centered with an ivory outline all around, text top-center
 * 'forest' = photo right with a gold frame offset to the left, text top-left
 * This is an invitation, so the lines look ahead to the wedding.
 */
export type PhotoLayout = 'ivory' | 'sage' | 'forest';
export const STORY_PHOTOS: { src: string; caption: string; layout: PhotoLayout; position?: string }[] = [
  { src: jardinVenueImg, caption: 'Our love story', layout: 'ivory' },
  { src: tablescapeImg, caption: 'Two hearts, one love', layout: 'sage' },
  { src: meadowCoupleImg, caption: 'Counting down to forever', layout: 'forest', position: '60% center' },
];
const PAGE_BG: Record<PhotoLayout, string> = {
  ivory: 'bg-[#F2EBDD] text-[#102F27]',
  sage: 'bg-[#78947F] text-white',
  forest: 'bg-[#102F27] text-white',
};
const easeOut = [0.16, 1, 0.3, 1] as const;
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
  const dark = slide.layout !== 'ivory'; // light text on emerald / forest
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
            <p className="ml-auto mt-3 max-w-[15rem] font-['Parisienne'] text-[clamp(2.8rem,14vw,3.6rem)] leading-[1.05] text-[#102F27]">
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
        <div className={`${page} items-center px-[clamp(1.5rem,8vw,2.25rem)] text-center`}>
          <motion.div {...fadeUp(0.3)}>
            <div className="flex justify-center">{namesLine}</div>
            <p className="mt-3 text-balance font-['Parisienne'] text-[clamp(2.8rem,14vw,3.6rem)] leading-[1.05] text-white">{slide.caption}</p>
          </motion.div>
          {/* Photo centered, ivory outline all around it */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.15, ease: easeOut }}
            className="relative mt-9 min-h-0 flex-1"
            style={{ width: 'min(calc(100% - 1.5rem), 17.5rem)' }}
          >
            <span className="absolute -inset-3 border border-[#F2EBDD]/70" />
            <div className="relative h-full overflow-hidden shadow-[0_24px_50px_-20px_rgba(16,47,39,0.6)]">
              <KenBurns src={slide.src} alt={slide.caption} position={slide.position} />
            </div>
          </motion.div>
          <div className="mt-3">{cue}</div>
        </div>
      )}

      {slide.layout === 'forest' && (
        <div className={`${page} px-[clamp(1.5rem,8vw,2.25rem)]`}>
          <motion.div {...fadeUp(0.3)}>
            {namesLine}
            <p className="mt-3 max-w-[16rem] font-['Parisienne'] text-[clamp(2.8rem,14vw,3.6rem)] leading-[1.05] text-white">{slide.caption}</p>
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
    <p className={`mt-4 font-['Parisienne'] text-[clamp(3.5rem,5.5vw,5rem)] leading-[1.05] ${tone} ${extra}`}>{slide.caption}</p>
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
          <p className="font-['Parisienne'] text-[1.9rem] leading-none">
            {groomName} <span className="text-[#B08A4F]">&amp;</span> {brideName}
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
