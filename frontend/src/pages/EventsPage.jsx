import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Cake, Heart, Plane, Clock, Star, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { eventService } from '../services/eventService';
import { personService } from '../services/personService';
import { useNotify } from '../context/NotificationContext';

export const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [people, setPeople] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotify();

  const [formData, setFormData] = useState({
    title: '',
    type: 'birthday',
    date: '',
    person_name: '',
    notes: '',
    recurring: false
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const [evRes, pplRes] = await Promise.all([
        eventService.list({ type: filterType !== 'all' ? filterType : undefined }),
        personService.list()
      ]);
      setEvents(evRes || []);
      setPeople(pplRes || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filterType]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date) {
      showToast('Title and Date are required', 'error');
      return;
    }
    try {
      await eventService.create(formData);
      showToast('Event reminder added to calendar!', 'success');
      setIsModalOpen(false);
      setFormData({ title: '', type: 'birthday', date: '', person_name: '', notes: '', recurring: false });
      fetchEvents();
    } catch (err) {
      showToast('Failed to create event', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await eventService.delete(id);
      showToast('Event deleted', 'info');
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      showToast('Failed to delete event', 'error');
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'birthday': return <Cake className="w-4 h-4 text-amber-500" />;
      case 'anniversary': return <Heart className="w-4 h-4 text-rose-500" />;
      case 'trip': return <Plane className="w-4 h-4 text-cyan-500" />;
      case 'promise': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default: return <Calendar className="w-4 h-4 text-brand-500" />;
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Events & Milestones
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Never miss birthdays, promises, trips, or important moments with loved ones.
          </p>
        </div>

        <Button
          variant="glow"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          icon={Plus}
        >
          Add Event / Reminder
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all', label: 'All Dates' },
          { id: 'birthday', label: '🎂 Birthdays' },
          { id: 'anniversary', label: '❤️ Anniversaries' },
          { id: 'promise', label: '🤝 Promises' },
          { id: 'trip', label: '✈️ Trips' },
          { id: 'important_date', label: '⭐ Important' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
              filterType === tab.id
                ? 'bg-brand-600 text-white border-brand-500 shadow-glow-sm'
                : 'glass-pill text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((ev) => (
            <Card key={ev.id} className="p-5 flex flex-col justify-between text-left space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-dark-800">
                    {getEventIcon(ev.type)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{ev.title}</h3>
                    {ev.person_name && (
                      <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                        {ev.person_name}
                      </span>
                    )}
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold shrink-0">
                  {ev.days_until === 0 ? 'Today!' : `in ${ev.days_until}d`}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                <p>
                  📅 Date: <strong>{new Date(ev.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>
                </p>
                {ev.notes && <p className="italic">{ev.notes}</p>}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">{ev.recurring ? '🔄 Yearly' : 'One-time'}</span>
                <button
                  onClick={() => handleDelete(ev.id)}
                  className="text-slate-400 hover:text-rose-500 p-1"
                  title="Delete event"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-16 space-y-3">
          <Calendar className="w-10 h-10 text-brand-500 mx-auto" />
          <h3 className="text-base font-bold">No events scheduled</h3>
          <p className="text-xs text-slate-500">Keep track of birthdays, promises, and milestones.</p>
          <Button size="sm" variant="glow" onClick={() => setIsModalOpen(true)}>
            Create Event
          </Button>
        </Card>
      )}

      {/* Create Event Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Event or Promise"
        subtitle="Schedule a reminder for birthdays, promises, or upcoming travel."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-left">
          <Input
            label="Event Title *"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Rahul's Birthday Surprise"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Event Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full glass-input rounded-xl text-xs py-2.5 px-3"
              >
                <option value="birthday">Birthday 🎂</option>
                <option value="anniversary">Anniversary ❤️</option>
                <option value="promise">Promise 🤝</option>
                <option value="trip">Trip ✈️</option>
                <option value="important_date">Important Date ⭐</option>
              </select>
            </div>

            <Input
              label="Date *"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <Input
            label="Person (Optional)"
            value={formData.person_name}
            onChange={(e) => setFormData({ ...formData, person_name: e.target.value })}
            placeholder="e.g. Rahul Sharma"
          />

          <Input
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="e.g. Buy Kyoto gift book ahead of time"
          />

          <div className="pt-2 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Event
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
