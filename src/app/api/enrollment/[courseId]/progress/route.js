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
    const { lectureId, playedSeconds, durationSeconds } = await req.json();

    let enrollment = await Enrollment.findOne({ user: decoded.id, course: courseId });
    if (!enrollment) {
      enrollment = await Enrollment.create({ user: decoded.id, course: courseId });
    }

    const duration = durationSeconds || 3600;
    const percentage = Math.min(100, Math.round(((playedSeconds || 0) / duration) * 100));
    const isCompleted = percentage >= 85;

    let lp = enrollment.lectureProgress.find(l => l.lectureId === lectureId);
    if (lp) {
      lp.playedSeconds = Math.max(lp.playedSeconds, playedSeconds || 0);
      lp.percentage = Math.max(lp.percentage, percentage);
      if (isCompleted) lp.completed = true;
      lp.lastWatchedAt = new Date();
    } else {
      enrollment.lectureProgress.push({
        lectureId,
        playedSeconds: playedSeconds || 0,
        durationSeconds: duration,
        percentage,
        completed: isCompleted,
        lastWatchedAt: new Date()
      });
    }

    if (isCompleted && !enrollment.completedLectures.includes(lectureId)) {
      enrollment.completedLectures.push(lectureId);
    }

    const course = await Course.findById(courseId);
    let totalLectures = 0;
    if (course && course.modules) {
      course.modules.forEach(m => { totalLectures += (m.lectures ? m.lectures.length : 0); });
    }
    if (totalLectures === 0) totalLectures = 1;

    enrollment.progress = Math.min(100, Math.round((enrollment.completedLectures.length / totalLectures) * 100));
    enrollment.lastAccessedAt = new Date();
    await enrollment.save();

    return NextResponse.json({
      message: 'Progress recorded',
      progress: enrollment.progress,
      completedLectures: enrollment.completedLectures,
      lectureProgress: enrollment.lectureProgress
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
