import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp, Tag, Star, Heart } from 'lucide-react';
import { Card } from '../components/common/Card';
import { analyticsService } from '../services/analyticsService';

const COLORS = ['#8b5cf6', '#0ea5e9', '#f43f5e', '#10b981', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6', '#84cc16'];

export const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await analyticsService.getOverview();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return <div className="py-20 text-center text-slate-400">Loading analytics...</div>;
  }

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <BarChart3 className="w-7 h-7 text-brand-500" /> Memory Vault Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Visual metrics on your preserved memories, friend interactions, and category distribution.
        </p>
      </div>

      {/* Top Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <span className="text-xs text-slate-400 uppercase font-semibold">Total Memories</span>
          <p className="text-2xl font-black text-brand-500 mt-1">{data.total_memories}</p>
        </Card>
        <Card className="p-4 text-center">
          <span className="text-xs text-slate-400 uppercase font-semibold">People Tracked</span>
          <p className="text-2xl font-black text-indigo-500 mt-1">{data.total_people}</p>
        </Card>
        <Card className="p-4 text-center">
          <span className="text-xs text-slate-400 uppercase font-semibold">Favorites</span>
          <p className="text-2xl font-black text-amber-500 mt-1">{data.total_favorites}</p>
        </Card>
        <Card className="p-4 text-center">
          <span className="text-xs text-slate-400 uppercase font-semibold">Gift Ideas</span>
          <p className="text-2xl font-black text-rose-500 mt-1">{data.total_gift_ideas}</p>
        </Card>
      </div>

      {/* Charts Row 1: Categories Breakdown & Memories Per Friend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Pie Chart */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-brand-500" /> Memories by Category
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.memories_by_category}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={45}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {data.memories_by_category.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Memories per Friend Bar Chart */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-500" /> Memories by Friend
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.memories_by_person}>
                <XAxis dataKey="person_name" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Charts Row 2: Top Tags Cloud */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Tag className="w-4 h-4 text-electric-500" /> Most Frequent Memory Tags
        </h3>
        <div className="flex flex-wrap gap-2 pt-2">
          {data.top_tags?.map((t, idx) => (
            <span
              key={t.tag}
              style={{
                fontSize: `${Math.min(18, 12 + t.count * 2)}px`
              }}
              className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-dark-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 font-bold transition-transform hover:scale-105"
            >
              #{t.tag} <span className="text-xs text-brand-500 font-normal">({t.count})</span>
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
};
