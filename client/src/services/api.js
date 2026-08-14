import axios from 'axios';

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000/api';
  }
  return 'https://api.jalyn.in/api';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to attach JWT token from Zustand store
api.interceptors.request.use(
  (config) => {
    const userStoreStr = localStorage.getItem('jalyn-user');
    if (userStoreStr) {
      try {
        const parsed = JSON.parse(userStoreStr);
        const token = parsed?.state?.token;
        if (token && token !== 'null' && token !== 'undefined') {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error('Error parsing jalyn-user store for token:', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

