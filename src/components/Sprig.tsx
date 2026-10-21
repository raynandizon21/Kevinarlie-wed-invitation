import React from 'react';

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
