import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Filter, User, Tag, Sparkles, Star, MapPin } from 'lucide-react';
import { Card } from '../components/common/Card';
import { CategoryBadge, ImportanceBadge } from '../components/common/Badge';
import { memoryService } from '../services/memoryService';
import { personService } from '../services/personService';

export const TimelinePage = () => {
  const [memories, setMemories] = useState([]);
  const [people, setPeople] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [memRes, pplRes] = await Promise.all([
          memoryService.list({ sort_by: 'date_desc', limit: 100 }),
          personService.list()
        ]);
        setMemories(memRes.items || []);
        setPeople(pplRes || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredMemories = memories.filter((m) => {
    const matchPerson = selectedPerson === 'All' || m.person_id === selectedPerson || m.person_name === selectedPerson;
    const matchCategory = selectedCategory === 'All' || m.category === selectedCategory;
    return matchPerson && matchCategory;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Visual Memory Timeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            A chronological memory stream tracking conversations and milestones over time.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedPerson}
            onChange={(e) => setSelectedPerson(e.target.value)}
            className="glass-input rounded-xl text-xs py-2 px-3 font-medium"
          >
            <option value="All" className="dark:bg-dark-900">All People</option>
            {people.map((p) => (
              <option key={p.id} value={p.name} className="dark:bg-dark-900">
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="glass-input rounded-xl text-xs py-2 px-3 font-medium"
          >
            <option value="All" className="dark:bg-dark-900">All Categories</option>
            {['Friendship', 'Family', 'Birthday', 'Gift', 'Food', 'Travel', 'Hobby', 'Conversation', 'Study', 'Work', 'Important', 'Other'].map((c) => (
              <option key={c} value={c} className="dark:bg-dark-900">
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-brand-500/30 dark:border-brand-500/20 space-y-8 my-6">
        {filteredMemories.length > 0 ? (
          filteredMemories.map((mem, idx) => {
            const dateObj = new Date(mem.date);
            const dateFormatted = dateObj.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <motion.div
                key={mem.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="relative group"
              >
                {/* Connecting Pulse Node */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-brand-500 border-4 border-slate-50 dark:border-dark-950 shadow-glow-sm group-hover:scale-125 transition-transform" />

                <Card className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <CategoryBadge category={mem.category} />
                      {mem.person_name && (
                        <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                          {mem.person_name}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      {dateFormatted}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {mem.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {mem.description}
                  </p>

                  {mem.image_url && (
                    <div className="rounded-xl overflow-hidden max-h-48 w-full border border-slate-200 dark:border-slate-800 mt-2">
                      <img src={mem.image_url} alt={mem.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {mem.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {mem.tags.map((t) => (
                        <span key={t} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-dark-800 text-slate-500 font-medium">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })
        ) : (
          <div className="py-12 text-center text-slate-400">
            No memories match this timeline filter.
          </div>
        )}
      </div>
    </div>
  );
};
