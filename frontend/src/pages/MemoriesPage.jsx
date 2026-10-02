import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookMarked,
  Sparkles,
  Plus,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Star,
  Trash2,
  Edit3
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { MemoryCard } from '../components/memories/MemoryCard';
import { CategoryPillFilter } from '../components/memories/CategoryPillFilter';
import { MemoryFormModal } from '../components/memories/MemoryFormModal';
import { memoryService } from '../services/memoryService';
import { useNotify } from '../context/NotificationContext';

export const MemoriesPage = () => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [sortBy, setSortBy] = useState('date_desc');
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState(null);
  const { showToast } = useNotify();
  const outletCtx = useOutletContext();

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const params = {
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        search: searchQuery.trim() || undefined,
        is_favorite: filterFavorites ? true : undefined,
        sort_by: sortBy
      };
      const res = await memoryService.list(params);
      setMemories(res.items || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load memories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, [selectedCategory, searchQuery, filterFavorites, sortBy]);

  useEffect(() => {
    const handleRefresh = () => fetchMemories();
    window.addEventListener('memorymate:refresh', handleRefresh);
    return () => window.removeEventListener('memorymate:refresh', handleRefresh);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this memory?')) return;
    try {
      await memoryService.delete(id);
      showToast('Memory removed from vault', 'info');
      setMemories((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      showToast('Failed to delete memory', 'error');
    }
  };

  const handleToggleFavorite = async (id) => {
    try {
      const updated = await memoryService.toggleFavorite(id);
      setMemories((prev) => prev.map((m) => (m.id === id ? updated : m)));
    } catch (err) {
      showToast('Failed to update favorite', 'error');
    }
  };

  // Compute category counts
  const categoryCounts = memories.reduce((acc, m) => {
    acc[m.category] = (acc[m.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Memories Vault
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse, filter, and preserve all conversations, preferences, and moments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="glow"
            size="sm"
            onClick={() => outletCtx?.openExtractModal?.()}
            icon={Sparkles}
          >
            AI Extract
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingMemory(null);
              setIsFormOpen(true);
            }}
            icon={Plus}
          >
            New Memory
          </Button>
        </div>
      </div>

      {/* Category Pills Filter */}
      <CategoryPillFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categoryCounts={categoryCounts}
      />

      {/* Controls Bar: Search, Favorites Toggle, Sort, Grid/List */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search within memories..."
            className="w-full glass-input rounded-xl text-xs sm:text-sm py-2 pl-9 pr-3"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
          {/* Favorite Toggle Button */}
          <button
            onClick={() => setFilterFavorites(!filterFavorites)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              filterFavorites
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                : 'glass-pill text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${filterFavorites ? 'fill-current' : ''}`} />
            Favorites Only
          </button>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="glass-input rounded-xl text-xs py-1.5 px-2.5 font-medium"
          >
            <option value="date_desc" className="dark:bg-dark-900">Newest First</option>
            <option value="date_asc" className="dark:bg-dark-900">Oldest First</option>
            <option value="importance" className="dark:bg-dark-900">Highest Importance</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-dark-800 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-white dark:bg-dark-700 text-brand-500 shadow-sm' : 'text-slate-400'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-white dark:bg-dark-700 text-brand-500 shadow-sm' : 'text-slate-400'}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Memory Items Grid / List */}
      {memories.length > 0 ? (
        <div
          className={
            viewMode === 'grid'
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              : "space-y-3"
          }
        >
          <AnimatePresence>
            {memories.map((mem) => (
              <MemoryCard
                key={mem.id}
                memory={mem}
                onToggleFavorite={handleToggleFavorite}
                onEdit={(m) => {
                  setEditingMemory(m);
                  setIsFormOpen(true);
                }}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-16 glass-card rounded-3xl p-8 space-y-3">
          <BookMarked className="w-10 h-10 text-brand-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No memories found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== 'All'
              ? 'Try changing your search query or category filter.'
              : 'Add your first memory manually or paste notes into the Gemma AI extractor!'}
          </p>
          <Button
            size="sm"
            variant="glow"
            onClick={() => outletCtx?.openExtractModal?.()}
            icon={Sparkles}
          >
            AI Quick Extract
          </Button>
        </div>
      )}

      {/* Manual Creation / Edit Modal */}
      <MemoryFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingMemory(null);
        }}
        initialMemory={editingMemory}
        onSaved={() => fetchMemories()}
      />
    </div>
  );
};
