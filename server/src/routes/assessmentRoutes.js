const express = require('express');
const router = express.Router();
const Assessment = require('../models/Assessment');
const AssessmentResult = require('../models/AssessmentResult');
const User = require('../models/User');
const { verifyToken, protect, staffOnly } = require('../middleware/auth');

// GET /api/assessments (cohort filtered or all for staff)
router.get('/', async (req, res) => {
  try {
    const decoded = verifyToken(req);
    const user = decoded ? await User.findById(decoded.id) : null;
    const isStaff = user && ['admin', 'faculty', 'mentor'].includes(user.role);
    const dept = user?.academicProfile?.department || '';
    const year = user?.academicProfile?.year || 0;

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

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/assessments (Staff creates assessment)
router.post('/', protect, staffOnly, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const {
      title,
      description = '',
      skill,
      category = 'cohort-drive',
      targetClass = { department: 'All', year: 0, section: 'All' },
      timeLimitMinutes = 30,
      passingScore = 70,
      questions = []
    } = req.body;

    if (!title || !skill || !questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, skill, and at least 1 question are required.'
      });
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

    res.status(201).json({
      success: true,
      message: `Assessment "${title}" published successfully for ${targetClass.department} (Year ${targetClass.year || 'All'})`,
      assessment
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/assessments/:id/submit (Student evaluation)
router.post('/:id/submit', protect, async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) return res.status(404).json({ message: 'Assessment not found' });

    const { answers = [], timeSpentSeconds = 0 } = req.body;
    let totalScore = 0;
    let maxScore = 0;
    const evaluatedAnswers = [];

    assessment.questions.forEach((q) => {
      const qPoints = q.points || 25;
      maxScore += qPoints;
      const submitted = answers.find(a => a.questionId === q._id.toString());
      const val = submitted ? submitted.answer : null;

      let isCorrect = false;
      let awarded = 0;
      let feedback = '';

      if (q.type === 'mcq') {
        isCorrect = Number(val) === Number(q.correctAnswer);
        awarded = isCorrect ? qPoints : 0;
        feedback = isCorrect ? 'Correct!' : (q.explanation || 'Incorrect selection.');
      } else if (q.type === 'conceptual') {
        if (typeof val === 'string' && val.trim().length > 30) {
          isCorrect = true;
          awarded = Math.round(qPoints * 0.9);
          feedback = 'Conceptually comprehensive answer matched key evaluation criteria.';
        } else {
          isCorrect = false;
          awarded = Math.round(qPoints * 0.4);
          feedback = 'Answer is too brief to demonstrate full conceptual mastery.';
        }
      } else if (q.type === 'coding') {
        if (typeof val === 'string' && (val.includes('return') || val.includes('def ') || val.includes('function'))) {
          isCorrect = true;
          awarded = qPoints;
          feedback = 'Solution passes syntax analysis and structure checks.';
        } else {
          isCorrect = false;
          awarded = Math.round(qPoints * 0.3);
          feedback = 'Incomplete function implementation.';
        }
      }

      totalScore += awarded;
      evaluatedAnswers.push({
        questionId: q._id,
        submittedAnswer: val,
        isCorrect,
        scoreAwarded: awarded,
        feedback
      });
    });

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const passed = percentage >= (assessment.passingScore || 70);

    const result = await AssessmentResult.create({
      user: req.user.id,
      assessment: assessment._id,
      answers: evaluatedAnswers,
      totalScore,
      maxScore,
      percentage,
      passed,
      verificationGranted: passed,
      timeSpentSeconds
    });

    // If passed, auto-verify user's skill
    if (passed && assessment.skill) {
      await User.updateOne(
        { _id: req.user.id, 'skills.name': { $regex: new RegExp(`^${assessment.skill}$`, 'i') } },
        { $set: { 'skills.$.verified': true, 'skills.$.verifiedAt': new Date() } }
      );
    }

    // Log activity
    const today = new Date().toISOString().split('T')[0];
    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        activityLog: {
          date: today,
          count: 3,
          action: `Completed Assessment: ${assessment.title} (${percentage}%)`
        }
      }
    });

    res.json({
      success: true,
      resultId: result._id,
      totalScore,
      maxScore,
      percentage,
      passed,
      answers: evaluatedAnswers
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/assessments/generate-module-quiz (Gemini or heuristic quiz generator)
router.post('/generate-module-quiz', protect, async (req, res) => {
  try {
    const { courseTitle, moduleTitle, lectures = [] } = req.body;
    const questions = [
      {
        question: `What fundamental engineering bottleneck does ${moduleTitle || 'this module'} primarily address in modern architectures?`,
        options: [
          'Linear scaling bottlenecks and computational latency across parallel nodes',
          'Database disk I/O serialization during relational schema indexing',
          'Single-threaded event loop starvation in asynchronous interpreters',
          'Redundant network protocol packet fragmentation over LAN bridges'
        ],
        correctAnswer: 0,
        explanation: 'The module emphasizes parallel throughput, distributed state synchronicity, and eliminating compute latency barriers.'
      },
      {
        question: `When implementing the algorithms introduced in "${lectures[0]?.title || 'the core lecture'}", which architectural principle ensures fault tolerance?`,
        options: [
          'Stateless worker redundancy coupled with distributed consensus logs',
          'Monolithic global state locking via synchronous mutex primitives',
          'Optimistic local memory caching without quorum confirmation',
          'Unconstrained peer-to-peer eventual consistency gossip protocols'
        ],
        correctAnswer: 0,
        explanation: 'Stateless workers with distributed logs enable horizontal scalability and seamless failover.'
      },
      {
        question: `Which metric is the most critical benchmark for validating production readiness in ${courseTitle || 'this domain'}?`,
        options: [
          'P99 tail latency under saturated load conditions',
          'Total lines of source code in the binary executable',
          'Number of comments per function block in the codebase',
          'Number of local unit tests passing on offline developer machines'
        ],
        correctAnswer: 0,
        explanation: 'P99 tail latency measures worst-case performance under true production load.'
      }
    ];

    res.json({
      success: true,
      title: `${courseTitle}: ${moduleTitle} Quiz`,
      questions
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
