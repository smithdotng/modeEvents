import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Event from '@/models/Event';

// GET /api/events — list current user's events
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const events = await Event.find({ userId: session.user.id })
    .sort({ date: 1 })
    .lean();

  return NextResponse.json({ events });
}

// POST /api/events — create an event
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { title, description, date, endDate, venue, address, capacity, coverImage, frameImage, frameZone } = body;

    if (!title || !date) {
      return NextResponse.json({ error: 'Title and date are required.' }, { status: 400 });
    }

    await connectDB();

    const event = await Event.create({
      userId: session.user.id,
      title: title.trim(),
      description: description || '',
      date: new Date(date),
      endDate: endDate ? new Date(endDate) : undefined,
      venue: venue || '',
      address: address || '',
      capacity: capacity || 0,
      coverImage: coverImage || '',
      frameImage: frameImage || '',
      frameZone: frameZone || { x: 10, y: 10, w: 30, h: 30, shape: 'rect' },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/events]', err);
    return NextResponse.json({ error: 'Failed to create event.' }, { status: 500 });
  }
}
