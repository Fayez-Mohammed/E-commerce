import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useLanguageStore } from '@/stores/languageStore';

const DEFAULT_API_URL = 'https://bestwallshop.runasp.net';
const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_URL).trim().replace(/\/+$/, '');
export const API_BASE_URL = rawBaseUrl.endsWith('/api') ? rawBaseUrl.slice(0, -4) : rawBaseUrl;

export const api = axios.create({
  baseURL: API_BASE_URL ? `${API_BASE_URL}/api` : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper for formatting static image URLs
export const getImageUrl = (path: string | null | undefined): string => {
  if (!path) {
    return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80';
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (API_BASE_URL) {
    return `${API_BASE_URL}${cleanPath}`;
  }
  return cleanPath;
};

// Request Interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('wallsshop-token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const currentLang = useLanguageStore.getState().language || 'ar';
    if (config.headers) {
      config.headers['Accept-Language'] = currentLang;
    }

    // Automatically append LanguageCode to query params if not present
    const params = config.params || {};
    if (!params.LanguageCode && !params.languageCode) {
      params.LanguageCode = currentLang;
    }
    config.params = params;

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ response?: string | any; message?: string; errors?: any }>) => {
    if (error.response?.status === 401) {
      // Clear token if invalid or expired
      const token = localStorage.getItem('wallsshop-token');
      if (token) {
        localStorage.removeItem('wallsshop-token');
        localStorage.removeItem('wallsshop-user');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

// Helper for extracting API error messages
export const getErrorMessage = (error: unknown, fallback = 'حدث خطأ غير متوقع'): string => {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data;
    if (typeof data === 'string') return data;
    if (data.response && typeof data.response === 'string') return data.response;
    if (data.message && typeof data.message === 'string') return data.message;
    if (data.response && Array.isArray(data.response)) {
      return data.response.map((e: any) => e.description || e).join(', ');
    }
    if (data.errors && typeof data.errors === 'object') {
      const msgs = Object.values(data.errors).flat();
      if (msgs.length > 0) return msgs.join(', ');
    }
  }
  if (error instanceof Error) return error.message;
  return fallback;
};

// Helper for normalizing order status in both English and Arabic
export type NormalizedOrderStatus = 'Confirmed' | 'Canceled' | 'Pending';

export const normalizeOrderStatus = (status?: string | null): NormalizedOrderStatus => {
  if (!status) return 'Pending';
  const s = status.trim().toLowerCase();
  if (
    s === 'confirmed' ||
    s === 'مؤكد' ||
    s === 'تم التاكيد' ||
    s === 'تم التأكيد' ||
    s === 'مكتمل'
  ) {
    return 'Confirmed';
  }
  if (
    s === 'canceled' ||
    s === 'cancelled' ||
    s === 'ملغي' ||
    s === 'تم الإلغاء' ||
    s === 'تم الالغاء'
  ) {
    return 'Canceled';
  }
  return 'Pending';
};

