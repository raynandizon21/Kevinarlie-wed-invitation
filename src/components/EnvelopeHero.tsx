import React, { useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { ColorPalette } from '../types/wedding';
import { melodyPlayer } from '../utils/audioSynth';
import realisticEnvelopeImg from '../assets/images/realistic_envelope_isolated.png';
import goldSealIsolatedImg from '../assets/images/gold_seal_isolated.png';

interface EnvelopeHeroProps {
  palette: ColorPalette;
  onOpenAndRedirect: () => void;
  groom?: string;
  bride?: string;
  displayDate?: string;
  churchName?: string;
  guestName?: string;
  onToggleMusic?: () => void;
  isMusicPlaying?: boolean;
  onOpenSettings?: () => void;
}

export const EnvelopeHero: React.FC<EnvelopeHeroProps> = ({
  onOpenAndRedirect,
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleOpenClick = () => {
    if (isTransitioning) return;

    setIsTransitioning(true);

    // Play sparkling chime sound effect
    try {
      melodyPlayer.playOpenEnvelopeSound();
    } catch {
      // Audio fallback
    }

    // Launch celebratory golden sparkle confetti
    try {
      confetti({
        particleCount: 36,
        spread: 60,
        origin: { y: 0.52 },
        colors: ['#B08A4F', '#B08A4F', '#F5E6C8', '#78947F', '#FFFFFF'],
        ticks: 180,
        gravity: 0.85,
        scalar: 0.85,
        disableForReducedMotion: true,
      });
    } catch {
      // Confetti fallback
    }

    // Smooth cinematic fade out transition to menu page
    setTimeout(() => {
      onOpenAndRedirect();
    }, 750);
  };

  return (
    <div
      className="relative h-full h-[100dvh] max-h-[100dvh] w-full flex flex-col items-center justify-center px-4 py-2 sm:py-6 bg-[#F8F6F1] select-none overflow-hidden touch-none"
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 45%, rgba(255, 255, 255, 0.9) 0%, transparent 65%),
          radial-gradient(circle at 50% 80%, rgba(92, 130, 93, 0.06) 0%, transparent 70%)
        `,
      }}
    >
      {/* Main Center Stage: 100% REALISTIC ENVELOPE (Perfect Horizontal & Vertical Balance) */}
      <div className="z-10 flex flex-col items-center justify-center my-auto w-full max-w-[340px] xs:max-w-[360px] sm:max-w-[400px] md:max-w-[450px] px-2">
        
        {/* Interactive Realistic Envelope Container - Zero Tilt, Level & Centered */}
        <motion.div
          onClick={handleOpenClick}
          animate={
            isTransitioning
              ? {
                  scale: 1.05,
                  y: -14,
                  opacity: 0,
                  filter: 'blur(3px)',
                }
              : {
                  scale: 1,
                  y: 0,
                  opacity: 1,
                  filter: 'blur(0px)',
                }
          }
          transition={
            isTransitioning
              ? { duration: 0.75, ease: [0.25, 1, 0.5, 1] }
              : { duration: 0.2, ease: 'easeOut' }
          }
          className="relative w-full aspect-[710/554] max-h-[50dvh] cursor-pointer group flex items-center justify-center mx-auto"
        >
          {/* Photorealistic Envelope Shadow - Perfectly Symmetrical */}
          <div
            className="absolute inset-x-6 -bottom-3 h-7 rounded-full blur-xl pointer-events-none transition-all duration-300"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(19, 62, 26, 0.4) 0%, rgba(0,0,0,0.18) 50%, transparent 80%)',
              transform: isTransitioning ? 'scale(1.15) translateY(10px)' : 'scale(1)',
              opacity: isTransitioning ? 0 : 0.75,
            }}
          />

          {/* Realistic Envelope Image (Authentic Dark Green Luxury Paper, Centered) */}
          <div className="relative w-full h-full select-none flex items-center justify-center">
            <img
              src={realisticEnvelopeImg}
              alt="Realistic Dark Green Wedding Envelope"
              className="w-full h-full object-contain select-none pointer-events-none block filter drop-shadow-md transition-transform duration-300 group-hover:scale-[1.012]"
              referrerPolicy="no-referrer"
            />

            {/* ANIMATED LUXURY GOLD WAX SEAL (Centered at 50% horizontally, locked to flap apex) */}
            <div
              className="absolute pointer-events-none flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
              style={{
                left: '50%',
                top: '60.5%',
                width: '19.7%',
                height: '25.3%',
              }}
            >
              {/* 1. Warm Soft Golden Ambient Aura (subtle, breathing glow) */}
              <motion.div
                animate={{
                  opacity: [0.25, 0.6, 0.25],
                  scale: [0.95, 1.12, 0.95],
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(238, 203, 128, 0.45) 0%, rgba(212, 175, 55, 0.2) 50%, transparent 70%)',
                  filter: 'blur(6px)',
                }}
              />

              {/* 2. Isolated Gold Wax Seal with Gentle Breath Animation & Hover Response */}
              <motion.div
                animate={{
                  scale: isTransitioning ? [1, 1.25, 0.9] : [1, 1.035, 1],
                  filter: isTransitioning
                    ? 'drop-shadow(0 0 16px rgba(245, 230, 180, 0.95)) brightness(1.25)'
                    : [
                        'drop-shadow(0 2px 6px rgba(0,0,0,0.35)) brightness(1)',
                        'drop-shadow(0 3px 12px rgba(212, 175, 55, 0.55)) brightness(1.08)',
                        'drop-shadow(0 2px 6px rgba(0,0,0,0.35)) brightness(1)',
                      ],
                }}
                transition={{
                  duration: isTransitioning ? 0.6 : 3.2,
                  repeat: isTransitioning ? 0 : Infinity,
                  ease: 'easeInOut',
                }}
                className="relative w-full h-full flex items-center justify-center rounded-full overflow-hidden"
              >
                <img
                  src={goldSealIsolatedImg}
                  alt="Gold Wax Seal"
                  className="w-full h-full object-contain pointer-events-none select-none"
                  referrerPolicy="no-referrer"
                />

                {/* 3. Diagonal Golden Metallic Sheen / Light Sweep Reflection across the gold surface */}
                <motion.div
                  animate={{
                    x: ['-140%', '160%'],
                  }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    repeatDelay: 1.6,
                    ease: 'easeInOut',
                  }}
                  className="absolute inset-y-0 w-1/2 pointer-events-none rounded-full"
                  style={{
                    background:
                      'linear-gradient(105deg, transparent 0%, rgba(255, 255, 255, 0) 25%, rgba(255, 248, 220, 0.55) 50%, rgba(255, 255, 255, 0.15) 60%, transparent 100%)',
                    transform: 'skewX(-20deg)',
                    mixBlendMode: 'overlay',
                  }}
                />

                {/* 4. Delicate Tiny Diamond Sparkle Glint on the gold crest */}
                <motion.div
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.2, 0.5],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    repeatDelay: 2.2,
                    ease: 'easeInOut',
                  }}
                  className="absolute top-[24%] left-[28%] w-1.5 h-1.5 rounded-full pointer-events-none"
                  style={{
                    background: '#FFFFFF',
                    boxShadow: '0 0 6px 2px rgba(255, 245, 200, 0.9), 0 0 10px 4px rgba(212, 175, 55, 0.6)',
                  }}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Clean, Elegant "TAP TO OPEN" Prompt below envelope (No Chevron Down / No Scroll Down) */}
        <motion.div
          animate={isTransitioning ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-4 sm:mt-6 text-center flex flex-col items-center"
        >
          <button
            onClick={handleOpenClick}
            disabled={isTransitioning}
            className="group cursor-pointer px-2 py-1.5 transition-transform hover:scale-105 active:scale-95"
          >
            <span className="text-[11px] sm:text-xs tracking-[0.28em] text-stone-600 group-hover:text-[#185844] font-sans uppercase font-medium transition-colors">
              {isTransitioning ? 'OPENING...' : 'TAP TO OPEN'}
            </span>
          </button>
        </motion.div>

      </div>
    </div>
  );
};
