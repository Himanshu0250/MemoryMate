import React from 'react';
import { CategoryIcon } from '../common/Badge';

export const CategoryPillFilter = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts = {}
}) => {
  const categories = [
    'All',
    'Friendship',
    'Family',
    'Birthday',
    'Gift',
    'Food',
    'Travel',
    'Hobby',
    'Conversation',
    'Study',
    'Work',
    'Important',
    'Other'
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none max-w-full">
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat;
        const count = categoryCounts[cat];

        return (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border shrink-0 ${
              isSelected
                ? 'bg-brand-600 text-white border-brand-500 shadow-glow-sm'
                : 'bg-white/80 dark:bg-dark-800/80 hover:bg-slate-100 dark:hover:bg-dark-750 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80'
            }`}
          >
            {cat !== 'All' && <CategoryIcon category={cat} className="w-3.5 h-3.5" />}
            <span>{cat}</span>
            {count !== undefined && count > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-dark-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
