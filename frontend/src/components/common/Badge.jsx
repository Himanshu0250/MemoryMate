import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Sparkles, Heart, Coffee, Plane, Palette, MessageSquare, BookOpen, Briefcase, Star, Gift, Cake, Users } from 'lucide-react';

export const CategoryIcon = ({ category, className = "w-3.5 h-3.5" }) => {
  switch (category) {
    case 'Friendship': return <Users className={className} />;
    case 'Family': return <Heart className={className} />;
    case 'Birthday': return <Cake className={className} />;
    case 'Gift': return <Gift className={className} />;
    case 'Food': return <Coffee className={className} />;
    case 'Travel': return <Plane className={className} />;
    case 'Hobby': return <Palette className={className} />;
    case 'Conversation': return <MessageSquare className={className} />;
    case 'Study': return <BookOpen className={className} />;
    case 'Work': return <Briefcase className={className} />;
    case 'Important': return <Star className={className} />;
    default: return <Sparkles className={className} />;
  }
};

export const CategoryBadge = ({ category, className = "" }) => {
  const styles = {
    Friendship: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    Family: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    Birthday: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    Gift: "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/20",
    Food: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    Travel: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    Hobby: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    Conversation: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    Study: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
    Work: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
    Important: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    Other: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20",
  };

  const currentStyle = styles[category] || styles.Other;

  return (
    <span className={twMerge(clsx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm", currentStyle, className))}>
      <CategoryIcon category={category} className="w-3.5 h-3.5" />
      {category}
    </span>
  );
};

export const ImportanceBadge = ({ importance }) => {
  const styles = {
    critical: "bg-red-500/15 text-red-500 border-red-500/30 font-bold",
    high: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    medium: "bg-blue-500/15 text-blue-500 border-blue-500/30",
    low: "bg-slate-500/15 text-slate-400 border-slate-500/30"
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border uppercase tracking-wider ${styles[importance] || styles.medium}`}>
      {importance}
    </span>
  );
};
