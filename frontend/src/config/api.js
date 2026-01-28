// API Configuration - Use environment variable for production
const isDev = import.meta.env.DEV

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (isDev ? 'http://localhost:5000' : window.location.origin)

export const API_URL = `${API_BASE_URL}/api`
