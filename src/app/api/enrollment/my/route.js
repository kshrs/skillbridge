import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function GET(req) {
  try {
    await connectDB();
    const decoded = verifyToken(req);
    if (!decoded) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const enrollments = await Enrollment.find({ user: decoded.id })
      .populate('course')
      .sort({ updatedAt: -1 });

    return NextResponse.json(enrollments);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
