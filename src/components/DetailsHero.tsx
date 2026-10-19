import React from 'react';
import { Calendar, MapPin, Clock, Heart } from 'lucide-react';
import meadowCoupleImg from '../assets/images/wedding_couple_meadow_1791602914531.jpg';

interface DetailsHeroProps {
  groom: string;
  bride: string;
  displayDate: string;
  ceremonyTime: string;
  churchName: string;
  receptionName: string;
}

export const DetailsHero: React.FC<DetailsHeroProps> = ({
  groom,
  bride,
  displayDate,
  ceremonyTime,
  churchName,
  receptionName,
}) => {
  return (
    <section id="wedding-hero" className="pt-8 pb-12 px-4 md:px-8 max-w-6xl mx-auto">
      {/* Editorial Couple Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-md border border-stone-200/80 bg-stone-900 min-h-[460px] md:min-h-[520px] flex items-end">
        <img
          src={meadowCoupleImg}
          alt="Mateo at Sofia sa kagubatan"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.88]"
          referrerPolicy="no-referrer"
        />

        {/* Soft elegant gradient scrim ensuring 4.5:1 text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent" />

        {/* Floating Top Badge */}
        <div className="absolute top-6 left-6 flex items-center gap-2 bg-stone-900/60 backdrop-blur-md px-3.5 py-1.5 rounded-full text-white/90 text-xs border border-white/10">
          <Heart className="w-3.5 h-3.5 text-[#B08A4F] fill-[#B08A4F]" />
          <span className="font-serif tracking-widest text-[11px] uppercase">
            2nd Page &bull; Mga Detalye ng Kasalan
          </span>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 p-6 md:p-12 w-full max-w-3xl text-white">
          <p className="font-script text-3xl md:text-5xl text-[#B08A4F] mb-2 drop-shadow-sm">
            Ikinagagalak naming ibahagi sa inyo
          </p>

          <h1 className="font-serif text-3xl md:text-6xl font-normal tracking-tight text-white leading-tight mb-4">
            {groom} <span className="text-[#B08A4F] font-script text-4xl md:text-6xl">&amp;</span> {bride}
          </h1>

          <p className="text-xs md:text-sm text-stone-200 leading-relaxed max-w-xl font-sans mb-6">
            Kayo po ay malugod naming inaanyayahan na saksihan ang pag-iisang dibdib at sumpaan ng aming walang-hanggang pag-ibig sa harap ng Poong Maykapal.
          </p>

          {/* Quick Key Info Pills */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-sans text-stone-100">
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/15">
              <Calendar className="w-3.5 h-3.5 text-[#B08A4F]" />
              <span>{displayDate}</span>
            </div>

            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/15">
              <Clock className="w-3.5 h-3.5 text-[#B08A4F]" />
              <span>{ceremonyTime}</span>
            </div>

            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/15">
              <MapPin className="w-3.5 h-3.5 text-[#B08A4F]" />
              <span>{churchName}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
