const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  type: { type: String, enum: ['mcq', 'conceptual', 'coding'], default: 'mcq' },
  question: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: mongoose.Schema.Types.Mixed },
  explanation: { type: String, default: '' },
  sampleSolution: { type: String, default: '' },
  starterCode: { type: String, default: '' },
  points: { type: Number, default: 25 }
}, { _id: true });

const AssessmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  skill: { type: String, required: true, index: true },
  category: { type: String, enum: ['module-self-quiz', 'cohort-drive', 'skill-verification'], default: 'cohort-drive' },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
  moduleId: { type: String, default: '' },
  targetClass: {
    department: { type: String, default: 'All' },
    year: { type: Number, default: 0 },
    section: { type: String, default: 'All' }
  },
  timeLimitMinutes: { type: Number, default: 30 },
  passingScore: { type: Number, default: 70 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  questions: [QuestionSchema]
}, { timestamps: true });

module.exports = mongoose.models.Assessment || mongoose.model('Assessment', AssessmentSchema);
