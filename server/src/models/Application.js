import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['Submitted', 'Under Review', 'Skill Assessment', 'Interview Scheduled', 'Offered', 'Rejected'],
    default: 'Submitted'
  },
  coverNote: { type: String, default: '' },
  matchScore: { type: Number, default: 0 },
  matchedSkills: [String],
  missingSkills: [String],
  timeline: [{
    status: String,
    note: String,
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('Application', ApplicationSchema);
