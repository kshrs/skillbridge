import mongoose from 'mongoose';

const AssessmentSchema = new mongoose.Schema({
  skill: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  passingScore: { type: Number, default: 70 },
  questions: [{
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true },
    explanation: { type: String, default: '' }
  }]
}, { timestamps: true });

export default mongoose.model('Assessment', AssessmentSchema);
