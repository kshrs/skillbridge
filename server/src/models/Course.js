import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  provider: { type: String, required: true },
  thumbnail: { type: String, default: '' },
  targetSkill: { type: String, required: true },
  relatedSkills: [String],
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  duration: { type: String, default: '12 hours' },
  modulesCount: { type: Number, default: 6 },
  rating: { type: Number, default: 4.8 },
  url: { type: String, default: 'https://skillbridge.dev/curriculum' },
  summary: { type: String, required: true },
  topics: [String]
}, { timestamps: true });

export default mongoose.model('Course', CourseSchema);
