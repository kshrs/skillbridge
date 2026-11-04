import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

const recordHeatmapActivity = async (userId, count = 1, metadata = {}) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const user = await User.findById(userId);
    if (!user) return;

    if (!user.activityLog) user.activityLog = [];
    const entry = user.activityLog.find(a => a.date === today);
    if (entry) {
      entry.count = (entry.count || 0) + count;
      if (metadata.type) {
        entry.details = entry.details || [];
        entry.details.push({ ...metadata, at: new Date() });
      }
    } else {
      user.activityLog.push({
        date: today,
        count: count,
        details: metadata.type ? [{ ...metadata, at: new Date() }] : []
      });
    }
    await user.save();
  } catch (err) {
    console.error('[Heatmap Log Error]:', err.message);
  }
};

export async function GET(req, { params }) {
  try {
    await connectDB();
    const decoded = verifyToken(req);
    if (!decoded) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { courseId } = await params;
    const enrollment = await Enrollment.findOne({ user: decoded.id, course: courseId }).populate('course');
    if (!enrollment) {
      return NextResponse.json({ message: 'Enrollment not found' }, { status: 404 });
    }
    return NextResponse.json(enrollment);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
