import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { modalVariant } from '../../animations/variants';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-xl'
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
            aria-hidden="true"
          />

          {/* Modal Dialog */}
          <motion.div
            variants={modalVariant}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`relative w-full ${maxWidth} bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-4 sm:p-7 text-slate-900 dark:text-slate-100 z-10 max-h-[88dvh] overflow-y-auto`}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-5">
              <div>
                {title && <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h3>}
                {subtitle && <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
