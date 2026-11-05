const mongoose = require('mongoose');

const SubmissionAnswerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  submittedAnswer: { type: mongoose.Schema.Types.Mixed },
  isCorrect: { type: Boolean, default: false },
  scoreAwarded: { type: Number, default: 0 },
  feedback: { type: String, default: '' }
}, { _id: false });

const AssessmentResultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  assessment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true, index: true },
  answers: [SubmissionAnswerSchema],
  totalScore: { type: Number, required: true },
  maxScore: { type: Number, required: true },
  percentage: { type: Number, required: true },
  passed: { type: Boolean, required: true },
  verificationGranted: { type: Boolean, default: false },
  timeSpentSeconds: { type: Number, default: 0 },
  completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

AssessmentResultSchema.index({ user: 1, assessment: 1 });

module.exports = mongoose.models.AssessmentResult || mongoose.model('AssessmentResult', AssessmentResultSchema);
