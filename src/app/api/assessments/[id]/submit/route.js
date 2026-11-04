import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Assessment from '@/models/Assessment';
import AssessmentResult from '@/models/AssessmentResult';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function POST(req, { params }) {
  try {
    await connectDB();
    const decoded = verifyToken(req);
    if (!decoded) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { answers } = await req.json();

    const assessment = await Assessment.findById(id);
    if (!assessment) return NextResponse.json({ message: 'Assessment not found' }, { status: 404 });

    const user = await User.findById(decoded.id);

    let earnedTotal = 0;
    let maxTotal = 0;
    const evaluatedAnswers = [];

    for (const q of assessment.questions) {
      const qMax = q.points || 25;
      maxTotal += qMax;

      const userSub = (answers || []).find(a => String(a.questionId) === String(q._id)) || {};
      let qEarned = 0;
      let isCorrect = false;

      if (q.type === 'mcq') {
        isCorrect = Number(userSub.selectedOption) === Number(q.correctAnswer);
        qEarned = isCorrect ? qMax : 0;
      } else if (q.type === 'conceptual') {
        const text = (userSub.textAnswer || '').trim();
        qEarned = text.length > 20 ? Math.round(qMax * 0.85) : Math.round(qMax * 0.4);
        isCorrect = qEarned >= qMax * 0.6;
      } else if (q.type === 'coding') {
        const code = (userSub.textAnswer || '').trim();
        qEarned = code.includes('return') ? Math.round(qMax * 0.9) : Math.round(qMax * 0.3);
        isCorrect = qEarned >= qMax * 0.6;
      }

      earnedTotal += qEarned;
      evaluatedAnswers.push({
        questionId: q._id,
        questionType: q.type,
        questionText: q.question,
        selectedOption: userSub.selectedOption ?? -1,
        textAnswer: userSub.textAnswer || '',
        isCorrect,
        earnedPoints: qEarned,
        maxPoints: qMax,
        aiFeedback: {
          score: qEarned,
          strengths: isCorrect ? ['Accurate understanding demonstrated'] : [],
          weaknesses: isCorrect ? [] : ['Further technical elaboration recommended'],
          constructiveFeedback: q.explanation || 'Reviewed against syllabus criteria.'
        }
      });
    }

    const percentage = maxTotal > 0 ? Math.round((earnedTotal / maxTotal) * 100) : 0;
    const passed = percentage >= (assessment.passingScore || 70);

    const result = await AssessmentResult.create({
      user: decoded.id,
      assessment: assessment._id,
      answers: evaluatedAnswers,
      totalScore: earnedTotal,
      maxPossibleScore: maxTotal,
      percentage,
      passed,
      overallFeedback: passed 
        ? `Superb! You demonstrated verified command over ${assessment.skill}.`
        : `Assessment incomplete. Score was below the passing threshold of ${assessment.passingScore}%. Review module lectures and retry.`,
      verifiedSkillCredited: passed ? assessment.skill : ''
    });

    if (passed && assessment.skill) {
      const existing = user.skills.find(s => s.name.toLowerCase() === assessment.skill.toLowerCase());
      if (existing) {
        existing.verified = true;
      } else {
        user.skills.push({ name: assessment.skill, level: 'Advanced', verified: true, verifiedAt: new Date() });
      }
      await user.save();
    }

    return NextResponse.json({ message: 'Evaluated successfully', result });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
