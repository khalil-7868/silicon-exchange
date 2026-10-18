/**
 * Format integer cents to USD string (e.g. 240 -> "$2.40", 12500 -> "$125.00")
 */
export function formatCents(cents: number): string {
  const isNegative = cents < 0;
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100);
  const remainder = abs % 100;
  const formatted = `$${dollars.toLocaleString('en-US')}.${remainder.toString().padStart(2, '0')}`;
  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Format hourly rate cents to rate string (e.g. 240 -> "$2.40/hr")
 */
export function formatHourlyRate(cents: number): string {
  return `${formatCents(cents)}/hr`;
}

/**
 * Format duration minutes to human readable string (e.g. 75 -> "1h 15m", 1440 -> "24h 00m")
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  if (hours === 0) {
    return `${remainingMinutes}m`;
  }
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Format timestamp to concise date/time string (e.g. "Oct 18, 14:00")
 */
export function formatDateTime(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Format seconds to mm:ss countdown
 */
export function formatCountdown(msRemaining: number): string {
  if (msRemaining <= 0) return '00:00';
  const totalSeconds = Math.floor(msRemaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
