import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Event from '@/models/Event';
import Attendee from '@/models/Attendee';

// POST /api/events/[id]/broadcast  { channel, subject, message }
// channel: 'email' → sends via Resend
// channel: 'whatsapp' → returns { contacts, message } for frontend to generate wa.me links
export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const event = await Event.findOne({ _id: params.id, userId: session.user.id }).lean();
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  const { channel, subject, message } = await req.json();
  const attendees = await Attendee.find({ eventId: event._id }).lean();

  if (attendees.length === 0) {
    return NextResponse.json({ error: 'No attendees to message' }, { status: 400 });
  }

  // ── Email via Resend ───────────────────────────────────────────────────────
  if (channel === 'email') {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'Email not configured — add RESEND_API_KEY to your environment variables.' }, { status: 500 });
    }
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Mode Events <onboarding@resend.dev>';
    const eventDate = new Date(event.date).toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    const htmlBody = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1c2410">
        <div style="background:#2a3b19;padding:24px;border-radius:12px 12px 0 0;text-align:center">
          <p style="color:#7ab648;font-size:12px;letter-spacing:4px;margin:0 0 8px">MODE EVENTS</p>
          <h1 style="color:#f2f1eb;margin:0;font-size:24px">${event.title}</h1>
          <p style="color:#7a9268;margin:8px 0 0;font-size:14px">📅 ${eventDate}${event.venue ? ` · 📍 ${event.venue}` : ''}</p>
        </div>
        <div style="background:#f2f1eb;padding:32px;border:1px solid #c0bfb9;border-top:none;border-radius:0 0 12px 12px">
          <p style="white-space:pre-wrap;line-height:1.7">${message}</p>
        </div>
        <p style="color:#888;font-size:11px;text-align:center;margin-top:16px">Sent via Mode Events</p>
      </div>
    `;

    // Send in batches of 50 (Resend limit per call)
    const emails = attendees.map(a => a.email);
    const errors = [];
    let sent = 0;

    for (let i = 0; i < emails.length; i += 50) {
      const batch = emails.slice(i, i + 50);
      try {
        await resend.emails.send({ from: fromEmail, to: batch, subject, html: htmlBody });
        sent += batch.length;
      } catch (e) {
        errors.push(e.message);
      }
    }

    return NextResponse.json({ sent, errors });
  }

  // ── WhatsApp — return contacts + message for frontend ─────────────────────
  if (channel === 'whatsapp') {
    const contacts = attendees
      .filter(a => a.phone?.trim())
      .map(a => ({ name: a.name, phone: a.phone.replace(/\D/g, '') }));
    return NextResponse.json({ contacts, message, noPhone: attendees.length - contacts.length });
  }

  return NextResponse.json({ error: 'Unknown channel' }, { status: 400 });
}
