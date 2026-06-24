import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Event from '@/models/Event';
import Attendee from '@/models/Attendee';

// POST /api/events/[id]/scan  { ticketCode }
// Verifies a ticket and checks in the attendee
export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const event = await Event.findOne({ _id: params.id, userId: session.user.id }).lean();
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  const { ticketCode } = await req.json();
  if (!ticketCode) return NextResponse.json({ error: 'Ticket code required' }, { status: 400 });

  const attendee = await Attendee.findOne({
    ticketCode: ticketCode.trim().toUpperCase(),
    eventId: event._id,
  });

  if (!attendee) {
    return NextResponse.json({ error: 'Ticket not found for this event' }, { status: 404 });
  }

  const alreadyCheckedIn = attendee.checkedIn;
  if (!alreadyCheckedIn) {
    attendee.checkedIn = true;
    await attendee.save();
  }

  return NextResponse.json({ attendee, alreadyCheckedIn });
}
