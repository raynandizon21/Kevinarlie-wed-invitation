import React from 'react';
import { motion } from 'motion/react';
import { ChevronUp } from 'lucide-react';
import { Sprig } from './Sprig';
import meadowCoupleImg from '../assets/images/wedding_couple_meadow_1791602914531.jpg';

// Mobile intro shown right after the envelope opens (same look as the desktop hero).
// Tap or swipe up to slide on to the first story page (the slide motion comes from App).
export const MobileHero: React.FC<{
  groomName: string;
  brideName: string;
  /** e.g. "Sunday, December 14, 2025" */
  displayDate: string;
  /** e.g. "2:30 PM" */
  time: string;
  onContinue: () => void;
}> = ({ groomName, brideName, displayDate, time, onContinue }) => {
  // "Sunday, December 14, 2025" -> Sunday / December / 14 / 2025
  const m = displayDate.match(/^\s*(\w+),\s*(\w+)\s+(\d{1,2}),?\s*(\d{4})/);
  return (
  <motion.div
    drag="y"
    dragConstraints={{ top: 0, bottom: 0 }}
    dragElastic={{ top: 0.4, bottom: 0 }}
    onDragEnd={(_, info) => {
      if (info.offset.y < -60 || info.velocity.y < -400) onContinue();
    }}
    onClick={onContinue}
    role="button"
    aria-label="Continue to the invitation"
    className="fixed inset-x-0 top-0 z-[60] h-[100lvh] w-full cursor-pointer overflow-hidden select-none bg-[#102F27]"
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
    {/* Photo fades into ivory at the top and bottom, the same color the phone browser gives its bars,
        so the image looks edge to edge (iPhone Safari never lets a page draw behind those bars) */}
    <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#F2EBDD] to-transparent" />
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#F2EBDD] via-[#F2EBDD]/70 to-transparent" />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,47,39,0.5)_0%,transparent_70%)]" />

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex h-[100dvh] flex-col items-center justify-center px-6 pb-14 text-center text-white"
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

      {/* Save-the-date block: month, then weekday | day | time, then year */}
      {m ? (
        <div className="mt-6 font-['Oswald'] font-light uppercase drop-shadow">
          <p className="text-[12px] tracking-[0.5em] pl-[0.5em] text-[#E6D3AE]">{m[2]}</p>
          <div className="mt-1 flex items-center justify-center">
            <span className="w-[6.75rem] border-y border-white/50 py-1.5 text-[11px] tracking-[0.3em]">{m[1]}</span>
            <span className="px-4 font-serif text-[3.4rem] font-light normal-case leading-none lining-nums">{m[3]}</span>
            <span className="w-[6.75rem] border-y border-white/50 py-1.5 text-[11px] tracking-[0.3em]">at {time}</span>
          </div>
          <p className="mt-1 text-[12px] tracking-[0.5em] pl-[0.5em] text-[#E6D3AE]">{m[4]}</p>
        </div>
      ) : (
        <p className="mt-6 font-['Oswald'] text-sm font-light uppercase tracking-[0.3em] drop-shadow">
          {displayDate} · {time}
        </p>
      )}

    </motion.div>

    {/* Continue cue */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.6, duration: 0.8 }}
      className="absolute inset-x-0 bottom-[calc(100lvh-100dvh+max(2rem,env(safe-area-inset-bottom)))] flex flex-col items-center text-[#102F27]"
    >
      <motion.span animate={{ y: [0, -6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
        <ChevronUp className="h-5 w-5" />
      </motion.span>
      <span className="mt-1 font-['Oswald'] text-[11px] font-light uppercase tracking-[0.4em]">Tap to continue</span>
    </motion.div>
  </motion.div>
  );
};
