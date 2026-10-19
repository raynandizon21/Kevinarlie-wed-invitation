import React from 'react';
import { TimelineItem } from '../types/wedding';
import { Clock, Church, Wine, Utensils, Music, HeartHandshake } from 'lucide-react';

interface EventTimelineProps {
  timeline: TimelineItem[];
}

export const EventTimeline: React.FC<EventTimelineProps> = ({ timeline }) => {
  const getIcon = (type: TimelineItem['icon']) => {
    switch (type) {
      case 'church':
        return <Church className="w-4 h-4 text-[#185844]" />;
      case 'cocktail':
        return <Wine className="w-4 h-4 text-[#185844]" />;
      case 'dinner':
        return <Utensils className="w-4 h-4 text-[#185844]" />;
      case 'party':
        return <Music className="w-4 h-4 text-[#185844]" />;
      default:
        return <HeartHandshake className="w-4 h-4 text-[#185844]" />;
    }
  };

  return (
    <section id="timeline" className="py-6 md:py-16 px-1 sm:px-4 md:px-8 max-w-4xl mx-auto">
      <div className="text-center max-w-xl mx-auto mb-8 md:mb-12">
        <span className="text-[11px] font-sans font-semibold uppercase tracking-widest text-[#78947F] block mb-2">
          Daloy ng Araw (Order of Events)
        </span>
        <h2 className="font-serif text-3xl md:text-4xl text-[#185844] font-semibold tracking-tight">
          Programa at Iskedyul
        </h2>
        <p className="font-sans text-sm text-stone-600 mt-2">
          Isang simpleng gabay sa mga espesyal na bahagi ng ating pagdiriwang.
        </p>
      </div>

      <div className="relative border-l border-stone-200 ml-4 md:ml-32 space-y-8 pl-6 md:pl-8">
        {timeline.map((item, idx) => (
          <div key={idx} className="relative group">
            {/* Timeline Marker Dot */}
            <div className="absolute -left-[31px] md:-left-[39px] top-1.5 w-7 h-7 rounded-full bg-[#F2EBDD] border-2 border-[#78947F] flex items-center justify-center shadow-2xs group-hover:bg-[#185844]/10 transition-colors">
              {getIcon(item.icon)}
            </div>

            {/* Time label on desktop left side */}
            <div className="md:absolute md:-left-36 md:top-1.5 md:w-28 md:text-right text-xs font-mono font-medium text-[#78947F] mb-1 md:mb-0">
              <span className="inline-block px-2 py-0.5 rounded bg-stone-100 md:bg-transparent">
                {item.time}
              </span>
            </div>

            {/* Event details card */}
            <div className="bg-white rounded-xl p-5 border border-stone-200/80 shadow-2xs group-hover:border-[#78947F]/40 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                <h3 className="font-serif text-lg font-semibold text-[#185844]">
                  {item.title}
                </h3>
                <span className="text-[11px] font-sans text-stone-500 italic">
                  {item.location}
                </span>
              </div>
              <p className="font-sans text-xs text-stone-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
