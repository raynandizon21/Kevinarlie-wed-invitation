import React from 'react';
import { Palette, MapPin, Clock, Users, Send, ArrowRight, Heart, Calendar } from 'lucide-react';
import { ColorPalette } from '../types/wedding';
import meadowCoupleImg from '../assets/images/wedding_couple_meadow_1791602914531.jpg';

export type SubPageView = 'palette' | 'venues' | 'timeline' | 'entourage' | 'rsvp';

interface CardsHubProps {
  palette: ColorPalette;
  groom: string;
  bride: string;
  displayDate: string;
  churchName: string;
  receptionName: string;
  rsvpDeadline: string;
  onSelectView: (view: SubPageView) => void;
}

export const CardsHub: React.FC<CardsHubProps> = ({
  palette,
  groom,
  bride,
  displayDate,
  churchName,
  receptionName,
  rsvpDeadline,
  onSelectView,
}) => {
  const coupleName = `${groom.split(' ')[0]} & ${bride.split(' ')[0]}`;

  const cards: Array<{
    id: SubPageView;
    title: string;
    subtitle: string;
    description: string;
    icon: React.ReactNode;
    badgeText?: string;
    customContent?: React.ReactNode;
  }> = [
    {
      id: 'palette',
      title: '4-Color Palette at Kasuotan',
      subtitle: 'Dress Code & Swatches',
      description: 'Tingnan ang 4 na kulay, mga hex code, at gabay sa pormal na kasuotan para sa mga bisita at abay.',
      icon: <Palette className="w-5 h-5 text-[#185844]" />,
      badgeText: palette.title,
      customContent: (
        <div className="flex items-center gap-1.5 mt-2">
          {palette.colors.map((c, i) => (
            <div key={i} className="flex items-center gap-1">
              <span
                className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            </div>
          ))}
          <span className="text-[10px] text-stone-500 font-mono ml-1">{palette.colors.length} Kulay</span>
        </div>
      ),
    },
    {
      id: 'venues',
      title: 'Simbahan at Resepsyon',
      subtitle: 'Mga Lokasyon at Mapa',
      description: `${churchName} & ${receptionName}. May direct Google Maps at Waze links.`,
      icon: <MapPin className="w-5 h-5 text-[#185844]" />,
      badgeText: 'May Waze & Maps',
    },
    {
      id: 'timeline',
      title: 'Daloy ng Programa',
      subtitle: 'Iskedyul ng Araw',
      description: 'Oras ng seremonya, cocktail hour, reception dinner, at after-party kasama ang ikakasal.',
      icon: <Clock className="w-5 h-5 text-[#185844]" />,
      badgeText: '2:00 PM – 8:30 PM',
    },
    {
      id: 'entourage',
      title: 'Entourage at mga Sponsor',
      subtitle: 'Ninong, Ninang, at mga Abay',
      description: 'Talaan ng mga magulang, principal sponsors, best man, maid of honor, at mga tagapag-alalay.',
      icon: <Users className="w-5 h-5 text-[#185844]" />,
      badgeText: 'Talaan ng Abay',
    },
    {
      id: 'rsvp',
      title: 'RSVP at Aklat ng Pagbati',
      subtitle: 'Kumpirmahin ang Pagdalo',
      description: `Magsumite ng kumpirmasyon bago sumapit ang ${rsvpDeadline} at mag-iwan ng taos-pusong mensahe.`,
      icon: <Send className="w-5 h-5 text-[#185844]" />,
      badgeText: 'Mahalaga',
    },
  ];

  return (
    <section className="py-6 px-4 md:px-8 max-w-5xl mx-auto">
      {/* Top Welcome Banner Card */}
      <div className="relative rounded-2xl overflow-hidden bg-stone-900 border border-stone-200 shadow-xs mb-8 min-h-[170px] md:min-h-[200px] flex items-center">
        <img
          src={meadowCoupleImg}
          alt="Mateo at Sofia sa kagubatan"
          className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.75]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/85 via-stone-950/50 to-transparent" />

        <div className="relative z-10 p-6 md:p-8 text-white max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#B08A4F]/20 text-[#B08A4F] border border-[#B08A4F]/30 mb-2">
            <Heart className="w-3 h-3 fill-[#B08A4F]" />
            <span>Pangunahing Menu ng Kasalan</span>
          </div>

          <h2 className="font-serif text-2xl md:text-4xl font-normal tracking-tight">
            {coupleName}
          </h2>

          <div className="flex items-center gap-2 text-xs text-stone-200 mt-1 font-sans">
            <Calendar className="w-3.5 h-3.5 text-[#B08A4F]" />
            <span>{displayDate}</span>
          </div>

          <p className="text-[11px] text-stone-300 mt-2 font-sans">
            Pumili ng card sa ibaba upang makita ang bawat detalye nang walang mahabang scroll down:
          </p>
        </div>
      </div>

      {/* Grid of Grouped Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => onSelectView(card.id)}
            className="group text-left bg-white rounded-2xl p-5 border border-stone-200/80 shadow-2xs hover:shadow-md hover:border-[#185844]/40 transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-[0.98]"
          >
            <div>
              {/* Card Header with Icon and Badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#185844]/10 flex items-center justify-center transition-colors group-hover:bg-[#185844] group-hover:text-white">
                  <span className="transition-colors group-hover:text-white">
                    {card.icon}
                  </span>
                </div>

                {card.badgeText && (
                  <span className="text-[10px] font-sans font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 group-hover:bg-[#78947F]/15 group-hover:text-[#185844] transition-colors">
                    {card.badgeText}
                  </span>
                )}
              </div>

              {/* Card Titles */}
              <h3 className="font-serif text-lg font-semibold text-[#185844] group-hover:text-[#102F27] transition-colors leading-snug">
                {card.title}
              </h3>
              <p className="text-[11px] font-sans font-medium text-[#78947F] mt-0.5">
                {card.subtitle}
              </p>

              {/* Description */}
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                {card.description}
              </p>

              {/* Custom micro preview if any (e.g., color swatches) */}
              {card.customContent}
            </div>

            {/* Bottom Redirect Indicator */}
            <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs font-medium text-[#185844]">
              <span className="text-[11px]">Tingnan ang Detalye</span>
              <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center group-hover:bg-[#185844] group-hover:text-white transition-all">
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
