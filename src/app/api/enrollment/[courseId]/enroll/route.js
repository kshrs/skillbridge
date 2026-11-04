import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';
import { verifyToken } from '@/lib/auth';

export async function POST(req, { params }) {
  try {
    await connectDB();
    const decoded = verifyToken(req);
    if (!decoded) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { courseId } = await params;
    const course = await Course.findById(courseId);
    if (!course) return NextResponse.json({ message: 'Course not found' }, { status: 404 });

    let enrollment = await Enrollment.findOne({ user: decoded.id, course: courseId });
    if (enrollment) {
      return NextResponse.json({ message: 'Already enrolled', enrollment });
    }

    enrollment = await Enrollment.create({
      user: decoded.id,
      course: courseId,
      status: 'in-progress',
      progress: 0,
      completedLectures: [],
      lectureProgress: [],
      notes: [],
      projectArtifacts: []
    });

    course.enrolledCount = (course.enrolledCount || 0) + 1;
    await course.save();

    return NextResponse.json({ message: 'Enrolled successfully', enrollment });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
