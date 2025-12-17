// Auto-detect API URL based on current domain
const getApiBaseUrl = (): string => {
  // If VITE_API_URL is set, use it (highest priority)
  if (import.meta.env.VITE_API_URL) {
    console.log('🌐 Using API URL from env:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  // Get current origin (e.g., https://nsub.dev or http://localhost:5173)
  const origin = window.location.origin;
  
  // If running on localhost, use localhost:3001 for backend
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return 'http://localhost:3001/api';
  }
  
  // For production, try common backend patterns:
  // 1. Same domain with /api path (if backend is proxied)
  // 2. api subdomain (e.g., api.nsub.dev)
  // 3. Different port (if backend is on same server)
  
  // Try api subdomain first (common pattern)
  try {
    const hostname = window.location.hostname;
    // Remove www. if present
    const domain = hostname.replace(/^www\./, '');
    const apiSubdomain = `https://api.${domain}/api`;
    console.log('🌐 Trying API subdomain:', apiSubdomain);
    // Note: We can't test this here, but this is a common pattern
    // You can set VITE_API_URL if your backend is at a different location
  } catch (e) {
    // Ignore
  }
  
  // Default: use same domain with /api path
  // This assumes your backend is proxied to /api or served from the same domain
  const apiUrl = `${origin}/api`;
  console.log('🌐 API URL detected:', apiUrl);
  console.log('💡 If backend is at a different URL, set VITE_API_URL in your build environment');
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
    const error = await response.json().catch(() => ({ 
      error: response.status === 404 
        ? `API endpoint not found. Make sure your backend server is running and accessible at ${API_BASE_URL}`
        : `HTTP error! status: ${response.status}`
    }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Timeline API
export const timelineAPI = {
  getAll: () => apiRequest<any[]>('/timeline'),
  create: (item: any) => {
    console.log('timelineAPI.create called with:', {
      item,
      hasMarkdown: !!item.markdownContent,
      markdownLength: item.markdownContent?.length || 0,
      stringified: JSON.stringify(item)
    });
    return apiRequest<any>('/timeline', {
      method: 'POST',
      headers: { Authorization: getAuthHeader() },
      body: JSON.stringify(item),
    });
  },
  update: (id: string, item: any) => {
    console.log('timelineAPI.update called with:', {
      id,
      item,
      hasMarkdown: !!item.markdownContent,
      markdownLength: item.markdownContent?.length || 0,
      stringified: JSON.stringify(item)
    });
    return apiRequest<any>(`/timeline/${id}`, {
      method: 'PUT',
      headers: { Authorization: getAuthHeader() },
      body: JSON.stringify(item),
    });
  },
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

