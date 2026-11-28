import EventRSVPClient from '@/components/EventRSVPClient';
import { connectDB } from '@/lib/mongodb';
import Event from '@/models/Event';

/*
 * Rendered per request, never at build time.
 *
 * generateMetadata reads the event, so without this Next connects to MongoDB during
 * "Collecting page data" and the whole deployment fails if the database
 * is unreachable from the build machine — which it is whenever Atlas's IP
 * allowlist covers the serverless runtime but not the builder. The data is
 * live anyway, so there is nothing to gain from prerendering it.
 */
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  try {
    await connectDB();
    const event = await Event.findOne({ uniqueCode: params.code.toUpperCase() }).lean();
    if (!event) return { title: 'Event Not Found | Mode Events' };

    const dateStr = new Date(event.date).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
    const description = [
      event.description || `Join us for ${event.title}`,
      event.venue && `📍 ${event.venue}`,
      `📅 ${dateStr}`,
    ].filter(Boolean).join(' · ');

    const imageUrl = `/api/og/${params.code}`;

    return {
      title: `${event.title} | Mode Events`,
      description,
      openGraph: {
        title: event.title,
        description,
        images: [{ url: imageUrl, width: 1200, height: 1200, alt: event.title }],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: event.title,
        description,
        images: [imageUrl],
      },
    };
  } catch {
    return { title: 'Mode Events' };
  }
}

export default function EventPage({ params }) {
  return <EventRSVPClient code={params.code} />;
}
