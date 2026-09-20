import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
const HOST_BASE_URL = cleanApiUrl.endsWith('/api') ? cleanApiUrl.slice(0, -4) : cleanApiUrl;

const apiClient = axios.create({
  baseURL: HOST_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage on every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('agricycle_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      (error.code === 'ECONNABORTED'
        ? 'Request timed out. Please try again.'
        : error.message === 'Network Error'
        ? 'Cannot connect to the server. Please ensure the backend is running on ' + API_BASE_URL
        : 'Something went wrong. Please try again.');

    // Attach user-friendly message to the error object
    error.userMessage = message;
    return Promise.reject(error);
  }
);

export default apiClient;
