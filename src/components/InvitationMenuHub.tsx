import React from 'react';
import { motion } from 'framer-motion';
import { ColorPalette } from '../types/wedding';
import jardinVenueImg from '../assets/images/jardin_venue_1791676573787.jpg';
import meadowCoupleImg from '../assets/images/wedding_couple_meadow_1791602914531.jpg';
import entourageTitleIvoryImg from '../assets/images/the_entourage_title_ivory.png';

export type MenuModalView = 'rsvp' | 'details' | 'timeline' | 'faqs' | 'palette' | 'venues' | 'entourage';

interface InvitationMenuHubProps {
  palette: ColorPalette;
  groom: string;
  bride: string;
  groomNickname?: string;
  brideNickname?: string;
  displayDate: string;
  churchName: string;
  receptionName: string;
  rsvpDeadline: string;
  onOpenView: (view: MenuModalView) => void;
  onOpenSettings: () => void;
}

export const InvitationMenuHub: React.FC<InvitationMenuHubProps> = ({
  groom,
  bride,
  groomNickname,
  brideNickname,
  onOpenView,
}) => {
  const groomName = groomNickname || groom.split(' ')[0] || 'Kevin';
  const brideName = brideNickname || bride.split(' ')[0] || 'Arlei';
  const coupleNames = `${groomName} + ${brideName}`;

  return (
    <div className="fixed inset-0 h-[100dvh] w-full flex items-center justify-center bg-[#E6DCC8] overflow-hidden select-none p-0 sm:p-2">
      {/* Outer ambient shadow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_40%,_rgba(30,40,22,0.18)_100%)]" />

      {/* Main Screen Container - Aspect Ratio 9:18 for realistic mobile flatlay */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative w-full max-w-[420px] h-[100dvh] sm:h-[97dvh] sm:max-h-[860px] bg-[#F2EBDD] sm:rounded-[36px] shadow-[0_25px_60px_-15px_rgba(25,35,20,0.35)] overflow-hidden flex flex-col items-center justify-center"
      >
        {/* =========================================================================
            CENTERED STATIONERY CANVAS
            Uses aspect-[9/15] to preserve authentic stationery flatlay proportions
            and centers all elements dead-center in the viewport
            ========================================================================= */}
        <div className="relative w-full max-w-[395px] aspect-[9/15] max-h-[88%] my-auto flex items-center justify-center">
          <div className="relative w-full h-full inset-0">

            {/* =======================================================================
                1. MAIN PHOTO CARD ("THE WEDDING OF Kevin + Arlei")
                Position: Top-Left | Width: 41% | Height: 27%
                Z-Index: 2
                ======================================================================= */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onOpenView('entourage')}
              className="absolute rounded-xs overflow-hidden shadow-[0_8px_20px_rgba(20,30,15,0.22)] border border-white/60 cursor-pointer group z-2 flex flex-col justify-end"
              style={{
                left: '6%',
                top: '4%',
                width: '41%',
                height: '27%',
              }}
            >
              <img
                src={jardinVenueImg}
                alt="Venue aerial view"
                className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.82] contrast-[1.06] group-hover:scale-105 transition-transform duration-700"
              />
              {/* Dark gradient for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              {/* Text Overlay */}
              <div className="relative z-10 p-2 sm:p-2.5 flex flex-col justify-end text-white">
                <span className="text-[7px] sm:text-[8px] uppercase tracking-[0.24em] font-sans font-medium text-stone-200 leading-none mb-1">
                  THE WEDDING OF
                </span>
                <h1 className="font-serif text-xs sm:text-sm font-normal tracking-wide text-white leading-tight drop-shadow-sm">
                  {coupleNames}
                </h1>
                <img
                  src={entourageTitleIvoryImg}
                  alt="The Entourage"
                  className="mt-1.5 self-start block h-[clamp(0.7rem,3vw,0.95rem)] w-auto max-w-full object-contain drop-shadow-sm"
                  draggable={false}
                />
              </div>
            </motion.div>

            {/* =======================================================================
                2. SAVE THE DATE CARD
                Position: Top-Right | Width: 41% | Height: 27%
                Z-Index: 2
                ======================================================================= */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="absolute rounded-xs bg-[#F8F4EA] shadow-[0_8px_20px_rgba(30,40,20,0.18)] p-2 sm:p-2.5 flex flex-col justify-between text-center z-2 border-t-[3.5px] border-b-[3.5px] border-[#185844]"
              style={{
                left: '53%',
                top: '4%',
                width: '41%',
                height: '27%',
              }}
            >
              {/* Header: Save the Date */}
              <div className="font-script text-base sm:text-xl text-[#185844] leading-tight pt-0.5">
                Save the Date
              </div>

              {/* Top divider line */}
              <div className="w-10/12 mx-auto border-t border-stone-300 my-0.5" />

              {/* SUNDAY */}
              <div className="text-[7px] sm:text-[8px] uppercase tracking-[0.22em] font-sans font-medium text-stone-500">
                SUNDAY
              </div>

              {/* DECEMBER | 14 | 2025 */}
              <div className="font-serif text-[9px] sm:text-xs font-bold text-[#102F27] tracking-wider my-0.5 flex items-center justify-center gap-1">
                <span>DECEMBER</span>
                <span className="text-[#185844] text-xs sm:text-sm font-extrabold px-1 border-x border-stone-300">
                  14
                </span>
                <span>2025</span>
              </div>

              {/* Bottom divider line */}
              <div className="w-10/12 mx-auto border-t border-stone-300 my-0.5" />

              {/* JARDIN DE JOSEFINA */}
              <div className="text-[6.5px] sm:text-[7.5px] uppercase tracking-[0.2em] font-sans font-semibold text-[#185844] pb-0.5">
                JARDIN DE JOSEFINA
              </div>
            </motion.div>

            {/* =======================================================================
                3. RSVP CARD ("Kindly RSVP here")
                Position: Middle-Left | Width: 41% | Height: 20%
                Has comfortable space allowance from Main Photo Card above and Timeline below
                Z-Index: 3
                ======================================================================= */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onOpenView('rsvp')}
              className="absolute rounded-xs bg-[#F8F4EA] shadow-[0_8px_20px_rgba(30,40,20,0.18)] cursor-pointer group z-3 flex flex-col justify-between p-2 pl-3 sm:pl-3.5 pr-2 text-left border-t border-b border-stone-200/60"
              style={{
                left: '6%',
                top: '34.6%',
                width: '41%',
                height: '20%',
              }}
            >
              {/* Dark Green Thick Vertical Bar on the left edge */}
              <div className="absolute left-0 top-0 bottom-0 w-2 sm:w-2.5 bg-[#185844]" />

              {/* Kindly (Cursive accent text, top-left) */}
              <div className="font-script text-xs sm:text-sm text-[#185844] leading-none self-start">
                Kindly
              </div>

              {/* RSVP (Large Serif font, center-aligned, with underline) */}
              <div className="w-full text-center my-auto">
                <span className="font-serif text-sm sm:text-lg font-bold tracking-[0.16em] text-[#102F27] border-b-2 border-[#102F27] pb-0.5 inline-block leading-none">
                  RSVP
                </span>
              </div>

              {/* here (Cursive accent text, bottom-right) */}
              <div className="font-script text-xs sm:text-sm text-[#185844] leading-none self-end">
                here
              </div>
            </motion.button>

            {/* =======================================================================
                4. DETAILS CARD ("Click for the DETAILS")
                Position: Middle-Right | Width: 41% | Height: 20%
                Separated nicely with margin from Save the Date
                Z-Index: 3
                ======================================================================= */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onOpenView('details')}
              className="absolute rounded-xs bg-[#F8F4EA] shadow-[0_8px_20px_rgba(30,40,20,0.18)] border border-stone-200/70 cursor-pointer group text-center p-2 pr-3 sm:pr-3.5 flex flex-col items-center justify-center z-3"
              style={{
                left: '53%',
                top: '34.6%',
                width: '41%',
                height: '20%',
              }}
            >
              {/* Dark Green Thick Vertical Bar on the right edge */}
              <div className="absolute right-0 top-0 bottom-0 w-2 sm:w-2.5 bg-[#185844]" />

              {/* Click for the (Italic calligraphy font) */}
              <span className="font-script text-xs sm:text-sm text-stone-600 mb-0.5 leading-tight">
                Click for the
              </span>

              {/* DETAILS (Bold, spaced Serif font, underlined) */}
              <span className="font-serif text-xs sm:text-sm font-bold tracking-[0.2em] text-[#102F27] group-hover:text-[#185844] border-b-2 border-[#102F27] pb-0.5 leading-none transition-colors">
                DETAILS
              </span>
            </motion.button>

            {/* =======================================================================
                5. EVENT TIMELINE CARD (Polaroid Card)
                Position: Bottom-Left | Width: 41% | Height: 35%
                Separated with space allowance below RSVP card
                Z-Index: 4
                ======================================================================= */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onOpenView('timeline')}
              className="absolute rounded-xs bg-white p-1.5 pb-2 sm:pb-2.5 shadow-[0_10px_24px_rgba(30,40,20,0.2)] border border-stone-200/80 cursor-pointer group text-center z-4 flex flex-col justify-between"
              style={{
                left: '6%',
                top: '58.2%',
                width: '41%',
                height: '35%',
              }}
            >
              {/* Couple photo in grass meadow */}
              <div className="relative w-full flex-1 rounded-2xs overflow-hidden bg-stone-100">
                <img
                  src={meadowCoupleImg}
                  alt="Couple timeline walking in meadow"
                  className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.05] group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Polaroid wide bottom margin with elegant script */}
              <div className="pt-1.5 pb-0.5 text-center">
                <span className="font-script text-sm sm:text-base text-[#102F27] group-hover:text-[#185844] transition-colors leading-none border-b border-[#102F27]/40 pb-0.5 inline-block">
                  Event Timeline
                </span>
              </div>
            </motion.button>

            {/* =======================================================================
                6. FAQS CIRCULAR BUTTON
                Position: Bottom-Right | Width: 41% (centered in the row beside the Timeline card)
                Z-Index: 5 (top layer)
                ======================================================================= */}
            <div
              className="absolute z-5 flex items-center justify-center"
              style={{
                left: '53%',
                top: '63.4%',
                width: '41%',
              }}
            >
              {/* Perfect Circle Button */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onOpenView('faqs')}
                className="relative w-full aspect-square rounded-full bg-[#185844] text-white flex flex-col items-center justify-center text-center p-2 shadow-[0_14px_28px_rgba(25,35,18,0.42)] border-2 border-white cursor-pointer group z-10"
              >
                {/* Click for the (Gold / Mustard cursive script) */}
                <span className="font-script text-xs sm:text-sm text-[#B08A4F] leading-none mb-0.5 drop-shadow-2xs">
                  Click for the
                </span>

                {/* FAQS (White bold serif font, underlined) */}
                <span className="font-serif text-sm sm:text-base font-bold tracking-[0.16em] text-white border-b border-white pb-0.5 leading-tight group-hover:text-[#E6D3AE] transition-colors">
                  FAQS
                </span>
              </motion.button>
            </div>

          </div>
        </div>

      </motion.div>
    </div>
  );
};
