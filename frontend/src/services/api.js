const BASE_URL = 'http://localhost:8080/api';

/**
 * Helper function to handle fetch requests with JSON parsing and error throwing.
 */
async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Add Authorization header if token exists in localStorage
  const token = localStorage.getItem('transitops_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.statusText}`);
  }

  return response.json();
}

// ==========================================
// AUTHENTICATION APIs
// ==========================================
export const authApi = {
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (payload) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getCurrentUser: () => request('/users/me'),
};

// ==========================================
// DASHBOARD & ANALYTICS APIs
// ==========================================
export const dashboardApi = {
  getKPIs: () => request('/dashboard'),
  getVehicleAnalytics: () => request('/dashboard/analytics/vehicles'),
};

// ==========================================
// FLEET VEHICLE APIs
// ==========================================
export const vehicleApi = {
  getAll: (status) =>
    request(status && status !== 'All' ? `/vehicles?status=${status}` : '/vehicles'),

  getById: (id) => request(`/vehicles/${id}`),

  create: (vehicleData) =>
    request('/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicleData),
    }),

  update: (id, vehicleData) =>
    request(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vehicleData),
    }),

  delete: (id) =>
    request(`/vehicles/${id}`, {
      method: 'DELETE',
    }),
};

// ==========================================
// DRIVER APIs
// ==========================================
export const driverApi = {
  getAll: (status) =>
    request(status && status !== 'All' ? `/drivers?status=${status}` : '/drivers'),

  getById: (id) => request(`/drivers/${id}`),

  create: (driverData) =>
    request('/drivers', {
      method: 'POST',
      body: JSON.stringify(driverData),
    }),
};

// ==========================================
// TRIP APIs
// ==========================================
export const tripApi = {
  getAll: (status) =>
    request(status && status !== 'All' ? `/trips?status=${status}` : '/trips'),

  create: (tripData) =>
    request('/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
    }),

  dispatch: (id) =>
    request(`/trips/${id}/dispatch`, {
      method: 'POST',
    }),

  complete: (id) =>
    request(`/trips/${id}/complete`, {
      method: 'POST',
    }),

  cancel: (id) =>
    request(`/trips/${id}/cancel`, {
      method: 'POST',
    }),
};
