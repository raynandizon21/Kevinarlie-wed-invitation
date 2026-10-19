import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Download, ExternalLink } from 'lucide-react';

interface WeddingCountdownProps {
  targetDate: string;
  displayDate: string;
  groom: string;
  bride: string;
  churchName: string;
  churchAddress: string;
}

export const WeddingCountdown: React.FC<WeddingCountdownProps> = ({
  targetDate,
  displayDate,
  groom,
  bride,
  churchName,
  churchAddress,
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  // Generate Google Calendar Link
  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    `Kasal nina ${groom} & ${bride}`
  )}&dates=20261128T063000Z/20261128T140000Z&details=${encodeURIComponent(
    `Masayang pagdiriwang ng kasal nina ${groom} at ${bride}. Mangyaring sundin ang Earthy Tones dress code.`
  )}&location=${encodeURIComponent(`${churchName}, ${churchAddress}`)}`;

  // Download .ics file
  const downloadIcs = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Wedding Invitation//EN',
      'BEGIN:VEVENT',
      'SUMMARY:Kasal nina ' + groom + ' at ' + bride,
      'DESCRIPTION:Pag-iisang dibdib nina ' + groom + ' at ' + bride + '. Dress code: Earthy Tones.',
      'LOCATION:' + churchName + ', ' + churchAddress,
      'DTSTART:20261128T063000Z',
      'DTEND:20261128T140000Z',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'kasal-mateo-sofia.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 border border-stone-200/80 shadow-xs max-w-4xl mx-auto my-2 md:my-8">
      <div className="text-center mb-6">
        <span className="text-[11px] font-sans font-semibold uppercase tracking-widest text-[#78947F] block mb-1">
          Huling Pagbibilang Hanggang sa Araw ng Kasal
        </span>
        <h3 className="font-serif text-2xl md:text-3xl text-[#185844] font-medium">
          {displayDate}
        </h3>
      </div>

      {/* Countdown Grid with Tabular Numerals */}
      <div className="grid grid-cols-4 gap-2 md:gap-4 max-w-xl mx-auto mb-6 text-center">
        <div className="bg-[#F2EBDD] rounded-xl px-1 py-2.5 sm:p-3 md:p-4 border border-stone-200/60">
          <span className="font-serif text-2xl sm:text-3xl md:text-5xl font-semibold text-[#185844] tabular-nums block">
            {String(timeLeft.days).padStart(2, '0')}
          </span>
          <span className="text-[10px] md:text-xs text-stone-500 font-sans uppercase tracking-wider mt-1 block">
            Araw
          </span>
        </div>

        <div className="bg-[#F2EBDD] rounded-xl px-1 py-2.5 sm:p-3 md:p-4 border border-stone-200/60">
          <span className="font-serif text-2xl sm:text-3xl md:text-5xl font-semibold text-[#185844] tabular-nums block">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-[10px] md:text-xs text-stone-500 font-sans uppercase tracking-wider mt-1 block">
            Oras
          </span>
        </div>

        <div className="bg-[#F2EBDD] rounded-xl px-1 py-2.5 sm:p-3 md:p-4 border border-stone-200/60">
          <span className="font-serif text-2xl sm:text-3xl md:text-5xl font-semibold text-[#185844] tabular-nums block">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-[10px] md:text-xs text-stone-500 font-sans uppercase tracking-wider mt-1 block">
            Minuto
          </span>
        </div>

        <div className="bg-[#F2EBDD] rounded-xl px-1 py-2.5 sm:p-3 md:p-4 border border-stone-200/60">
          <span className="font-serif text-2xl sm:text-3xl md:text-5xl font-semibold text-[#185844] tabular-nums block">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="text-[10px] md:text-xs text-stone-500 font-sans uppercase tracking-wider mt-1 block">
            Segundo
          </span>
        </div>
      </div>

      {/* Calendar Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-stone-100">
        <a
          href={gcalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#185844] text-white hover:bg-[#102F27] transition-colors shadow-2xs"
        >
          <Calendar className="w-3.5 h-3.5 text-[#B08A4F]" />
          <span>I-save sa Google Calendar</span>
          <ExternalLink className="w-3 h-3 opacity-70" />
        </a>

        <button
          onClick={downloadIcs}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium border border-stone-300 text-stone-700 bg-white hover:bg-stone-50 transition-colors cursor-pointer shadow-2xs"
        >
          <Download className="w-3.5 h-3.5 text-stone-500" />
          <span>I-download ang iCal File (.ics)</span>
        </button>
      </div>
    </div>
  );
};
