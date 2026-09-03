// ─── GSAP singleton ─────────────────────────────────────────────────────────
// Every component that needs gsap/ScrollTrigger imports from here instead of
// 'gsap' directly. Registering a plugin twice from two different modules is
// the most common source of duplicate-trigger bugs — this file guarantees
// registration happens exactly once, on first import, anywhere in the app.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Keep pinned/scrubbed sections snappy — no exaggerated lag smoothing.
gsap.ticker.lagSmoothing(0);

export { gsap, ScrollTrigger };
