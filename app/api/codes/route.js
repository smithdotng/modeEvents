import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Code from '@/models/Code';

// GET /api/codes — list current user's codes
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type'); // optional filter: qr | barcode
  const limit = parseInt(searchParams.get('limit') || '50');

  const filter = { userId: session.user.id };
  if (type) filter.type = type;

  const codes = await Code.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
  return NextResponse.json({ codes });
}

// POST /api/codes — save a generated code
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { type, format, content, label, dataURL, options } = body;

    if (!type || !format || !content || !dataURL) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    await connectDB();
    const code = await Code.create({
      userId: session.user.id,
      type,
      format,
      content,
      label: label || content.slice(0, 60),
      dataURL,
      options: options || {},
    });

    return NextResponse.json({ code }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/codes]', err);
    return NextResponse.json({ error: 'Failed to save code.' }, { status: 500 });
  }
}
