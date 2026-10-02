import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Button = ({
  children,
  variant = 'primary', // primary, secondary, glow, outline, ghost, danger
  size = 'md', // sm, md, lg, icon
  loading = false,
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/50 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5",
    icon: "p-2.5 aspect-square"
  };

  const variantStyles = {
    primary: "bg-brand-600 hover:bg-brand-500 text-white shadow-md hover:shadow-glow-sm border border-brand-500/30",
    glow: "bg-gradient-to-r from-brand-600 via-indigo-600 to-electric-500 hover:opacity-95 text-white shadow-glow border border-white/20",
    secondary: "bg-slate-200/80 hover:bg-slate-300 dark:bg-dark-800 dark:hover:bg-dark-750 text-slate-800 dark:text-slate-200 border border-slate-300/50 dark:border-slate-700/60",
    outline: "bg-transparent border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-700 dark:text-slate-300",
    ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100",
    danger: "bg-rose-600 hover:bg-rose-500 text-white shadow-sm border border-rose-500/30"
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, sizeStyles[size], variantStyles[variant], className))}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className={clsx("shrink-0", size === 'sm' ? "w-3.5 h-3.5" : "w-4 h-4")} />
      ) : null}
      {children}
    </button>
  );
};
