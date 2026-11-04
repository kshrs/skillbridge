import mongoose from 'mongoose';

const AnswerSubmissionSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  questionType: { type: String, enum: ['mcq', 'conceptual', 'coding'] },
  questionText: { type: String, default: '' },
  selectedOption: { type: Number, default: -1 },
  textAnswer: { type: String, default: '' },
  isCorrect: { type: Boolean, default: false },
  earnedPoints: { type: Number, default: 0 },
  maxPoints: { type: Number, default: 25 },
  aiFeedback: {
    score: { type: Number, default: 0 },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    constructiveFeedback: { type: String, default: '' }
  }
}, { _id: false });

const AssessmentResultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  assessment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true, index: true },
  answers: [AnswerSubmissionSchema],
  totalScore: { type: Number, default: 0 },
  maxPossibleScore: { type: Number, default: 100 },
  percentage: { type: Number, default: 0 },
  passed: { type: Boolean, default: false },
  overallFeedback: { type: String, default: '' },
  verifiedSkillCredited: { type: String, default: '' },
  completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.AssessmentResult || mongoose.model('AssessmentResult', AssessmentResultSchema);
