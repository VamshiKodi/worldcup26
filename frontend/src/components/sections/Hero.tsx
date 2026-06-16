import { Suspense, lazy, useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useMouseFollow } from '../../hooks/useMouseFollow';

// Three.js stays out of the initial bundle — only fetched for the hero.
const HeroCanvas = lazy(() => import('../three/HeroCanvas'));

/**
 * Hero — R3F trophy + particles behind a parallaxed headline, with a pointer-driven
 * ambient glow. Under reduced motion the canvas is skipped for a static gradient poster.
 */
export function Hero() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  // Mount the canvas only while the hero is on screen (frees the GPU when scrolled away).
  const inView = useInView(sectionRef, { margin: '0px 0px -20% 0px' });
  const { x, y } = useMouseFollow();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduced ? 1 : 0]);

  // Pointer-parallaxed glow offsets.
  const glowX = useTransform(x, [-1, 1], [-30, 30]);
  const glowY = useTransform(y, [-1, 1], [-30, 30]);

  const showCanvas = !reduced && inView;

  return (
    <section ref={sectionRef} className="relative grid min-h-screen place-items-center overflow-hidden px-6">
      {/* Ambient glow — also the poster fallback while the canvas loads / under reduced motion. */}
      <motion.div style={{ x: glowX, y: glowY }} className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute right-1/4 top-1/2 h-80 w-80 rounded-full bg-accent/10 blur-[100px]" />
      </motion.div>

      {/* 3D trophy layer */}
      <div className="pointer-events-none absolute inset-0">
        <Suspense fallback={null}>{showCanvas && <HeroCanvas tiltX={x} tiltY={y} />}</Suspense>
      </div>

      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="relative z-10 max-w-4xl text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4 text-sm uppercase tracking-[0.3em] text-secondary"
        >
          FIFA World Cup 2026 Prediction Experience
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display text-5xl font-bold leading-[1.05] sm:text-7xl"
        >
          PREDICT THE <span className="text-gradient">ROAD TO GLORY</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex items-center justify-center gap-4"
        >
          <Link to="/predictions">
            <Button variant="primary">Predict Now</Button>
          </Link>
          <Link to="/teams">
            <Button variant="ghost">Explore Tournament</Button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40"
      >
        <motion.div
          animate={reduced ? undefined : { y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-1 text-xs uppercase tracking-widest"
        >
          Scroll
          <span aria-hidden>↓</span>
        </motion.div>
      </motion.div>
    </section>
  );
}
