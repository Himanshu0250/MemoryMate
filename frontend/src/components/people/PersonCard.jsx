import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookMarked, Gift, Calendar, ArrowRight, Heart, Sparkles } from 'lucide-react';

export const PersonCard = ({ person }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      layout
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      onClick={() => navigate(`/people/${person.id}`)}
      className="glass-card-hover rounded-2xl p-5 flex flex-col justify-between text-left cursor-pointer group border border-slate-200/80 dark:border-slate-800/80"
    >
      <div>
        {/* Header with Avatar & Relationship */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="relative">
            <img
              src={person.avatar_url}
              alt={person.name}
              className="w-13 h-13 rounded-2xl object-cover bg-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm"
            />
            <div className="absolute -bottom-1 -right-1 p-1 bg-white dark:bg-dark-900 rounded-full shadow-sm">
              <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
            </div>
          </div>

          <div className="truncate">
            <h3 className="text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-brand-500 transition-colors">
              {person.name}
            </h3>
            <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400 mt-0.5">
              {person.relationship || 'Friend'}
            </span>
          </div>
        </div>

        {/* AI Summary snippet */}
        {person.ai_summary ? (
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 italic leading-relaxed">
            "{person.ai_summary}"
          </p>
        ) : person.notes ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
            {person.notes}
          </p>
        ) : null}

        {/* Interests */}
        {person.interests?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {person.interests.slice(0, 3).map((item) => (
              <span
                key={item}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 font-medium"
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Metrics */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <BookMarked className="w-3.5 h-3.5 text-brand-500" />
            {person.memory_count || 0} memories
          </span>
          <span className="flex items-center gap-1">
            <Gift className="w-3.5 h-3.5 text-indigo-500" />
            {person.gift_count || 0} gifts
          </span>
        </div>

        <span className="flex items-center gap-1 text-brand-600 dark:text-brand-400 font-semibold group-hover:translate-x-1 transition-transform">
          Profile <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </motion.div>
  );
};
