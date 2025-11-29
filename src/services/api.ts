// Auto-detect API URL based on current domain
const getApiBaseUrl = (): string => {
  // If VITE_API_URL is set, use it
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Get current origin (e.g., https://nsub.dev or http://localhost:5173)
  const origin = window.location.origin;
  
  // If running on localhost, use localhost:3001 for backend
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return 'http://localhost:3001/api';
  }
  
  // Otherwise, use the same domain as the frontend
  // Assumes backend is on the same domain (e.g., nsub.dev/api)
  const apiUrl = `${origin}/api`;
  console.log('🌐 API URL detected:', apiUrl);
  return apiUrl;
};

const API_BASE_URL = getApiBaseUrl();

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

