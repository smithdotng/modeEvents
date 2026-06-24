import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Event from '@/models/Event';
import Attendee from '@/models/Attendee';

// POST /api/events/[id]/message  { attendeeId, channel, subject, message }
// Sends a message to a single attendee
export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const event = await Event.findOne({ _id: params.id, userId: session.user.id }).lean();
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  const { attendeeId, channel, subject, message } = await req.json();
  const attendee = await Attendee.findOne({ _id: attendeeId, eventId: event._id }).lean();
  if (!attendee) return NextResponse.json({ error: 'Attendee not found' }, { status: 404 });

  // ── Email via Resend ───────────────────────────────────────────────────────
  if (channel === 'email') {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'Email not configured — add RESEND_API_KEY.' }, { status: 500 });
    }
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Mode Events <onboarding@resend.dev>';

    await resend.emails.send({
      from: fromEmail,
      to: attendee.email,
      subject,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1c2410">
          <div style="background:#2a3b19;padding:24px;border-radius:12px 12px 0 0;text-align:center">
            <p style="color:#7ab648;font-size:12px;letter-spacing:4px;margin:0 0 8px">MODE EVENTS</p>
            <h1 style="color:#f2f1eb;margin:0;font-size:22px">${event.title}</h1>
          </div>
          <div style="background:#f2f1eb;padding:32px;border:1px solid #c0bfb9;border-top:none;border-radius:0 0 12px 12px">
            <p>Hi ${attendee.name},</p>
            <p style="white-space:pre-wrap;line-height:1.7">${message}</p>
          </div>
          <p style="color:#888;font-size:11px;text-align:center;margin-top:16px">Sent via Mode Events</p>
        </div>
      `,
    });
    return NextResponse.json({ ok: true });
  }

  // ── WhatsApp — return wa.me URL ────────────────────────────────────────────
  if (channel === 'whatsapp') {
    const phone = attendee.phone?.replace(/\D/g, '');
    if (!phone) return NextResponse.json({ error: 'This attendee has no phone number on file.' }, { status: 400 });
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    return NextResponse.json({ waUrl });
  }

  return NextResponse.json({ error: 'Unknown channel' }, { status: 400 });
}
