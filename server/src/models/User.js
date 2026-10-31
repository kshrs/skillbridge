import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  headline: { type: String, default: 'Computer Science & Engineering Student' },
  bio: { type: String, default: 'Passionate learner aiming to bridge skills into software industry roles.' },
  avatar: { type: String, default: '' },
  targetRole: { type: String, default: 'Full Stack Developer' },
  education: [{
    degree: { type: String },
    institution: { type: String },
    year: { type: String },
    grade: { type: String }
  }],
  skills: [{
    name: { type: String },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
    verified: { type: Boolean, default: false }
  }],
  resume: {
    title: { type: String, default: 'Master Resume' },
    summary: { type: String, default: '' },
    experience: [{
      role: { type: String },
      company: { type: String },
      period: { type: String },
      description: { type: String }
    }],
    projects: [{
      title: { type: String },
      tech: [String],
      link: { type: String },
      description: { type: String }
    }],
    certifications: [String]
  },
  assessmentResults: [{
    skill: String,
    score: Number,
    total: Number,
    percentage: Number,
    passed: Boolean,
    date: { type: Date, default: Date.now }
  }],
  matchedMentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor', default: null },
  geminiApiKey: { type: String, default: '' }
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', UserSchema);
