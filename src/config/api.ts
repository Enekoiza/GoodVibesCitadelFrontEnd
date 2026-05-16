const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL?.trim();

if (!backendBaseUrl) {
  throw new Error('Missing required environment variable: VITE_BACKEND_BASE_URL');
}

export const API_BASE_URL = backendBaseUrl.replace(/\/+$/, '');

export const apiUrl = (path: string) => `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
