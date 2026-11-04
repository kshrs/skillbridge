import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import { verifyToken } from '@/lib/auth';

export async function POST(req, { params }) {
  try {
    await connectDB();
    const decoded = verifyToken(req);
    if (!decoded) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { courseId } = await params;
    const { moduleId, moduleTitle, content, attachedFiles } = await req.json();

    let enrollment = await Enrollment.findOne({ user: decoded.id, course: courseId });
    if (!enrollment) {
      enrollment = await Enrollment.create({ user: decoded.id, course: courseId });
    }

    const existingIdx = enrollment.notes.findIndex(n => n.moduleId === moduleId);
    if (existingIdx >= 0) {
      enrollment.notes[existingIdx].content = content || enrollment.notes[existingIdx].content;
      if (attachedFiles && Array.isArray(attachedFiles)) {
        enrollment.notes[existingIdx].attachedFiles = [
          ...(enrollment.notes[existingIdx].attachedFiles || []),
          ...attachedFiles
        ];
      }
      enrollment.notes[existingIdx].updatedAt = new Date();
    } else {
      enrollment.notes.push({
        moduleId: moduleId || '',
        moduleTitle: moduleTitle || 'Module Notes',
        content: content || '',
        attachedFiles: attachedFiles || [],
        updatedAt: new Date()
      });
    }

    await enrollment.save();
    return NextResponse.json({ message: 'Notes saved', notes: enrollment.notes });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
