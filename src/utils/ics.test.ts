import { describe, expect, it } from 'vitest';
import { buildAllDayPlaceholderIcs, buildEventIcs } from './ics';

const sampleEvent = {
  id: 'test-event',
  title: 'Degustation test',
  date: '2026-05-10',
  startTime: '18:30',
  endTime: '20:00',
  venue: 'Brasserie',
  city: 'Bassens',
  address: '33530 Bassens',
  description: 'Une belle soiree de degustation.',
  registrationUrl: 'https://lecoledubelier.beer/#contact',
  highlight: true
};

describe('ICS utils', () => {
  it('should generate a valid calendar payload', () => {
    const payload = buildEventIcs(sampleEvent);

    expect(payload).toContain('BEGIN:VCALENDAR');
    expect(payload).toContain('BEGIN:VEVENT');
    expect(payload).toContain('UID:test-event@lecoledubelier.beer');
    expect(payload).toContain('DTSTART:20260510T183000');
    expect(payload).toContain('DTEND:20260510T200000');
    expect(payload).toContain('SUMMARY:Degustation test');
    expect(payload).toContain('END:VEVENT');
    expect(payload).toContain('END:VCALENDAR');
  });

  it('should generate an all-day fallback payload', () => {
    const payload = buildAllDayPlaceholderIcs(sampleEvent);

    expect(payload).toContain('DTSTART;VALUE=DATE:20260510');
    expect(payload).toContain('DTEND;VALUE=DATE:20260511');
  });
});
