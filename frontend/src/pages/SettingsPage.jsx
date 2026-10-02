import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  Cpu,
  Download,
  Trash2,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Lock,
  User,
  AlertTriangle
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { privacyService } from '../services/privacyService';
import { useNotify } from '../context/NotificationContext';

export const SettingsPage = () => {
  const { user, updateProfile, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showToast } = useNotify();

  const [name, setName] = useState(user?.name || '');
  const [provider, setProvider] = useState(user?.ai_settings?.preferred_provider || 'gemma');
  const [isWipeModalOpen, setIsWipeModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({
        name,
        ai_settings: {
          preferred_provider: provider
        }
      });
    } catch (err) {
      // Toast in context
    } finally {
      setSavingProfile(false);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      await privacyService.exportData();
      showToast('Downloaded full GDPR JSON memory backup!', 'success');
    } catch (err) {
      showToast('Failed to export data', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleSeedDemoData = async () => {
    setSeeding(true);
    try {
      await privacyService.seedDemo();
      showToast('Safe fictional demo memories & people loaded!', 'success');
      window.dispatchEvent(new CustomEvent('memorymate:refresh'));
    } catch (err) {
      showToast('Failed to populate demo data', 'error');
    } finally {
      setSeeding(false);
    }
  };

  const handleWipeData = async () => {
    try {
      await privacyService.wipeData();
      showToast('All memories and profile data have been permanently wiped.', 'info');
      setIsWipeModalOpen(false);
      window.dispatchEvent(new CustomEvent('memorymate:refresh'));
    } catch (err) {
      showToast('Failed to wipe data', 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto text-left">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-brand-500" /> Settings & Privacy
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your account profile, theme preferences, AI engine, and data sovereignty.
        </p>
      </div>

      {/* Account Profile Card */}
      <Card className="p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-4 h-4 text-brand-500" /> User Profile & Identity
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
          <Input
            label="Display Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Mercer"
            required
          />

          <Input
            label="Email Address"
            value={user?.email || ''}
            disabled
            className="opacity-70 cursor-not-allowed"
          />

          <Button variant="primary" size="sm" type="submit" loading={savingProfile}>
            Save Profile
          </Button>
        </form>
      </Card>

      {/* Appearance & Theme */}
      <Card className="p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Monitor className="w-4 h-4 text-indigo-500" /> Appearance & Theme
        </h2>

        <div className="grid grid-cols-3 gap-3 max-w-md">
          {[
            { id: 'dark', label: 'Dark Mode', icon: Moon },
            { id: 'light', label: 'Light Mode', icon: Sun },
            { id: 'system', label: 'System Auto', icon: Monitor },
          ].map((t) => {
            const Icon = t.icon;
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                  isSelected
                    ? 'bg-brand-500/15 text-brand-600 dark:text-brand-400 border-brand-500 shadow-glow-sm'
                    : 'glass-pill text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-semibold">{t.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Open-Weight AI Settings */}
      <Card className="p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-brand-500" /> Open-Weight AI Engine Provider
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          MemoryMate uses Google Gemma open weights. You can run locally via Ollama or connect private cloud endpoints.
        </p>

        <div className="space-y-3 max-w-lg">
          {[
            { id: 'gemma', name: 'Google Gemma 2 (Local Ollama / Open-Weight)', desc: 'Privacy-preserving local inference via localhost:11434' },
            { id: 'groq', name: 'Open-Weight Cloud API (Groq / vLLM)', desc: 'High-speed cloud endpoint with user-provided API token' },
            { id: 'fallback', name: 'Deterministic Heuristic Fallback', desc: '100% offline rule-based & TF-IDF cosine semantic extractor' }
          ].map((item) => (
            <label
              key={item.id}
              className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                provider === item.id
                  ? 'bg-brand-500/10 border-brand-500/40 shadow-sm'
                  : 'glass-pill border-slate-200 dark:border-slate-800'
              }`}
            >
              <input
                type="radio"
                name="provider"
                value={item.id}
                checked={provider === item.id}
                onChange={(e) => setProvider(e.target.value)}
                className="mt-1 text-brand-600"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">{item.name}</span>
                <span className="text-[11px] text-slate-500">{item.desc}</span>
              </div>
            </label>
          ))}
        </div>
      </Card>

      {/* Privacy & Data Sovereignty */}
      <Card className="p-6 space-y-5">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Data Sovereignty & Portability
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            You own 100% of your memories. Export your database anytime in structured JSON.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
            loading={exporting}
            icon={Download}
          >
            Export All Memories (JSON)
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleSeedDemoData}
            loading={seeding}
            icon={Sparkles}
          >
            Reset / Load Safe Demo Data
          </Button>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 space-y-4 border-rose-500/20 bg-rose-500/5">
        <h2 className="text-base font-bold text-rose-500 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Danger Zone
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Permanently erase all stored memories, friends profiles, gift wishlists, and chats.
        </p>

        <Button
          variant="danger"
          size="sm"
          onClick={() => setIsWipeModalOpen(true)}
          icon={Trash2}
        >
          Wipe All Personal Data
        </Button>
      </Card>

      {/* Wipe Confirmation Modal */}
      <Modal
        isOpen={isWipeModalOpen}
        onClose={() => setIsWipeModalOpen(false)}
        title="Permanently Wipe All Data?"
        subtitle="This action is irreversible and will erase all your memories and friend profiles."
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-left">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Please make sure you have exported a backup if you wish to keep any records.
          </p>
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setIsWipeModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleWipeData}>
              Yes, Wipe Everything
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
