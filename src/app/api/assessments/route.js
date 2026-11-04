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

    const query = {
      $or: [
        { 'targetClass.department': 'All', 'targetClass.year': 0 },
        { 'targetClass.department': dept, 'targetClass.year': year },
        { 'targetClass.department': 'All', 'targetClass.year': year },
        { 'targetClass.department': dept, 'targetClass.year': 0 }
      ]
    };

    const assessments = await Assessment.find(query, '-questions.correctAnswer -questions.sampleSolution')
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
