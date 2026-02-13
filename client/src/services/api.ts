import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  login: (credentials: { username: string; password: string }) =>
    api.post('/api/auth/login', credentials),
  register: (userData: any) =>
    api.post('/api/auth/register', userData),
  logout: () =>
    api.post('/api/auth/logout'),
  getProfile: () =>
    api.get('/api/auth/profile'),
};

// User endpoints
export const userApi = {
  getUsers: () =>
    api.get('/api/users'),
  getUser: (id: number) =>
    api.get(`/api/users/${id}`),
  createUser: (userData: any) =>
    api.post('/api/users', userData),
  updateUser: (id: number, userData: any) =>
    api.put(`/api/users/${id}`, userData),
  deleteUser: (id: number) =>
    api.delete(`/api/users/${id}`),
};

// Channel endpoints
export const channelApi = {
  getChannels: () =>
    api.get('/api/channels'),
  getChannel: (id: number) =>
    api.get(`/api/channels/${id}`),
  createChannel: (channelData: any) =>
    api.post('/api/channels', channelData),
  updateChannel: (id: number, channelData: any) =>
    api.put(`/api/channels/${id}`, channelData),
  deleteChannel: (id: number) =>
    api.delete(`/api/channels/${id}`),
};

// Order endpoints
export const orderApi = {
  getOrders: () =>
    api.get('/api/orders'),
  getOrder: (id: number) =>
    api.get(`/api/orders/${id}`),
  createOrder: (orderData: any) =>
    api.post('/api/orders', orderData),
  updateOrder: (id: number, orderData: any) =>
    api.put(`/api/orders/${id}`, orderData),
  deleteOrder: (id: number) =>
    api.delete(`/api/orders/${id}`),
};

// Daifu endpoints
export const daifuApi = {
  getDaifus: () =>
    api.get('/api/daifu'),
  getDaifu: (id: number) =>
    api.get(`/api/daifu/${id}`),
  createDaifu: (daifuData: any) =>
    api.post('/api/daifu', daifuData),
  updateDaifu: (id: number, daifuData: any) =>
    api.put(`/api/daifu/${id}`, daifuData),
  deleteDaifu: (id: number) =>
    api.delete(`/api/daifu/${id}`),
};

// Report endpoints
export const reportApi = {
  getReports: () =>
    api.get('/api/reports'),
  getFinancialReport: () =>
    api.get('/api/reports/financial'),
  getBonusReport: () =>
    api.get('/api/reports/bonus'),
};

// Bonus endpoints
export const bonusApi = {
  getBonuses: () =>
    api.get('/api/bonuses'),
  getBonus: (id: number) =>
    api.get(`/api/bonuses/${id}`),
  createBonus: (bonusData: any) =>
    api.post('/api/bonuses', bonusData),
  updateBonus: (id: number, bonusData: any) =>
    api.put(`/api/bonuses/${id}`, bonusData),
  deleteBonus: (id: number) =>
    api.delete(`/api/bonuses/${id}`),
};

export default api;
