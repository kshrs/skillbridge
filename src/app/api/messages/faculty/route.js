import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function GET(req) {
  try {
    await connectDB();
    const faculty = await User.find({ role: { $in: ['faculty', 'admin', 'mentor'] } })
      .select('-password')
      .sort({ name: 1 });
    return NextResponse.json(faculty);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
