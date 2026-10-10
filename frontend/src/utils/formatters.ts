export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '--';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatTime(timeString: string | null | undefined): string {
  if (!timeString) return '--';
  // Formats HH:MM:SS to 12-hour format
  try {
    const parts = timeString.split(':');
    if (parts.length >= 2) {
      let hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 becomes 12
      return `${hours}:${minutes} ${ampm}`;
    }
    return timeString;
  } catch {
    return timeString;
  }
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return '0.0%';
  return `${value.toFixed(1)}%`;
}
