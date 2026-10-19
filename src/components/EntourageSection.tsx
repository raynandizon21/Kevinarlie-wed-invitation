import React, { useState } from 'react';
import { EntourageCategory } from '../types/wedding';
import { Users, Heart } from 'lucide-react';

interface EntourageSectionProps {
  categories: EntourageCategory[];
}

export const EntourageSection: React.FC<EntourageSectionProps> = ({ categories }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Lahat');

  const categoryNames = ['Lahat', ...categories.map((c) => c.category)];

  const displayedCategories =
    selectedCategory === 'Lahat'
      ? categories
      : categories.filter((c) => c.category === selectedCategory);

  return (
    <section id="entourage" className="py-6 md:py-16 px-1 sm:px-4 md:px-8 max-w-5xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-6 md:mb-10">
        <span className="text-[11px] font-sans font-semibold uppercase tracking-widest text-[#78947F] block mb-2">
          Ang Aming mga Minamahal na Kasama
        </span>
        <h2 className="font-serif text-3xl md:text-4xl text-[#185844] font-semibold tracking-tight">
          Entourage at mga Ninong at Ninang
        </h2>
        <p className="font-sans text-sm text-stone-600 mt-2">
          Ang mga taong gumabay, nagmahal, at patuloy na sumusuporta sa aming paglalakbay.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 bg-stone-100 rounded-xl max-w-3xl mx-auto mb-6 md:mb-10 border border-stone-200/60">
        {categoryNames.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer truncate max-w-[200px] ${
                isActive
                  ? 'bg-white text-[#185844] shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {cat === 'Lahat' ? 'Lahat ng Abay' : cat.split('(')[0]}
            </button>
          );
        })}
      </div>

      {/* Categorized Member Grids */}
      <div className="space-y-8">
        {displayedCategories.map((group) => (
          <div
            key={group.category}
            className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 border border-stone-200/80 shadow-xs"
          >
            <div className="flex items-center gap-2 mb-6 pb-3 border-b border-stone-100">
              <Heart className="w-4 h-4 text-[#78947F]" />
              <h3 className="font-serif text-xl font-semibold text-[#185844]">
                {group.category}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {group.members.map((member, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#F2EBDD] border border-stone-100 flex flex-col justify-center"
                >
                  <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-[#78947F] block mb-1">
                    {member.role}
                  </span>
                  <p className="font-serif text-base text-[#102F27] font-medium">
                    {member.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
