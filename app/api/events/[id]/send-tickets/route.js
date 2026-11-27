import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Event from '@/models/Event';
import Attendee from '@/models/Attendee';

/**
 * POST /api/events/[id]/send-tickets
 *   { channel: 'email' | 'whatsapp', attendeeIds?: string[] }
 *
 * Sends attendees their own QR entry pass.
 *
 * email    — one personalised message each, with the QR embedded as a hosted
 *            image plus a link to the pass. Sent through Resend's batch
 *            endpoint where available, since one call per guest would hit the
 *            rate limit on a list of any size.
 * whatsapp — wa.me cannot carry an attachment, so this returns a link per
 *            guest for the browser to open; the message contains their
 *            personal pass URL.
 */

export const runtime = 'nodejs';

/**
 * Work out the public origin for links and images.
 *
 * Taken from the request first, so passes point at whatever domain the
 * organiser is actually using. NEXTAUTH_URL is only a fallback: it is often
 * left on a default deployment URL, which would send guests somewhere other
 * than the site they were invited from.
 */
function originFrom(req) {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  if (host) return `${proto}://${host}`;
  return (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '');
}

const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const fmt = (d, opts) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Lagos', ...opts }).format(new Date(d));

function ticketEmail({ attendee, event, origin }) {
  const passUrl = `${origin}/t/${attendee.ticketCode}`;
  const qrUrl = `${origin}/api/tickets/${attendee.ticketCode}/qr`;
  const when = fmt(event.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const time = fmt(event.date, { hour: '2-digit', minute: '2-digit', hour12: true })
    + (event.endDate ? ` – ${fmt(event.endDate, { hour: '2-digit', minute: '2-digit', hour12: true })}` : '');

  return `
  <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1c2410">
    <div style="background:#2a3b19;padding:24px;border-radius:12px 12px 0 0;text-align:center">
      <p style="color:#7ab648;font-size:12px;letter-spacing:4px;margin:0 0 8px">YOUR ENTRY PASS</p>
      <h1 style="color:#f2f1eb;margin:0;font-size:22px">${esc(event.title)}</h1>
    </div>
    <div style="background:#f2f1eb;padding:32px;border:1px solid #c0bfb9;border-top:none;border-radius:0 0 12px 12px">
      <p style="margin:0 0 20px">Hi ${esc(attendee.name)},</p>
      <p style="margin:0 0 24px;line-height:1.7">
        Here is your entry pass. Show this QR code at the door — you can print it
        or just open it on your phone.
      </p>

      <div style="background:#ffffff;border-radius:12px;padding:20px;text-align:center">
        <img src="${qrUrl}" alt="Your QR entry pass" width="240" height="240"
             style="display:block;margin:0 auto;width:240px;height:240px" />
        <p style="font-family:monospace;font-size:18px;font-weight:bold;color:#2a3b19;letter-spacing:2px;margin:12px 0 0">
          ${esc(attendee.ticketCode)}
        </p>
      </div>

      <p style="text-align:center;margin:24px 0">
        <a href="${passUrl}"
           style="background:#2a3b19;color:#f2f1eb;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:bold;display:inline-block">
          Open my pass
        </a>
      </p>

      <div style="border-top:1px solid #c0bfb9;padding-top:16px;font-size:14px;color:#546048;line-height:1.7">
        <p style="margin:0">📅 ${when}</p>
        <p style="margin:0;padding-left:20px">${time}</p>
        ${event.venue ? `<p style="margin:0">📍 ${esc(event.venue)}</p>` : ''}
        ${event.address ? `<p style="margin:0;padding-left:20px;font-size:12px">${esc(event.address)}</p>` : ''}
      </div>

      <p style="font-size:12px;color:#888;margin:20px 0 0">
        If the QR code above does not load, open your pass with the button — it
        works on any phone.
      </p>
    </div>
  </div>`;
}

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const event = await Event.findOne({ _id: params.id, userId: session.user.id }).lean();
  if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

  const { channel, attendeeIds } = await req.json();

  const query = { eventId: event._id };
  if (Array.isArray(attendeeIds) && attendeeIds.length) query._id = { $in: attendeeIds };
  const attendees = await Attendee.find(query).select('name email phone ticketCode').lean();

  if (!attendees.length) {
    return NextResponse.json({ error: 'No attendees matched.' }, { status: 400 });
  }

  const origin = originFrom(req);

  // ── WhatsApp ────────────────────────────────────────────────────────────
  if (channel === 'whatsapp') {
    const contacts = [];
    let noPhone = 0;
    for (const a of attendees) {
      const phone = a.phone?.replace(/\D/g, '');
      if (!phone) { noPhone++; continue; }
      const text =
        `Hello ${a.name}, here is your entry pass for ${event.title} — ` +
        `${fmt(event.date, { weekday: 'long', day: 'numeric', month: 'long' })}, ` +
        `${fmt(event.date, { hour: '2-digit', minute: '2-digit', hour12: true })}` +
        `${event.venue ? ` at ${event.venue}` : ''}.\n\n` +
        `Your pass: ${origin}/t/${a.ticketCode}\n` +
        `Ticket code: ${a.ticketCode}\n\n` +
        `Please show the QR code at the door.`;
      contacts.push({
        id: String(a._id),
        name: a.name,
        phone,
        ticketCode: a.ticketCode,
        waUrl: `https://wa.me/${phone}?text=${encodeURIComponent(text)}`,
      });
    }
    return NextResponse.json({ channel: 'whatsapp', contacts, noPhone });
  }

  // ── Email ───────────────────────────────────────────────────────────────
  if (channel === 'email') {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'Email not configured — add RESEND_API_KEY.' }, { status: 500 });
    }
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.RESEND_FROM_EMAIL || 'Mode Events <onboarding@resend.dev>';

    const withEmail = attendees.filter(a => a.email?.trim());
    const noEmail = attendees.length - withEmail.length;

    if (!withEmail.length) {
      return NextResponse.json({
        error: 'None of these attendees has an email address. Use WhatsApp instead.',
        noEmail,
      }, { status: 400 });
    }

    const messages = withEmail.map(a => ({
      from,
      to: a.email,
      subject: `Your entry pass — ${event.title}`,
      html: ticketEmail({ attendee: a, event, origin }),
    }));

    const errors = [];
    let sent = 0;

    // Each pass is personalised, so these cannot share one send. Resend's
    // batch endpoint takes up to 100 distinct messages per call; without it,
    // one call per guest would trip the rate limit, so the fallback paces.
    const canBatch = typeof resend.batch?.send === 'function';
    if (canBatch) {
      for (let i = 0; i < messages.length; i += 100) {
        const chunk = messages.slice(i, i + 100);
        try {
          const res = await resend.batch.send(chunk);
          if (res?.error) errors.push(res.error.message || String(res.error));
          else sent += chunk.length;
        } catch (e) {
          errors.push(e.message);
        }
      }
    } else {
      for (const m of messages) {
        try {
          await resend.emails.send(m);
          sent++;
        } catch (e) {
          errors.push(`${m.to}: ${e.message}`);
        }
        await new Promise(r => setTimeout(r, 600)); // stay under the rate limit
      }
    }

    return NextResponse.json({ channel: 'email', sent, noEmail, errors });
  }

  return NextResponse.json({ error: 'Unknown channel' }, { status: 400 });
}
