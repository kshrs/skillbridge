import mongoose from 'mongoose';

const PlacementSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  roleTitle: { type: String, required: true },
  driveType: { type: String, default: 'On-Campus' },
  status: { type: String, default: 'Registration Open' },
  ctcPackage: { type: String, required: true },
  location: { type: String, default: 'Bangalore / Hybrid' },
  description: { type: String, default: '' },
  eligibleDepartments: [{ type: String }],
  eligibleGraduationYears: [{ type: Number }],
  minCgpa: { type: Number, default: 7.0 },
  requiredSkills: [{ type: String, required: true }],
  preferredSkills: [{ type: String }],
  driveDate: { type: Date, required: true },
  registrationDeadline: { type: Date, required: true },
  selectionProcess: [{ type: String }]
}, { timestamps: true });

export default mongoose.models.Placement || mongoose.model('Placement', PlacementSchema);
