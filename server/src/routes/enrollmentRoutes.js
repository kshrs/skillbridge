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
    const { lectureNumber, completed, lectureId, playedSeconds, durationSeconds } = req.body;
    let enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.courseId
    }).populate('course');

    if (!enrollment) {
      enrollment = await Enrollment.create({
        user: req.user.id,
        course: req.params.courseId,
        completedLectures: [],
        lastWatchedLecture: 1,
        progressPercentage: 0
      });
      enrollment = await Enrollment.findById(enrollment._id).populate('course');
    }

    // Determine target lecture number
    let targetNum = Number(lectureNumber);
    if (!targetNum && lectureId && enrollment.course?.modules) {
      for (const m of enrollment.course.modules) {
        const found = (m.lectures || []).find(l => 
          (l.lectureId && l.lectureId.toString() === lectureId.toString()) || 
          (l._id && l._id.toString() === lectureId.toString()) ||
          (l.lectureNumber && Number(l.lectureNumber) === Number(lectureId))
        );
        if (found) {
          targetNum = found.lectureNumber;
          break;
        }
      }
    }
    if (!targetNum) targetNum = 1;

    const totalLectures = enrollment.course?.modules?.reduce((acc, m) => acc + (m.lectures?.length || 0), 0) || 10;

    // Toggle or ensure completion
    const isAlreadyCompleted = enrollment.completedLectures.includes(targetNum);
    if (completed === false) {
      enrollment.completedLectures = enrollment.completedLectures.filter(n => n !== targetNum);
    } else if (!isAlreadyCompleted) {
      enrollment.completedLectures.push(targetNum);
    }

    enrollment.lastWatchedLecture = targetNum;
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
          action: `Watched Lecture ${targetNum}`
        }
      }
    });

    res.json({
      success: true,
      enrollment,
      progress: enrollment.progressPercentage,
      progressPercentage: enrollment.progressPercentage,
      completedLectures: enrollment.completedLectures
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save or append notes with attachments
router.post('/:courseId/notes', protect, async (req, res) => {
  try {
    const { lectureNumber = 1, content, title, attachedFile, attachedFiles = [] } = req.body;
    let enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.courseId
    });

    if (!enrollment) {
      enrollment = await Enrollment.create({
        user: req.user.id,
        course: req.params.courseId,
        completedLectures: [],
        lastWatchedLecture: Number(lectureNumber) || 1,
        progressPercentage: 0
      });
    }

    const targetNum = Number(lectureNumber) || 1;
    const allFiles = attachedFile ? [attachedFile] : (Array.isArray(attachedFiles) ? attachedFiles : []);

    const noteIndex = enrollment.notes.findIndex(n => n.lectureNumber === targetNum);
    if (noteIndex > -1) {
      enrollment.notes[noteIndex].content = content;
      if (title) enrollment.notes[noteIndex].title = title;
      enrollment.notes[noteIndex].updatedAt = new Date();
      if (allFiles.length > 0) {
        enrollment.notes[noteIndex].attachedFiles = allFiles;
      }
    } else {
      enrollment.notes.push({
        lectureNumber: targetNum,
        title: title || `Lecture ${targetNum} Notes`,
        content: content || '',
        attachedFiles: allFiles,
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
          action: `Added Notes for Lecture ${targetNum}`
        }
      }
    });

    res.json({
      success: true,
      notes: enrollment.notes,
      enrollment
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register Project Done / Artifacts for this Course
router.post('/:courseId/projects', protect, async (req, res) => {
  try {
    const { title, description, repoUrl, demoUrl } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Project title is required' });
    }

    let enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.courseId
    }).populate('course');

    if (!enrollment) {
      enrollment = await Enrollment.create({
        user: req.user.id,
        course: req.params.courseId,
        completedLectures: [],
        lastWatchedLecture: 1,
        progressPercentage: 0
      });
      enrollment = await Enrollment.findById(enrollment._id).populate('course');
    }

    const newArtifact = {
      title: title.trim(),
      description: description ? description.trim() : '',
      repoUrl: repoUrl ? repoUrl.trim() : '',
      demoUrl: demoUrl ? demoUrl.trim() : '',
      submittedAt: new Date()
    };

    enrollment.projectArtifacts.push(newArtifact);
    await enrollment.save();

    // Log activity
    const today = new Date().toISOString().split('T')[0];
    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        activityLog: {
          date: today,
          count: 5,
          action: `Submitted Project: ${title.trim()}`
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Project registered successfully',
      projectArtifacts: enrollment.projectArtifacts,
      enrollment
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
