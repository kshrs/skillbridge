import express from 'express';
import Job from '../models/Job.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { calculateJobMatch } from '../services/aiEngine.js';

const router = express.Router();

// List jobs with AI matching if user is authenticated
router.get('/', async (req, res) => {
  try {
    const { search, type, workplace, role } = req.query;
    let query = { isActive: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { requiredSkills: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    if (type) query.type = type;
    if (workplace) query.workplaceType = workplace;

    const jobs = await Job.find(query).sort({ createdAt: -1 });

    // Optional token decoding for personalized match score calculation
    let userSkills = [];
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'skillbridge_super_secret_jwt_key_2026');
        const User = (await import('../models/User.js')).default;
        const user = await User.findById(decoded.id);
        if (user) userSkills = user.skills || [];
      } catch (e) {
        // Continue unauthenticated match
      }
    }

    const jobsWithMatch = jobs.map(j => {
      const jobObj = j.toObject();
      if (userSkills.length > 0) {
        const match = calculateJobMatch(userSkills, j.requiredSkills, j.preferredSkills);
        jobObj.matchScore = match.score;
        jobObj.matchedSkills = match.matchedSkills;
        jobObj.missingSkills = match.missingSkills;
      } else {
        jobObj.matchScore = null;
      }
      return jobObj;
    });

    res.json({ success: true, count: jobsWithMatch.length, jobs: jobsWithMatch });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single job details
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Create job (CRUD: Create)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      postedBy: req.user._id
    };
    const job = await Job.create(jobData);
    res.status(201).json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Update job (CRUD: Update)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Delete job (CRUD: Delete)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
