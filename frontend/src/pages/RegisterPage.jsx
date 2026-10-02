import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Lock, Mail, User, Sparkles, ShieldCheck } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { GoogleSignInButton } from '../components/auth/GoogleSignInButton';
import { useAuth } from '../context/AuthContext';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      // Handled via toast in AuthContext
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
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-electric-500 flex items-center justify-center text-white mx-auto shadow-glow-sm mb-4">
          <Brain className="w-7 h-7" />
        </div>

        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Create Private Vault</h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 mb-5">
          Never forget the little things that matter for your friends
        </p>

        {/* Google Sign Up Button */}
        <div className="mb-4">
          <GoogleSignInButton text="Sign up with Google" />
        </div>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">or with email</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <Input
            label="Your Name"
            icon={User}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Mercer"
            required
          />

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
            placeholder="At least 6 characters"
            required
          />

          <div className="flex items-center gap-2 text-xs text-slate-500 py-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Encrypted database & zero third-party training</span>
          </div>

          <Button variant="glow" type="submit" loading={loading} className="w-full font-bold">
            Create MemoryMate Account
          </Button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-500 font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
