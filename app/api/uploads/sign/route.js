import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';
import Event from '@/models/Event';
import { validateUploadEndpoint } from '@/lib/formFields';

/**
 * POST /api/uploads/sign  { code }
 *
 * Mints a short-lived HMAC token the browser presents to the shared-hosting
 * upload receiver. The shared secret itself never leaves the server, so the
 * image can go straight from the browser to the file host — which is what
 * keeps it out of Vercel's 4.5 MB request body limit.
 *
 * Tokens are scoped to a real, published event and expire quickly, so a
 * scraped token is not a general-purpose upload key.
 */

const TOKEN_TTL_SECONDS = 300; // 5 minutes: long enough to pick and send a file

export async function POST(req) {
  const secret = process.env.UPLOAD_SHARED_SECRET;
  const endpoint = process.env.NEXT_PUBLIC_UPLOAD_ENDPOINT;

  if (!secret || !endpoint) {
    return NextResponse.json(
      { error: 'Image hosting is not configured for this deployment.' },
      { status: 501 }
    );
  }

  // Refuse to hand out a token that would be posted somewhere useless.
  // Without this the browser sends the upload to whatever the variable holds —
  // typically a hosting provider's parked page — and the guest sees a timeout
  // with nothing indicating the real cause.
  const check = validateUploadEndpoint(endpoint);
  if (!check.ok) {
    console.error('[uploads/sign] ' + check.error);
    return NextResponse.json(
      { error: 'Image hosting is misconfigured on this site. ' + check.error },
      { status: 501 }
    );
  }
  if (check.warning) console.warn('[uploads/sign] ' + check.warning);

  let code = '';
  try {
    ({ code } = await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  if (!code || typeof code !== 'string') {
    return NextResponse.json({ error: 'Event code is required.' }, { status: 400 });
  }

  // Only issue tokens for events that actually accept RSVPs.
  await connectDB();
  const event = await Event.findOne({
    uniqueCode: code.toUpperCase(),
    status: 'published',
  }).select('_id uniqueCode').lean();

  if (!event) {
    return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
  }

  const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  const payload = JSON.stringify({
    exp,
    code: event.uniqueCode,
    nonce: crypto.randomBytes(8).toString('hex'),
  });

  const payloadB64 = Buffer.from(payload).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payloadB64).digest('hex');

  return NextResponse.json({
    token: `${payloadB64}.${signature}`,
    endpoint,
    expiresAt: exp,
  });
}
