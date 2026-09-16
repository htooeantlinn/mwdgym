import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Response interceptor for unified error formatting
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Silence expected 401s for auth check & public shop (no console spam)
      const url = error.config?.url || "";
      if (error.response.status === 401 && (url.includes("/auth/me") || url.includes("/coin-shop/packages"))) {
        return Promise.reject(error);
      }
      const message = error.response.data?.error || error.response.data?.message || 'An error occurred';
      return Promise.reject(new Error(message));
    }
    return Promise.reject(error);
  }
);

export default api;
