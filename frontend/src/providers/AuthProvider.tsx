import { useEffect, type ReactNode } from 'react';
import { bindAuthBridge } from '../lib/api';
import { useAuth, type AuthUser } from '../store/authSlice';

/**
 * Connects the Axios token bridge to the auth store and restores a session on boot.
 * Mounted once near the root.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const loadMe = useAuth((s) => s.loadMe);

  useEffect(() => {
    bindAuthBridge({
      getAccessToken: () => useAuth.getState().accessToken,
      onRefreshed: (user, token) =>
        useAuth.getState().setSession(user as AuthUser, token as string),
      onAuthLost: () => useAuth.setState({ user: null, accessToken: null, status: 'guest' }),
    });
    void loadMe();
  }, [loadMe]);

  return <>{children}</>;
}
