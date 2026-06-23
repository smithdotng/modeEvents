import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Event from '@/models/Event';
import Attendee from '@/models/Attendee';

// GET /api/events/[id]/attendees — host views their attendee list
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const event = await Event.findOne({ _id: params.id, userId: session.user.id });
  if (!event) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  const attendees = await Attendee.find({ eventId: event._id })
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ attendees });
}

// PATCH /api/events/[id]/attendees — check in an attendee
export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const event = await Event.findOne({ _id: params.id, userId: session.user.id });
  if (!event) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  const { attendeeId, checkedIn } = await req.json();
  const attendee = await Attendee.findOneAndUpdate(
    { _id: attendeeId, eventId: event._id },
    { checkedIn },
    { new: true }
  );

  return NextResponse.json({ attendee });
}
