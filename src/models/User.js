import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin', 'faculty', 'mentor'], default: 'student' },

  academicProfile: {
    department: { type: String, default: 'Information Technology' },
    year: { type: Number, default: 3 },
    section: { type: String, default: 'A' },
    rollNumber: { type: String, default: '22IT1042' },
    cgpa: { type: Number, default: 8.92 }
  },

  headline: { type: String, default: 'Student & Aspiring Software Engineer' },
  bio: { type: String, default: 'Passionate student learning computer science foundations, open courseware, and modern full-stack architectures.' },
  avatar: { type: String, default: '' },
  targetRole: { type: String, default: 'AI / ML Engineer' },
  geminiApiKey: { type: String, default: '' },

  skills: [{
    name: { type: String, required: true },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], default: 'Intermediate' },
    verified: { type: Boolean, default: false },
    verifiedAt: { type: Date }
  }],

  activityLog: [{
    date: { type: String }, // 'YYYY-MM-DD'
    count: { type: Number, default: 1 },
    action: { type: String },
    details: [{ type: mongoose.Schema.Types.Mixed }]
  }],

  staffProfile: {
    department: { type: String, default: 'Information Technology' },
    title: { type: String, default: 'Associate Professor & Placement Mentor' },
    designation: { type: String, default: 'Associate Professor' },
    disciplines: [{ type: String }],
    officeLocation: { type: String, default: 'Academic Complex Block B, Room 304' },
    officeHours: { type: String, default: 'Mon-Thu 2:00 PM - 5:00 PM' },
    contactEmail: { type: String, default: '' }
  },

  resume: {
    title: { type: String, default: '' },
    summary: { type: String, default: '' }
  }
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', UserSchema);
