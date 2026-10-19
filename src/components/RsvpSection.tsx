import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { GuestWish } from '../types/wedding';
import { CheckCircle2, Heart, Send, Gift, Sparkles, MessageCircleHeart } from 'lucide-react';

interface RsvpSectionProps {
  wishes: GuestWish[];
  onAddWish: (wish: GuestWish) => void;
  rsvpDeadline: string;
}

export const RsvpSection: React.FC<RsvpSectionProps> = ({
  wishes,
  onAddWish,
  rsvpDeadline,
}) => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [attendance, setAttendance] = useState<'attending' | 'regret'>('attending');
  const [guestCount, setGuestCount] = useState<'1' | '2'>('1');
  const [dietary, setDietary] = useState('Walang partikular na allergy');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newWish: GuestWish = {
      id: `wish-${Date.now()}`,
      name: name.trim(),
      message: message.trim() || (attendance === 'attending' ? 'Malugod kaming dadalo sa inyong espesyal na araw! Pagbati!' : 'Pagpalain nawa kayo ng Poong Maykapal!'),
      attendance,
      date: 'Ngayon lang',
    };

    onAddWish(newWish);
    setIsSubmitted(true);

    if (attendance === 'attending') {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#185844', '#78947F', '#B08A4F', '#A2B6A2'],
      });
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setName('');
    setMessage('');
    setContact('');
  };

  return (
    <section id="rsvp" className="py-6 md:py-16 px-1 sm:px-4 md:px-8 max-w-5xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
        <span className="text-[11px] font-sans font-semibold uppercase tracking-widest text-[#78947F] block mb-2">
          Kumpirmasyon ng Pagdalo
        </span>
        <h2 className="font-serif text-3xl md:text-4xl text-[#185844] font-semibold tracking-tight">
          I-kumpirma ang Inyong Pagdalo (RSVP)
        </h2>
        <p className="font-sans text-sm text-stone-600 mt-2">
          Mangyaring mag-RSVP bago o sa ganap na <strong>{rsvpDeadline}</strong> upang maihanda ang inyong upuan at handog na pagkain.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: RSVP Form */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-4 sm:p-6 md:p-8 border border-stone-200/80 shadow-xs">
          {isSubmitted ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-[#185844]/10 text-[#185844] flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-[#185844]" />
              </div>
              <h3 className="font-serif text-2xl text-[#185844] font-medium mb-2">
                Maraming Salamat, {name}!
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed mb-6 max-w-sm mx-auto">
                {attendance === 'attending'
                  ? 'Matagumpay na naitala ang inyong pagdalo. Sabik na kaming makasama kayo sa aming espesyal na araw!'
                  : 'Naiintindihan namin at lubos naming pinahahalagahan ang inyong taos-pusong pagbati.'}
              </p>
              <button
                onClick={handleReset}
                className="px-5 py-2 rounded-full text-xs font-medium border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Magsumite muli para sa ibang panauhin
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Buong Pangalan ng Panauhin <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Hal. Juan Dela Cruz"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#185844]/20 focus:border-[#185844]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Numero ng Telepono o Email
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="0917-xxx-xxxx o juan@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#185844]/20 focus:border-[#185844]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-2">
                  Makakadalo po ba kayo? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAttendance('attending')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      attendance === 'attending'
                        ? 'bg-[#185844] text-white border-[#185844] shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <span>Oo, Malugod na Dadalo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAttendance('regret')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      attendance === 'regret'
                        ? 'bg-stone-800 text-white border-stone-800 shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <span>Hindi Makakadalo</span>
                  </button>
                </div>
              </div>

              {attendance === 'attending' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Bilang ng Nakalaang Upuan
                    </label>
                    <select
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value as '1' | '2')}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#185844]/20 focus:border-[#185844] bg-white cursor-pointer"
                    >
                      <option value="1">1 Panauhin (Para sa akin lamang)</option>
                      <option value="2">2 Panauhin (Kasama ang aking plus one)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Kaugalian sa Pagkain (Dietary Preference)
                    </label>
                    <select
                      value={dietary}
                      onChange={(e) => setDietary(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#185844]/20 focus:border-[#185844] bg-white cursor-pointer"
                    >
                      <option value="Walang partikular na allergy">Walang partikular na allergy (Kahit ano)</option>
                      <option value="Halal Friendly">Halal Friendly / Pork-Free</option>
                      <option value="Vegetarian">Vegetarian / Gulay lamang</option>
                      <option value="Seafood Allergy">May allergy sa Hipon / Seafood</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Mensahe at Pagbati para sa Ikakasal
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Isulat ang inyong taos-pusong hiling o mensahe..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#185844]/20 focus:border-[#185844]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-serif text-sm tracking-wide bg-[#185844] text-white hover:bg-[#102F27] active:scale-[0.99] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Send className="w-3.5 h-3.5 text-[#B08A4F]" />
                <span>Isumite ang Aking RSVP</span>
              </button>
            </form>
          )}

          {/* Monetary Gift / Wishing Well Note */}
          <div className="mt-8 pt-6 border-t border-stone-100">
            <div className="flex items-start gap-3 bg-[#F2EBDD] p-4 rounded-xl border border-stone-200/60">
              <Gift className="w-5 h-5 text-[#78947F] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-serif text-sm font-semibold text-[#185844]">
                  Regalo at Wishing Well
                </h4>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  Ang inyong pagdalo at panalangin ang pinakamalaking regalo para sa amin. Kung ninanais ninyong mag-abot ng regalo, ang isang tulong-pinansyal para sa aming bagong tahanan ay taos-puso naming pasasalamatan.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Guestbook & Wishes Wall */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-4 sm:p-6 md:p-8 border border-stone-200/80 shadow-xs flex flex-col h-full max-h-[640px]">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
            <div className="flex items-center gap-2">
              <MessageCircleHeart className="w-5 h-5 text-[#78947F]" />
              <h3 className="font-serif text-xl font-semibold text-[#185844]">
                Aklat ng mga Pagbati (Guestbook)
              </h3>
            </div>
            <span className="text-xs font-mono text-stone-500">{wishes.length} mensahe</span>
          </div>

          {/* Scrollable wishes feed */}
          <div className="space-y-3.5 overflow-y-auto pr-1 flex-1">
            {wishes.map((w) => (
              <div
                key={w.id}
                className="p-4 rounded-xl bg-[#F2EBDD] border border-stone-200/60 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-serif text-sm font-semibold text-[#185844]">
                    {w.name}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-stone-400">
                    <span className="font-mono">{w.date}</span>
                    {w.attendance === 'attending' && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-50 text-emerald-700 font-medium">
                        Dadalo
                      </span>
                    )}
                  </div>
                </div>
                <p className="font-sans text-xs text-stone-600 leading-relaxed italic">
                  &ldquo;{w.message}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
