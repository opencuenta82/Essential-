export function convertTo24Hour(timeString: string): string {
  if (!timeString) return timeString;

  // Si ya está en formato 24h (no tiene AM/PM), devolver tal como está
  if (!timeString.includes('AM') && !timeString.includes('PM')) {
    return timeString;
  }

  const [time, period] = timeString.split(' ');
  const [hours, minutes] = time.split(':');
  let hour24 = parseInt(hours);

  if (period === 'PM' && hour24 !== 12) {
    hour24 += 12;
  } else if (period === 'AM' && hour24 === 12) {
    hour24 = 0;
  }

  return `${hour24.toString().padStart(2, '0')}:${minutes}`;
}