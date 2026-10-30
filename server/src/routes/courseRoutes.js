import express from 'express';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { analyzeSkillGap } from '../services/aiEngine.js';

const router = express.Router();

// List courses & personalized recommendations
router.get('/', async (req, res) => {
  try {
    const { skill, level } = req.query;
    let query = {};
    if (skill) query.targetSkill = { $regex: skill, $options: 'i' };
    if (level) query.level = level;

    const courses = await Course.find(query);
    res.json({ success: true, count: courses.length, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Personalized course recommendations based on user's skill gaps
router.get('/recommendations', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const gapAnalysis = analyzeSkillGap(user.skills || [], user.targetRole);
    const missingSkills = gapAnalysis.missingSkills;
    const recommendedSkills = gapAnalysis.recommendedSkills;

    const targetList = [...new Set([...missingSkills, ...recommendedSkills])];

    const courses = await Course.find({
      $or: [
        { targetSkill: { $in: targetList.map(s => new RegExp(`^${s}$`, 'i')) } },
        { relatedSkills: { $in: targetList.map(s => new RegExp(s, 'i')) } }
      ]
    });

    res.json({
      success: true,
      targetRole: user.targetRole,
      missingSkills,
      recommendedSkills,
      recommendedCourses: courses
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Add course (CRUD: Create)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Delete course (CRUD: Delete)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, message: 'Course removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
