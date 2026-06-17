import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import App from './App';
import { AuthProvider } from './providers/AuthProvider';
import { SmoothScrollProvider } from './providers/SmoothScrollProvider';
import { LiveProvider } from './providers/LiveProvider';
import { Toaster } from './components/ui/Toaster';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* reducedMotion="user" makes prefers-reduced-motion a first-class mode */}
      <MotionConfig reducedMotion="user">
        <AuthProvider>
          {/* One global Lenis loop (disabled under reduced motion) */}
          <SmoothScrollProvider>
            {/* Global realtime layer: live score updates + goal toasts (Phase 9) */}
            <LiveProvider>
              <App />
              <Toaster />
            </LiveProvider>
          </SmoothScrollProvider>
        </AuthProvider>
      </MotionConfig>
    </BrowserRouter>
  </React.StrictMode>,
);
