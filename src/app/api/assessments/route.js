import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Assessment from '@/models/Assessment';
import AssessmentResult from '@/models/AssessmentResult';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function GET(req) {
  try {
    await connectDB();
    const decoded = verifyToken(req);
    const user = decoded ? await User.findById(decoded.id) : null;
    const dept = user?.academicProfile?.department || '';
    const year = user?.academicProfile?.year || 0;

    const isStaff = currentUser && ['admin', 'faculty', 'mentor'].includes(currentUser.role);

    let query = {};
    if (!isStaff) {
      query = {
        $or: [
          { 'targetClass.department': 'All', 'targetClass.year': 0 },
          { 'targetClass.department': dept, 'targetClass.year': year },
          { 'targetClass.department': 'All', 'targetClass.year': year },
          { 'targetClass.department': dept, 'targetClass.year': 0 }
        ]
      };
    }

    const projection = isStaff ? '' : '-questions.correctAnswer -questions.sampleSolution';
    const assessments = await Assessment.find(query, projection)
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });

    const results = decoded ? await AssessmentResult.find({ user: decoded.id }) : [];
    const resultMap = {};
    results.forEach(r => {
      resultMap[r.assessment.toString()] = {
        totalScore: r.totalScore,
        percentage: r.percentage,
        passed: r.passed,
        completedAt: r.completedAt
      };
    });

    const enriched = assessments.map(a => ({
      ...a.toObject(),
      result: resultMap[a._id.toString()] || null
    }));

    return NextResponse.json(enriched);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
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

    const body = await req.json();
    const {
      title,
      description = '',
      skill,
      category = 'cohort-drive',
      targetClass = { department: 'All', year: 0, section: 'All' },
      timeLimitMinutes = 30,
      passingScore = 70,
      questions = []
    } = body;

    if (!title || !skill || !questions || questions.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: title, skill, and at least 1 question are required.'
      }, { status: 400 });
    }

    const assessment = await Assessment.create({
      title,
      description,
      skill,
      category,
      targetClass: {
        department: targetClass.department || 'All',
        year: Number(targetClass.year) || 0,
        section: targetClass.section || 'All'
      },
      timeLimitMinutes: Number(timeLimitMinutes) || 30,
      passingScore: Number(passingScore) || 70,
      createdBy: currentUser._id,
      questions
    });

    return NextResponse.json({
      success: true,
      message: `Assessment "${title}" published successfully for ${targetClass.department} (Year ${targetClass.year || 'All'})`,
      assessment
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

