import express from 'express';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper to record activity in user's GitHub-style heatmap
const recordHeatmapActivity = async (userId, count = 1, metadata = {}) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const user = await User.findById(userId);
    if (!user) return;

    if (!user.activityLog) user.activityLog = [];
    const entry = user.activityLog.find(a => a.date === today);
    if (entry) {
      entry.count = (entry.count || 0) + count;
      if (metadata.type) {
        entry.details = entry.details || [];
        entry.details.push({ ...metadata, at: new Date() });
      }
    } else {
      user.activityLog.push({
        date: today,
        count: count,
        details: metadata.type ? [{ ...metadata, at: new Date() }] : []
      });
    }
    await user.save();
  } catch (err) {
    console.error('[Heatmap Log Error]:', err.message);
  }
};

// GET /api/enrollment/my - List all enrolled courses for logged-in user
router.get('/my', protect, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id })
      .populate('course')
      .sort({ updatedAt: -1 });
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/enrollment/:courseId - Get single course enrollment details
router.get('/:courseId', protect, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: req.params.courseId
    }).populate('course');

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found for this course' });
    }
    res.json(enrollment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/enrollment/:courseId/enroll - Enroll in a course
router.post('/:courseId/enroll', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    let enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: req.params.courseId
    });

    if (enrollment) {
      return res.json({ message: 'Already enrolled', enrollment });
    }

    enrollment = await Enrollment.create({
      user: req.user._id,
      course: req.params.courseId,
      status: 'in-progress',
      progress: 0,
      completedLectures: [],
      lectureProgress: [],
      notes: [],
      projectArtifacts: []
    });

    // Record activity in heatmap
    await recordHeatmapActivity(req.user._id, 1, {
      type: 'course_enrolled',
      courseTitle: course.title
    });

    // Increment course enrollment count
    course.enrolledCount = (course.enrolledCount || 0) + 1;
    await course.save();

    res.status(201).json({ message: 'Successfully enrolled', enrollment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/enrollment/:courseId/progress - Update lecture playback progress
router.post('/:courseId/progress', protect, async (req, res) => {
  try {
    const { lectureId, playedSeconds, durationSeconds } = req.body;
    if (!lectureId) {
      return res.status(400).json({ message: 'lectureId is required' });
    }

    let enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: req.params.courseId
    });

    if (!enrollment) {
      // Auto-enroll if not enrolled
      enrollment = await Enrollment.create({
        user: req.user._id,
        course: req.params.courseId,
        lectureProgress: []
      });
    }

    const course = await Course.findById(req.params.courseId);
    const duration = durationSeconds || 1800;
    const percentage = Math.min(100, Math.round(((playedSeconds || 0) / duration) * 100));
    const isCompleted = percentage >= 85;

    let lp = enrollment.lectureProgress.find(l => l.lectureId === lectureId);
    if (lp) {
      lp.playedSeconds = Math.max(lp.playedSeconds, playedSeconds || 0);
      lp.durationSeconds = duration;
      lp.percentage = Math.max(lp.percentage, percentage);
      if (isCompleted && !lp.completed) {
        lp.completed = true;
      }
      lp.lastWatchedAt = new Date();
    } else {
      enrollment.lectureProgress.push({
        lectureId,
        playedSeconds: playedSeconds || 0,
        durationSeconds: duration,
        percentage,
        completed: isCompleted,
        lastWatchedAt: new Date()
      });
    }

    if (isCompleted && !enrollment.completedLectures.includes(lectureId)) {
      enrollment.completedLectures.push(lectureId);
      // Heatmap log for lecture completion
      await recordHeatmapActivity(req.user._id, 2, {
        type: 'lecture_completed',
        courseId: req.params.courseId,
        lectureId
      });
    }

    // Calculate overall course progress
    let totalLectures = 0;
    if (course && course.modules) {
      course.modules.forEach(m => {
        totalLectures += (m.lectures ? m.lectures.length : 0);
      });
    }
    if (totalLectures === 0) totalLectures = 1;

    enrollment.progress = Math.min(100, Math.round((enrollment.completedLectures.length / totalLectures) * 100));
    if (enrollment.progress >= 100) {
      enrollment.status = 'completed';
      // If student completed course, add skills to user's profile if not present
      if (course && course.skillsCovered) {
        const user = await User.findById(req.user._id);
        if (user) {
          course.skillsCovered.forEach(skill => {
            const hasSkill = user.skills.some(s => s.name.toLowerCase() === skill.toLowerCase());
            if (!hasSkill) {
              user.skills.push({ name: skill, level: 'Intermediate', verified: false });
            }
          });
          await user.save();
        }
      }
    }

    enrollment.lastAccessedAt = new Date();
    await enrollment.save();

    res.json({
      message: 'Progress recorded',
      progress: enrollment.progress,
      completedLectures: enrollment.completedLectures,
      lectureProgress: enrollment.lectureProgress
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/enrollment/:courseId/notes - Add or update module notes
router.post('/:courseId/notes', protect, async (req, res) => {
  try {
    const { moduleId, moduleTitle, content } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Note content is required' });
    }

    let enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: req.params.courseId
    });

    if (!enrollment) {
      enrollment = await Enrollment.create({
        user: req.user._id,
        course: req.params.courseId
      });
    }

    const existingIndex = enrollment.notes.findIndex(n => n.moduleId === moduleId);
    if (existingIndex >= 0) {
      enrollment.notes[existingIndex].content = content;
      enrollment.notes[existingIndex].moduleTitle = moduleTitle || enrollment.notes[existingIndex].moduleTitle;
      enrollment.notes[existingIndex].updatedAt = new Date();
    } else {
      enrollment.notes.push({
        moduleId: moduleId || '',
        moduleTitle: moduleTitle || 'Course General Notes',
        content,
        updatedAt: new Date()
      });
    }

    await enrollment.save();

    // Heatmap bump
    await recordHeatmapActivity(req.user._id, 1, {
      type: 'notes_updated',
      courseId: req.params.courseId
    });

    res.json({ message: 'Notes saved', notes: enrollment.notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/enrollment/:courseId/artifacts - Submit project artifact / github repo
router.post('/:courseId/artifacts', protect, async (req, res) => {
  try {
    const { title, repoUrl, demoUrl, description } = req.body;
    if (!title || !repoUrl) {
      return res.status(400).json({ message: 'Title and repoUrl are required' });
    }

    let enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: req.params.courseId
    });

    if (!enrollment) {
      enrollment = await Enrollment.create({
        user: req.user._id,
        course: req.params.courseId
      });
    }

    enrollment.projectArtifacts.push({
      title,
      repoUrl,
      demoUrl,
      description,
      submittedAt: new Date()
    });

    await enrollment.save();

    // Heatmap bump
    await recordHeatmapActivity(req.user._id, 3, {
      type: 'artifact_submitted',
      title,
      repoUrl
    });

    res.status(201).json({ message: 'Artifact submitted successfully', artifacts: enrollment.projectArtifacts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
