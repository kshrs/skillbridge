import mongoose from 'mongoose';

const MentorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  avatar: { type: String, default: '' },
  expertise: [String],
  bio: { type: String, required: true },
  experienceYears: { type: Number, default: 5 },
  availability: { type: String, default: '4 slots this week' },
  rating: { type: Number, default: 4.9 },
  sessionsCompleted: { type: Number, default: 42 }
}, { timestamps: true });

export default mongoose.model('Mentor', MentorSchema);
