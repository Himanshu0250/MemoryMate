import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Home,
  BookMarked,
  Users,
  Calendar,
  Gift,
  MessageSquare,
  Sparkles,
  BarChart3,
  Bell,
  Settings,
  Sun,
  Moon,
  LogOut,
  Search,
  Plus,
  Mic,
  Menu,
  X,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { GlobalSearchModal } from '../components/common/GlobalSearchModal';
import { MemoryExtractModal } from '../components/memories/MemoryExtractModal';
import { VoiceRecorderModal } from '../components/memories/VoiceRecorderModal';
import { PWAInstallBanner } from '../components/common/PWAInstallBanner';

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isExtractOpen, setIsExtractOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Memories', path: '/memories', icon: BookMarked },
    { label: 'People', path: '/people', icon: Users },
    { label: 'Timeline', path: '/timeline', icon: Calendar },
    { label: 'Events', path: '/events', icon: Calendar },
    { label: 'GiftMate', path: '/giftmate', icon: Gift, badge: 'AI' },
    { label: 'AI Chat', path: '/chat', icon: MessageSquare, badge: 'Gemma' },
    { label: 'AI Insights', path: '/insights', icon: Sparkles },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="relative min-h-screen flex bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-slate-100 overflow-x-hidden pt-safe pb-safe">
      {/* Background Ambient Glow Elements */}
      <div className="fixed top-0 left-1/4 w-96 h-96 ambient-glow rounded-full pointer-events-none blur-3xl opacity-50 z-0" />
      <div className="fixed bottom-10 right-10 w-96 h-96 ambient-glow-cyan rounded-full pointer-events-none blur-3xl opacity-30 z-0" />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 fixed inset-y-0 left-0 z-30 bg-white/75 dark:bg-dark-900/75 backdrop-blur-2xl border-r border-slate-200/80 dark:border-slate-800/80 p-5">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-2 py-2 mb-6 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-electric-500 flex items-center justify-center text-white shadow-glow-sm">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-brand-600 via-indigo-500 to-electric-500 bg-clip-text text-transparent">
              MemoryMate
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Gemma AI Memory Vault</p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="space-y-2 mb-6">
          <button
            onClick={() => setIsExtractOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-glow-sm transition-all active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Quick Extract</span>
          </button>
          <button
            onClick={() => setIsVoiceOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-750 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200/60 dark:border-slate-700/60 transition-all"
          >
            <Mic className="w-3.5 h-3.5 text-rose-500" />
            <span>Voice Memory Capture</span>
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-500/15 text-brand-600 dark:text-brand-400 font-semibold border border-brand-500/30 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-500' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-brand-500/20 text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Privacy Footer */}
        <div className="pt-4 mt-auto border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100/60 dark:bg-dark-800/60">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={user?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name || 'User'}`}
                alt="Avatar"
                className="w-8 h-8 rounded-full bg-slate-200 shrink-0"
              />
              <div className="truncate text-left">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user?.name || 'User'}</p>
                <span className="text-[10px] text-emerald-500 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3 h-3" /> Private Vault
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-64 xl:pl-72 z-10">
        {/* Top Header */}
        <header className="sticky top-0 z-20 h-16 bg-white/75 dark:bg-dark-900/75 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 flex items-center justify-between">
          {/* Left: Mobile hamburger & Search button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-dark-800 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Open mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-dark-800 border border-slate-200/80 dark:border-slate-700/80 text-xs sm:text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all cursor-pointer min-h-[38px]"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Search memories, people, gifts...</span>
              <span className="sm:hidden">Search...</span>
              <kbd className="hidden sm:inline-block ml-3 px-1.5 py-0.5 rounded bg-slate-200 dark:bg-dark-700 text-[10px] font-mono text-slate-500">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right: PWA Install, Quick actions & Theme Switch */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* PWA Install Button */}
            <PWAInstallBanner />

            <button
              onClick={() => setIsExtractOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 border border-brand-500/20 text-xs font-semibold transition-all min-h-[38px]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Extract</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 pb-28 lg:pb-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ openExtractModal: () => setIsExtractOpen(true) }} />
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-dark-900/95 backdrop-blur-2xl border-t border-slate-200/80 dark:border-slate-800/80 px-2 pt-1.5 safe-bottom-nav flex items-center justify-around shadow-2xl">
          {[
            { label: 'Home', path: '/dashboard', icon: Home },
            { label: 'Memories', path: '/memories', icon: BookMarked },
            { label: 'Chat', path: '/chat', icon: MessageSquare, isGlow: true },
            { label: 'People', path: '/people', icon: Users },
            { label: 'Gifts', path: '/giftmate', icon: Gift },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center min-w-[54px] min-h-[48px] py-1 px-2 rounded-xl transition-all ${
                  isActive
                    ? 'text-brand-600 dark:text-brand-400 font-semibold scale-105'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <div className={`p-1 rounded-lg ${item.isGlow && isActive ? 'bg-brand-500/20 text-brand-500' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Mobile Slide-over Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-72 max-w-[80vw] bg-white dark:bg-dark-900 h-full p-5 flex flex-col z-10 border-r border-slate-200 dark:border-slate-800 pt-safe pb-safe"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white">
                    <Brain className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-base bg-gradient-to-r from-brand-600 to-electric-500 bg-clip-text text-transparent">
                    MemoryMate
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800 min-w-[36px] min-h-[36px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 mb-4">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsExtractOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs font-semibold shadow-glow-sm active:scale-98"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>AI Memory Extract</span>
                </button>
              </div>

              <div className="flex-1 space-y-1 overflow-y-auto pr-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium ${
                        isActive
                          ? 'bg-brand-500/15 text-brand-600 dark:text-brand-400 font-semibold'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-brand-500/20 text-brand-500">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>

              <div className="pt-4 mt-auto border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 truncate max-w-[120px]">{user?.name}</span>
                <button onClick={logout} className="text-xs text-rose-500 font-semibold flex items-center gap-1 min-h-[36px] px-2">
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onOpenExtract={() => setIsExtractOpen(true)}
      />

      <MemoryExtractModal
        isOpen={isExtractOpen}
        onClose={() => setIsExtractOpen(false)}
        onSaved={() => {
          setIsExtractOpen(false);
          // If on memories page, trigger refresh
          window.dispatchEvent(new CustomEvent('memorymate:refresh'));
        }}
      />

      <VoiceRecorderModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onExtracted={(extractedData) => {
          setIsVoiceOpen(false);
          setIsExtractOpen(true);
        }}
      />
    </div>
  );
};

