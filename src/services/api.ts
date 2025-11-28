const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function for authenticated requests
const getAuthHeader = (): string => {
  const password = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';
  return `Bearer ${password}`;
};

// Generic fetch wrapper
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Timeline API
export const timelineAPI = {
  getAll: () => apiRequest<any[]>('/timeline'),
  create: (item: any) => apiRequest<any>('/timeline', {
    method: 'POST',
    headers: { Authorization: getAuthHeader() },
    body: JSON.stringify(item),
  }),
  update: (id: string, item: any) => apiRequest<any>(`/timeline/${id}`, {
    method: 'PUT',
    headers: { Authorization: getAuthHeader() },
    body: JSON.stringify(item),
  }),
  delete: (id: string) => apiRequest<any>(`/timeline/${id}`, {
    method: 'DELETE',
    headers: { Authorization: getAuthHeader() },
  }),
};

// Career API
export const careerAPI = {
  getAll: () => apiRequest<any[]>('/career'),
  create: (item: any) => apiRequest<any>('/career', {
    method: 'POST',
    headers: { Authorization: getAuthHeader() },
    body: JSON.stringify(item),
  }),
  update: (id: string, item: any) => apiRequest<any>(`/career/${id}`, {
    method: 'PUT',
    headers: { Authorization: getAuthHeader() },
    body: JSON.stringify(item),
  }),
  delete: (id: string) => apiRequest<any>(`/career/${id}`, {
    method: 'DELETE',
    headers: { Authorization: getAuthHeader() },
  }),
};

// Shitposts API
export const shitpostsAPI = {
  getAll: () => apiRequest<any[]>('/shitposts'),
  create: (item: any) => apiRequest<any>('/shitposts', {
    method: 'POST',
    headers: { Authorization: getAuthHeader() },
    body: JSON.stringify(item),
  }),
  update: (id: string, item: any) => apiRequest<any>(`/shitposts/${id}`, {
    method: 'PUT',
    headers: { Authorization: getAuthHeader() },
    body: JSON.stringify(item),
  }),
  delete: (id: string) => apiRequest<any>(`/shitposts/${id}`, {
    method: 'DELETE',
    headers: { Authorization: getAuthHeader() },
  }),
};

