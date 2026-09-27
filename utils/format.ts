const DAY = 24 * 60 * 60 * 1000;

export const formatKm = (km: number) => `${Math.round(km).toLocaleString('pt-BR')} km`;

export const formatCurrency = (value: number) =>
  value === 0 ? 'Grátis' : value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const formatPct = (v: number, digits = 0) => `${(v * 100).toFixed(digits).replace('.', ',')}%`;

const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const pad = (n: number) => n.toString().padStart(2, '0');

export function formatDayShort(d: Date | string) {
  const date = typeof d === 'string' ? new Date(d) : d;
  return `${WEEKDAYS[date.getDay()]}, ${pad(date.getDate())} ${MONTHS[date.getMonth()]}`;
}

export function formatDate(d: Date | string) {
  const date = typeof d === 'string' ? new Date(d) : d;
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function formatDateTime(d: Date | string) {
  const date = typeof d === 'string' ? new Date(d) : d;
  return `${formatDate(date)} às ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatTime(d: Date | string) {
  const date = typeof d === 'string' ? new Date(d) : d;
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  if (d === 1) return 'ontem';
  if (d < 30) return `há ${d} dias`;
  return formatDate(iso);
}

export const daysUntil = (iso: string) => Math.ceil((new Date(iso).getTime() - Date.now()) / DAY);

export const monthsBetween = (fromIso: string, to = new Date()) =>
  (to.getTime() - new Date(fromIso).getTime()) / (30.44 * DAY);

export const uid = (prefix = 'id') => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export function firstName(name: string) {
  return name.split(' ')[0];
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}
