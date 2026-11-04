import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin', 'staff', 'faculty', 'mentor'], default: 'student' },

  // Academic Cohort Profile (For admin targeting e.g. IT 3rd Year)
  academicProfile: {
    department: { type: String, default: 'Information Technology' }, // e.g., 'Information Technology', 'Computer Science'
    year: { type: mongoose.Schema.Types.Mixed, default: 3 },        // number 3 or '3rd Year'
    section: { type: String, default: 'A' },
    rollNumber: { type: String, default: '22IT1042' },
    cgpa: { type: Number, default: 8.8 }
  },

  headline: { type: String, default: 'Student & Aspiring Software Engineer' },
  bio: { type: String, default: 'Passionate student learning computer science foundations, open courseware, and modern full-stack architectures.' },
  avatar: { type: String, default: '' },
  targetRole: { type: String, default: 'Full Stack Developer' },
  geminiApiKey: { type: String, default: '' }, // For client-side on-demand quiz generation and rubric evaluation

  // Verified Competencies & Skills
  skills: [{
    name: { type: String, required: true },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], default: 'Intermediate' },
    verified: { type: Boolean, default: false },
    verifiedAt: { type: Date }
  }],

  // GitHub-style Daily Learning Activity Log (for heatmap visualization)
  activityLog: [{
    date: { type: String }, // 'YYYY-MM-DD'
    count: { type: Number, default: 1 },
    action: { type: String },
    details: [{ type: mongoose.Schema.Types.Mixed }]
  }],

  // Staff / Mentor Profile (when role in faculty/staff/mentor/admin)
  staffProfile: {
    department: { type: String, default: 'Information Technology' },
    title: { type: String, default: 'Associate Professor & Placement Mentor' },
    designation: { type: String, default: 'Associate Professor' },
    disciplines: [{ type: String }], // e.g. ['Natural Language Processing', 'Distributed Systems']
    officeLocation: { type: String, default: 'Academic Complex Block B, Room 304' },
    officeHours: { type: String, default: 'Mon-Thu 2:00 PM - 5:00 PM' },
    contactEmail: { type: String, default: '' }
  },

  education: [{
    degree: { type: String },
    institution: { type: String },
    year: { type: String },
    grade: { type: String }
  }],

  resume: {
    title: { type: String, default: '' },
    summary: { type: String, default: '' }
  },

  assessmentResults: [{
    skill: { type: String },
    score: { type: Number },
    total: { type: Number },
    percentage: { type: Number },
    passed: { type: Boolean },
    date: { type: Date, default: Date.now }
  }],

  matchedMentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

// Password hashing middleware
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

// Compare password helper
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', UserSchema);
