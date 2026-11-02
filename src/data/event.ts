// Fuente única del perfeccionamiento: héroe, barra fija, ticket, contador y JSON-LD salen de acá.
// Lo marcado [CONFIRMAR] es de ejemplo hasta que Mauv lo confirme: no publicar con esos valores.

export const event = {
  name: 'Perfeccionamiento MAUV311',
  // Instante físico de inicio, en hora argentina.
  startsAt: '2026-11-22T10:00:00-03:00',
  dayLabel: 'Domingo 22 de noviembre',
  shortDate: 'Dom 22/11',
  timeLabel: '10 h',
  price: 85_000,
  anchorPrice: 145_000,
  // [CONFIRMAR] lugares reales del studio. `left` se actualiza a mano y se redeploya.
  seats: { total: 12, left: 12 },
  venue: 'Mauv Studio',
  street: 'Mitre 2130',
  city: 'Luján',
  region: 'Provincia de Buenos Aires',
  instagram: 'mauv311',
  // 549 + área sin 0 + número sin 15 (Luján: 2323).
  whatsapp: '5492323313544',
  whatsappMessage:
    'Hola Mauv! Quiero reservar mi lugar en el Perfeccionamiento MAUV311 del domingo 22/11. Mi nombre es ',
} as const;

const ars = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
export const money = (n: number) => ars.format(n).replace(/\s/g, '');

export const savings = event.anchorPrice - event.price;
export const savingsPct = Math.round((savings / event.anchorPrice) * 100);

export const waHref = `https://wa.me/${event.whatsapp}?text=${encodeURIComponent(event.whatsappMessage)}`;
export const igHref = `https://www.instagram.com/${event.instagram}/`;
export const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${event.street}, ${event.city}, ${event.region}, Argentina`,
)}`;
