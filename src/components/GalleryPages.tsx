import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Sprig } from './Sprig';
import { RETURN_SECONDS } from './SubPages';
// Prenup photos: colonnade walk (portrait), crosswalk from above (landscape), city walk (landscape)
import colonnadeImg from '../assets/images/image0.jpeg';
import crosswalkImg from '../assets/images/image1.jpeg';
import colonnadeCopyImg from '../assets/images/image0 - Copy.jpeg';

/**
 * Desktop photo bands between sections, and the closing Thank-you page.
 * Each band picks one of these photos; its layout key names the band's look.
 */
export type PhotoLayout = 'ivory' | 'sage' | 'forest';
export const STORY_PHOTOS: { src: string; caption: string; layout: PhotoLayout; position?: string }[] = [
  // 4:5 frame: keep the lower part of the portrait, where the couple walks
  { src: colonnadeImg, caption: 'Our love story', layout: 'ivory', position: '50% 85%' },
  // 16:9 frame: the couple sits right of centre
  { src: crosswalkImg, caption: 'Hand in Hand', layout: 'sage', position: 'center 40%' },
  // 4:5 frame cut from the landscape city walk, centred on the couple (the hero shows the whole photo)
  // colonnade walk: the couple stands in the middle, lower part of the photo
  { src: colonnadeCopyImg, caption: 'Always & Forever', layout: 'forest', position: '50% 70%' },
];
const easeOut = [0.16, 1, 0.3, 1] as const;

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
  // After the RSVP: count down RETURN_SECONDS, then back to the beginning (scroll only; the music keeps playing)
  const [secondsLeft, setSecondsLeft] = useState(RETURN_SECONDS);
  const restartRef = useRef(onRestart);
  restartRef.current = onRestart;
  useEffect(() => {
    if (!autoReturn) return;
    if (secondsLeft <= 0) return restartRef.current();
    const t = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [autoReturn, secondsLeft]);

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
          <p className="font-['Ms_Madi'] text-[2.4rem] leading-none">
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
        {autoReturn && (
          <p className="mt-3 font-serif text-sm text-[#102F27]/60" aria-live="polite">
            Returning in <span className="font-semibold tabular-nums text-[#185844]">{Math.max(0, secondsLeft)}</span>…
          </p>
        )}
      </motion.div>
    </div>
  );
};
