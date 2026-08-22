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

// Response Interceptor: expire the session on any 401 (stale/invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/google');
    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('jalyn-user');
      window.dispatchEvent(new Event('jalyn-session-expired'));
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  google: (data) => api.post('/auth/google', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
  getAddresses: () => api.get('/auth/addresses'),
  createAddress: (data) => api.post('/auth/addresses', data),
  updateAddress: (id, data) => api.put(`/auth/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/auth/addresses/${id}`),
};

export default api;

