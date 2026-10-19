import React, { useState } from 'react';
import { ColorPalette, ColorSwatch } from '../types/wedding';
import { Check, Copy, Sparkles, Shirt, Palette } from 'lucide-react';
import meadowCoupleImg from '../assets/images/wedding_couple_meadow_1791602914531.jpg';
import tablescapeImg from '../assets/images/wedding_tablescape_candlelight_1791602927298.jpg';
import detailsImg from '../assets/images/wedding_details_botanical_1791602939243.jpg';

interface ColorPaletteSectionProps {
  currentPalette: ColorPalette;
  allPalettes: ColorPalette[];
  onSelectPalette: (palette: ColorPalette) => void;
}

export const ColorPaletteSection: React.FC<ColorPaletteSectionProps> = ({
  currentPalette,
  allPalettes,
  onSelectPalette,
}) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [activeSwatchIndex, setActiveSwatchIndex] = useState<number>(0);

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const activeSwatch = currentPalette.colors[activeSwatchIndex];

  return (
    <section id="color-palette" className="py-6 md:py-16 px-1 sm:px-4 md:px-8 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#78947F]/10 text-[#185844] mb-3">
          <Palette className="w-3.5 h-3.5 text-[#78947F]" />
          <span>Gabay sa Kulay at Tema ng Kasal</span>
        </div>
        <h2 className="font-serif text-3xl md:text-4xl text-[#185844] font-semibold tracking-tight">
          Ang Aming Color Palette
        </h2>
        <p className="font-sans text-sm text-stone-600 mt-2 leading-relaxed">
          Pinili nang may pagmamahal para sa isang maaliwalas, moderno, at romantikong selebrasyon.
          Ito ang magiging kulay ng aming entourage at rekomendasyon para sa inyong pormal na kasuotan.
        </p>
      </div>

      {/* Palette Selector Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6 md:mb-10">
        <span className="text-xs text-stone-500 font-medium mr-2">Pumili ng Paleta:</span>
        {allPalettes.map((p) => {
          const isSelected = p.id === currentPalette.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelectPalette(p)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#185844] text-white shadow-sm ring-2 ring-[#185844]/20'
                  : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-400'
              }`}
            >
              <div className="flex -space-x-1 items-center">
                {p.colors.map((c, i) => (
                  <span
                    key={i}
                    className="w-3 h-3 rounded-full border border-white"
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
              <span className="font-medium">{p.title}</span>
              {p.id === 'earthy-tones' && (
                <span className="text-[10px] bg-[#B08A4F] text-stone-900 px-1.5 py-0.2 rounded-full font-bold">
                  Default
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Feature Layout: 4 Color Swatches on Left / Editorial Collage on Right (Matching the uploaded image) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: The 4 Swatches & Detailed Role Specs */}
        <div className="lg:col-span-5 min-w-0 bg-white rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm border border-stone-200/80">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
            <div>
              <h3 className="font-serif text-xl font-semibold text-[#185844]">
                {currentPalette.title}
              </h3>
              <p className="text-xs text-stone-500 font-sans mt-0.5">
                {currentPalette.subtitle}
              </p>
            </div>
            <span className="text-xs font-mono font-medium text-stone-400">{currentPalette.colors.length} Swatches</span>
          </div>

          {/* 4 Large Aesthetic Swatch Buttons */}
          <div className="grid gap-2 sm:gap-3 mb-6" style={{ gridTemplateColumns: `repeat(${currentPalette.colors.length}, minmax(0, 1fr))` }}>
            {currentPalette.colors.map((swatch, idx) => {
              const isActive = activeSwatchIndex === idx;
              return (
                <button
                  key={swatch.hex}
                  onClick={() => setActiveSwatchIndex(idx)}
                  className={`group min-w-0 flex flex-col items-center p-1 sm:p-2 rounded-xl transition-all cursor-pointer ${
                    isActive ? 'bg-stone-50 ring-2 ring-[#185844]' : 'hover:bg-stone-50/50'
                  }`}
                >
                  <div
                    className="w-full max-w-14 md:max-w-16 aspect-square rounded-full shadow-md transition-transform duration-200 group-hover:scale-105 flex items-center justify-center relative border border-black/10"
                    style={{ backgroundColor: swatch.hex }}
                  >
                    {isActive && (
                      <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-white shadow-xs" />
                    )}
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-medium text-stone-700 mt-1.5 sm:mt-2 truncate max-w-full text-center">
                    {swatch.name}
                  </span>
                  <span className="hidden sm:block text-[10px] font-mono text-stone-400 truncate max-w-full">
                    {swatch.hex}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Color Highlight Card */}
          <div className="bg-[#F2EBDD] rounded-xl p-4 sm:p-5 border border-stone-200/60 mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-5 h-5 rounded-full border border-black/15 shadow-2xs"
                  style={{ backgroundColor: activeSwatch.hex }}
                />
                <div>
                  <h4 className="font-serif text-base font-semibold text-[#185844]">
                    {activeSwatch.name}
                  </h4>
                  <span className="text-xs text-[#78947F] italic">
                    ({activeSwatch.tagalogName})
                  </span>
                </div>
              </div>

              {/* Copy Hex Button */}
              <button
                onClick={() => handleCopyHex(activeSwatch.hex)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 transition-colors shadow-2xs cursor-pointer"
                title="Kopyahin ang HEX color code"
              >
                {copiedHex === activeSwatch.hex ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">Nakopya!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-stone-400" />
                    <span>{activeSwatch.hex}</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-2 mt-3 pt-3 border-t border-stone-200/60 text-xs">
              <div>
                <span className="font-semibold text-stone-700 block">Tungkulin sa Kasal:</span>
                <span className="text-stone-600">{activeSwatch.role}</span>
              </div>
              <div>
                <span className="font-semibold text-stone-700 block">Gabay sa Kasuotan:</span>
                <span className="text-stone-600">{activeSwatch.attireGuide}</span>
              </div>
            </div>
          </div>

          {/* General Dress Code Notes for Guests */}
          <div className="rounded-xl border border-dashed border-[#78947F]/40 p-4 bg-[#78947F]/5">
            <div className="flex items-start gap-2.5">
              <Shirt className="w-4 h-4 text-[#185844] mt-0.5 shrink-0" />
              <div>
                <h5 className="font-serif text-sm font-semibold text-[#185844]">
                  Mahalagang Paalala sa Kasuotan (Dress Code):
                </h5>
                <ul className="text-xs text-stone-600 mt-1.5 space-y-1 list-disc list-inside">
                  <li>
                    <strong>Kasuotan:</strong> Pormal o Modern Filipiniana / Barong Tagalog.
                  </li>
                  <li>
                    <strong>Kulay ng mga Panauhin:</strong> Inaanyayahan kayong magsuot ng alinman sa 4 na Earthy Tones na ito.
                  </li>
                  <li>
                    <strong>Pakiusap:</strong> Mangyaring iwasan ang purong puti o ivory upang maging natatangi ang ikakasal.
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Editorial Moodboard Collage (Inspired by user's uploaded picture!) */}
        <div className="lg:col-span-7 min-w-0 flex flex-col gap-4">
          
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-stone-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-serif uppercase tracking-widest text-stone-500">
                Wedding Moodboard &amp; Visual Inspirations
              </span>
              <span className="text-xs text-[#78947F] font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Earthy &amp; Botanical Tone
              </span>
            </div>

            {/* Collage Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Image 1: Couple in Pine Forest Meadow */}
              <div className="relative group overflow-hidden rounded-xl border border-stone-100 aspect-4/3">
                <img
                  src={meadowCoupleImg}
                  alt="Bride and groom walking in meadow"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[10px] uppercase tracking-wider text-[#B08A4F] font-medium">
                    Outdoor Sanctuary
                  </span>
                  <p className="font-serif text-sm font-medium">
                    Kasunduan sa Lilim ng mga Puno
                  </p>
                </div>
              </div>

              {/* Image 2: Reception Tablescape Candlelight */}
              <div className="relative group overflow-hidden rounded-xl border border-stone-100 aspect-4/3">
                <img
                  src={tablescapeImg}
                  alt="Rustic wedding reception banquet table with eucalyptus"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[10px] uppercase tracking-wider text-[#B08A4F] font-medium">
                    The Reception Tablescape
                  </span>
                  <p className="font-serif text-sm font-medium">
                    Kandila, Kahoy, at Sariwang Oliba
                  </p>
                </div>
              </div>

              {/* Image 3: Stationery & Botanical Details (Wide Span) */}
              <div className="md:col-span-2 relative group overflow-hidden rounded-xl border border-stone-100 aspect-16/9">
                <img
                  src={detailsImg}
                  alt="Earthy green invitation suite with wax seal and olive sprigs"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white flex justify-between items-end">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#B08A4F] font-medium">
                      Stationery Suite
                    </span>
                    <p className="font-serif text-base font-medium">
                      Makalumang Wax Seal, Ginto, at Deckled Paper
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs">
                    <span className="w-2 h-2 rounded-full bg-[#185844]" />
                    <span className="w-2 h-2 rounded-full bg-[#F2EBDD]" />
                    <span className="w-2 h-2 rounded-full bg-[#78947F]" />
                    <span className="w-2 h-2 rounded-full bg-[#102F27]" />
                    <span className="w-2 h-2 rounded-full bg-[#B08A4F]" />
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
