import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { isAdmin } from '@/lib/isAdmin';
import Event from '@/models/Event';
import Attendee from '@/models/Attendee';
import User from '@/models/User';

// GET /api/admin/events — all events across all users (admin only)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session.user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();

  const events = await Event.find({})
    .sort({ createdAt: -1 })
    .lean();

  // Enrich with attendee counts and host names
  const enriched = await Promise.all(
    events.map(async (ev) => {
      const [attendeeCount, host] = await Promise.all([
        Attendee.countDocuments({ eventId: ev._id }),
        User.findById(ev.userId).select('name email').lean(),
      ]);
      return { ...ev, attendeeCount, host };
    })
  );

  return NextResponse.json({ events: enriched });
}
