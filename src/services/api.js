// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://lmgtech-e1q0.onrender.com',
});

// ✅ Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('merchantToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
