const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Placement = require('../models/Placement');
const PlacementApplication = require('../models/PlacementApplication');
const AssessmentResult = require('../models/AssessmentResult');
const { protect, staffOnly } = require('../middleware/auth');

// GET /api/admin/students
router.get('/students', protect, staffOnly, async (req, res) => {
  try {
    const { department, year, search, studentId } = req.query;

    if (studentId) {
      const student = await User.findById(studentId).select('-password');
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }

      const enrollments = await Enrollment.find({ user: studentId }).populate('course', 'title institution code thumbnail modules');
      const applications = await PlacementApplication.find({ student: studentId }).populate('placement', 'companyName roleTitle ctcPackage driveDate');
      const assessmentResults = await AssessmentResult.find({ user: studentId }).populate('assessment', 'title skill passingScore');

      return res.json({
        student,
        enrollments,
        applications,
        assessmentResults
      });
    }

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
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/tickets
router.get('/tickets', protect, staffOnly, async (req, res) => {
  try {
    const { placementId, stage } = req.query;
    const filter = {};
    if (placementId && placementId !== 'All') {
      filter.placement = placementId;
    }
    if (stage && stage !== 'All') {
      filter.currentStage = stage;
    }

    const applications = await PlacementApplication.find(filter)
      .populate('placement', 'companyName roleTitle ctcPackage driveDate driveType status')
      .populate('student', 'name email academicProfile skills avatar headline')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/tickets
router.patch('/tickets', protect, staffOnly, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const { applicationId, nextStage, reviewNotes } = req.body;

    if (!applicationId || !nextStage) {
      return res.status(400).json({ success: false, message: 'applicationId and nextStage are required' });
    }

    const application = await PlacementApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.currentStage = nextStage;
    application.stageHistory.push({
      stage: nextStage,
      updatedAt: new Date(),
      notes: reviewNotes || `Stage updated to ${nextStage} by ${currentUser.name}`
    });

    await application.save();

    res.json({
      success: true,
      message: `Application ticket ${application.ticketNumber} updated to ${nextStage}`,
      application
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
