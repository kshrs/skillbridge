import mongoose from 'mongoose';

const PlacementSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  roleTitle: { type: String, required: true },
  logoUrl: { type: String, default: '' },
  driveType: { 
    type: String, 
    enum: ['On-Campus', 'Off-Campus Pool', 'Internship-to-PPO'], 
    default: 'On-Campus' 
  },
  status: { 
    type: String, 
    enum: ['Upcoming', 'Registration Open', 'Screening', 'Interviews Ongoing', 'Completed'], 
    default: 'Registration Open' 
  },
  ctcPackage: { type: String, required: true }, // e.g. "18.5 LPA" or "₹1,20,000/mo Internship"
  location: { type: String, default: 'Bangalore / Hybrid' },
  description: { type: String, default: '' },
  
  // Eligibility & Cohorts
  eligibleDepartments: [{ type: String }], // ['Information Technology', 'Computer Science']
  eligibleGraduationYears: [{ type: Number }], // [2026, 2027]
  minCgpa: { type: Number, default: 7.0 },

  // Prerequisite Skills
  requiredSkills: [{ type: String, required: true }],
  preferredSkills: [{ type: String }],

  driveDate: { type: Date, required: true },
  registrationDeadline: { type: Date, required: true },
  selectionProcess: [{ type: String }], // ['Online Assessment', 'Technical Round 1', 'HR Discussion']

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Placement', PlacementSchema);
