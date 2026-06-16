import { SmoothScrollProvider } from '../providers/SmoothScrollProvider';
import { Hero } from '../components/sections/Hero';

/**
 * Home — the cinematic scroll experience.
 * Phase 1 ships the Hero. Phases 4–6 add the 10 storytelling sections:
 * Intro · Hosts · Teams · Groups · MatchCenter · Bracket · PredictionLab ·
 * Players · Simulator · Community — each animating into view.
 */
export default function Home() {
  return (
    <SmoothScrollProvider>
      <main>
        <Hero />
        <section className="mx-auto grid max-w-4xl gap-4 px-6 py-32 text-center">
          <h2 className="font-display text-3xl text-white/80">The scroll experience begins here</h2>
          <p className="text-white/50">
            Phase 1 scaffold. Tournament intro, host countries, teams, groups, match center,
            knockout bracket, AI prediction lab, players, simulator, and community sections land in
            Phases 4–6.
          </p>
        </section>
      </main>
    </SmoothScrollProvider>
  );
}
