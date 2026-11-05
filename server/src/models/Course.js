const mongoose = require('mongoose');

const LectureSchema = new mongoose.Schema({
  lectureNumber: { type: Number, required: true },
  title: { type: String, required: true },
  youtubeId: { type: String, required: true },
  duration: { type: String, default: '50m' },
  readingNotes: { type: String, default: '' },
  slidesUrl: { type: String, default: '' }
}, { _id: true });

const ModuleSchema = new mongoose.Schema({
  moduleId: { type: String, required: true },
  title: { type: String, required: true },
  lectures: [LectureSchema]
}, { _id: true });

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  institution: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  instructor: { type: String, required: true },
  term: { type: String, default: 'Annual' },
  playlistId: { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  level: { type: String, default: 'Undergraduate / Graduate' },
  prerequisites: [{ type: String }],
  description: { type: String, required: true },
  skillsTaught: [{ type: String }],
  modules: [ModuleSchema]
}, { timestamps: true });

module.exports = mongoose.models.Course || mongoose.model('Course', CourseSchema);
