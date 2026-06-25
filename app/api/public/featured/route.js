import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Event from '@/models/Event';
import Attendee from '@/models/Attendee';

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
