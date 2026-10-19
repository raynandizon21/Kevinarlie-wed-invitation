import React, { useState } from 'react';
import { Palette, MapPin, Users, Calendar, Sparkles } from 'lucide-react';
import { ColorPalette, EntourageCategory } from '../types/wedding';
import { ColorPaletteSection } from './ColorPaletteSection';
import { VenuesSection } from './VenuesSection';
import { EntourageSection } from './EntourageSection';
import { WeddingCountdown } from './WeddingCountdown';
import { PALETTES } from '../data/weddingData';

interface WeddingDetailsHubProps {
  currentPalette: ColorPalette;
  onSelectPalette: (palette: ColorPalette) => void;
  groom: string;
  bride: string;
  displayDate: string;
  weddingDate: string;
  ceremonyTime: string;
  churchName: string;
  churchAddress: string;
  receptionName: string;
  receptionAddress: string;
  mapsChurchUrl: string;
  mapsReceptionUrl: string;
  wazeChurchUrl: string;
  entourageData: EntourageCategory[];
  defaultTab?: 'palette' | 'venues' | 'entourage';
}

export const WeddingDetailsHub: React.FC<WeddingDetailsHubProps> = ({
  currentPalette,
  onSelectPalette,
  groom,
  bride,
  displayDate,
  weddingDate,
  ceremonyTime,
  churchName,
  churchAddress,
  receptionName,
  receptionAddress,
  mapsChurchUrl,
  mapsReceptionUrl,
  wazeChurchUrl,
  entourageData,
  defaultTab = 'palette',
}) => {
  const [activeTab, setActiveTab] = useState<'palette' | 'venues' | 'entourage'>(defaultTab);

  return (
    <div className="space-y-6 pb-12">
      {/* Live Countdown Card */}
      <WeddingCountdown
        targetDate={weddingDate}
        displayDate={displayDate}
        groom={groom}
        bride={bride}
        churchName={churchName}
        churchAddress={churchAddress}
      />

      {/* Segmented Filter / Tab Bar */}
      <div className="flex justify-center px-4">
        <div className="inline-flex items-center p-1 bg-stone-200/70 rounded-full border border-stone-300/60 shadow-2xs text-xs font-medium max-w-full overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('palette')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'palette'
                ? 'bg-[#185844] text-white shadow-2xs font-semibold'
                : 'text-stone-700 hover:text-stone-950'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Color Palette</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('venues')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'venues'
                ? 'bg-[#185844] text-white shadow-2xs font-semibold'
                : 'text-stone-700 hover:text-stone-950'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Simbahan at Resepsyon</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('entourage')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'entourage'
                ? 'bg-[#185844] text-white shadow-2xs font-semibold'
                : 'text-stone-700 hover:text-stone-950'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Entourage at Sponsors</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="pt-2">
        {activeTab === 'palette' && (
          <ColorPaletteSection
            currentPalette={currentPalette}
            allPalettes={PALETTES}
            onSelectPalette={onSelectPalette}
          />
        )}

        {activeTab === 'venues' && (
          <VenuesSection
            churchName={churchName}
            churchAddress={churchAddress}
            ceremonyTime={ceremonyTime}
            receptionName={receptionName}
            receptionAddress={receptionAddress}
            mapsChurchUrl={mapsChurchUrl}
            mapsReceptionUrl={mapsReceptionUrl}
            wazeChurchUrl={wazeChurchUrl}
          />
        )}

        {activeTab === 'entourage' && (
          <EntourageSection categories={entourageData} />
        )}
      </div>
    </div>
  );
};
