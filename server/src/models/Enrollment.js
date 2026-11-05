const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  lectureNumber: { type: Number, required: true },
  title: { type: String, default: '' },
  content: { type: String, required: true },
  attachedFiles: [{
    fileName: { type: String, required: true },
    fileSize: { type: String, default: '' },
    fileType: { type: String, default: '' },
    uploadedAt: { type: Date, default: Date.now },
    fileData: { type: String, default: '' } // Base64 data URI
  }],
  updatedAt: { type: Date, default: Date.now }
}, { _id: true });

const EnrollmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  completedLectures: [{ type: Number }], // Array of lectureNumber
  lastWatchedLecture: { type: Number, default: 1 },
  progressPercentage: { type: Number, default: 0 },
  notes: [NoteSchema],
  projectArtifacts: [{
    title: { type: String, required: true },
    description: { type: String },
    repoUrl: { type: String },
    demoUrl: { type: String },
    submittedAt: { type: Date, default: Date.now }
  }],
  status: { type: String, enum: ['Active', 'Completed', 'Dropped'], default: 'Active' },
  enrolledAt: { type: Date, default: Date.now },
  lastAccessedAt: { type: Date, default: Date.now }
}, { timestamps: true });

EnrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.models.Enrollment || mongoose.model('Enrollment', EnrollmentSchema);
