import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useApi } from '../../hooks/useApi';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import type { ListResponse, Team } from '../../lib/types';
import { GlassCard } from '../ui/GlassCard';
import { Flag } from '../ui/Flag';
import { Badge } from '../ui/Badge';

gsap.registerPlugin(ScrollTrigger);

/**
 * Top contenders in a GSAP-pinned horizontal-scroll strip: the section pins and the
 * track translates with scroll. Under reduced motion it degrades to a native overflow scroll.
 */
export function TeamsShowcase() {
  const reduced = useReducedMotion();
  const isDesktop = useIsDesktop();
  // Pinning + horizontal scrub only on desktop; touch devices get native overflow scroll.
  const pinned = isDesktop && !reduced;
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const { body } = useApi<ListResponse<Team>>('/teams', { limit: 14 });
  const teams = body?.data ?? [];

  useLayoutEffect(() => {
    if (!pinned || teams.length === 0) return;

    const ctx = gsap.context(() => {
      const track = trackRef.current;
      const section = sectionRef.current;
      if (!track || !section) return;

      const getScrollAmount = () => track.scrollWidth - window.innerWidth + 48;

      gsap.to(track, {
        x: () => -getScrollAmount(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${getScrollAmount()}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    }, sectionRef);

    // Layout settles after data + flags load; recompute trigger bounds.
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [pinned, teams.length]);

  if (teams.length === 0) return null;

  const cards = teams.map((team) => (
    <GlassCard
      key={team._id}
      className="flex h-56 w-64 shrink-0 flex-col justify-between"
      hover
    >
      <div className="flex items-start justify-between">
        <Flag code={team.code} flagUrl={team.flagUrl} size={44} />
        {team.isHost && <Badge tone="secondary">Host</Badge>}
      </div>
      <div>
        <p className="text-xs text-white/40">#{team.fifaRanking} in the world</p>
        <h3 className="font-display text-2xl font-semibold">{team.name}</h3>
        <Badge tone="muted" className="mt-2">
          {team.confederation}
        </Badge>
      </div>
    </GlassCard>
  ));

  // Mobile / reduced motion: simple, accessible native horizontal scroll (no pin).
  if (!pinned) {
    return (
      <section className="py-20">
        <Header />
        <div className="flex gap-4 overflow-x-auto px-6 pb-4">{cards}</div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative flex min-h-screen flex-col justify-center overflow-hidden">
      <Header />
      <div ref={trackRef} className="flex gap-4 px-6 will-change-transform">
        {cards}
      </div>
    </section>
  );
}

function Header() {
  return (
    <div className="mb-8 px-6">
      <p className="text-xs uppercase tracking-[0.3em] text-secondary">The contenders</p>
      <h2 className="font-display text-3xl font-bold sm:text-4xl">Favourites for the title</h2>
      <p className="mt-1 text-sm text-white/50">Scroll to move through the field.</p>
    </div>
  );
}
