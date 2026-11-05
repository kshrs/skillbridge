const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Get all enrolled courses for logged in user
router.get('/my', protect, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user.id })
      .populate('course')
      .sort({ updatedAt: -1 });
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get specific enrollment
router.get('/:courseId', protect, async (req, res) => {
  try {
    let enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.courseId
    }).populate('course');

    if (!enrollment) {
      // Auto-enroll if accessing course
      enrollment = await Enrollment.create({
        user: req.user.id,
        course: req.params.courseId,
        completedLectures: [],
        lastWatchedLecture: 1,
        progressPercentage: 0
      });
      enrollment = await Enrollment.findById(enrollment._id).populate('course');
    }

    res.json(enrollment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Explicit enroll
router.post('/:courseId/enroll', protect, async (req, res) => {
  try {
    let enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.courseId
    });

    if (!enrollment) {
      enrollment = await Enrollment.create({
        user: req.user.id,
        course: req.params.courseId,
        completedLectures: [],
        lastWatchedLecture: 1,
        progressPercentage: 0
      });

      // Update student activity
      const today = new Date().toISOString().split('T')[0];
      await User.findByIdAndUpdate(req.user.id, {
        $push: {
          activityLog: {
            date: today,
            count: 1,
            action: 'Enrolled in Course'
          }
        }
      });
    }

    enrollment = await Enrollment.findById(enrollment._id).populate('course');
    res.json(enrollment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update lecture watch progress
router.post('/:courseId/progress', protect, async (req, res) => {
  try {
    const { lectureNumber, completed } = req.body;
    let enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.courseId
    }).populate('course');

    if (!enrollment) {
      enrollment = await Enrollment.create({
        user: req.user.id,
        course: req.params.courseId,
        completedLectures: [],
        lastWatchedLecture: lectureNumber || 1,
        progressPercentage: 0
      });
      enrollment = await Enrollment.findById(enrollment._id).populate('course');
    }

    const totalLectures = enrollment.course?.modules?.reduce((acc, m) => acc + (m.lectures?.length || 0), 0) || 10;

    if (completed && !enrollment.completedLectures.includes(lectureNumber)) {
      enrollment.completedLectures.push(lectureNumber);
    }
    enrollment.lastWatchedLecture = lectureNumber;
    enrollment.progressPercentage = Math.min(100, Math.round((enrollment.completedLectures.length / totalLectures) * 100));
    enrollment.lastAccessedAt = new Date();

    await enrollment.save();

    // Log activity
    const today = new Date().toISOString().split('T')[0];
    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        activityLog: {
          date: today,
          count: 1,
          action: `Watched Lecture ${lectureNumber}`
        }
      }
    });

    res.json(enrollment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save or append notes with attachments
router.post('/:courseId/notes', protect, async (req, res) => {
  try {
    const { lectureNumber, content, title, attachedFile } = req.body;
    let enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.courseId
    });

    if (!enrollment) {
      enrollment = await Enrollment.create({
        user: req.user.id,
        course: req.params.courseId,
        completedLectures: [],
        lastWatchedLecture: lectureNumber || 1,
        progressPercentage: 0
      });
    }

    const noteIndex = enrollment.notes.findIndex(n => n.lectureNumber === lectureNumber);
    if (noteIndex > -1) {
      enrollment.notes[noteIndex].content = content;
      if (title) enrollment.notes[noteIndex].title = title;
      enrollment.notes[noteIndex].updatedAt = new Date();
      if (attachedFile) {
        enrollment.notes[noteIndex].attachedFiles.push(attachedFile);
      }
    } else {
      enrollment.notes.push({
        lectureNumber,
        title: title || `Lecture ${lectureNumber} Field Notes`,
        content,
        attachedFiles: attachedFile ? [attachedFile] : [],
        updatedAt: new Date()
      });
    }

    await enrollment.save();

    // Log activity
    const today = new Date().toISOString().split('T')[0];
    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        activityLog: {
          date: today,
          count: 2,
          action: `Added Notes for Lecture ${lectureNumber}`
        }
      }
    });

    res.json(enrollment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
