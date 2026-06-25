import { Parallax } from './Parallax';

/**
 * Full-page depth backdrop for the landing page: soft colour orbs and a grid that drift at
 * different parallax speeds behind the content, giving the scroll a layered, 3D feel. Purely
 * decorative (pointer-events-none) and motion-safe via <Parallax>.
 */
export function ParallaxBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <Parallax speed={-180} className="absolute -left-32 top-[10%]">
        <div className="h-[34rem] w-[34rem] rounded-full bg-primary/10 blur-[140px]" />
      </Parallax>
      <Parallax speed={120} className="absolute right-[-10%] top-[35%]">
        <div className="h-[28rem] w-[28rem] rounded-full bg-accent/10 blur-[130px]" />
      </Parallax>
      <Parallax speed={-90} className="absolute left-[20%] top-[65%]">
        <div className="h-[30rem] w-[30rem] rounded-full bg-secondary/10 blur-[150px]" />
      </Parallax>
      <Parallax speed={200} className="absolute bottom-[2%] right-[15%]">
        <div className="h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />
      </Parallax>
    </div>
  );
}
