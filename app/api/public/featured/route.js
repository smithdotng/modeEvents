import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Event from '@/models/Event';
import Attendee from '@/models/Attendee';

/*
 * Rendered per request, never at build time.
 *
 * this route reads featured events, so without this Next connects to MongoDB during
 * "Collecting page data" and the whole deployment fails if the database
 * is unreachable from the build machine — which it is whenever Atlas's IP
 * allowlist covers the serverless runtime but not the builder. The data is
 * live anyway, so there is nothing to gain from prerendering it.
 */
export const dynamic = 'force-dynamic';

// GET /api/public/featured — featured published events for the landing page
export async function GET() {
  await connectDB();

  const events = await Event.find({ featured: true, status: 'published' })
    .sort({ date: 1 })
    .limit(6)
    .lean();

  const enriched = await Promise.all(
    events.map(async (ev) => {
      const count = await Attendee.countDocuments({ eventId: ev._id });
      return { ...ev, attendeeCount: count };
    })
  );

  return NextResponse.json({ events: enriched });
}
