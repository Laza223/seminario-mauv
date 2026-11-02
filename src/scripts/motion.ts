// Movimiento con GSAP (patrón de bf-servicios-integrales). El HTML ya trae el estado final: acá solo se anima
// hacia él (gsap.from), así sin JS todo se ve. Nunca con reduced-motion (el feedback de los botones sí queda).
// Atributos: data-reveal (un bloque), data-stagger (sus hijos en cascada), data-parallax (deriva de la foto),
// data-mask (el texto sube línea por línea desde una máscara), data-wipe (se destapa: "right" o "up"),
// data-strike (el tachado se dibuja), data-timeline (la línea de las horas avanza con el scroll).

const reduce = matchMedia('(prefers-reduced-motion: reduce)');

async function init() {
  const [{ gsap }, { ScrollTrigger }, { SplitText }] = await Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
    import('gsap/SplitText'),
  ]);
  gsap.registerPlugin(ScrollTrigger, SplitText);
  // Marca que hay movimiento: los estados "apagados" (horas sin llegar) solo existen con JS.
  document.documentElement.dataset.js = '';

  // Solo lo que está fuera de pantalla al cargar: evita el parpadeo visible → oculto → visible.
  const below = (el: Element) => el.getBoundingClientRect().top > innerHeight;
  const once = (trigger: Element) => ({ trigger, start: 'top 88%', once: true });
  const ease = 'power3.out';
  const all = (sel: string) => gsap.utils.toArray<HTMLElement>(sel);

  all('[data-reveal]').filter(below).forEach((el) => {
    gsap.from(el, { y: 28, opacity: 0, duration: 0.9, ease, scrollTrigger: once(el) });
  });
  all('[data-stagger]').filter(below).forEach((el) => {
    gsap.from(Array.from(el.children), { y: 24, opacity: 0, duration: 0.8, ease, stagger: 0.08, scrollTrigger: once(el) });
  });
  all('[data-parallax]').forEach((el) => {
    gsap.fromTo(
      el,
      { yPercent: -6, scale: 1.12 },
      { yPercent: 6, scale: 1.12, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } },
    );
  });

  // Destapar: la foto o el ticket aparecen como una pasada. El inset negativo deja afuera las muescas del ticket.
  all('[data-wipe]').filter(below).forEach((el) => {
    const from = el.dataset.wipe === 'up' ? 'inset(100% 0px 0px 0px)' : 'inset(-20px 100% -20px 0px)';
    gsap.fromTo(
      el,
      { clipPath: from },
      { clipPath: 'inset(-20px -20px -20px -20px)', duration: 0.9, ease: 'power2.inOut', clearProps: 'clipPath', scrollTrigger: once(el) },
    );
  });

  // Tachado del precio viejo: se dibuja de izquierda a derecha al entrar.
  all('[data-strike]').filter(below).forEach((el) => {
    gsap.from(el, { backgroundSize: '0% 2px', duration: 0.7, delay: 0.25, ease: 'power2.out', scrollTrigger: once(el) });
  });

  // Texto en una máscara: cada línea sube desde abajo. Se parte cuando las fuentes ya cargaron y se revierte al terminar
  // (la máscara de línea cortaría ascendentes y descendentes de los títulos de interlineado apretado).
  const masked = all('[data-mask]').filter(below);
  if (masked.length) {
    void document.fonts.ready.then(() => {
      masked.forEach((el) => {
        SplitText.create(el, {
          type: 'lines',
          mask: 'lines',
          aria: 'none',
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 110,
              duration: 0.9,
              ease,
              stagger: Math.min(0.08, 0.4 / Math.max(self.lines.length, 1)),
              scrollTrigger: once(el),
              onComplete: () => self.revert(),
            }),
        });
      });
    });
  }

  // Las horas del día: la línea avanza con el scroll y cada hora se enciende al llegar.
  all('[data-timeline]').forEach((ol) => {
    gsap.fromTo(
      ol,
      { '--p': 0 },
      { '--p': 1, ease: 'none', scrollTrigger: { trigger: ol, start: 'top 65%', end: 'bottom 70%', scrub: true } },
    );
    Array.from(ol.children).forEach((li) => {
      ScrollTrigger.create({
        trigger: li,
        start: 'top 68%',
        onToggle: (self) => (li as HTMLElement).toggleAttribute('data-on', self.progress > 0 || self.isActive),
      });
    });
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

// Medición y feedback: cada toque a WhatsApp es un evento en Vercel Web Analytics (con de qué botón salió) y el
// botón confirma el toque con "Abriendo…" (también con reduced-motion: es estado, no movimiento).
type VA = (event: 'event', props: { name: string; data?: Record<string, string> }) => void;
document.addEventListener('click', (e) => {
  const a = (e.target as Element).closest<HTMLAnchorElement>('[data-cta]');
  if (!a) return;
  const va = (window as Window & { va?: VA }).va;
  if (va) va('event', { name: 'whatsapp', data: { from: a.dataset.cta ?? '' } });
  if (a.dataset.opening === undefined) {
    const label = a.textContent;
    a.dataset.opening = '';
    a.textContent = 'Abriendo…';
    setTimeout(() => {
      a.textContent = label;
      delete a.dataset.opening;
    }, 1800);
  }
});
