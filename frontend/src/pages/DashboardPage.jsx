import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  BookMarked,
  Users,
  Calendar,
  Gift,
  Sparkles,
  ArrowRight,
  Heart,
  Plus,
  Star,
  Clock,
  Cake,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { MemoryCard } from '../components/memories/MemoryCard';
import { memoryService } from '../services/memoryService';
import { personService } from '../services/personService';
import { eventService } from '../services/eventService';
import { aiService } from '../services/aiService';
import { useAuth } from '../context/AuthContext';
import { useNotify } from '../context/NotificationContext';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { showToast } = useNotify();
  const navigate = useNavigate();
  const outletCtx = useOutletContext();

  const [memoryOfDay, setMemoryOfDay] = useState(null);
  const [recentMemories, setRecentMemories] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [people, setPeople] = useState([]);
  const [insights, setInsights] = useState(null);
  const [quickText, setQuickText] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [motd, memRes, evRes, pplRes, insRes] = await Promise.all([
        memoryService.getMemoryOfTheDay().catch(() => null),
        memoryService.list({ limit: 6 }),
        eventService.list({ upcoming_only: true }),
        personService.list(),
        aiService.getInsights().catch(() => null)
      ]);
      setMemoryOfDay(motd);
      setRecentMemories(memRes.items || []);
      setUpcomingEvents((evRes || []).slice(0, 4));
      setPeople(pplRes || []);
      setInsights(insRes);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const handleRefresh = () => fetchDashboardData();
    window.addEventListener('memorymate:refresh', handleRefresh);
    return () => window.removeEventListener('memorymate:refresh', handleRefresh);
  }, []);

  const handleCelebrate = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 }
    });
    showToast('Cherished memory celebrated! 🎉', 'success');
  };

  const handleQuickExtract = () => {
    if (!quickText.trim()) return;
    outletCtx?.openExtractModal?.();
  };

  return (
    <div className="space-y-8 text-left">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Good day, {user?.name || 'Friend'} ✨
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            "Never forget the little things that matter."
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="glow"
            size="sm"
            onClick={() => outletCtx?.openExtractModal?.()}
            icon={Sparkles}
          >
            AI Extract Memory
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/memories')}
            icon={BookMarked}
          >
            All Memories
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <Card
          hover
          onClick={() => navigate('/memories')}
          className="p-4 sm:p-5 flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Memories
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {recentMemories.length || 0}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
            <BookMarked className="w-5 h-5" />
          </div>
        </Card>

        <Card
          hover
          onClick={() => navigate('/people')}
          className="p-4 sm:p-5 flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Friends & Family
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {people.length || 0}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </Card>

        <Card
          hover
          onClick={() => navigate('/events')}
          className="p-4 sm:p-5 flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Upcoming Dates
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {upcomingEvents.length || 0}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </Card>

        <Card
          hover
          onClick={() => navigate('/giftmate')}
          className="p-4 sm:p-5 flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Gift Ideas
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {insights?.potential_gift_ideas?.length || 4}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <Gift className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Main Row: Memory of the Day Spotlight + Quick AI Capture */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Memory of the Day Spotlight (2 Cols) */}
        <div className="lg:col-span-2">
          {memoryOfDay ? (
            <div className="relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-brand-900/30 via-dark-900/90 to-indigo-950/40 border border-brand-500/30 shadow-glow backdrop-blur-xl overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-20 group-hover:opacity-30 transition-opacity">
                <Sparkles className="w-32 h-32 text-brand-400" />
              </div>

              <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-300 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" /> Memory of the Day
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {new Date(memoryOfDay.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    {memoryOfDay.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed line-clamp-3">
                    {memoryOfDay.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-xs text-brand-300 font-medium flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 fill-current text-rose-400" />
                    Remembering {memoryOfDay.person_name || 'a special moment'}
                  </span>

                  <button
                    onClick={handleCelebrate}
                    className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    🎉 Celebrate Memory
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Card className="p-7 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-brand-500 mx-auto" />
              <h3 className="text-base font-bold">Start Building Your Memory Vault</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Record your first memory about a friend to unlock daily reflections, gift recommendations, and AI insights.
              </p>
              <Button size="sm" variant="glow" onClick={() => outletCtx?.openExtractModal?.()}>
                Create First Memory
              </Button>
            </Card>
          )}
        </div>

        {/* Quick Natural Language Capture (1 Col) */}
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col justify-between p-6 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-brand-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Quick Natural Capture</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Type what your friend said or loves. Gemma will structure it into an approved memory.
              </p>
              <textarea
                rows={3}
                value={quickText}
                onChange={(e) => setQuickText(e.target.value)}
                placeholder="Rahul loves dark chocolate and wants to visit Kyoto..."
                className="w-full glass-input rounded-xl p-3 text-xs resize-none"
              />
            </div>

            <Button
              variant="glow"
              size="sm"
              onClick={handleQuickExtract}
              disabled={!quickText.trim()}
              icon={Sparkles}
              className="w-full font-semibold"
            >
              Extract & Review
            </Button>
          </Card>
        </div>
      </div>

      {/* Upcoming Milestones & Birthdays + AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Events (1 Col) */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" /> Upcoming Milestones
            </h2>
            <button
              onClick={() => navigate('/events')}
              className="text-xs text-brand-500 font-semibold hover:underline"
            >
              View all
            </button>
          </div>

          <div className="space-y-2.5">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => navigate('/events')}
                  className="glass-card-hover p-3.5 rounded-xl flex items-center justify-between cursor-pointer border border-slate-200/60 dark:border-slate-800/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      <Cake className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{ev.title}</p>
                      <span className="text-[10px] text-slate-500">
                        {new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-1 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                    {ev.days_until === 0 ? 'Today!' : `in ${ev.days_until}d`}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic py-4">No upcoming events scheduled.</p>
            )}
          </div>
        </div>

        {/* AI Relationship Insights (2 Cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" /> AI Relationship Highlights
            </h2>
            <button
              onClick={() => navigate('/insights')}
              className="text-xs text-brand-500 font-semibold hover:underline"
            >
              Explore Insights
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Frequently Remembered
              </span>
              <div className="flex flex-wrap gap-1.5">
                {insights?.frequently_remembered_people?.map((p) => (
                  <span
                    key={p.person_name}
                    className="px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold"
                  >
                    {p.person_name} ({p.count})
                  </span>
                )) || <span className="text-xs text-slate-400">Add memories to compute metrics</span>}
              </div>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Top Shared Passions
              </span>
              <div className="flex flex-wrap gap-1.5">
                {insights?.common_topics?.map((t) => (
                  <span
                    key={t.topic}
                    className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold"
                  >
                    #{t.topic}
                  </span>
                )) || <span className="text-xs text-slate-400">Add tags to discover topics</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Memories Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Memories</h2>
            <p className="text-xs text-slate-500">Latest moments preserved in your private vault</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/memories')}
            icon={ArrowRight}
          >
            All Memories
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recentMemories.map((mem) => (
            <MemoryCard
              key={mem.id}
              memory={mem}
              onToggleFavorite={async (id) => {
                await memoryService.toggleFavorite(id);
                fetchDashboardData();
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
