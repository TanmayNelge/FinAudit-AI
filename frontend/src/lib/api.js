import axios from 'axios'

// Centralized Axios instance so the API base URL lives in one place.
// Defaults to same-origin `/api`, which works both in dev (Vite proxies
// `/api` to the backend) and when the backend serves the built frontend in
// production. Set VITE_API_URL only for a cross-origin deployment.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
})
