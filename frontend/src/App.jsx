import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import { AppLayout } from './layouts/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { MemoriesPage } from './pages/MemoriesPage';
import { PeoplePage } from './pages/PeoplePage';
import { PersonDetailPage } from './pages/PersonDetailPage';
import { TimelinePage } from './pages/TimelinePage';
import { EventsPage } from './pages/EventsPage';
import { GiftMatePage } from './pages/GiftMatePage';
import { AIChatPage } from './pages/AIChatPage';
import { AIInsightsPage } from './pages/AIInsightsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950 text-slate-400">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Only Route (e.g. login/register redirect to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Marketing Landing */}
              <Route path="/" element={<LandingPage />} />

              {/* Public Auth Routes */}
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
              <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

              {/* Protected Application Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/memories" element={<MemoriesPage />} />
                <Route path="/people" element={<PeoplePage />} />
                <Route path="/people/:id" element={<PersonDetailPage />} />
                <Route path="/timeline" element={<TimelinePage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/giftmate" element={<GiftMatePage />} />
                <Route path="/chat" element={<AIChatPage />} />
                <Route path="/insights" element={<AIInsightsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
