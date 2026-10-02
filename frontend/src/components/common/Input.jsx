import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Input = ({
  label,
  error,
  icon: Icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          className={twMerge(
            clsx(
              "w-full glass-input rounded-xl text-sm py-2.5 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500",
              Icon ? "pl-10 pr-3.5" : "px-3.5",
              error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20" : "",
              className
            )
          )}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-rose-500 font-medium">{error}</span>}
    </div>
  );
};
