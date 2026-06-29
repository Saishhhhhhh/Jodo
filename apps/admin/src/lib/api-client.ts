import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach access token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });
  failedQueue = [];
}

// Response interceptor — handle 401 with token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request while we wait for refresh
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(`${API_URL}/api/admin/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', newRefreshToken);

        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear auth and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ── API functions ──

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/admin/auth/login', { email, password }),
  logout: (refreshToken: string) =>
    apiClient.post('/admin/auth/logout', { refreshToken }),
  me: () => apiClient.get('/admin/auth/me'),
};

export const dashboardApi = {
  summary: () => apiClient.get('/admin/dashboard/summary'),
};

export const staffApi = {
  list: (params?: Record<string, unknown>) => apiClient.get('/admin/staff', { params }),
  roles: () => apiClient.get('/admin/staff/roles'),
  create: (data: Record<string, unknown>) => apiClient.post('/admin/staff', data),
  update: (id: string, data: Record<string, unknown>) => apiClient.put(`/admin/staff/${id}`, data),
  delete: (id: string) => apiClient.delete(`/admin/staff/${id}`),
};

export const productsApi = {
  list: (params?: Record<string, unknown>) => apiClient.get('/admin/products', { params }),
  create: (data: any) => apiClient.post('/admin/products', data),
  update: (id: string, data: any) => apiClient.put(`/admin/products/${id}`, data),
  delete: (id: string) => apiClient.delete(`/admin/products/${id}`),
};

export const ordersApi = {
  list: (params?: Record<string, unknown>) => apiClient.get('/admin/orders', { params }),
};

export const customersApi = {
  list: (params?: Record<string, unknown>) => apiClient.get('/admin/customers', { params }),
};

export const inventoryApi = {
  list: (params?: Record<string, unknown>) => apiClient.get('/admin/inventory', { params }),
  update: (id: string, data: any) => apiClient.put(`/admin/inventory/${id}`, data),
};

export const discountsApi = {
  list: (params?: Record<string, unknown>) => apiClient.get('/admin/discounts', { params }),
};

export const appsApi = {
  list: (params?: Record<string, unknown>) => apiClient.get('/admin/apps', { params }),
};

export const storeApi = {
  get: () => apiClient.get('/admin/store'),
  update: (data: Record<string, unknown>) => apiClient.put('/admin/store', data),
};

export const auditLogsApi = {
  list: () => apiClient.get('/admin/audit-logs'),
};

export const collectionsApi = {
  list: () => apiClient.get('/admin/collections'),
  create: (data: any) => apiClient.post('/admin/collections', data),
  update: (id: string, data: any) => apiClient.put(`/admin/collections/${id}`, data),
  delete: (id: string) => apiClient.delete(`/admin/collections/${id}`),
};

export const giftCardsApi = {
  list: () => apiClient.get('/admin/gift-cards'),
  create: (data: any) => apiClient.post('/admin/gift-cards', data),
  update: (id: string, data: any) => apiClient.put(`/admin/gift-cards/${id}`, data),
  delete: (id: string) => apiClient.delete(`/admin/gift-cards/${id}`),
};
