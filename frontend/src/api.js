const getBaseURL = () => {
  if (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__.API_URL) {
    return window.__ENV__.API_URL;
  }
  if (typeof window !== 'undefined') {
    const isLocal = window.location.protocol === 'file:' ||
                    window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1';
    return isLocal ? 'http://localhost:5000/api' : '/api';
  }
  return 'http://localhost:5000/api';
};

const BASE_URL = getBaseURL();

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = (data && data.message) ? data.message : `HTTP error ${response.status}`;
      throw new Error(errorMsg);
    }
    return data;
  } catch (err) {
    console.warn(`[API] Error querying ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  getBaseURL,
  getDashboardStats: () => request('/dashboard/stats'),
  getMonthlySalesTrends: () => request('/dashboard/trends'),
  getOrders: (status = 'All', page = 1, limit = 10) =>
    request(`/orders?status=${encodeURIComponent(status)}&page=${page}&limit=${limit}`),
  getOrderCounts: () => request('/orders/counts'),
  getOrderById: (id) => request(`/orders/${id}`),
  createOrder: (payload) => request('/orders', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  approveOrder: (id) => request(`/orders/${id}/approve`, { method: 'POST' }),
  completeOrder: (id) => request(`/orders/${id}/complete`, { method: 'POST' }),
  cancelOrder: (id) => request(`/orders/${id}/cancel`, { method: 'POST' }),
  returnOrder: (id) => request(`/orders/${id}/return`, { method: 'POST' }),
  getInventory: () => request('/inventory'),
  getLowStockItems: () => request('/inventory/low-stock'),
};
