import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, User, Calendar, Gift, Heart, ArrowRight, X } from 'lucide-react';
import { memoryService } from '../../services/memoryService';
import { personService } from '../../services/personService';

export const GlobalSearchModal = ({ isOpen, onClose, onOpenExtract }) => {
  const [query, setQuery] = useState('');
  const [memories, setMemories] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      return;
    }

    const timer = setTimeout(async () => {
      if (query.trim().length > 1) {
        setLoading(true);
        try {
          const [memRes, pplRes] = await Promise.all([
            memoryService.list({ search: query, limit: 5 }),
            personService.list()
          ]);
          setMemories(memRes.items || []);
          const filteredPpl = (pplRes || []).filter(p =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            (p.relationship && p.relationship.toLowerCase().includes(query.toLowerCase()))
          );
          setPeople(filteredPpl.slice(0, 4));
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        setMemories([]);
        setPeople([]);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10"
        >
          {/* Search Header */}
          <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
            <Search className="w-5 h-5 text-slate-400 ml-2 mr-3 shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search memories, people, gifts, or dates... (Type 'Rahul', 'Birthday', 'Japan')"
              className="w-full bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400 text-base"
            />
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Actions if query empty */}
          {query.trim().length <= 1 && (
            <div className="p-5 text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 block">
                Quick Shortcuts & AI Tools
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenExtract?.();
                  }}
                  className="flex items-center justify-between p-3 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 text-brand-600 dark:text-brand-400 transition-all text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">Extract Memory with Gemma</span>
                  </div>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => {
                    onClose();
                    navigate('/chat');
                  }}
                  className="flex items-center justify-between p-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 transition-all text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">Ask AI Assistant</span>
                  </div>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* Search Results */}
          {query.trim().length > 1 && (
            <div className="max-h-96 overflow-y-auto p-4 text-left divide-y divide-slate-100 dark:divide-slate-800/60">
              {/* People Section */}
              {people.length > 0 && (
                <div className="py-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                    People ({people.length})
                  </span>
                  <div className="space-y-1.5">
                    {people.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onClose();
                          navigate(`/people/${p.id}`);
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-800 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img src={p.avatar_url} alt={p.name} className="w-7 h-7 rounded-full bg-slate-200" />
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{p.name}</p>
                            <p className="text-xs text-slate-500">{p.relationship || 'Friend'}</p>
                          </div>
                        </div>
                        <span className="text-xs text-brand-500 font-medium flex items-center gap-1">
                          View Profile <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Memories Section */}
              {memories.length > 0 && (
                <div className="py-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                    Memories ({memories.length})
                  </span>
                  <div className="space-y-1.5">
                    {memories.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          onClose();
                          navigate('/memories');
                        }}
                        className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-800 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{m.title}</p>
                          <span className="text-[11px] text-slate-400">{m.category}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{m.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {memories.length === 0 && people.length === 0 && !loading && (
                <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                  No memories or friends found matching "<span className="text-brand-500 font-medium">{query}</span>"
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-dark-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Navigation: <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-dark-800 text-[10px] font-mono">ESC</kbd> to close</span>
            <span>MemoryMate Spotlight</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
