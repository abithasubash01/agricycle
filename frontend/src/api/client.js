import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
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
