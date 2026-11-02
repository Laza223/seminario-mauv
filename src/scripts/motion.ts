// Movimiento con GSAP (patrón de bf-servicios-integrales). El HTML ya trae el estado final: acá solo se anima
// hacia él (gsap.from), así sin JS todo se ve. Nunca con reduced-motion.
// Atributos: data-reveal (un bloque), data-stagger (sus hijos en cascada), data-parallax (deriva de la foto).

const reduce = matchMedia('(prefers-reduced-motion: reduce)');

async function init() {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
  gsap.registerPlugin(ScrollTrigger);

  // Solo lo que está fuera de pantalla al cargar: evita el parpadeo visible → oculto → visible.
  const below = (el: Element) => el.getBoundingClientRect().top > innerHeight;
  const once = (trigger: Element) => ({ trigger, start: 'top 88%', once: true });
  const ease = 'power3.out';

  gsap.utils.toArray<HTMLElement>('[data-reveal]').filter(below).forEach((el) => {
    gsap.from(el, { y: 28, opacity: 0, duration: 0.9, ease, scrollTrigger: once(el) });
  });
  gsap.utils.toArray<HTMLElement>('[data-stagger]').filter(below).forEach((el) => {
    gsap.from(Array.from(el.children), { y: 24, opacity: 0, duration: 0.8, ease, stagger: 0.08, scrollTrigger: once(el) });
  });
  gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
    gsap.fromTo(
      el,
      { yPercent: -6, scale: 1.12 },
      { yPercent: 6, scale: 1.12, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } },
    );
  });

  // Scroll suave solo con mouse: en touch queda el scroll nativo.
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const { default: Lenis } = await import('lenis');
    const lenis = new Lenis({ lerp: 0.12 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
}

if (!reduce.matches) void init();

// Medición: cada toque a WhatsApp es un evento en Vercel Web Analytics (con de qué botón salió).
type VA = (event: 'event', props: { name: string; data?: Record<string, string> }) => void;
document.addEventListener('click', (e) => {
  const a = (e.target as Element).closest<HTMLAnchorElement>('[data-cta]');
  const va = (window as Window & { va?: VA }).va;
  if (a && va) va('event', { name: 'whatsapp', data: { from: a.dataset.cta ?? '' } });
});
