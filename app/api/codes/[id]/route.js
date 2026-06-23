import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Code from '@/models/Code';

// DELETE /api/codes/[id]
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const code = await Code.findOne({ _id: params.id, userId: session.user.id });

  if (!code) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  await code.deleteOne();
  return NextResponse.json({ message: 'Deleted.' });
}
