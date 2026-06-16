import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  build: {
    target: 'es2020',
    sourcemap: false,
    // `three` is a deliberately large, lazy-loaded vendor chunk (hero only) — it
    // never blocks first paint, so the default 500 kB warning is noise here.
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          motion: ['framer-motion', 'gsap', 'lenis'],
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
