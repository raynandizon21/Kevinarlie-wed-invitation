import React, { useState } from 'react';
import { MapPin, Navigation, Copy, Check, Clock, Church, UtensilsCrossed } from 'lucide-react';

interface VenuesSectionProps {
  churchName: string;
  churchAddress: string;
  ceremonyTime: string;
  receptionName: string;
  receptionAddress: string;
  mapsChurchUrl: string;
  mapsReceptionUrl: string;
  wazeChurchUrl: string;
}

export const VenuesSection: React.FC<VenuesSectionProps> = ({
  churchName,
  churchAddress,
  ceremonyTime,
  receptionName,
  receptionAddress,
  mapsChurchUrl,
  mapsReceptionUrl,
  wazeChurchUrl,
}) => {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(label);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  return (
    <section id="venues" className="py-6 md:py-16 px-1 sm:px-4 md:px-8 max-w-6xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
        <span className="text-[11px] font-sans font-semibold uppercase tracking-widest text-[#78947F] block mb-2">
          Mga Lokasyon at Oras
        </span>
        <h2 className="font-serif text-3xl md:text-4xl text-[#185844] font-semibold tracking-tight">
          Simbahan at Resepsyon
        </h2>
        <p className="font-sans text-sm text-stone-600 mt-2">
          Mangyaring planuhin ang inyong biyahe upang makarating nang maaga bago magsimula ang prusisyon.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Church Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-full bg-[#185844]/10 text-[#185844] flex items-center justify-center mb-4">
              <Church className="w-5 h-5 text-[#185844]" />
            </div>

            <span className="text-xs uppercase tracking-widest font-semibold text-[#78947F] block mb-1">
              Ang Banal na Kasal (Ceremony)
            </span>
            <h3 className="font-serif text-2xl font-semibold text-[#185844] mb-2">
              {churchName}
            </h3>

            <div className="flex items-center gap-2 text-xs font-medium text-stone-700 mb-4 bg-[#F2EBDD] p-2.5 rounded-lg border border-stone-100">
              <Clock className="w-4 h-4 text-[#B08A4F] shrink-0" />
              <span>{ceremonyTime} (Magsisimula ang prusisyon sa ganap na 2:15 PM)</span>
            </div>

            <div className="flex items-start gap-2 text-xs text-stone-600 mb-6">
              <MapPin className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
              <p className="leading-relaxed">{churchAddress}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 space-y-2.5">
            <div className="flex items-center gap-2">
              <a
                href={mapsChurchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-[#185844] text-white hover:bg-[#102F27] transition-colors"
              >
                <Navigation className="w-3.5 h-3.5 text-[#B08A4F]" />
                <span>Buksan sa Google Maps</span>
              </a>

              <a
                href={wazeChurchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-stone-100 text-stone-800 hover:bg-stone-200 transition-colors"
              >
                <span>Waze</span>
              </a>
            </div>

            <button
              onClick={() => copyToClipboard(churchAddress, 'church')}
              className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium text-stone-600 hover:text-stone-900 border border-stone-200 hover:bg-stone-50 transition-colors cursor-pointer"
            >
              {copiedAddress === 'church' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Nakopya ang address sa clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-400" />
                  <span>Kopyahin ang Address ng Simbahan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Reception Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-full bg-[#78947F]/15 text-[#78947F] flex items-center justify-center mb-4">
              <UtensilsCrossed className="w-5 h-5 text-[#185844]" />
            </div>

            <span className="text-xs uppercase tracking-widest font-semibold text-[#78947F] block mb-1">
              Ang Piging at Selebrasyon (Reception)
            </span>
            <h3 className="font-serif text-2xl font-semibold text-[#185844] mb-2">
              {receptionName}
            </h3>

            <div className="flex items-center gap-2 text-xs font-medium text-stone-700 mb-4 bg-[#F2EBDD] p-2.5 rounded-lg border border-stone-100">
              <Clock className="w-4 h-4 text-[#B08A4F] shrink-0" />
              <span>5:30 PM - Cocktail Socials / 6:00 PM - Hapunan</span>
            </div>

            <div className="flex items-start gap-2 text-xs text-stone-600 mb-6">
              <MapPin className="w-4 h-4 text-stone-400 mt-0.5 shrink-0" />
              <p className="leading-relaxed">{receptionAddress}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 space-y-2.5">
            <div className="flex items-center gap-2">
              <a
                href={mapsReceptionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-[#185844] text-white hover:bg-[#102F27] transition-colors"
              >
                <Navigation className="w-3.5 h-3.5 text-[#B08A4F]" />
                <span>Buksan sa Google Maps</span>
              </a>

              <a
                href="https://waze.com/ul?q=The+Peninsula+Manila"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-stone-100 text-stone-800 hover:bg-stone-200 transition-colors"
              >
                <span>Waze</span>
              </a>
            </div>

            <button
              onClick={() => copyToClipboard(receptionAddress, 'reception')}
              className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium text-stone-600 hover:text-stone-900 border border-stone-200 hover:bg-stone-50 transition-colors cursor-pointer"
            >
              {copiedAddress === 'reception' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Nakopya ang address sa clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-400" />
                  <span>Kopyahin ang Address ng Reception</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
