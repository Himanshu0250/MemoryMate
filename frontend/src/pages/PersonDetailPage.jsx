import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Gift,
  BookMarked,
  Heart,
  Sparkles,
  Edit3,
  Trash2,
  Cake,
  Plus,
  RefreshCw,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { MemoryCard } from '../components/memories/MemoryCard';
import { PersonFormModal } from '../components/people/PersonFormModal';
import { MemoryFormModal } from '../components/memories/MemoryFormModal';
import { personService } from '../services/personService';
import { giftService } from '../services/giftService';
import { memoryService } from '../services/memoryService';
import { useNotify } from '../context/NotificationContext';

export const PersonDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useNotify();

  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('memories'); // memories, preferences, gifts, events
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [generatingGifts, setGeneratingGifts] = useState(false);

  const fetchPersonData = async () => {
    setLoading(true);
    try {
      const data = await personService.getById(id);
      setPerson(data);
    } catch (err) {
      console.error(err);
      showToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonData();
  }, [id]);

  const handleGenerateSummary = async () => {
    setGeneratingSummary(true);
    try {
      const res = await personService.generateSummary(id);
      setPerson((prev) => ({ ...prev, ai_summary: res.summary }));
      showToast('Gemma generated a biographical summary!', 'success');
    } catch (err) {
      showToast('Failed to generate summary', 'error');
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleRecommendGifts = async () => {
    setGeneratingGifts(true);
    try {
      const res = await giftService.recommend(id);
      if (res.suggestions?.length > 0) {
        // Save first 2 suggestions automatically
        for (const s of res.suggestions.slice(0, 2)) {
          await giftService.create({
            gift_name: s.gift_name,
            person_id: id,
            person_name: person.name,
            reason: s.reason,
            source_memory_ids: s.source_memory_ids,
            estimated_price: s.estimated_price,
            is_purchased: false,
            saved_by_user: true
          });
        }
        showToast('Gemma generated & saved new GiftMate suggestions!', 'success');
        fetchPersonData();
        setActiveTab('gifts');
      }
    } catch (err) {
      showToast('Failed to generate gift recommendations', 'error');
    } finally {
      setGeneratingGifts(false);
    }
  };

  const handleDeletePerson = async () => {
    if (!window.confirm(`Are you sure you want to delete ${person?.name}'s profile?`)) return;
    try {
      await personService.delete(id);
      showToast('Profile removed', 'info');
      navigate('/people');
    } catch (err) {
      showToast('Failed to delete person', 'error');
    }
  };

  if (loading || !person) {
    return (
      <div className="py-20 text-center text-slate-400">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Back Button */}
      <div>
        <button
          onClick={() => navigate('/people')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Friends Directory
        </button>
      </div>

      {/* Hero Profile Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={person.avatar_url}
              alt={person.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover bg-slate-200 border-2 border-brand-500/30 shadow-glow-sm"
            />
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {person.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-lg bg-brand-500/15 text-brand-600 dark:text-brand-400 text-xs font-bold">
                  {person.relationship || 'Friend'}
                </span>
              </div>

              {person.birthday && (
                <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1.5">
                  <Cake className="w-4 h-4" />
                  <span>Birthday: {person.birthday}</span>
                </div>
              )}

              {/* Interests preview pills */}
              {person.interests?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {person.interests.map((item) => (
                    <span
                      key={item}
                      className="text-[11px] px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-300 font-medium"
                    >
                      #{item}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              icon={Edit3}
            >
              Edit Profile
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeletePerson}
              icon={Trash2}
            />
          </div>
        </div>

        {/* AI Summary Box */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" /> Gemma AI Biographical Summary
            </span>
            <button
              onClick={handleGenerateSummary}
              disabled={generatingSummary}
              className="text-xs text-slate-400 hover:text-brand-500 flex items-center gap-1 font-medium transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${generatingSummary ? 'animate-spin' : ''}`} />
              Regenerate
            </button>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic bg-brand-500/5 dark:bg-brand-500/10 p-4 rounded-2xl border border-brand-500/15 leading-relaxed">
            "{person.ai_summary || 'No AI summary generated yet. Click regenerate to synthesize all stored memories for ' + person.name}."
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'memories', label: `Memories (${person.memories?.length || 0})`, icon: BookMarked },
          { id: 'gifts', label: `Gift Wishlist (${person.gift_ideas?.length || 0})`, icon: Gift },
          { id: 'preferences', label: 'Favorite Things', icon: Heart },
          { id: 'events', label: `Events (${person.events?.length || 0})`, icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 whitespace-nowrap ${
                isActive
                  ? 'bg-brand-600 text-white shadow-glow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Memories Timeline */}
      {activeTab === 'memories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Chronological Memories for {person.name}
            </h3>
            <Button
              variant="glow"
              size="sm"
              onClick={() => setIsMemoryModalOpen(true)}
              icon={Plus}
            >
              Add Memory
            </Button>
          </div>

          {person.memories?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {person.memories.map((m) => (
                <MemoryCard
                  key={m.id}
                  memory={{ ...m, person_name: person.name }}
                  onToggleFavorite={async (id) => {
                    await memoryService.toggleFavorite(id);
                    fetchPersonData();
                  }}
                />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12 space-y-2">
              <BookMarked className="w-8 h-8 text-brand-500 mx-auto" />
              <p className="text-sm font-semibold">No memories recorded yet for {person.name}.</p>
              <Button size="sm" variant="glow" onClick={() => setIsMemoryModalOpen(true)}>
                Add First Memory
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* Tab 2: Gift Wishlist & Recommendations */}
      {activeTab === 'gifts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Gift Ideas & Wishlist
              </h3>
              <p className="text-xs text-slate-500">Curated specifically based on {person.name}'s memories</p>
            </div>
            <Button
              variant="glow"
              size="sm"
              onClick={handleRecommendGifts}
              loading={generatingGifts}
              icon={Sparkles}
            >
              Ask Gemma for Gift Ideas
            </Button>
          </div>

          {person.gift_ideas?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {person.gift_ideas.map((g) => (
                <Card key={g.id} className="p-4 space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{g.gift_name}</h4>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                      {g.estimated_price || '$25 - $50'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{g.reason}</p>
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-slate-400">
                      {g.is_purchased ? '✅ Purchased' : '🎁 In Wishlist'}
                    </span>
                    <button
                      onClick={async () => {
                        await giftService.togglePurchased(g.id);
                        fetchPersonData();
                      }}
                      className="text-brand-500 hover:underline font-semibold"
                    >
                      {g.is_purchased ? 'Mark as Wishlist' : 'Mark as Purchased'}
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12 space-y-2">
              <Gift className="w-8 h-8 text-indigo-500 mx-auto" />
              <p className="text-sm font-semibold">No gifts saved for {person.name} yet.</p>
              <Button size="sm" variant="glow" onClick={handleRecommendGifts} loading={generatingGifts}>
                Generate AI Gift Recommendations
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* Tab 3: Favorite Things & Preferences */}
      {activeTab === 'preferences' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Favorite Things & Passions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(person.favorite_things || {}).length > 0 ? (
              Object.entries(person.favorite_things).map(([key, val]) => (
                <Card key={key} className="p-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      {key.replace('_', ' ')}
                    </span>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">{String(val)}</p>
                  </div>
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                </Card>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">
                No specific favorite things mapped yet. Edit profile or add memories containing their preferences.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Events */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Upcoming Events & Promises
          </h3>
          <div className="space-y-2.5">
            {person.events?.length > 0 ? (
              person.events.map((e) => (
                <Card key={e.id} className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{e.title}</h4>
                    <span className="text-xs text-slate-500">
                      Date: {new Date(e.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold">
                    {e.type}
                  </span>
                </Card>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic">No events or reminders linked to {person.name}.</p>
            )}
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <PersonFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialPerson={person}
        onSaved={() => fetchPersonData()}
      />

      {/* Add Memory Modal pre-filled with person name */}
      <MemoryFormModal
        isOpen={isMemoryModalOpen}
        onClose={() => setIsMemoryModalOpen(false)}
        initialMemory={{ person_name: person.name, person_id: person.id }}
        onSaved={() => fetchPersonData()}
      />
    </div>
  );
};
