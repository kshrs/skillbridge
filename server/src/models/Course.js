import mongoose from 'mongoose';

const LectureSchema = new mongoose.Schema({
  lectureId: { type: String, default: '' },
  lectureNumber: { type: Number, default: 1 },
  title: { type: String, required: true },
  youtubeVideoId: { type: String, required: true },
  youtubeUrl: { type: String, required: true },
  duration: { type: String, default: '1 hr 15 min' },
  durationSeconds: { type: Number, default: 4500 },
  summary: { type: String, default: '' },
  keyTopics: [{ type: String }],
  readings: [{ type: String }]
}, { _id: true });

const ModuleSchema = new mongoose.Schema({
  moduleId: { type: String, default: '' },
  moduleNumber: { type: Number, default: 1 },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  skillsLearned: [{ type: String }],
  lectures: [LectureSchema]
}, { _id: true });

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  provider: { type: String, default: 'Stanford Online' }, // alias for university
  university: { type: String, default: 'Stanford Online' },
  instructor: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Beginner-Intermediate', 'Intermediate-Advanced'], default: 'Intermediate' },
  thumbnail: { type: String, default: '' },
  thumbnailUrl: { type: String, default: '' },
  description: { type: String, required: true },
  duration: { type: String, default: '36 hours' },
  durationHours: { type: Number, default: 36 },
  rating: { type: Number, default: 4.9 },
  enrolledStudentsCount: { type: Number, default: 120 },
  enrolledCount: { type: Number, default: 120 },
  prerequisites: [{ type: String }],
  skillsCovered: [{ type: String }],
  skillsTaught: [{ type: String }],
  modules: [ModuleSchema]
}, { timestamps: true });

export default mongoose.model('Course', CourseSchema);
