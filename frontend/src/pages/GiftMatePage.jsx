import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles, User, CheckCircle2, Trash2, Plus, ArrowRight, ExternalLink, Heart } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { giftService } from '../services/giftService';
import { personService } from '../services/personService';
import { useNotify } from '../context/NotificationContext';

export const GiftMatePage = () => {
  const [people, setPeople] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [generating, setGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotify();

  const [customGift, setCustomGift] = useState({
    gift_name: '',
    person_name: '',
    reason: '',
    estimated_price: '$30 - $50'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pplRes, giftRes] = await Promise.all([
        personService.list(),
        giftService.list()
      ]);
      setPeople(pplRes || []);
      setGifts(giftRes || []);
      if (pplRes?.length > 0 && !selectedPersonId) {
        setSelectedPersonId(pplRes[0].id);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load gifts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateAIRecommendations = async () => {
    if (!selectedPersonId) {
      showToast('Please select a friend first', 'error');
      return;
    }
    setGenerating(true);
    try {
      const res = await giftService.recommend(selectedPersonId);
      setAiSuggestions(res.suggestions || []);
      showToast(`Gemma generated ${res.suggestions?.length || 0} gift suggestions!`, 'success');
    } catch (err) {
      showToast('Failed to generate suggestions', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveSuggestion = async (suggestion) => {
    const selectedPerson = people.find((p) => p.id === selectedPersonId);
    try {
      await giftService.create({
        gift_name: suggestion.gift_name,
        person_id: selectedPersonId,
        person_name: selectedPerson?.name || 'Friend',
        reason: suggestion.reason,
        source_memory_ids: suggestion.source_memory_ids,
        estimated_price: suggestion.estimated_price,
        is_purchased: false,
        saved_by_user: true
      });
      showToast('Saved to wishlist!', 'success');
      fetchData();
    } catch (err) {
      showToast('Failed to save gift idea', 'error');
    }
  };

  const handleTogglePurchased = async (id) => {
    try {
      await giftService.togglePurchased(id);
      fetchData();
    } catch (err) {
      showToast('Failed to update purchased status', 'error');
    }
  };

  const handleDeleteGift = async (id) => {
    try {
      await giftService.delete(id);
      showToast('Gift idea removed', 'info');
      setGifts((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      showToast('Failed to delete gift', 'error');
    }
  };

  const handleAddCustomGift = async (e) => {
    e.preventDefault();
    if (!customGift.gift_name || !customGift.person_name) return;
    try {
      await giftService.create({
        ...customGift,
        is_purchased: false,
        saved_by_user: true
      });
      showToast('Gift idea added!', 'success');
      setIsAddModalOpen(false);
      setCustomGift({ gift_name: '', person_name: '', reason: '', estimated_price: '$30 - $50' });
      fetchData();
    } catch (err) {
      showToast('Failed to add gift', 'error');
    }
  };

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Gift className="w-7 h-7 text-indigo-500" /> GiftMate AI
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gemma synthesizes past memories and preferences into thoughtful, bespoke gift ideas.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          icon={Plus}
        >
          Add Manual Gift Idea
        </Button>
      </div>

      {/* AI Recommendation Box */}
      <Card className="p-6 sm:p-7 border border-indigo-500/30 shadow-glow space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500" /> Select Friend for Gemma AI Analysis
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Generate Thoughtful Gift Ideas
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedPersonId}
              onChange={(e) => setSelectedPersonId(e.target.value)}
              className="glass-input rounded-xl text-sm py-2 px-3 font-semibold min-w-44"
            >
              {people.map((p) => (
                <option key={p.id} value={p.id} className="dark:bg-dark-900">
                  {p.name} ({p.relationship || 'Friend'})
                </option>
              ))}
            </select>

            <Button
              variant="glow"
              onClick={handleGenerateAIRecommendations}
              loading={generating}
              icon={Sparkles}
            >
              Generate Gifts
            </Button>
          </div>
        </div>

        {/* AI Suggestions Display */}
        {aiSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Gemma AI Recommendations:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiSuggestions.map((s, idx) => (
                <div
                  key={idx}
                  className="glass-card p-4 rounded-2xl flex flex-col justify-between space-y-2 border border-indigo-500/20"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{s.gift_name}</h4>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                        {s.estimated_price}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{s.reason}</p>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Grounded on memories
                    </span>
                    <button
                      onClick={() => handleSaveSuggestion(s)}
                      className="px-3 py-1 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all"
                    >
                      + Save to Wishlist
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </Card>

      {/* Saved Wishlist Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-500" /> Saved Gift Wishlist ({gifts.length})
        </h2>

        {gifts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gifts.map((g) => (
              <Card key={g.id} className="p-5 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{g.gift_name}</h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-300">
                      {g.estimated_price || '$30'}
                    </span>
                  </div>

                  <span className="inline-block text-xs font-bold text-brand-600 dark:text-brand-400">
                    For: {g.person_name}
                  </span>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{g.reason}</p>

                  {/* Linked Source Memory preview */}
                  {g.source_memories?.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-dark-850 text-[11px] text-slate-500 border border-slate-200/60 dark:border-slate-800">
                      <span className="font-semibold block mb-0.5">Source Memory:</span>
                      <p className="italic line-clamp-1">{g.source_memories[0].title}</p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleTogglePurchased(g.id)}
                    className={`flex items-center gap-1.5 font-bold ${
                      g.is_purchased ? 'text-emerald-500' : 'text-slate-400 hover:text-brand-500'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{g.is_purchased ? 'Purchased' : 'Mark Purchased'}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteGift(g.id)}
                    className="p-1 text-slate-400 hover:text-rose-500"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12 space-y-2">
            <Gift className="w-8 h-8 text-indigo-500 mx-auto" />
            <p className="text-sm font-semibold">No saved gift ideas yet.</p>
            <p className="text-xs text-slate-500">Generate recommendations with Gemma above or add ideas manually.</p>
          </Card>
        )}
      </div>

      {/* Manual Add Gift Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Gift Idea"
        subtitle="Save a thoughtful gift to your friend's wishlist."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddCustomGift} className="space-y-4 text-left">
          <Input
            label="Gift Item Name *"
            value={customGift.gift_name}
            onChange={(e) => setCustomGift({ ...customGift, gift_name: e.target.value })}
            placeholder="e.g. Kyoto Ceramic Tea Cup"
            required
          />

          <Input
            label="Friend Name *"
            value={customGift.person_name}
            onChange={(e) => setCustomGift({ ...customGift, person_name: e.target.value })}
            placeholder="e.g. Rahul Sharma"
            required
          />

          <Input
            label="Reason / Memory Context"
            value={customGift.reason}
            onChange={(e) => setCustomGift({ ...customGift, reason: e.target.value })}
            placeholder="e.g. Loves green tea and Japanese ceramics"
          />

          <Input
            label="Estimated Price Range"
            value={customGift.estimated_price}
            onChange={(e) => setCustomGift({ ...customGift, estimated_price: e.target.value })}
            placeholder="$30 - $50"
          />

          <div className="pt-2 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <Button variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save to Wishlist
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
