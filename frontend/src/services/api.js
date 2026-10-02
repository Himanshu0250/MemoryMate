import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach bearer token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('memorymate_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: auto logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and not already on auth page, clean token
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register') && window.location.pathname !== '/') {
        localStorage.removeItem('memorymate_token');
        localStorage.removeItem('memorymate_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
