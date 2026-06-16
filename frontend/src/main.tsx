import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import App from './App';
import { AuthProvider } from './providers/AuthProvider';
import { SmoothScrollProvider } from './providers/SmoothScrollProvider';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* reducedMotion="user" makes prefers-reduced-motion a first-class mode */}
      <MotionConfig reducedMotion="user">
        <AuthProvider>
          {/* One global Lenis loop (disabled under reduced motion) */}
          <SmoothScrollProvider>
            <App />
          </SmoothScrollProvider>
        </AuthProvider>
      </MotionConfig>
    </BrowserRouter>
  </React.StrictMode>,
);
