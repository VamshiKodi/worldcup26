import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL,
  withCredentials: true, // send refresh cookie
});

// Phase 3 attaches the access-token interceptor + refresh-on-401 retry here.
export default api;
