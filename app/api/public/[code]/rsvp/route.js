import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Event from '@/models/Event';
import Attendee from '@/models/Attendee';

// POST /api/public/[code]/rsvp — submit RSVP (no auth required)
export async function POST(req, { params }) {
  await connectDB();

  const event = await Event.findOne({
    uniqueCode: params.code.toUpperCase(),
    status: 'published',
  });

  if (!event) return NextResponse.json({ error: 'Event not found or no longer accepting RSVPs.' }, { status: 404 });

  // Capacity check
  if (event.capacity > 0) {
    const count = await Attendee.countDocuments({ eventId: event._id });
    if (count >= event.capacity) {
      return NextResponse.json({ error: 'This event is fully booked.' }, { status: 409 });
    }
  }

  const { name, email, phone, photo, compositeImage } = await req.json();

  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
  }

  // Check if already registered
  const existing = await Attendee.findOne({ eventId: event._id, email: email.toLowerCase() });
  if (existing) {
    return NextResponse.json({
      error: 'You have already registered for this event.',
      ticketCode: existing.ticketCode,
      compositeImage: existing.compositeImage,
    }, { status: 409 });
  }

  const attendee = await Attendee.create({
    eventId: event._id,
    name: name.trim(),
    email: email.toLowerCase(),
    phone: phone || '',
    photo: photo || '',
    compositeImage: compositeImage || '',
  });

  return NextResponse.json({
    message: 'RSVP confirmed!',
    ticketCode: attendee.ticketCode,
    compositeImage: attendee.compositeImage,
    attendeeId: attendee._id,
    attendee: {
      name: attendee.name,
      email: attendee.email,
      ticketCode: attendee.ticketCode,
    },
  }, { status: 201 });
}

// PATCH /api/public/[code]/rsvp — save avatar composite after RSVP
// body: { ticketCode, compositeImage }
export async function PATCH(req, { params }) {
  await connectDB();

  const event = await Event.findOne({ uniqueCode: params.code.toUpperCase() }).lean();
  if (!event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });

  const { ticketCode, compositeImage } = await req.json();
  if (!ticketCode || !compositeImage) {
    return NextResponse.json({ error: 'ticketCode and compositeImage are required.' }, { status: 400 });
  }

  const attendee = await Attendee.findOneAndUpdate(
    { ticketCode: ticketCode.toUpperCase(), eventId: event._id },
    { compositeImage },
    { new: true }
  );

  if (!attendee) return NextResponse.json({ error: 'Attendee not found.' }, { status: 404 });

  return NextResponse.json({ ok: true });
}
