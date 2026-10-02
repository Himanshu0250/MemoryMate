import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Search, UserPlus, Sparkles } from 'lucide-react';
import { Button } from '../components/common/Button';
import { PersonCard } from '../components/people/PersonCard';
import { PersonFormModal } from '../components/people/PersonFormModal';
import { personService } from '../services/personService';
import { useNotify } from '../context/NotificationContext';

export const PeoplePage = () => {
  const [people, setPeople] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useNotify();

  const fetchPeople = async () => {
    setLoading(true);
    try {
      const data = await personService.list();
      setPeople(data || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load friends directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeople();
  }, []);

  const filteredPeople = people.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.relationship && p.relationship.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.interests && p.interests.some((i) => i.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Friends & Loved Ones
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Dedicated profiles, chronological memory streams, and favorite things for each person.
          </p>
        </div>

        <Button
          variant="glow"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          icon={UserPlus}
        >
          Add Friend Profile
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by name, relationship, or hobby..."
          className="w-full glass-input rounded-xl text-xs sm:text-sm py-2 pl-9 pr-3"
        />
      </div>

      {/* People Grid */}
      {filteredPeople.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filteredPeople.map((person) => (
              <PersonCard key={person.id} person={person} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-16 glass-card rounded-3xl p-8 space-y-3">
          <Users className="w-10 h-10 text-brand-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No people found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? 'No friends match your search filter.'
              : 'Add your friends to start mapping their favorite things, gift ideas, and memories!'}
          </p>
          <Button
            size="sm"
            variant="glow"
            onClick={() => setIsModalOpen(true)}
            icon={Plus}
          >
            Add First Profile
          </Button>
        </div>
      )}

      {/* Add Modal */}
      <PersonFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={() => fetchPeople()}
      />
    </div>
  );
};
