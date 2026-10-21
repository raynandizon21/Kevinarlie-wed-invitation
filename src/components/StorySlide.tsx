import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

// Mobile story: after the hero, each page is a full screen. Every step has its own transition
// (named on the page it leads to), played backwards when going back.
export type StoryKind = 'none' | 'rise' | 'push' | 'zoom' | 'circle' | 'wipe';
/** dir: +1 forward, -1 back, 0 no animation (first page after the envelope). */
export type StoryMotion = { dir: number; kind: StoryKind };

const ease = [0.65, 0, 0.35, 1] as const;
export const storyTransition = { duration: 0.8, ease };

// The page that ends up in front: the new one going forward, the old one going back
const front = 2;
const behind = 1;

export const storyVariants = {
  enter: ({ dir, kind }: StoryMotion) => {
    const fwd = dir > 0;
    if (dir === 0 || kind === 'none') return { zIndex: front };
    switch (kind) {
      case 'rise':
        return { y: fwd ? '100%' : '-100%', zIndex: front };
      case 'push':
        return { x: fwd ? '100%' : '-30%', zIndex: fwd ? front : behind };
      case 'zoom':
        return { opacity: 0, scale: fwd ? 1.12 : 0.92, zIndex: front };
      case 'circle':
        return fwd
          ? { clipPath: 'circle(0% at 50% 100%)', zIndex: front }
          : { scale: 0.94, opacity: 0.6, zIndex: behind };
      case 'wipe':
        return fwd
          ? { clipPath: 'inset(100% 0% 0% 0%)', zIndex: front }
          : { y: '-12%', opacity: 0.6, zIndex: behind };
    }
  },
  center: ({ dir, kind }: StoryMotion) => ({
    x: 0,
    y: 0,
    scale: 1,
    opacity: 1,
    clipPath: kind === 'circle' ? 'circle(150% at 50% 100%)' : 'inset(0% 0% 0% 0%)',
    zIndex: dir < 0 && (kind === 'push' || kind === 'circle' || kind === 'wipe') ? behind : front,
  }),
  exit: ({ dir, kind }: StoryMotion) => {
    const fwd = dir > 0;
    switch (kind) {
      case 'rise':
        return { y: fwd ? '-100%' : '100%', zIndex: behind };
      case 'push':
        return { x: fwd ? '-30%' : '100%', zIndex: fwd ? behind : front };
      case 'zoom':
        return { opacity: 0, scale: fwd ? 0.92 : 1.12, zIndex: behind };
      case 'circle':
        return fwd
          ? { scale: 0.94, opacity: 0.6, zIndex: behind }
          : { clipPath: 'circle(0% at 50% 100%)', zIndex: front };
      case 'wipe':
        return fwd
          ? { y: '-12%', opacity: 0.6, zIndex: behind }
          : { clipPath: 'inset(100% 0% 0% 0%)', zIndex: front };
      default:
        return { opacity: 0 };
    }
  },
};

/** "Next · Timeline →" cue at the end of a page. */
export const NextCue: React.FC<{ label: string; onNext: () => void; light?: boolean; className?: string }> = ({
  label,
  onNext,
  light = false,
  className = '',
}) => (
  <button
    type="button"
    onClick={onNext}
    className={`group mx-auto flex shrink-0 items-center gap-3 transition-colors cursor-pointer ${
      light ? 'text-[#F2EBDD]/85 hover:text-[#E6D3AE]' : 'text-[#102F27]/75 hover:text-[#185844]'
    } ${className}`}
  >
    <span className={`h-px w-8 ${light ? 'bg-[#E6D3AE]/60' : 'bg-[#B08A4F]/60'}`} />
    <span className="font-['Oswald'] text-[11px] font-light uppercase tracking-[0.4em] pl-[0.4em]">Next · {label}</span>
    <motion.span animate={{ x: [0, 5, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
      <ArrowRight className={`h-4 w-4 ${light ? 'text-[#E6D3AE]' : 'text-[#B08A4F]'}`} />
    </motion.span>
  </button>
);

// One full-screen page with its own scroll.
// Next: swipe left, or swipe up at the bottom. Previous: swipe right, or swipe down at the top.
export const StorySlide: React.FC<{
  motion: StoryMotion;
  onNext?: () => void;
  onPrev?: () => void;
  /** Shows the Next cue after the content (pages that fit one screen draw their own) */
  nextLabel?: string;
  /** Page color behind the content and the cue */
  tone?: 'ivory' | 'sage' | 'forest' | 'emerald';
  children: React.ReactNode;
}> = ({ motion: m, onNext, onPrev, nextLabel, tone = 'ivory', children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number; atTop: boolean; atBottom: boolean } | null>(null);
  const dark = tone !== 'ivory';
  const toneBg =
    tone === 'emerald' ? 'bg-[#185844]' : tone === 'forest' ? 'bg-[#102F27]' : tone === 'sage' ? 'bg-[#78947F]' : 'bg-[#F2EBDD]';

  return (
    <motion.div
      ref={ref}
      custom={m}
      variants={storyVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={storyTransition}
      onTouchStart={(e) => {
        const el = ref.current;
        if (!el) return;
        touch.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          atTop: el.scrollTop <= 0,
          atBottom: el.scrollTop + el.clientHeight >= el.scrollHeight - 2,
        };
      }}
      onTouchEnd={(e) => {
        const t = touch.current;
        touch.current = null;
        if (!t) return;
        const dx = e.changedTouches[0].clientX - t.x;
        const dy = e.changedTouches[0].clientY - t.y;
        if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) {
          if (dx < 0) onNext?.();
          else onPrev?.();
        } else if (dy < -70 && t.atBottom) onNext?.();
        else if (dy > 70 && t.atTop) onPrev?.();
      }}
      // Full screen height (100lvh) so the page also sits behind the phone browser's bars (iPhone Safari
      // otherwise paints its own lighter color there); the bottom padding keeps the end of the page above the toolbar.
      className={`fixed inset-x-0 top-0 h-[100lvh] w-full overflow-y-auto overflow-x-hidden overscroll-contain pb-[calc(100lvh-100dvh)] ${
        toneBg
      }`}
    >
      {children}
      {onNext && nextLabel && (
        <div className={`pb-[max(2.25rem,env(safe-area-inset-bottom,0px))] pt-2 ${dark ? toneBg : ''}`}>
          <NextCue label={nextLabel} onNext={onNext} light={dark} />
        </div>
      )}
    </motion.div>
  );
};
