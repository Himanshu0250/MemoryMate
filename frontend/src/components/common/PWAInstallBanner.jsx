import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Smartphone, Share2, PlusSquare, MoreVertical, CheckCircle2, X, Brain } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallBanner = () => {
  const { isInstallable, isInstalled, isIOS, isStandalone, promptInstall } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isStandalone || isInstalled) {
    return null; // Already installed and running in standalone app mode!
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await promptInstall();
      if (outcome === 'accepted') return;
    }
    // Show visual guide if prompt not available or on iOS
    setShowGuide(true);
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-600/20 to-indigo-600/20 hover:from-brand-600/30 hover:to-indigo-600/30 text-brand-600 dark:text-brand-300 border border-brand-500/30 text-xs font-bold transition-all shadow-sm active:scale-95"
        title="Install MemoryMate as a standalone mobile app"
      >
        <Smartphone className="w-3.5 h-3.5 text-brand-500" />
        <span className="hidden sm:inline">Install App</span>
        <span className="sm:hidden">Install</span>
      </button>

      {/* Installation Instruction Modal */}
      <Modal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        title="Install MemoryMate App"
        subtitle="Install MemoryMate on your phone for a full-screen, native standalone app experience."
        maxWidth="max-w-md"
      >
        <div className="space-y-5 text-left pt-1">
          {/* App Header info */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-100 dark:bg-dark-850">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-glow-sm shrink-0">
              <Brain className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">MemoryMate PWA</h4>
              <p className="text-[11px] text-slate-500">Standalone offline-capable memory assistant</p>
            </div>
          </div>

          {/* Platform Steps */}
          {isIOS ? (
            /* iOS Safari Instructions */
            <div className="space-y-3">
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider block">
                How to install on iPhone (Safari):
              </span>
              <ol className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="p-1 rounded-lg bg-brand-500/15 text-brand-500 shrink-0 font-bold text-[11px]">1</div>
                  <div>
                    Tap the <strong>Share button</strong> <Share2 className="inline w-3.5 h-3.5 text-brand-500 mx-1" /> in Safari's bottom toolbar.
                  </div>
                </li>
                <li className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="p-1 rounded-lg bg-brand-500/15 text-brand-500 shrink-0 font-bold text-[11px]">2</div>
                  <div>
                    Scroll down and select <strong>"Add to Home Screen"</strong> <PlusSquare className="inline w-3.5 h-3.5 text-brand-500 mx-1" />.
                  </div>
                </li>
                <li className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="p-1 rounded-lg bg-brand-500/15 text-brand-500 shrink-0 font-bold text-[11px]">3</div>
                  <div>
                    Tap <strong>"Add"</strong> in the top-right corner to finish installing.
                  </div>
                </li>
              </ol>
            </div>
          ) : (
            /* Android / Chrome Instructions */
            <div className="space-y-3">
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider block">
                How to install on Android (Chrome):
              </span>
              <ol className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="p-1 rounded-lg bg-brand-500/15 text-brand-500 shrink-0 font-bold text-[11px]">1</div>
                  <div>
                    Tap the <strong>three dots menu</strong> <MoreVertical className="inline w-3.5 h-3.5 text-brand-500 mx-0.5" /> in Chrome's top right corner.
                  </div>
                </li>
                <li className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="p-1 rounded-lg bg-brand-500/15 text-brand-500 shrink-0 font-bold text-[11px]">2</div>
                  <div>
                    Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                  </div>
                </li>
                <li className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="p-1 rounded-lg bg-brand-500/15 text-brand-500 shrink-0 font-bold text-[11px]">3</div>
                  <div>
                    Confirm <strong>"Install"</strong>. MemoryMate will appear on your app drawer and home screen!
                  </div>
                </li>
              </ol>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <Button variant="primary" size="sm" onClick={() => setShowGuide(false)}>
              Got it!
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
