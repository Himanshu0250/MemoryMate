import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { authService } from '../services/authService';
import { useNotify } from '../context/NotificationContext';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useNotify();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await authService.resetPasswordRequest(email);
      setSubmitted(true);
      showToast('Password reset instructions sent!', 'success');
    } catch (err) {
      showToast('Failed to process request', 'error');
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

        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Reset Password</h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
          Enter your email to receive recovery instructions
        </p>

        {!submitted ? (
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

            <Button variant="glow" type="submit" loading={loading} className="w-full font-bold">
              Send Reset Link
            </Button>
          </form>
        ) : (
          <div className="py-4 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="text-sm text-slate-700 dark:text-slate-200">
              If an account with <strong>{email}</strong> exists, instructions have been sent.
            </p>
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 text-xs">
          <Link to="/login" className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center gap-1.5 font-medium">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
