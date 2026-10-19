import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, MessageCircle, Heart } from 'lucide-react';
import { FAQS_DATA, FaqItem } from '../data/weddingData';

interface FaqSectionProps {
  onBackToMenu?: () => void;
  onOpenRsvp?: () => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ onBackToMenu, onOpenRsvp }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-6 px-4 md:px-6 max-w-3xl mx-auto">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#185844]/10 text-[#185844] text-xs font-medium mb-3">
          <HelpCircle className="w-3.5 h-3.5 text-[#78947F]" />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl text-[#185844] font-medium tracking-tight">
          Mga Madalas Itanong (FAQs)
        </h2>
        <p className="text-stone-600 text-xs sm:text-sm mt-2 max-w-md mx-auto">
          Narito ang ilang mahahalagang gabay at paalala para sa komportable at masayang pagdiriwang ng aming kasal sa Jardin de Josefina.
        </p>
      </div>

      {/* Accordion Questions */}
      <div className="space-y-3">
        {FAQS_DATA.map((item: FaqItem, index: number) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isOpen
                  ? 'bg-white border-[#78947F]/40 shadow-sm'
                  : 'bg-white/80 border-stone-200/80 hover:border-stone-300'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleItem(index)}
                className="w-full py-4 px-5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#78947F]/15 text-[#185844] text-xs font-semibold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <span className="font-serif text-sm sm:text-base font-medium text-stone-900">
                    {item.question}
                  </span>
                </div>
                <div className="text-stone-400 shrink-0 ml-2">
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#185844]" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-stone-600 border-t border-stone-100 leading-relaxed bg-[#F8F4EA]/50">
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Helpful reminder card */}
      <div className="mt-8 p-5 rounded-2xl bg-[#185844] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-[#B08A4F] font-medium mb-1">
            <Heart className="w-3.5 h-3.5 fill-[#B08A4F]" />
            <span>May karagdagang katanungan?</span>
          </div>
          <p className="text-xs text-stone-200">
            Huwag mag-atubiling makipag-ugnayan sa amin o kumpirmahin ang iyong pagdalo sa aming RSVP page.
          </p>
        </div>
        {onOpenRsvp && (
          <button
            onClick={onOpenRsvp}
            className="px-4 py-2 rounded-full bg-[#B08A4F] hover:bg-[#B08A4F] text-stone-900 text-xs font-semibold shrink-0 transition-colors shadow-2xs cursor-pointer"
          >
            Mag-RSVP Ngayon
          </button>
        )}
      </div>
    </section>
  );
};
