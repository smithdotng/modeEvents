import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { isAdmin } from '@/lib/isAdmin';
import Event from '@/models/Event';

// PATCH /api/admin/events/[id]/feature — toggle featured flag (admin only)
export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin(session.user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();
  const event = await Event.findById(params.id);
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  const { featured } = await req.json();
  event.featured = !!featured;
  await event.save();

  return NextResponse.json({ ok: true, featured: event.featured });
}
