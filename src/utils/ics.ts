import type { Event } from '../schemas/event.schema';

function sanitizeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function toDateToken(date: string, time: string): string {
  const compactDate = date.replace(/-/g, '');
  const compactTime = time.replace(':', '');
  return `${compactDate}T${compactTime}00`;
}

function incrementDate(date: string): string {
  const dateObject = new Date(`${date}T00:00:00Z`);
  dateObject.setUTCDate(dateObject.getUTCDate() + 1);
  return dateObject.toISOString().slice(0, 10).replace(/-/g, '');
}

export function buildEventIcs(event: Event): string {
  const uid = `${event.id}@lecoledubelier.beer`;
  const createdAt = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const start = toDateToken(event.date, event.startTime);
  const end = toDateToken(event.date, event.endTime);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//L Ecole du Belier//Agenda//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${createdAt}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${sanitizeIcsText(event.title)}`,
    `DESCRIPTION:${sanitizeIcsText(event.description)}`,
    `LOCATION:${sanitizeIcsText(`${event.venue}, ${event.address}, ${event.city}`)}`,
    `X-ALT-DESC;FMTTYPE=text/plain:${sanitizeIcsText(event.description)}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  return `${lines.join('\r\n')}\r\n`;
}

export function buildAllDayPlaceholderIcs(event: Event): string {
  const uid = `${event.id}-all-day@lecoledubelier.beer`;
  const createdAt = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const start = event.date.replace(/-/g, '');
  const end = incrementDate(event.date);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//L Ecole du Belier//Agenda//FR',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${createdAt}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${sanitizeIcsText(event.title)}`,
    `DESCRIPTION:${sanitizeIcsText(event.description)}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  return `${lines.join('\r\n')}\r\n`;
}
