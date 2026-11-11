export const timezone = import.meta.env.VITE_APP_TIMEZONE || 'Asia/Kolkata';

export function today() {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const part = (type) => parts.find((item) => item.type === type).value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function formatDate(date, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
  return new Intl.DateTimeFormat('en-GB', { ...options, timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`));
}

export function shiftDate(date, days) {
  const result = new Date(`${date}T12:00:00Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

export const slots = [
  { id: 'morning', name: 'Morning', detail: 'Fasting', icon: 'sunrise' },
  { id: 'after_breakfast', name: 'After breakfast', detail: 'Your breakfast reading', icon: 'coffee' },
  { id: 'after_lunch', name: 'After lunch', detail: 'Your lunch reading', icon: 'sun' },
  { id: 'after_dinner', name: 'After dinner', detail: 'Your evening reading', icon: 'moon' },
];

export const slotName = (slot) => slots.find((item) => item.id === slot)?.name || slot;
