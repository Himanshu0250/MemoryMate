import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain,
  Sparkles,
  ShieldCheck,
  Heart,
  Gift,
  Mic,
  Calendar,
  Lock,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Users,
  Search,
  MessageSquare,
  ChevronRight,
  ExternalLink,
  Code
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { PWAInstallBanner } from '../components/common/PWAInstallBanner';
import { GoogleSignInButton } from '../components/auth/GoogleSignInButton';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [demoInput, setDemoInput] = useState("Rahul told me yesterday that he loves single-origin dark chocolate and wants to visit Kyoto next spring.");
  const [extractedDemo, setExtractedDemo] = useState(null);
  const [extracting, setExtracting] = useState(false);

  const runDemoExtract = () => {
    setExtracting(true);
    setTimeout(() => {
      setExtractedDemo({
        person: "Rahul Sharma",
        category: "Food & Travel",
        importance: "High",
        tags: ["chocolate", "kyoto", "japan", "photography"],
        giftHints: ["Artisanal Dark Chocolate Tasting Box", "Kyoto Travel Guide & Photobook"],
        preferences: ["85% single-origin dark chocolate", "Japan spring photography trip"]
      });
      setExtracting(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-slate-100 overflow-x-hidden selection:bg-brand-500 selection:text-white">
      {/* Background Ambient Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] ambient-glow rounded-full pointer-events-none blur-3xl opacity-40 z-0" />
      <div className="fixed top-1/3 right-0 w-[500px] h-[500px] ambient-glow-rose rounded-full pointer-events-none blur-3xl opacity-20 z-0" />
      <div className="fixed bottom-10 left-0 w-[500px] h-[500px] ambient-glow-cyan rounded-full pointer-events-none blur-3xl opacity-20 z-0" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-dark-950/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-electric-500 flex items-center justify-center text-white shadow-glow-sm">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-brand-600 via-indigo-500 to-electric-500 bg-clip-text text-transparent">
                MemoryMate
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#how-it-works" className="hover:text-brand-500 transition-colors">How it Works</a>
            <a href="#features" className="hover:text-brand-500 transition-colors">Features</a>
            <a href="#privacy" className="hover:text-brand-500 transition-colors">Open-Weight AI</a>
            <a href="#demo" className="hover:text-brand-500 transition-colors">Live Demo</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <PWAInstallBanner />
            {isAuthenticated ? (
              <Button variant="glow" size="sm" onClick={() => navigate('/dashboard')} icon={ArrowRight}>
                Open Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Log In
                </Button>
                <Button variant="glow" size="sm" onClick={() => navigate('/register')}>
                  Get Started Free
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 text-center px-4 max-w-5xl mx-auto z-10">
        {/* Hacktoberfest Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-600 dark:text-brand-400 text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Hacktoberfest 2026 · "Build for a Friend" Challenge</span>
        </motion.div>

        {/* Main Tagline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]"
        >
          Never forget the <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-brand-600 via-indigo-500 to-electric-400 bg-clip-text text-transparent">
            little things that matter.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed"
        >
          A private AI memory vault for your closest friends and loved ones. Remember favorite foods, birthdays, dream travels, promises, and gift ideas—powered by open-weight <strong>Gemma AI</strong>.
        </motion.p>

        {/* Hero CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-lg mx-auto"
        >
          <Button
            variant="glow"
            size="lg"
            onClick={() => navigate('/register')}
            className="w-full sm:w-auto shadow-glow font-bold text-base"
            icon={Sparkles}
          >
            Start Your Memory Vault
          </Button>
          
          <div className="w-full sm:w-auto">
            <GoogleSignInButton text="Continue with Google" />
          </div>
        </motion.div>

        {/* Trust Badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-500" /> 100% Private & Encrypted
          </span>
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-brand-500" /> Open-Weight Gemma Core
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> No Data Mining
          </span>
        </div>
      </section>

      {/* Interactive Live Demo Simulation Section */}
      <section id="demo" className="py-16 px-4 max-w-4xl mx-auto z-10 relative">
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-500 mb-2 block">
            Interactive Gemma Simulation
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            See Gemma AI Extract Memories in Real-Time
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Type any raw observation or conversation snippet below to experience instant semantic entity structuring.
          </p>
        </div>

        <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
          <div className="space-y-4 text-left">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Raw Observation / Voice Transcript
            </label>
            <textarea
              rows={3}
              value={demoInput}
              onChange={(e) => setDemoInput(e.target.value)}
              className="w-full glass-input rounded-2xl p-3.5 text-sm resize-none"
            />

            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Review before saving is mandatory</span>
              <Button
                variant="glow"
                onClick={runDemoExtract}
                loading={extracting}
                icon={Sparkles}
              >
                Extract with Gemma
              </Button>
            </div>
          </div>

          {/* Extracted Demo Output */}
          {extractedDemo && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left"
            >
              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-dark-850">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Person & Category
                </span>
                <p className="text-sm font-bold text-brand-600 dark:text-brand-400">{extractedDemo.person}</p>
                <span className="text-xs text-slate-500">{extractedDemo.category}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-dark-850">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Discovered Gift Ideas
                </span>
                <ul className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
                  {extractedDemo.giftHints.map((g, i) => (
                    <li key={i} className="flex items-center gap-1 truncate">
                      <Gift className="w-3 h-3 text-indigo-500 shrink-0" /> {g}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-dark-850">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Smart Tags
                </span>
                <div className="flex flex-wrap gap-1">
                  {extractedDemo.tags.map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-brand-500/15 text-brand-500 font-semibold">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Why Open-Weight AI & Privacy Section */}
      <section id="privacy" className="py-16 px-4 bg-slate-100/60 dark:bg-dark-900/40 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-500 mb-2 block">
              Open-Weight AI Manifesto
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Why Open-Weight AI Matters for Personal Memory
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
              Personal memories are intimate. You shouldn't have to surrender your friend's secrets, health notes, and heartfelt stories to closed corporate advertising trackers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="glass-card rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Local & Edge Inference</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Run Gemma directly on your device via Ollama or private containers. Zero telemetry, zero external training on your data.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Data Sovereignty & Portability</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                One-click full JSON export. Total user ownership with instant data wipe guarantees. Your memories remain yours forever.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-electric-500/10 text-electric-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Model Swappability</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Decoupled backend architecture enables swapping between Gemma 2B, 9B, vLLM, or custom fine-tunes without code rewrites.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section id="features" className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-500 mb-2 block">
            Comprehensive Memory Suite
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Engineered for Deep, Lasting Friendships
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {[
            {
              icon: Sparkles,
              title: "AI Memory Extraction",
              desc: "Turns messy notes or audio into structured facts (Category, Mood, Importance, Gift Hints) with mandatory user approval."
            },
            {
              icon: MessageSquare,
              title: "Grounded RAG AI Assistant",
              desc: "Ask natural questions like 'What gifts would Rahul like?' and get answers citing exact source memories—no hallucinations."
            },
            {
              icon: Gift,
              title: "GiftMate Advisor",
              desc: "Synthesizes past memories and interests into thoughtful, curated gift suggestions with precise rationale."
            },
            {
              icon: Calendar,
              title: "Visual Chronological Timelines",
              desc: "Experience your friendship history along an interactive, animated visual timeline filterable by friend and category."
            },
            {
              icon: Mic,
              title: "Voice Memory Capture",
              desc: "Record thoughts on the go. Web Speech STT transcribes and feeds your note directly into Gemma extraction."
            },
            {
              icon: Users,
              title: "Inter-Memory Connections",
              desc: "Gemma identifies hidden links across past memories and upcoming milestones to recommend proactive catchups."
            }
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="glass-card-hover rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center mb-4 shadow-sm">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-dark-950/50 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-brand-500" />
            <span className="font-bold text-slate-800 dark:text-slate-200">MemoryMate</span>
            <span>— Built for Hacktoberfest 2026 "Build for a Friend" Challenge</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Powered by Open-Weight Gemma AI</span>
            <span>·</span>
            <span>MongoDB Atlas</span>
            <span>·</span>
            <span>FastAPI & React</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
