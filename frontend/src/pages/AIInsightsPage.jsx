import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Link as LinkIcon, Heart, TrendingUp, Users, Calendar, Gift, RefreshCw } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { aiService } from '../services/aiService';
import { useNotify } from '../context/NotificationContext';

export const AIInsightsPage = () => {
  const [insights, setInsights] = useState(null);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotify();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [insRes, connRes] = await Promise.all([
        aiService.getInsights(),
        aiService.getConnections()
      ]);
      setInsights(insRes);
      setConnections(connRes.connections || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load AI insights', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-indigo-500" /> AI Insights & Memory Connections
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gemma synthesizes latent links, recurring themes, and relationship dynamics across your vault.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          loading={loading}
          icon={RefreshCw}
        >
          Refresh Insights
        </Button>
      </div>

      {/* Latent Memory Connections */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-brand-500" /> Inter-Memory Connections Discovered
        </h2>

        {connections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connections.map((c, idx) => (
              <Card key={idx} className="p-5 space-y-3 border border-brand-500/20 shadow-glow-sm">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{c.title}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-600 dark:text-brand-400 text-[10px] font-bold uppercase tracking-wider">
                    {Math.round(c.confidence * 100)}% Match
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {c.description}
                </p>

                <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs text-brand-600 dark:text-brand-300 font-medium">
                  💡 <strong>Actionable Suggestion:</strong> {c.actionable_insight}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center text-slate-500 text-xs">
            Add more memories and events to let Gemma discover connections across your friends.
          </Card>
        )}
      </div>

      {/* Relationship Metrics & Emotional Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Most Remembered */}
        <Card className="p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-500" /> Most Remembered Friends
          </h3>
          <div className="space-y-2">
            {insights?.frequently_remembered_people?.map((p) => (
              <div key={p.person_name} className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{p.person_name}</span>
                <span className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-500 font-bold">{p.count} memories</span>
              </div>
            )) || <p className="text-xs text-slate-400">No data</p>}
          </div>
        </Card>

        {/* Common Topics */}
        <Card className="p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" /> Recurring Passions & Topics
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {insights?.common_topics?.map((t) => (
              <span key={t.topic} className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                #{t.topic} ({t.count})
              </span>
            )) || <p className="text-xs text-slate-400">No topics</p>}
          </div>
        </Card>

        {/* Emotional Distribution */}
        <Card className="p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" /> Emotional Sentiment Tone
          </h3>
          <div className="space-y-1.5">
            {Object.entries(insights?.sentiment_distribution || {}).map(([mood, count]) => (
              <div key={mood} className="flex items-center justify-between text-xs">
                <span className="capitalize font-medium text-slate-700 dark:text-slate-300">{mood}</span>
                <span className="text-slate-400 font-mono">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
