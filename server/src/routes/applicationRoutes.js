import express from 'express';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { calculateJobMatch } from '../services/aiEngine.js';

const router = express.Router();

// Apply for a job (CRUD: Create)
router.post('/', protect, async (req, res) => {
  try {
    const { jobId, coverNote } = req.body;
    const studentId = req.user._id;

    const existing = await Application.findOne({ jobId, studentId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already applied for this role.' });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const match = calculateJobMatch(req.user.skills || [], job.requiredSkills, job.preferredSkills);

    const application = await Application.create({
      jobId,
      studentId,
      coverNote,
      matchScore: match.score,
      matchedSkills: match.matchedSkills,
      missingSkills: match.missingSkills,
      timeline: [{
        status: 'Submitted',
        note: `Applied with ${match.score}% Skill-Match readiness`,
        date: new Date()
      }]
    });

    res.status(201).json({ success: true, application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Student: Get my applications (Application tracking)
router.get('/my', protect, async (req, res) => {
  try {
    const applications = await Application.find({ studentId: req.user._id })
      .populate('jobId')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: applications.length, applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Get all applications for review
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('jobId')
      .populate('studentId', 'name email skills headline targetRole')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: applications.length, applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Update application status (CRUD: Update)
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, note } = req.body;
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    application.status = status;
    application.timeline.push({
      status,
      note: note || `Status updated to ${status}`,
      date: new Date()
    });

    await application.save();
    res.json({ success: true, application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Student: Withdraw application (CRUD: Delete)
router.delete('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, studentId: req.user._id });
    if (!application) return res.status(404).json({ success: false, message: 'Application not found or unauthorized' });

    await application.deleteOne();
    res.json({ success: true, message: 'Application withdrawn successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
