import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^\d{2}:\d{2}$/;

export const EventSchema = z.object({
  id: z.string().min(1, "L'ID est requis"),
  title: z.string().min(3, 'Le titre est requis'),
  date: z.string().regex(dateRegex, 'Date invalide (YYYY-MM-DD)'),
  startTime: z.string().regex(timeRegex, 'Heure de début invalide (HH:MM)'),
  endTime: z.string().regex(timeRegex, 'Heure de fin invalide (HH:MM)'),
  venue: z.string().min(2, 'Le lieu est requis'),
  city: z.string().min(2, 'La ville est requise'),
  address: z.string().min(5, "L'adresse est requise"),
  description: z.string().min(10, 'La description est trop courte'),
  registrationUrl: z.string().url('URL d\'inscription invalide').optional(),
  highlight: z.boolean().default(false)
});

export type Event = z.infer<typeof EventSchema>;
export const EventsArraySchema = z.array(EventSchema);
