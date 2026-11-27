import { connectDB } from '@/lib/mongodb';
import Attendee from '@/models/Attendee';
import Event from '@/models/Event';

/**
 * Public entry pass: /t/TKT-XXXXXX
 *
 * This is the page an attendee is sent to by email or WhatsApp. WhatsApp
 * cannot carry an attachment through a wa.me link, so a link to this page is
 * how a guest gets their QR on that channel.
 *
 * Server-rendered so the QR is visible immediately and so link previews work.
 */

export const dynamic = 'force-dynamic';

async function getTicket(code) {
  const clean = String(code || '').trim().toUpperCase();
  if (!/^TKT-[A-Z0-9]{4,12}$/.test(clean)) return null;

  await connectDB();
  const attendee = await Attendee.findOne({ ticketCode: clean })
    .select('name ticketCode eventId checkedIn')
    .lean();
  if (!attendee) return null;

  const event = await Event.findById(attendee.eventId)
    .select('title date endDate venue address uniqueCode')
    .lean();
  if (!event) return null;

  return { attendee, event };
}

export async function generateMetadata({ params }) {
  const data = await getTicket(params.code);
  if (!data) return { title: 'Ticket not found | Mode Events' };
  return {
    title: `Your pass — ${data.event.title}`,
    description: `Entry pass for ${data.attendee.name}. Show this QR code at the door.`,
  };
}

const fmt = (d, opts) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Lagos', ...opts }).format(new Date(d));

export default async function TicketPage({ params }) {
  const data = await getTicket(params.code);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-5xl mb-4">🎟</p>
          <h1 className="text-2xl font-bold text-[#1c2410] mb-2">Ticket not found</h1>
          <p className="text-[#546048]">Check the link, or ask the organiser to resend it.</p>
        </div>
      </div>
    );
  }

  const { attendee, event } = data;

  return (
    <div className="max-w-md mx-auto px-4 py-10 space-y-6">
      <div className="text-center space-y-1">
        <p className="text-xs font-bold text-[#546048] uppercase tracking-widest">Entry pass</p>
        <h1 className="text-2xl font-extrabold text-[#1c2410] leading-tight">{event.title}</h1>
      </div>

      <div className="bg-[#f2f1eb] border border-[#c0bfb9] rounded-2xl p-6 space-y-5">
        <div className="text-center">
          <p className="text-xs text-[#546048] uppercase tracking-widest mb-1">Attendee</p>
          <p className="text-xl font-extrabold text-[#1c2410]">{attendee.name}</p>
        </div>

        {/* The QR itself — a plain <img> so it prints and screenshots cleanly */}
        <div className="bg-white rounded-xl p-4 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/tickets/${attendee.ticketCode}/qr`}
            alt={`QR code for ticket ${attendee.ticketCode}`}
            width={280}
            height={280}
            className="w-full max-w-[280px] h-auto"
          />
        </div>

        <p className="text-center font-mono text-lg font-bold text-[#2a3b19] tracking-wider">
          {attendee.ticketCode}
        </p>

        {attendee.checkedIn && (
          <p className="text-center text-sm font-bold text-[#7ab648] bg-[#7ab648]/10 border border-[#7ab648]/30 rounded-xl py-2">
            ✓ Already checked in
          </p>
        )}

        <div className="border-t border-[#c0bfb9] pt-4 text-sm text-[#546048] space-y-1">
          <p>📅 {fmt(event.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p className="pl-5">
            {fmt(event.date, { hour: '2-digit', minute: '2-digit', hour12: true })}
            {event.endDate && ` – ${fmt(event.endDate, { hour: '2-digit', minute: '2-digit', hour12: true })}`}
          </p>
          {event.venue && <p>📍 {event.venue}</p>}
          {event.address && <p className="text-xs pl-5">{event.address}</p>}
        </div>
      </div>

      <p className="text-center text-xs text-[#546048] leading-relaxed">
        Show this screen at the entrance. You can screenshot it — it works offline
        once loaded, and the code does not change.
      </p>
    </div>
  );
}
