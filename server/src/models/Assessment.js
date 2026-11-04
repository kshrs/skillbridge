import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['mcq', 'conceptual', 'coding'], 
    default: 'mcq' 
  },
  question: { type: String, required: true },
  options: [{ type: String }], // For MCQ
  correctAnswer: { type: mongoose.Schema.Types.Mixed }, // index number for MCQ or key answers
  explanation: { type: String, default: '' },
  sampleSolution: { type: String, default: '' }, // For coding or conceptual rubric
  starterCode: { type: String, default: '' },     // For coding
  testCases: [{
    input: { type: String, default: '' },
    expectedOutput: { type: String, default: '' },
    isHidden: { type: Boolean, default: false }
  }],
  points: { type: Number, default: 10 }
}, { _id: true });

const AssessmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  skill: { type: String, required: true, index: true },
  category: { 
    type: String, 
    enum: ['module-self-quiz', 'cohort-drive', 'skill-verification'], 
    default: 'cohort-drive' 
  },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
  moduleId: { type: String, default: '' },
  
  // Cohort targeting (e.g. IT 3rd Year)
  targetClass: {
    department: { type: String, default: 'All' }, // 'Information Technology', 'Computer Science', etc.
    year: { type: Number, default: 0 },          // 3 for 3rd Year, 0 for All
    section: { type: String, default: 'All' }
  },

  timeLimitMinutes: { type: Number, default: 30 },
  passingScore: { type: Number, default: 70 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  dueDate: { type: Date, default: null },
  questions: [QuestionSchema]
}, { timestamps: true });

export default mongoose.model('Assessment', AssessmentSchema);
