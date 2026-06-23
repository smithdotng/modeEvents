import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Event from '@/models/Event';
import Attendee from '@/models/Attendee';

// GET /api/public/[code] — public event details (no auth required)
export async function GET(req, { params }) {
  await connectDB();

  const event = await Event.findOne({
    uniqueCode: params.code.toUpperCase(),
    status: 'published',
  })
    .select('-userId')
    .lean();

  if (!event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });

  const attendeeCount = await Attendee.countDocuments({ eventId: event._id });

  return NextResponse.json({ event, attendeeCount });
}
