import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Course from '@/models/Course';

export async function GET(req) {
  try {
    await connectDB();
    const courses = await Course.find().sort({ rating: -1, enrolledCount: -1 });
    return NextResponse.json({ success: true, count: courses.length, courses });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
