import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, ArrowRight, X, AlertCircle, RefreshCw, Plus, Tag, Gift, Heart, Calendar } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { CategoryBadge } from '../common/Badge';
import { aiService } from '../../services/aiService';
import { memoryService } from '../../services/memoryService';
import { giftService } from '../../services/giftService';
import { useNotify } from '../../context/NotificationContext';

export const MemoryExtractModal = ({ isOpen, onClose, onSaved, initialText = '' }) => {
  const [rawText, setRawText] = useState(initialText);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [newTag, setNewTag] = useState('');
  const [saveGiftIdeas, setSaveGiftIdeas] = useState(true);
  const { showToast } = useNotify();

  const handleExtract = async () => {
    if (!rawText.trim() || rawText.length < 3) {
      showToast('Please enter a note to extract memory from', 'error');
      return;
    }
    setExtracting(true);
    try {
      const data = await aiService.extract(rawText);
      setExtracted({
        ...data,
        is_favorite: false,
        location: '',
      });
      showToast('Gemma AI extracted structured memory details!', 'success');
    } catch (err) {
      showToast('Failed to extract memory details', 'error');
      console.error(err);
    } finally {
      setExtracting(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && extracted && !extracted.tags.includes(newTag.trim().toLowerCase())) {
      setExtracted({
        ...extracted,
        tags: [...extracted.tags, newTag.trim().toLowerCase()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    if (extracted) {
      setExtracted({
        ...extracted,
        tags: extracted.tags.filter((t) => t !== tagToRemove)
      });
    }
  };

  const handleApproveAndSave = async () => {
    if (!extracted) return;
    setSaving(true);
    try {
      const payload = {
        title: extracted.title,
        description: extracted.description,
        date: extracted.date || new Date().toISOString(),
        person_name: extracted.person_name,
        person_id: extracted.person_id,
        category: extracted.category,
        tags: extracted.tags,
        importance: extracted.importance,
        mood: extracted.mood,
        location: extracted.location,
        is_favorite: extracted.is_favorite || false,
        ai_gift_ideas: extracted.ai_gift_ideas || [],
        source_raw_text: rawText
      };

      const savedMem = await memoryService.create(payload);

      // Auto save gift ideas to GiftMate wishlist if requested
      if (saveGiftIdeas && extracted.ai_gift_ideas?.length > 0 && extracted.person_name) {
        for (const giftName of extracted.ai_gift_ideas) {
          try {
            await giftService.create({
              gift_name: giftName,
              person_id: extracted.person_id,
              person_name: extracted.person_name,
              reason: `Extracted from memory: ${extracted.title}`,
              source_memory_ids: [savedMem.id],
              estimated_price: '$30 - $60',
              is_purchased: false,
              saved_by_user: true
            });
          } catch (e) {
            console.error(e);
          }
        }
      }

      showToast('Memory verified & permanently saved to vault!', 'success');
      setExtracted(null);
      setRawText('');
      onSaved?.(savedMem);
    } catch (err) {
      showToast('Failed to save memory', 'error');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const categories = [
    'Friendship', 'Family', 'Birthday', 'Gift', 'Food', 'Travel',
    'Hobby', 'Conversation', 'Study', 'Work', 'Important', 'Other'
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setExtracted(null);
        onClose();
      }}
      title="AI Memory Extraction"
      subtitle="Paste or type any conversation note. Gemma will extract structured facts for your review."
      maxWidth="max-w-2xl"
    >
      {!extracted ? (
        <div className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Conversation Note or Observation
            </label>
            <textarea
              rows={4}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Example: Rahul told me yesterday that he loves single-origin dark chocolate, enjoys film photography, and plans to visit Kyoto next spring."
              className="w-full glass-input rounded-2xl p-3.5 text-sm resize-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Try sample:</span>
            <button
              type="button"
              onClick={() => setRawText("Rahul told me yesterday that he loves dark chocolate and wants to visit Japan.")}
              className="text-xs text-brand-500 hover:underline"
            >
              "Rahul's preferences"
            </button>
            <span className="text-slate-300">·</span>
            <button
              type="button"
              onClick={() => setRawText("Priya mentioned she drinks Uji ceremonial matcha every morning and loves reading Ted Chiang sci-fi.")}
              className="text-xs text-brand-500 hover:underline"
            >
              "Priya's morning routine"
            </button>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="glow"
              onClick={handleExtract}
              loading={extracting}
              icon={Sparkles}
            >
              Extract with Gemma AI
            </Button>
          </div>
        </div>
      ) : (
        /* Review & Approve Step */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5 text-left"
        >
          <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-between text-xs text-brand-600 dark:text-brand-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-500" />
              <span>Gemma AI has structured this memory. Please verify and edit before saving:</span>
            </div>
            <button
              onClick={() => setExtracted(null)}
              className="font-medium hover:underline text-brand-500"
            >
              Re-extract
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Memory Title"
                value={extracted.title}
                onChange={(e) => setExtracted({ ...extracted, title: e.target.value })}
              />
            </div>

            <div>
              <Input
                label="Person Mentioned"
                value={extracted.person_name || ''}
                onChange={(e) => setExtracted({ ...extracted, person_name: e.target.value })}
                placeholder="Name (e.g. Rahul)"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Category
              </label>
              <select
                value={extracted.category}
                onChange={(e) => setExtracted({ ...extracted, category: e.target.value })}
                className="w-full glass-input rounded-xl text-sm py-2.5 px-3"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="dark:bg-dark-900">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Importance
              </label>
              <select
                value={extracted.importance}
                onChange={(e) => setExtracted({ ...extracted, importance: e.target.value })}
                className="w-full glass-input rounded-xl text-sm py-2.5 px-3"
              >
                <option value="low" className="dark:bg-dark-900">Low</option>
                <option value="medium" className="dark:bg-dark-900">Medium</option>
                <option value="high" className="dark:bg-dark-900">High</option>
                <option value="critical" className="dark:bg-dark-900">Critical</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Mood / Emotional Tone
              </label>
              <select
                value={extracted.mood}
                onChange={(e) => setExtracted({ ...extracted, mood: e.target.value })}
                className="w-full glass-input rounded-xl text-sm py-2.5 px-3"
              >
                <option value="happy" className="dark:bg-dark-900">Happy</option>
                <option value="excited" className="dark:bg-dark-900">Excited</option>
                <option value="grateful" className="dark:bg-dark-900">Grateful</option>
                <option value="loving" className="dark:bg-dark-900">Loving</option>
                <option value="reflective" className="dark:bg-dark-900">Reflective</option>
                <option value="touched" className="dark:bg-dark-900">Touched</option>
                <option value="neutral" className="dark:bg-dark-900">Neutral</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Memory Description
            </label>
            <textarea
              rows={3}
              value={extracted.description}
              onChange={(e) => setExtracted({ ...extracted, description: e.target.value })}
              className="w-full glass-input rounded-xl p-3 text-sm resize-none"
            />
          </div>

          {/* Smart Tags */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Smart Tags
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              {extracted.tags?.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-dark-800 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  #{t}
                  <button
                    onClick={() => handleRemoveTag(t)}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="+ tag"
                  className="w-20 glass-input rounded-lg text-xs py-1 px-2"
                />
              </div>
            </div>
          </div>

          {/* AI Gift Ideas */}
          {extracted.ai_gift_ideas?.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5" /> AI Gift Hints Detected
                </span>
                <label className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveGiftIdeas}
                    onChange={(e) => setSaveGiftIdeas(e.target.checked)}
                    className="rounded text-brand-600"
                  />
                  <span>Sync to GiftMate Wishlist</span>
                </label>
              </div>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                {extracted.ai_gift_ideas.map((g, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <Button
              variant="secondary"
              onClick={() => setExtracted(null)}
            >
              Back to Edit Note
            </Button>
            <Button
              variant="glow"
              onClick={handleApproveAndSave}
              loading={saving}
              icon={Check}
            >
              Approve & Save Memory
            </Button>
          </div>
        </motion.div>
      )}
    </Modal>
  );
};
