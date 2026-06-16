import axios, { type AxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL,
  withCredentials: true, // send/receive the httpOnly refresh cookie
});

/**
 * Token plumbing lives here to avoid a circular import with the auth store.
 * The store registers a getter/setter on boot via `bindAuthBridge`.
 */
type AuthBridge = {
  getAccessToken: () => string | null;
  onRefreshed: (user: unknown, token: string) => void;
  onAuthLost: () => void;
};
let bridge: AuthBridge | null = null;
export function bindAuthBridge(b: AuthBridge) {
  bridge = b;
}

// Attach the access token to every request.
api.interceptors.request.use((config) => {
  const token = bridge?.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Refresh-on-401 with single-flight: concurrent 401s share one refresh call.
let refreshing: Promise<string | null> | null = null;

async function runRefresh(): Promise<string | null> {
  try {
    const { data } = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
    bridge?.onRefreshed(data.data.user, data.data.accessToken);
    return data.data.accessToken as string;
  } catch {
    bridge?.onAuthLost();
    return null;
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as AxiosRequestConfig & { _retried?: boolean };
    const status = error.response?.status;
    const isAuthCall = original?.url?.includes('/auth/');

    if (status === 401 && original && !original._retried && !isAuthCall) {
      original._retried = true;
      refreshing ??= runRefresh().finally(() => {
        refreshing = null;
      });
      const newToken = await refreshing;
      if (newToken) {
        original.headers = { ...original.headers, Authorization: `Bearer ${newToken}` };
        return api(original);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
