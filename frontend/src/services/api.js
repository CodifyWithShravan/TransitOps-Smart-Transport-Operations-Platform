import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('transitops_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling 401 errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('transitops_token');
      localStorage.removeItem('transitops_user');
      window.location.href = '/';
    }
    
    // Extract backend error message if available
    const message = error.response?.data?.message || error.message || 'API Error';
    return Promise.reject(new Error(message));
  }
);

// ==========================================
// AUTHENTICATION APIs
// ==========================================
export const authApi = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (payload) => apiClient.post('/auth/register', payload),
  getCurrentUser: () => apiClient.get('/users/me'),
};

// ==========================================
// DASHBOARD & ANALYTICS APIs
// ==========================================
export const dashboardApi = {
  getKPIs: () => apiClient.get('/dashboard'),
  getVehicleAnalytics: () => apiClient.get('/dashboard/analytics/vehicles'),
};

// ==========================================
// FLEET VEHICLE APIs
// ==========================================
export const vehicleApi = {
  getAll: (status) =>
    apiClient.get(status && status !== 'All' ? `/vehicles?status=${status}` : '/vehicles'),
  getById: (id) => apiClient.get(`/vehicles/${id}`),
  create: (vehicleData) => apiClient.post('/vehicles', vehicleData),
  update: (id, vehicleData) => apiClient.put(`/vehicles/${id}`, vehicleData),
  delete: (id) => apiClient.delete(`/vehicles/${id}`),
};

// ==========================================
// DRIVER APIs
// ==========================================
export const driverApi = {
  getAll: (status) =>
    apiClient.get(status && status !== 'All' ? `/drivers?status=${status}` : '/drivers'),
  getById: (id) => apiClient.get(`/drivers/${id}`),
  create: (driverData) => apiClient.post('/drivers', driverData),
};

// ==========================================
// TRIP APIs
// ==========================================
export const tripApi = {
  getAll: (status) =>
    apiClient.get(status && status !== 'All' ? `/trips?status=${status}` : '/trips'),
  create: (tripData) => apiClient.post('/trips', tripData),
  dispatch: (id) => apiClient.patch(`/trips/${id}/dispatch`),
  complete: (id) => apiClient.patch(`/trips/${id}/complete`),
  cancel: (id) => apiClient.patch(`/trips/${id}/cancel`),
};

// ==========================================
// MAINTENANCE APIs
// ==========================================
export const maintenanceApi = {
  getAll: (status) =>
    apiClient.get(status && status !== 'All' ? `/maintenance?status=${status}` : '/maintenance'),
  create: (maintenanceData) => apiClient.post('/maintenance', maintenanceData),
  complete: (id) => apiClient.patch(`/maintenance/${id}/close`),
  close: (id) => apiClient.patch(`/maintenance/${id}/close`),
};

// ==========================================
// FUEL & EXPENSE APIs
// ==========================================
export const fuelApi = {
  getAll: () => apiClient.get('/fuel-logs'),
  create: (data) => apiClient.post('/fuel-logs', data),
};

export const expenseApi = {
  getAll: () => apiClient.get('/expenses'),
  create: (data) => apiClient.post('/expenses', data),
};
