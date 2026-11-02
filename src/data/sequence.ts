// Frames del video IA del héroe (public/seq/). Los genera `work/frames.sh` con ffmpeg desde work/video/hero-v2.mp4
// (Google Flow, Omni 1.1 Flash, 9:16). Hay un solo set vertical: en pantallas horizontales se dibuja entero y
// centrado sobre negro (el fondo del video es negro puro), sin ampliarlo.
// null = todavía no hay video: el héroe usa la foto de su IG.
export const sequence: {
  poster: string;
  base: string;
  count: number;
} | null = { poster: '/seq/v2/poster.webp', base: '/seq/v2/', count: 96 };
