import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface EditDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groom: string;
  bride: string;
  displayDate: string;
  churchName: string;
  receptionName: string;
  guestName: string;
  onSave: (data: {
    groom: string;
    bride: string;
    displayDate: string;
    churchName: string;
    receptionName: string;
    guestName: string;
  }) => void;
}

export const EditDetailsModal: React.FC<EditDetailsModalProps> = ({
  isOpen,
  onClose,
  groom: initialGroom,
  bride: initialBride,
  displayDate: initialDate,
  churchName: initialChurch,
  receptionName: initialReception,
  guestName: initialGuest,
  onSave,
}) => {
  const [groom, setGroom] = useState(initialGroom);
  const [bride, setBride] = useState(initialBride);
  const [displayDate, setDisplayDate] = useState(initialDate);
  const [churchName, setChurchName] = useState(initialChurch);
  const [receptionName, setReceptionName] = useState(initialReception);
  const [guestName, setGuestName] = useState(initialGuest);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      groom,
      bride,
      displayDate,
      churchName,
      receptionName,
      guestName,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <h3 className="font-serif text-xl font-semibold text-[#185844]">
              Customize Wedding Details
            </h3>
            <p className="text-xs text-stone-500">
              Try your own names and date.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Groom's Name
              </label>
              <input
                type="text"
                value={groom}
                onChange={(e) => setGroom(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#185844]"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Bride's Name
              </label>
              <input
                type="text"
                value={bride}
                onChange={(e) => setBride(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#185844]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Guest Name on Envelope
            </label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="e.g. Mr. & Mrs. Dizon"
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#185844]"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Wedding Date
            </label>
            <input
              type="text"
              value={displayDate}
              onChange={(e) => setDisplayDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#185844]"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Ceremony Venue
            </label>
            <input
              type="text"
              value={churchName}
              onChange={(e) => setChurchName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#185844]"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Reception Venue
            </label>
            <input
              type="text"
              value={receptionName}
              onChange={(e) => setReceptionName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#185844]"
            />
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-[#185844] text-white hover:bg-[#102F27] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Details</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
