import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Card = ({
  children,
  className = '',
  hover = false,
  glow = false,
  onClick,
  ...props
}) => {
  const Component = onClick ? motion.div : 'div';
  return (
    <Component
      onClick={onClick}
      className={twMerge(
        clsx(
          "rounded-2xl p-5",
          hover ? "glass-card-hover cursor-pointer" : "glass-card",
          glow && "shadow-glow-sm border-brand-500/30",
          className
        )
      )}
      {...props}
    >
      {children}
    </Component>
  );
};
