import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Lock, Mail, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { GoogleSignInButton } from '../components/auth/GoogleSignInButton';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      // Error is handled via Toast in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      // Register or login as demo user
      try {
        await login('demo@memorymate.ai', 'demo123456');
      } catch (e) {
        // If demo user doesn't exist, create it
        const { register } = useAuth();
        await register('Alex Mercer', 'demo@memorymate.ai', 'demo123456');
      }
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-dark-950 relative overflow-hidden">
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 ambient-glow rounded-full blur-3xl opacity-40 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md glass-card rounded-3xl p-7 sm:p-9 shadow-2xl border border-slate-200/80 dark:border-slate-800/80 z-10 text-center"
      >
        {/* Brand Icon */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-electric-500 flex items-center justify-center text-white mx-auto shadow-glow-sm mb-4">
          <Brain className="w-7 h-7" />
        </div>

        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Welcome Back</h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 mb-5">
          Access your private memory vault
        </p>

        {/* Google Sign In Button */}
        <div className="mb-4">
          <GoogleSignInButton text="Sign in with Google" />
        </div>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">or with email</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* 1-Click Demo Login Banner */}
        <div className="mb-5 p-3 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-left">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Quick Evaluation Mode
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Explore with rich preloaded memories & gift ideas.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              className="px-2.5 py-1 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-[11px] font-bold shrink-0 shadow-sm transition-all active:scale-95"
            >
              Demo Login
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />

          <Input
            label="Password"
            type="password"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <div className="flex items-center justify-between text-xs">
            <Link to="/forgot-password" className="text-brand-500 hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button variant="glow" type="submit" loading={loading} className="w-full font-bold">
            Sign In to MemoryMate
          </Button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-500 font-semibold hover:underline">
            Create an account
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
