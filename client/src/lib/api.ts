import axios from 'axios';
import { getToken, removeToken } from './auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the server rejects a token as invalid/expired, clear local state and
// force a fresh login. Skip the login endpoint itself (wrong-password = 401).
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const isAuthEndpoint = (error.config?.url as string | undefined)
      ?.includes('/auth/login');
    if (error.response?.status === 401 && !isAuthEndpoint) {
      removeToken();
      globalThis.location.replace('/login');
    }
    return Promise.reject(error);
  },
);

export default api;
