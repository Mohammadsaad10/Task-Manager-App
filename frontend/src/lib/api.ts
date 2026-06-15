import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
  withCredentials: true, // Send HTTP-only cookies with every request
});

// Response interceptor — handle 401 globally (except for login/signup)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/signup');
    
    if (error.response?.status === 401 && typeof window !== 'undefined' && !isAuthRoute) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
