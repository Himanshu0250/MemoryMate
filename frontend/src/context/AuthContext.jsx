import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { useNotify } from './NotificationContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('memorymate_token'));
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotify();

  const fetchCurrentUser = useCallback(async () => {
    if (!localStorage.getItem('memorymate_token')) {
      setLoading(false);
      return;
    }
    try {
      const userData = await authService.getMe();
      setUser(userData);
      localStorage.setItem('memorymate_user', JSON.stringify(userData));
    } catch (err) {
      console.error('Failed to load current user:', err);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login({ email, password });
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem('memorymate_token', data.access_token);
      localStorage.setItem('memorymate_user', JSON.stringify(data.user));
      showToast(`Welcome back, ${data.user.name}!`, 'success');
      return data;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid email or password';
      showToast(msg, 'error');
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const data = await authService.register({ name, email, password });
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem('memorymate_token', data.access_token);
      localStorage.setItem('memorymate_user', JSON.stringify(data.user));
      showToast(`Account created! Welcome to MemoryMate, ${data.user.name}`, 'success');
      return data;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed';
      showToast(msg, 'error');
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (googlePayload) => {
    setLoading(true);
    try {
      const data = await authService.loginWithGoogle(googlePayload);
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem('memorymate_token', data.access_token);
      localStorage.setItem('memorymate_user', JSON.stringify(data.user));
      showToast(`Signed in with Google as ${data.user.name}!`, 'success');
      return data;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Google authentication failed';
      showToast(msg, 'error');
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('memorymate_token');
    localStorage.removeItem('memorymate_user');
    showToast('You have been logged out.', 'info');
  };

  const updateProfile = async (updates) => {
    try {
      const updated = await authService.updateProfile(updates);
      setUser(updated);
      localStorage.setItem('memorymate_user', JSON.stringify(updated));
      showToast('Profile updated successfully!', 'success');
      return updated;
    } catch (err) {
      showToast('Failed to update profile', 'error');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        loginWithGoogle,
        logout,
        updateProfile,
        refreshUser: fetchCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
