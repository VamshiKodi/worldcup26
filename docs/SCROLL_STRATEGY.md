# Scroll Animation Strategy

The scroll experience is the centerpiece. This document defines the architecture so all sections
feel cohesive and nothing fights the scroll loop.

## Core principle: one loop, three actors

There is **one** smooth-scroll loop (Lenis). Everything else hangs off it:

| Actor | Owns | When to use |
|-------|------|-------------|
| **Lenis** | The smooth-scroll position & momentum | Always on (except reduced-motion) |
| **GSAP ScrollTrigger** | Scroll-pinned timelines, horizontal sections, scrubbed animation | Sticky/pinned sequences, horizontal scroll, scroll-controlled timelines |
| **Framer Motion** | Enter/exit, layout, micro-interactions, page transitions | Section reveal-on-view, hover/tap, modal/route transitions |
| **React Three Fiber** | The 3D hero (trophy, particles) | Home hero only, lazy-loaded |

### Lenis ↔ GSAP sync (the critical glue)
ScrollTrigger must read Lenis's virtual scroll, not the native scrollbar, or they desync:

```ts
// providers/SmoothScrollProvider.tsx (Phase 5)
const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

## Technique → section mapping

| Technique | Sections |
|-----------|----------|
| Parallax / depth layers | Hero, Hosts (USA/Canada/Mexico) |
| Text reveal / mask | Intro, all section headers |
| Animated counters | Intro (teams/matches/goals/stadiums) |
| Image scaling on scroll | Hosts, Players |
| Sticky / pinned | Intro storytelling, PredictionLab |
| Horizontal scroll | Teams showcase, Players showcase |
| Scroll progress indicator | Global top bar |
| Scroll-controlled timeline | Bracket reveal, Trophy rotation |
| Momentum | Global (Lenis) |
| Mouse-follow | Hero light, card tilt |
| Micro-interactions | Buttons, prediction sliders, cards |
| Page transitions | Route changes (Framer `AnimatePresence`) |

## Reusable hooks (Phase 5)
- `useScrollReveal(opts)` — IntersectionObserver/Framer `whileInView` wrapper for fade/slide/mask-in
- `useParallax(speed)` — maps scroll progress → transform via Framer `useScroll`/`useTransform`
- `useReducedMotion()` — central switch; disables Lenis & scrubs, swaps to opacity-only
- `useMouseFollow()` — pointer-driven spring for lights/tilt

## Performance rules
- Animate only `transform` and `opacity` (GPU-friendly); never animate layout properties on scroll.
- `will-change` applied sparingly and removed after animation.
- 3D is lazy: `const Trophy = lazy(() => import('./three/Trophy'))`, suspense-fallback poster image.
- Pause offscreen R3F render loop (`frameloop="demand"` when hero leaves viewport).
- All scrubbed timelines killed on unmount (`ScrollTrigger.getAll().forEach(t => t.kill())`).

## Reduced motion
When `prefers-reduced-motion: reduce`:
- Lenis is **not** initialized (native scroll).
- ScrollTrigger scrubs become simple in-view toggles.
- R3F hero replaced by a static rendered poster.
- Framer transitions reduced to `opacity` with near-zero duration.
This is wired globally via Framer `<MotionConfig reducedMotion="user">` + a `useReducedMotion` guard.
