import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  logo: { type: String, default: '' },
  location: { type: String, required: true },
  type: { type: String, enum: ['Full-time', 'Internship', 'Part-time', 'Contract'], default: 'Internship' },
  workplaceType: { type: String, enum: ['Remote', 'Hybrid', 'On-site'], default: 'Remote' },
  salary: { type: String, default: '$45,000 - $65,000 / yr' },
  experienceLevel: { type: String, enum: ['Junior', 'Mid', 'Senior'], default: 'Junior' },
  description: { type: String, required: true },
  requiredSkills: [{ type: String, required: true }],
  preferredSkills: [{ type: String }],
  responsibilities: [String],
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  deadline: { type: Date }
}, { timestamps: true });

export default mongoose.model('Job', JobSchema);
