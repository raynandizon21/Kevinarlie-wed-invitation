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
  { src: tablescapeImg, caption: 'Soon to be wed', layout: 'sage' },
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
            <p className="mt-3 font-['Parisienne'] text-[clamp(2.8rem,14vw,3.6rem)] leading-[1.05] text-white">{slide.caption}</p>
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
