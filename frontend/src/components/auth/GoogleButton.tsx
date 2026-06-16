import { useEffect, useRef } from 'react';
import { useAuth } from '../../store/authSlice';

// Minimal typing for the Google Identity Services global.
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: { client_id: string; callback: (r: { credential: string }) => void }) => void;
          renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
        };
      };
    };
  }
}

const GSI_SRC = 'https://accounts.google.com/gsi/client';
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/** Renders the official Google Sign-In button. Hidden when no client id is configured. */
export function GoogleButton() {
  const ref = useRef<HTMLDivElement>(null);
  const loginWithGoogle = useAuth((s) => s.loginWithGoogle);

  useEffect(() => {
    if (!CLIENT_ID || !ref.current) return;

    function init() {
      if (!window.google || !ref.current) return;
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (r) => void loginWithGoogle(r.credential),
      });
      window.google.accounts.id.renderButton(ref.current, {
        theme: 'filled_black',
        size: 'large',
        shape: 'pill',
        width: 280,
      });
    }

    if (window.google) {
      init();
    } else {
      const script = document.createElement('script');
      script.src = GSI_SRC;
      script.async = true;
      script.onload = init;
      document.head.appendChild(script);
    }
  }, [loginWithGoogle]);

  if (!CLIENT_ID) return null;
  return <div ref={ref} className="flex justify-center" />;
}
