import axios from 'axios';
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080' });
api.interceptors.request.use(c => { const t = localStorage.getItem('qease_token'); if (t) c.headers.Authorization = 'Bearer ' + t; return c; });
api.interceptors.response.use(r => r, e => {            // expired/invalid login -> back to the login page
  if (e.response?.status === 401 && !e.config.url.includes('/auth/')) { localStorage.clear(); location.href = '/login'; }
  return Promise.reject(e); });
export const errMsg = e => e.response?.data?.error || (e.request ? 'Cannot reach the server. Is the backend running?' : e.message);
export const get = url => api.get(url).then(r => r.data);
