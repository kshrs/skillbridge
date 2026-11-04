import mongoose from 'mongoose';

const PlacementApplicationSchema = new mongoose.Schema({
  ticketNumber: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  }, // Format: TKT-2026-IT-0042
  placement: { type: mongoose.Schema.Types.ObjectId, ref: 'Placement', required: true, index: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  
  // Snapshot of applicant's metrics at time of application
  academicSnapshot: {
    department: { type: String, default: '' },
    year: { type: Number, default: 0 },
    rollNumber: { type: String, default: '' },
    cgpa: { type: Number, default: 0 }
  },
  
  skillMatchSnapshot: {
    score: { type: Number, default: 0 }, // 0 - 100
    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }]
  },

  resumeUrl: { type: String, default: '' },
  portfolioUrl: { type: String, default: '' },

  currentStage: { 
    type: String, 
    enum: ['Registered', 'Shortlisted', 'Assessment Round', 'Technical Interview', 'Offered', 'Rejected'], 
    default: 'Registered' 
  },
  stageHistory: [{
    stage: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now },
    notes: { type: String, default: '' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],

  appliedAt: { type: Date, default: Date.now }
}, { timestamps: true });

PlacementApplicationSchema.index({ placement: 1, student: 1 }, { unique: true });

export default mongoose.model('PlacementApplication', PlacementApplicationSchema);
