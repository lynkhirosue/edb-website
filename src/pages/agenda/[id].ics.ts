import { buildEventIcs } from '../../utils/ics';
import { loadEvents } from '../../utils/data-loader';
import type { Event } from '../../schemas/event.schema';

export const prerender = true;

interface StaticPath {
  params: {
    id: string;
  };
  props: {
    event: Event;
  };
}

export async function getStaticPaths(): Promise<StaticPath[]> {
  const events = await loadEvents();

  return events.map((event) => ({
    params: {
      id: event.id
    },
    props: {
      event
    }
  }));
}

export async function GET({ props }: { props: { event: Event } }) {
  const calendar = buildEventIcs(props.event);

  return new Response(calendar, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${props.event.id}.ics"`,
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
