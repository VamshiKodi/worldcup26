import { Link } from 'react-router-dom';
import { SmoothScrollProvider } from '../providers/SmoothScrollProvider';
import { Hero } from '../components/sections/Hero';
import { StatsBand } from '../components/sections/StatsBand';
import { TopScorers } from '../components/sections/TopScorers';

const EXPLORE = [
  { to: '/teams', title: 'Teams', desc: '48 nations, ranked and grouped.' },
  { to: '/groups', title: 'Groups', desc: '12 groups, live standings.' },
  { to: '/matches', title: 'Matches', desc: 'Every fixture and result.' },
  { to: '/bracket', title: 'Bracket', desc: 'The knockout road to the final.' },
  { to: '/players', title: 'Players', desc: 'The golden boot contenders.' },
  { to: '/leaderboard', title: 'Leaderboard', desc: 'See who predicts best.' },
];

/**
 * Home — the cinematic scroll experience.
 * Phase 4 wires real data sections; Phase 5 layers in Lenis + GSAP scroll animations
 * and the R3F hero.
 */
export default function Home() {
  return (
    <SmoothScrollProvider>
      <main>
        <Hero />
        <StatsBand />

        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-secondary">Explore the tournament</p>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Dive into the data</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {EXPLORE.map((c) => (
              <Link
                key={c.to}
                to={c.to}
                className="glass group p-6 transition hover:border-primary/40 hover:shadow-glow"
              >
                <h3 className="font-display text-2xl font-semibold transition group-hover:text-primary">
                  {c.title}
                </h3>
                <p className="mt-1 text-sm text-white/50">{c.desc}</p>
                <span className="mt-4 inline-block text-sm text-primary opacity-0 transition group-hover:opacity-100">
                  Explore →
                </span>
              </Link>
            ))}
          </div>
        </section>

        <TopScorers />

        <section className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h2 className="font-display text-4xl font-bold">Think you can call it?</h2>
          <p className="mt-3 text-white/50">
            Predict group winners, knockout upsets and the eventual champion. Climb the leaderboard
            as the tournament unfolds.
          </p>
          <Link
            to="/predictions"
            className="mt-8 inline-block rounded-full bg-primary px-8 py-3 font-semibold text-bg shadow-glow transition hover:brightness-110"
          >
            Start predicting
          </Link>
        </section>
      </main>
    </SmoothScrollProvider>
  );
}
