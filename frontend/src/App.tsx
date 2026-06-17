import { Suspense, lazy, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ScrollProgressBar } from './components/motion/ScrollProgressBar';
import { PageTransition } from './components/motion/PageTransition';
import { scrollToTop } from './providers/SmoothScrollProvider';

// Route-level code splitting (Phase 8 performance target)
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Teams = lazy(() => import('./pages/Teams'));
const Players = lazy(() => import('./pages/Players'));
const Matches = lazy(() => import('./pages/Matches'));
const MatchDetail = lazy(() => import('./pages/MatchDetail'));
const Groups = lazy(() => import('./pages/Groups'));
const Bracket = lazy(() => import('./pages/Bracket'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Predictions = lazy(() => import('./pages/Predictions'));
const AiLab = lazy(() => import('./pages/AiLab'));
const Simulator = lazy(() => import('./pages/Simulator'));
const Admin = lazy(() => import('./pages/Admin'));
const NotFound = lazy(() => import('./pages/NotFound'));

const Loader = () => <div className="grid min-h-screen place-items-center text-primary">Loading…</div>;

export default function App() {
  const location = useLocation();

  useEffect(() => {
    scrollToTop(true);
    // Pinned/scrubbed triggers must recompute once the new page has laid out.
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-bg text-white">
      <ScrollProgressBar />
      <Navbar />
      <AnimatePresence mode="wait">
        <PageTransition key={location.pathname}>
          <Suspense fallback={<Loader />}>
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/players" element={<Players />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/matches/:id" element={<MatchDetail />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/bracket" element={<Bracket />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/lab" element={<AiLab />} />
              <Route path="/simulator" element={<Simulator />} />
              <Route
                path="/predictions"
                element={
                  <ProtectedRoute>
                    <Predictions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </PageTransition>
      </AnimatePresence>
      <Footer />
    </div>
  );
}
