import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Event from '@/models/Event';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const event = await Event.findOne({ uniqueCode: params.code.toUpperCase() }).lean();

    if (!event?.coverImage) {
      // Fall back to the logo
      return NextResponse.redirect(new URL('/logo.png', req.url));
    }

    // coverImage is stored as a data URL: "data:<mime>;base64,<data>"
    const [meta, b64] = event.coverImage.split(',');
    const mimeType = meta.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
    const buffer = Buffer.from(b64, 'base64');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch {
    return NextResponse.redirect(new URL('/logo.png', req.url));
  }
}
