import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Event from '@/models/Event';
import Attendee from '@/models/Attendee';
import { normalizeFormFields } from '@/lib/formFields';

// GET /api/events/[id]
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const event = await Event.findOne({ _id: params.id, userId: session.user.id }).lean();
  if (!event) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  return NextResponse.json({ event });
}

// PUT /api/events/[id] — update event
export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const event = await Event.findOne({ _id: params.id, userId: session.user.id });
  if (!event) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  const body = await req.json();
  const allowed = ['title','description','date','endDate','venue','address','capacity','coverImage','avatarsEnabled','frameImage','frameZone','status'];
  allowed.forEach(k => { if (body[k] !== undefined) event[k] = body[k]; });

  // The RSVP form is sanitised rather than trusted verbatim.
  if (body.formFields !== undefined) {
    event.formFields = normalizeFormFields(body.formFields);
  }

  await event.save();
  return NextResponse.json({ event });
}

// DELETE /api/events/[id]
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const event = await Event.findOne({ _id: params.id, userId: session.user.id });
  if (!event) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  await Attendee.deleteMany({ eventId: event._id });
  await event.deleteOne();

  return NextResponse.json({ message: 'Event deleted.' });
}
