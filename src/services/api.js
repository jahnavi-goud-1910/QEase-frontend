import axios from 'axios';

// Backend address: set VITE_API_URL at build time for deployment (with or without the trailing /api).
// Falls back to the local backend for development.
const rawApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/+$/, '');
const API_BASE_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('qease_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle authentication errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('qease_token');
      localStorage.removeItem('qease_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
