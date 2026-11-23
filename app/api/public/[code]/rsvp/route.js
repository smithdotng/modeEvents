import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Event from '@/models/Event';
import Attendee from '@/models/Attendee';
import { getFormFields, collectSubmission, normalizePhone } from '@/lib/formFields';

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

  const body = await req.json();
  const { photo, compositeImage } = body;

  // Answers arrive keyed by form-field key. Older clients posted name/email/phone
  // at the top level, so those are accepted as a fallback.
  const answers = {
    name: body.name,
    email: body.email,
    phone: body.phone,
    ...(body.answers && typeof body.answers === 'object' ? body.answers : {}),
  };

  const fields = getFormFields(event);
  const { errors, core, responses } = collectSubmission(fields, answers);

  if (errors.length) {
    return NextResponse.json({ error: errors[0], errors }, { status: 400 });
  }
  if (!core.name) {
    return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
  }

  const email = (core.email || '').toLowerCase();
  const phoneKey = normalizePhone(core.phone);

  // Duplicate check. Phone is the primary identity because email is optional;
  // whichever contact details were given are both checked, so a guest cannot
  // slip a second registration through by supplying only the other one.
  const orClauses = [];
  if (phoneKey) orClauses.push({ phoneKey });
  if (email) orClauses.push({ email });

  if (orClauses.length) {
    const existing = await Attendee.findOne({ eventId: event._id, $or: orClauses });
    if (existing) {
      return NextResponse.json({
        error: 'You have already registered for this event.',
        ticketCode: existing.ticketCode,
        compositeImage: existing.compositeImage,
      }, { status: 409 });
    }
  }

  let attendee;
  try {
    attendee = await Attendee.create({
      eventId: event._id,
      name: core.name.trim(),
      email,
      phone: core.phone || '',
      responses,
      photo: photo || '',
      compositeImage: compositeImage || '',
    });
  } catch (err) {
    // Two people submitting at the same moment can both pass the check above;
    // the unique index is the real guard, so translate its error rather than
    // returning a 500.
    if (err?.code === 11000) {
      const existing = await Attendee.findOne({ eventId: event._id, $or: orClauses });
      return NextResponse.json({
        error: 'You have already registered for this event.',
        ticketCode: existing?.ticketCode,
        compositeImage: existing?.compositeImage,
      }, { status: 409 });
    }
    console.error('[rsvp]', err);
    return NextResponse.json({ error: 'Could not save your RSVP. Please try again.' }, { status: 500 });
  }

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
