import React from 'react';
import { motion } from 'motion/react';
import { ChevronUp } from 'lucide-react';
import { Sprig } from './DesktopSite';
import meadowCoupleImg from '../assets/images/wedding_couple_meadow_1791602914531.jpg';

// Mobile intro shown right after the envelope opens (same look as the desktop hero).
// Tap or swipe up to slide it away and reveal the invitation cards underneath.
export const MobileHero: React.FC<{ groomName: string; brideName: string; onContinue: () => void }> = ({
  groomName,
  brideName,
  onContinue,
}) => (
  <motion.div
    key="mobile-hero"
    // Fully opaque from the first frame so the cards never show through
    initial={false}
    exit={{ y: '-100%' }}
    transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
    drag="y"
    dragConstraints={{ top: 0, bottom: 0 }}
    dragElastic={{ top: 0.4, bottom: 0 }}
    onDragEnd={(_, info) => {
      if (info.offset.y < -60 || info.velocity.y < -400) onContinue();
    }}
    onClick={onContinue}
    role="button"
    aria-label="Continue to the invitation"
    className="fixed inset-0 z-[60] h-[100dvh] w-full cursor-pointer overflow-hidden select-none bg-[#102F27]"
  >
    <motion.img
      src={meadowCoupleImg}
      alt={`${groomName} and ${brideName}`}
      initial={{ scale: 1.1 }}
      animate={{ scale: 1 }}
      transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
      draggable={false}
      className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[60%_center]"
    />
    <div className="absolute inset-0 bg-[#102F27]/30" />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,47,39,0.5)_0%,transparent_70%)]" />

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex h-full flex-col items-center justify-center px-6 text-center text-white"
    >
      <p className="font-['Parisienne'] text-[1.6rem] text-white/95 drop-shadow">our wedding story</p>
      {/* Couple names in calligraphy */}
      <h1 className="mt-4 font-['Parisienne'] font-normal leading-[0.95] drop-shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
        <span className="block text-[clamp(4.5rem,24vw,6.5rem)]">{groomName}</span>
        <span className="block -my-2 text-[clamp(2.75rem,14vw,3.75rem)] text-[#E6D3AE]">&amp;</span>
        <span className="block text-[clamp(4.5rem,24vw,6.5rem)]">{brideName}</span>
      </h1>
      <p className="mt-3 font-['Parisienne'] text-[1.6rem] text-white/95 drop-shadow">hope you&apos;ll celebrate with us</p>
      <Sprig className="mt-4 w-16 text-white/85" />
    </motion.div>

    {/* Continue cue */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.6, duration: 0.8 }}
      className="absolute inset-x-0 bottom-[max(2rem,env(safe-area-inset-bottom))] flex flex-col items-center text-white/90"
    >
      <motion.span animate={{ y: [0, -6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
        <ChevronUp className="h-5 w-5" />
      </motion.span>
      <span className="mt-1 font-['Oswald'] text-[11px] font-light uppercase tracking-[0.4em]">Tap to continue</span>
    </motion.div>
  </motion.div>
);
