import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const cleanApiUrl = rawApiUrl.replace(/\/+$/, '');
const BASE_URL = cleanApiUrl.endsWith('/api') ? cleanApiUrl : `${cleanApiUrl}/api`;

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT from localStorage on every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('agricycle_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// User-friendly error extraction
client.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      (error.code === 'ECONNABORTED'
        ? 'Request timed out. Please try again.'
        : error.message === 'Network Error'
        ? `Cannot connect to the backend at ${BASE_URL}. Ensure the server is running.`
        : 'Something went wrong. Please try again.');
    error.userMessage = message;
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
  me: () => client.get('/auth/me'),
};

// ─── Residue ──────────────────────────────────────────────────────────────────
export const residueApi = {
  calculate: (data) => client.post('/residue/calculate', data),
};

// ─── Listings ─────────────────────────────────────────────────────────────────
export const listingsApi = {
  create: (data) => client.post('/listings', data),
  list: (params) => client.get('/listings', { params }),
  get: (id) => client.get(`/listings/${id}`),
  update: (id, data) => client.put(`/listings/${id}`, data),
  delete: (id) => client.delete(`/listings/${id}`),
};

// ─── Buyers / Requirements ────────────────────────────────────────────────────
export const buyersApi = {
  list: () => client.get('/buyers'),
  match: (data) => client.post('/buyers/match', data),
  createRequirement: (data) => client.post('/buyers/requirements', data),
  listRequirements: (params) => client.get('/buyers/requirements', { params }),
  getRequirement: (id) => client.get(`/buyers/requirements/${id}`),
  updateRequirement: (id, data) => client.put(`/buyers/requirements/${id}`, data),
  deleteRequirement: (id) => client.delete(`/buyers/requirements/${id}`),
};

// ─── Transport ────────────────────────────────────────────────────────────────
export const transportApi = {
  calculate: (data) => client.post('/transport/calculate', data),
};

// ─── Opportunities ────────────────────────────────────────────────────────────
export const opportunitiesApi = {
  analyze: (data) => client.post('/opportunities/analyze', data),
  list: (params) => client.get('/opportunities', { params }),
  get: (id) => client.get(`/opportunities/${id}`),
};

// ─── Health ───────────────────────────────────────────────────────────────────
export const healthApi = {
  check: () => client.get('/health'),
};

export default client;
