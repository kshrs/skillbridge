import express from 'express';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Course from '../models/Course.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ isActive: true });
    const totalApplications = await Application.countDocuments();
    const totalCourses = await Course.countDocuments();

    // Skill distribution among all students
    const students = await User.find({ role: 'student' }, 'skills targetRole');
    const skillCounts = {};
    const targetRoles = {};

    students.forEach(s => {
      if (s.targetRole) {
        targetRoles[s.targetRole] = (targetRoles[s.targetRole] || 0) + 1;
      }
      (s.skills || []).forEach(sk => {
        skillCounts[sk.name] = (skillCounts[sk.name] || 0) + 1;
      });
    });

    const recentApplications = await Application.find()
      .populate('jobId', 'title company')
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      success: true,
      metrics: {
        totalStudents,
        totalJobs,
        activeJobs,
        totalApplications,
        totalCourses
      },
      topSkills: Object.entries(skillCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8),
      targetRoles: Object.entries(targetRoles)
        .map(([role, count]) => ({ role, count })),
      recentApplications
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin management: Get all students
router.get('/students', protect, adminOnly, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: students.length, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
