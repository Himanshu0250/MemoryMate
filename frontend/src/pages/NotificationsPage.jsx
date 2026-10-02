import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Cake, Sparkles, Check, Trash2, Calendar, CheckCheck } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { notificationService } from '../services/analyticsService';
import { useNotify } from '../context/NotificationContext';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotify();

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const data = await notificationService.list();
      setNotifications(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      showToast('All alerts marked as read', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'birthday_reminder': return <Cake className="w-5 h-5 text-amber-500" />;
      case 'connection_found': return <Sparkles className="w-5 h-5 text-indigo-500" />;
      default: return <Bell className="w-5 h-5 text-brand-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto text-left">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Bell className="w-7 h-7 text-brand-500" /> Notifications & Reminders
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Birthday alerts, connection findings, and daily reflection reminders.
          </p>
        </div>

        {notifications.some((n) => !n.is_read) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            icon={CheckCheck}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* List */}
      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-all ${
                n.is_read ? 'opacity-70' : 'border-brand-500/30 shadow-glow-sm'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-dark-800 shrink-0">
                  {getIcon(n.type)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{n.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {!n.is_read && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-dark-800 shrink-0"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-16 space-y-2">
          <Bell className="w-8 h-8 text-brand-500 mx-auto" />
          <p className="text-sm font-semibold">No notifications right now.</p>
        </Card>
      )}
    </div>
  );
};
