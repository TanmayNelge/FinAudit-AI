import axios from 'axios'

// Centralized Axios instance so the API base URL lives in one place.
// With no VITE_API_URL the baseURL is empty and api calls use their full
// routes (`/api/...`). Those resolve against the page origin, which works in
// dev (Vite proxies `/api` to the backend) and in production (Express serves
// the built frontend). Set VITE_API_URL to an absolute URL for a cross-origin
// deployment (e.g. http://localhost:5000) — axios prepends it to `/api/...`.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true,
})
