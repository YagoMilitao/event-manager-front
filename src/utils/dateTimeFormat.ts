// Converte 1930 ou "1930" em "19:30"
export function formatHour(value?: number | string | null): string {
  if (value === null || value === undefined || value === '') return '';

  const num = typeof value === 'string' ? Number(value) : value;

  if (Number.isNaN(num)) return '';

  const hours = Math.floor(num / 100);
  const minutes = num % 100;

  if (
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return '';
  }

  const hh = hours.toString().padStart(2, '0');
  const mm = minutes.toString().padStart(2, '0');

  return `${hh}:${mm}`;
}

// Formata a data do evento em pt-BR: "16/11/2025"
export function formatDatePt(dateString: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
