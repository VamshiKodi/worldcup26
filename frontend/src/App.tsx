import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Route-level code splitting (Phase 8 performance target)
const Home = lazy(() => import('./pages/Home'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <div className="min-h-screen bg-bg text-white">
      <Navbar />
      <Suspense fallback={<div className="grid min-h-screen place-items-center text-primary">Loading…</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Phase 4 adds: /teams /players /matches /bracket /leaderboard /predictions /admin /login */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Footer />
    </div>
  );
}
