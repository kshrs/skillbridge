import mongoose from 'mongoose';

const EnrollmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  status: { type: String, enum: ['in-progress', 'completed', 'dropped'], default: 'in-progress' },
  progress: { type: Number, default: 0, min: 0, max: 100 }, // Overall course percentage
  completedLectures: [{ type: String }], // lecture IDs completed
  lectureProgress: [{
    lectureId: { type: String, required: true },
    playedSeconds: { type: Number, default: 0 },
    durationSeconds: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    lastWatchedAt: { type: Date, default: Date.now }
  }],
  notes: [{
    moduleId: { type: String, default: '' },
    moduleTitle: { type: String, default: '' },
    content: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now }
  }],
  projectArtifacts: [{
    title: { type: String, required: true },
    repoUrl: { type: String, default: '' },
    demoUrl: { type: String, default: '' },
    description: { type: String, default: '' },
    submittedAt: { type: Date, default: Date.now }
  }],
  enrolledAt: { type: Date, default: Date.now },
  lastAccessedAt: { type: Date, default: Date.now }
}, { timestamps: true });

EnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.model('Enrollment', EnrollmentSchema);
