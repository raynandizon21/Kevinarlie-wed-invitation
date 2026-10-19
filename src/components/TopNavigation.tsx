import React from 'react';
import { ArrowLeft, Settings, Music, Grid, Mail } from 'lucide-react';
import { SubPageView } from './CardsHub';

interface TopNavigationProps {
  groom: string;
  bride: string;
  activeView: 'hub' | SubPageView;
  onReturnToEnvelope: () => void;
  onReturnToHub: () => void;
  onSelectView: (view: SubPageView) => void;
  onOpenSettings: () => void;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  groom,
  bride,
  activeView,
  onReturnToEnvelope,
  onReturnToHub,
  onSelectView,
  onOpenSettings,
  isMusicPlaying,
  onToggleMusic,
}) => {
  const coupleWordmark = `${groom.split(' ')[0]} & ${bride.split(' ')[0]}`;

  return (
    <header className="sticky top-0 z-50 bg-[#F2EBDD]/95 backdrop-blur-md border-b border-stone-200/80 px-4 md:px-8 py-3 transition-all shadow-2xs">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Navigation Back Buttons */}
        <div className="flex items-center gap-2">
          {activeView !== 'hub' ? (
            <button
              onClick={onReturnToHub}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-[#185844]/30 bg-[#185844] text-white hover:bg-[#102F27] transition-all shadow-2xs cursor-pointer"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Bumalik sa Menu</span>
            </button>
          ) : (
            <button
              onClick={onReturnToEnvelope}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-stone-300 bg-white text-stone-700 hover:text-[#185844] hover:bg-stone-50 transition-colors shadow-2xs cursor-pointer"
              title="Bumalik sa Sobre"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Sobre</span>
            </button>
          )}

          <button
            onClick={onReturnToHub}
            className="font-serif text-lg md:text-xl font-semibold tracking-tight text-[#185844] whitespace-nowrap shrink-0 hover:opacity-85 transition-opacity pl-1 cursor-pointer"
          >
            {coupleWordmark}
          </button>
        </div>

        {/* Center: Quick Subpage Pill Switcher */}
        <nav className="hidden md:flex items-center gap-1.5 bg-stone-100 p-1 rounded-full text-xs font-medium border border-stone-200/60">
          <button
            onClick={onReturnToHub}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              activeView === 'hub'
                ? 'bg-white text-[#185844] shadow-2xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Menu
          </button>
          <button
            onClick={() => onSelectView('palette')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              activeView === 'palette'
                ? 'bg-white text-[#185844] shadow-2xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            4 Color Palette
          </button>
          <button
            onClick={() => onSelectView('venues')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              activeView === 'venues'
                ? 'bg-white text-[#185844] shadow-2xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Simbahan &amp; Resepsyon
          </button>
          <button
            onClick={() => onSelectView('timeline')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              activeView === 'timeline'
                ? 'bg-white text-[#185844] shadow-2xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Programa
          </button>
          <button
            onClick={() => onSelectView('entourage')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              activeView === 'entourage'
                ? 'bg-white text-[#185844] shadow-2xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Entourage
          </button>
          <button
            onClick={() => onSelectView('rsvp')}
            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
              activeView === 'rsvp'
                ? 'bg-[#185844] text-white shadow-2xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            RSVP
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onToggleMusic}
            className="p-2 rounded-full border border-stone-200 bg-white text-stone-600 hover:text-[#185844] hover:bg-stone-50 transition-colors cursor-pointer shadow-2xs"
            title={isMusicPlaying ? 'I-mute ang musika' : 'Patugtugin ang musika'}
          >
            <Music className={`w-3.5 h-3.5 ${isMusicPlaying ? 'text-[#78947F] animate-pulse' : 'text-stone-400'}`} />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full border border-stone-200 bg-white text-stone-600 hover:text-[#185844] hover:bg-stone-50 transition-colors cursor-pointer shadow-2xs"
            title="Baguhin ang Pangalan at Detalye"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {activeView !== 'rsvp' && (
            <button
              onClick={() => onSelectView('rsvp')}
              className="px-3.5 py-1.5 text-xs font-serif font-medium text-white bg-[#185844] rounded-full hover:bg-[#102F27] transition-colors whitespace-nowrap shrink-0 shadow-2xs cursor-pointer"
            >
              Mag-RSVP
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
