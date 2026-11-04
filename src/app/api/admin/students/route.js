import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Enrollment from '@/models/Enrollment';
import PlacementApplication from '@/models/PlacementApplication';
import AssessmentResult from '@/models/AssessmentResult';
import { verifyToken } from '@/lib/auth';

export async function GET(req) {
  try {
    await connectDB();
    const decoded = verifyToken(req);
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await User.findById(decoded.id);
    if (!currentUser || !['admin', 'faculty', 'mentor'].includes(currentUser.role)) {
      return NextResponse.json({ success: false, message: 'Forbidden. Staff/Faculty role required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const department = searchParams.get('department');
    const year = searchParams.get('year');
    const search = searchParams.get('search');
    const studentId = searchParams.get('studentId');

    // If specific student detailed profile is requested
    if (studentId) {
      const student = await User.findById(studentId).select('-password');
      if (!student) {
        return NextResponse.json({ success: false, message: 'Student not found' }, { status: 404 });
      }

      const enrollments = await Enrollment.find({ user: studentId }).populate('course', 'title institution code thumbnail modules');
      const applications = await PlacementApplication.find({ student: studentId }).populate('placement', 'companyName roleTitle ctcPackage driveDate');
      const assessmentResults = await AssessmentResult.find({ user: studentId }).populate('assessment', 'title skill passingScore');

      return NextResponse.json({
        student,
        enrollments,
        applications,
        assessmentResults
      });
    }

    // Otherwise list students with filters
    const query = { role: 'student' };
    if (department && department !== 'All') {
      query['academicProfile.department'] = department;
    }
    if (year && year !== 'All') {
      query['academicProfile.year'] = Number(year);
    }
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { 'academicProfile.rollNumber': { $regex: search.trim(), $options: 'i' } },
        { 'skills.name': { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const students = await User.find(query).select('-password').sort({ 'academicProfile.cgpa': -1, name: 1 });
    return NextResponse.json(students);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
