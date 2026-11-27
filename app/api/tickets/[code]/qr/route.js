import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Attendee from '@/models/Attendee';

/**
 * GET /api/tickets/[code]/qr  →  PNG of the attendee's QR code
 *
 * Public on purpose: email clients fetch images unauthenticated, so this
 * cannot sit behind a session. The ticket code is the only thing the image
 * encodes, and anyone holding the code already has the ticket — so the image
 * discloses nothing its viewer did not already have.
 *
 * The QR encodes the BARE ticket code (e.g. "TKT-8F3K2A") and nothing else,
 * because that is exactly what the door scanner posts to
 * /api/events/[id]/scan. Encoding a URL here would break check-in.
 */

export const runtime = 'nodejs';      // the qrcode package needs Node, not Edge
export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  const code = String(params.code || '').trim().toUpperCase();
  if (!/^TKT-[A-Z0-9]{4,12}$/.test(code)) {
    return NextResponse.json({ error: 'Invalid ticket code.' }, { status: 400 });
  }

  await connectDB();
  const attendee = await Attendee.findOne({ ticketCode: code }).select('_id').lean();
  if (!attendee) {
    return NextResponse.json({ error: 'Ticket not found.' }, { status: 404 });
  }

  const QRCode = (await import('qrcode')).default;
  const png = await QRCode.toBuffer(code, {
    type: 'png',
    width: 600,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: { dark: '#1c2410', light: '#ffffff' },
  });

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      // A ticket code never changes, so let mail clients and CDNs keep it.
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Length': String(png.length),
    },
  });
}
