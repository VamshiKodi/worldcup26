import { motion } from 'framer-motion';
import { Button } from '../ui/Button';

/**
 * Hero — Phase 1 static-but-styled version with Framer entrance.
 * Phase 5 replaces the backdrop with the R3F 3D trophy + particles + animated world map,
 * and adds scroll-driven transform into the tournament overview.
 */
export function Hero() {
  return (
    <section className="relative grid min-h-screen place-items-center overflow-hidden px-6">
      {/* Ambient glow placeholder for the future 3D trophy / particles */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute right-1/4 top-1/2 h-80 w-80 rounded-full bg-accent/10 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl text-center">
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
          <Button variant="primary">Predict Now</Button>
          <Button variant="ghost">Explore Tournament</Button>
        </motion.div>
      </div>
    </section>
  );
}
