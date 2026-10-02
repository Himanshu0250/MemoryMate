import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Calendar, User, Trash2, Edit3, Sparkles, Tag, Gift } from 'lucide-react';
import { CategoryBadge, ImportanceBadge } from '../common/Badge';

export const MemoryCard = ({
  memory,
  onToggleFavorite,
  onEdit,
  onDelete,
  onClick
}) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getMoodEmoji = (mood) => {
    switch (mood) {
      case 'excited': return '✨';
      case 'grateful': return '🙏';
      case 'loving': return '❤️';
      case 'reflective': return '💭';
      case 'touched': return '🥺';
      default: return '😊';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="glass-card-hover rounded-2xl p-5 flex flex-col justify-between text-left relative overflow-hidden group border border-slate-200/80 dark:border-slate-800/80"
    >
      {/* Top Bar */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <CategoryBadge category={memory.category} />
          
          <div className="flex items-center gap-1.5">
            <ImportanceBadge importance={memory.importance} />
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite?.(memory.id);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-amber-400 transition-colors"
              title={memory.is_favorite ? 'Favorited' : 'Add to favorites'}
            >
              <Star
                className={`w-4 h-4 ${
                  memory.is_favorite ? 'fill-amber-400 text-amber-400' : 'text-slate-400'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Title & Mood */}
        <h4 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 mb-1.5 flex items-center gap-1.5">
          <span>{getMoodEmoji(memory.mood)}</span>
          <span className="truncate">{memory.title}</span>
        </h4>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 leading-relaxed">
          {memory.description}
        </p>

        {/* Optional Image thumbnail */}
        {memory.image_url && (
          <div className="mb-4 rounded-xl overflow-hidden max-h-36 w-full border border-slate-200 dark:border-dark-750">
            <img src={memory.image_url} alt={memory.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
        )}

        {/* Smart Tags */}
        {memory.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {memory.tags.slice(0, 4).map((t) => (
              <span
                key={t}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 font-medium"
              >
                #{t}
              </span>
            ))}
            {memory.tags.length > 4 && (
              <span className="text-[11px] text-slate-400 px-1 py-0.5 font-medium">
                +{memory.tags.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/70 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3 truncate">
          {memory.person_name && (
            <span className="flex items-center gap-1 font-semibold text-brand-600 dark:text-brand-400 truncate">
              <User className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{memory.person_name}</span>
            </span>
          )}

          <span className="flex items-center gap-1 shrink-0">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(memory.date)}
          </span>

          {memory.location && (
            <span className="hidden sm:flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{memory.location}</span>
            </span>
          )}
        </div>

        {/* Quick actions (Edit / Delete) */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(memory);
              }}
              className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Edit"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(memory.id);
              }}
              className="p-1 rounded-md hover:bg-rose-500/10 text-slate-400 hover:text-rose-500"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
