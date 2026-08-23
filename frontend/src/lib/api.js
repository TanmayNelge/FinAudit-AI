import axios from 'axios'

// Centralized Axios instance so the API base URL lives in one place
// (configurable via VITE_API_URL) instead of being hardcoded per-component.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
})
