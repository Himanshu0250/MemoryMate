import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Tag, X, Plus, Calendar, Heart } from 'lucide-react';
import { personService } from '../../services/personService';
import { useNotify } from '../../context/NotificationContext';

export const PersonFormModal = ({ isOpen, onClose, onSaved, initialPerson = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    relationship: 'Friend',
    birthday: '',
    interests: [],
    favorite_things: {},
    notes: '',
    avatar_url: ''
  });
  const [newInterest, setNewInterest] = useState('');
  const [saving, setSaving] = useState(false);
  const { showToast } = useNotify();

  useEffect(() => {
    if (initialPerson) {
      setFormData({
        name: initialPerson.name || '',
        relationship: initialPerson.relationship || 'Friend',
        birthday: initialPerson.birthday || '',
        interests: initialPerson.interests || [],
        favorite_things: initialPerson.favorite_things || {},
        notes: initialPerson.notes || '',
        avatar_url: initialPerson.avatar_url || ''
      });
    } else {
      setFormData({
        name: '',
        relationship: 'Friend',
        birthday: '',
        interests: [],
        favorite_things: {},
        notes: '',
        avatar_url: ''
      });
    }
  }, [initialPerson, isOpen]);

  const handleAddInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData({
        ...formData,
        interests: [...formData.interests, newInterest.trim()]
      });
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (item) => {
    setFormData({
      ...formData,
      interests: formData.interests.filter((i) => i !== item)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Name is required', 'error');
      return;
    }

    setSaving(true);
    try {
      if (initialPerson?.id) {
        const updated = await personService.update(initialPerson.id, formData);
        showToast(`${updated.name}'s profile updated!`, 'success');
        onSaved?.(updated);
      } else {
        const created = await personService.create(formData);
        showToast(`${created.name} added to your friends vault!`, 'success');
        onSaved?.(created);
      }
      onClose();
    } catch (err) {
      showToast('Failed to save profile', 'error');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialPerson ? 'Edit Friend Profile' : 'Add a New Friend / Loved One'}
      subtitle="Keep track of their birthdays, favorite things, and key passions."
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <Input
          label="Full Name *"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Rahul Sharma"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Relationship
            </label>
            <select
              value={formData.relationship}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
              className="w-full glass-input rounded-xl text-sm py-2.5 px-3"
            >
              <option value="Best Friend" className="dark:bg-dark-900">Best Friend</option>
              <option value="Friend" className="dark:bg-dark-900">Friend</option>
              <option value="Sister" className="dark:bg-dark-900">Sister</option>
              <option value="Brother" className="dark:bg-dark-900">Brother</option>
              <option value="Partner" className="dark:bg-dark-900">Partner</option>
              <option value="Colleague" className="dark:bg-dark-900">Colleague</option>
              <option value="Mentor" className="dark:bg-dark-900">Mentor</option>
              <option value="Family" className="dark:bg-dark-900">Family</option>
              <option value="Other" className="dark:bg-dark-900">Other</option>
            </select>
          </div>

          <Input
            label="Birthday (YYYY-MM-DD)"
            type="date"
            value={formData.birthday}
            onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
          />
        </div>

        {/* Interests */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Hobbies & Interests
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            {formData.interests.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-dark-800 text-xs border border-slate-200 dark:border-slate-700"
              >
                {item}
                <button type="button" onClick={() => handleRemoveInterest(item)} className="text-slate-400 hover:text-rose-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
                placeholder="+ add interest"
                className="w-28 glass-input rounded-lg text-xs py-1 px-2"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Personal Notes & Context
          </label>
          <textarea
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="How you met, important nuances, personality traits..."
            className="w-full glass-input rounded-xl p-3 text-sm resize-none"
          />
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={saving}>
            {initialPerson ? 'Save Changes' : 'Create Profile'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
