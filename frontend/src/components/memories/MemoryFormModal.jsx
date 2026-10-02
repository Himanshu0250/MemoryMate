import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Tag, X, Plus, Star, Image, MapPin, Sparkles } from 'lucide-react';
import { memoryService } from '../../services/memoryService';
import { useNotify } from '../../context/NotificationContext';

export const MemoryFormModal = ({ isOpen, onClose, onSaved, initialMemory = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    person_name: '',
    category: 'Conversation',
    importance: 'medium',
    mood: 'happy',
    location: '',
    image_url: '',
    is_favorite: false,
    tags: []
  });
  const [newTag, setNewTag] = useState('');
  const [saving, setSaving] = useState(false);
  const { showToast } = useNotify();

  useEffect(() => {
    if (initialMemory) {
      setFormData({
        title: initialMemory.title || '',
        description: initialMemory.description || '',
        person_name: initialMemory.person_name || '',
        category: initialMemory.category || 'Conversation',
        importance: initialMemory.importance || 'medium',
        mood: initialMemory.mood || 'happy',
        location: initialMemory.location || '',
        image_url: initialMemory.image_url || '',
        is_favorite: initialMemory.is_favorite || false,
        tags: initialMemory.tags || []
      });
    } else {
      setFormData({
        title: '',
        description: '',
        person_name: '',
        category: 'Conversation',
        importance: 'medium',
        mood: 'happy',
        location: '',
        image_url: '',
        is_favorite: false,
        tags: []
      });
    }
  }, [initialMemory, isOpen]);

  const categories = [
    'Friendship', 'Family', 'Birthday', 'Gift', 'Food', 'Travel',
    'Hobby', 'Conversation', 'Study', 'Work', 'Important', 'Other'
  ];

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim().toLowerCase())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim().toLowerCase()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      showToast('Title and description are required', 'error');
      return;
    }

    setSaving(true);
    try {
      if (initialMemory?.id) {
        const updated = await memoryService.update(initialMemory.id, formData);
        showToast('Memory updated successfully!', 'success');
        onSaved?.(updated);
      } else {
        const created = await memoryService.create(formData);
        showToast('New memory saved to your vault!', 'success');
        onSaved?.(created);
      }
      onClose();
    } catch (err) {
      showToast('Failed to save memory', 'error');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialMemory ? 'Edit Memory' : 'Create New Memory'}
      subtitle="Save moments, preferences, and important promises about your friends."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <Input
          label="Memory Title *"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g. Favorite Dark Chocolate brand"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Person Name"
            value={formData.person_name}
            onChange={(e) => setFormData({ ...formData, person_name: e.target.value })}
            placeholder="e.g. Rahul Sharma"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
              value={formData.importance}
              onChange={(e) => setFormData({ ...formData, importance: e.target.value })}
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
              Mood / Tone
            </label>
            <select
              value={formData.mood}
              onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
              className="w-full glass-input rounded-xl text-sm py-2.5 px-3"
            >
              <option value="happy" className="dark:bg-dark-900">Happy 😊</option>
              <option value="excited" className="dark:bg-dark-900">Excited ✨</option>
              <option value="grateful" className="dark:bg-dark-900">Grateful 🙏</option>
              <option value="loving" className="dark:bg-dark-900">Loving ❤️</option>
              <option value="reflective" className="dark:bg-dark-900">Reflective 💭</option>
              <option value="touched" className="dark:bg-dark-900">Touched 🥺</option>
              <option value="neutral" className="dark:bg-dark-900">Neutral 😐</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Memory Details *
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Write details of what was said or observed..."
            className="w-full glass-input rounded-xl p-3 text-sm resize-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Location"
            icon={MapPin}
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g. Blue Tokai Coffee, Indiranagar"
          />

          <Input
            label="Image URL"
            icon={Image}
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            placeholder="https://images.unsplash.com/..."
          />
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" /> Tags
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            {formData.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-dark-800 text-xs border border-slate-200 dark:border-slate-700"
              >
                #{t}
                <button type="button" onClick={() => handleRemoveTag(t)} className="text-slate-400 hover:text-rose-500">
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
                placeholder="+ add tag"
                className="w-24 glass-input rounded-lg text-xs py-1 px-2"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer font-medium">
            <input
              type="checkbox"
              checked={formData.is_favorite}
              onChange={(e) => setFormData({ ...formData, is_favorite: e.target.checked })}
              className="rounded text-brand-600"
            />
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              Pin to Favorites
            </span>
          </label>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={saving}>
            {initialMemory ? 'Update Memory' : 'Save Memory'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
