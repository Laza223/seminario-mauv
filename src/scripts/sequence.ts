// Secuencia de frames del video IA dibujada en canvas y manejada por el scroll (técnica "AirPods").
// Un solo set vertical: en vertical cubre la pantalla, en horizontal va entero y centrado. Primero baja 1 de cada 4 frames
// y después completa; siempre dibuja el frame cargado más cercano. Con reduced-motion o ahorro de datos no
// baja nada y queda el póster (que es el primer frame y lo que mide la carga).

type FrameSet = { base: string; count: number };

const pad = (n: number) => String(n).padStart(4, '0');

function pickSet(el: HTMLElement): FrameSet | null {
  const base = el.dataset.seq;
  const count = Number(el.dataset.count);
  return base && count > 0 ? { base, count } : null;
}

export function mountSequence(canvas: HTMLCanvasElement) {
  const set = pickSet(canvas);
  const ctx = canvas.getContext('2d');
  if (!set || !ctx) return null;

  const frames: (HTMLImageElement | undefined)[] = new Array(set.count);
  let current = 0;

  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    draw(current);
  };

  // "cover" en vertical y "contain" en horizontal, igual que el object-fit del póster, para que el cambio no salte.
  const landscape = matchMedia('(orientation: landscape)');
  function paint(img: HTMLImageElement) {
    const cw = canvas.width;
    const ch = canvas.height;
    const fit = landscape.matches ? Math.min : Math.max;
    const s = fit(cw / img.naturalWidth, ch / img.naturalHeight);
    ctx!.clearRect(0, 0, cw, ch);
    const w = img.naturalWidth * s;
    const h = img.naturalHeight * s;
    ctx!.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  }

  function draw(i: number) {
    for (let k = i; k >= 0; k--) {
      const img = frames[k];
      if (img?.complete && img.naturalWidth) {
        paint(img);
        canvas.dataset.ready = '1';
        return;
      }
    }
  }

  const load = (i: number) =>
    new Promise<void>((resolve) => {
      if (frames[i]) return resolve();
      const img = new Image();
      img.decoding = 'async';
      img.onload = img.onerror = () => {
        if (i <= current) draw(current);
        resolve();
      };
      img.src = `${set.base}${pad(i + 1)}.webp`;
      frames[i] = img;
    });

  async function preload() {
    const coarse = [];
    for (let i = 0; i < set!.count; i += 4) coarse.push(load(i));
    await Promise.all(coarse);
    for (let i = 0; i < set!.count; i++) await load(i);
  }

  addEventListener('resize', resize, { passive: true });
  resize();
  void preload();

  return {
    count: set.count,
    // progress 0→1
    seek(progress: number) {
      current = Math.min(set.count - 1, Math.max(0, Math.round(progress * (set.count - 1))));
      draw(current);
    },
  };
}

export const sequenceAllowed = () => {
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return !matchMedia('(prefers-reduced-motion: reduce)').matches && !conn?.saveData;
};
