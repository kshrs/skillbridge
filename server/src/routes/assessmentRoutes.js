import express from 'express';
import Assessment from '../models/Assessment.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { parseAndAnalyzeResume, analyzeSkillGap } from '../services/aiEngine.js';

const router = express.Router();

// Get available assessments
router.get('/', protect, async (req, res) => {
  try {
    const assessments = await Assessment.find({}, '-questions.correctAnswer');
    res.json({ success: true, assessments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Take assessment questions
router.get('/:id', protect, async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id, '-questions.correctAnswer');
    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' });
    res.json({ success: true, assessment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Submit assessment & auto-grade + update verified skill
router.post('/:id/submit', protect, async (req, res) => {
  try {
    const { answers } = req.body; // array of { questionIndex, answer }
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' });

    let score = 0;
    const review = assessment.questions.map((q, idx) => {
      const userAnswer = answers ? answers[idx] : null;
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) score += 1;
      return {
        question: q.question,
        options: q.options,
        userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation
      };
    });

    const total = assessment.questions.length;
    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= assessment.passingScore;

    // Save in user profile
    const user = await User.findById(req.user._id);
    user.assessmentResults.push({
      skill: assessment.skill,
      score,
      total,
      percentage,
      passed,
      date: new Date()
    });

    // If passed, mark skill as verified or add if not present
    const existingSkill = user.skills.find(s => s.name.toLowerCase() === assessment.skill.toLowerCase());
    if (existingSkill) {
      if (passed) existingSkill.verified = true;
    } else {
      user.skills.push({
        name: assessment.skill,
        level: percentage >= 90 ? 'Advanced' : 'Intermediate',
        verified: passed
      });
    }

    await user.save();

    res.json({
      success: true,
      score,
      total,
      percentage,
      passed,
      passingScore: assessment.passingScore,
      review
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// AI Resume Analysis Endpoint
router.post('/ai-resume-analyze', protect, async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) {
      return res.status(400).json({ success: false, message: 'Resume text is required' });
    }

    const analysis = parseAndAnalyzeResume(resumeText);
    res.json({ success: true, analysis });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// AI Skill Gap Analysis Endpoint
router.post('/ai-gap-analyze', protect, async (req, res) => {
  try {
    const { targetRole } = req.body;
    const user = await User.findById(req.user._id);
    const analysis = analyzeSkillGap(user.skills, targetRole || user.targetRole);
    res.json({ success: true, analysis });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
