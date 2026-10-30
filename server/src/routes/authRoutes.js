import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { analyzeSkillGap } from '../services/aiEngine.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'skillbridge_super_secret_jwt_key_2026', {
    expiresIn: '30d'
  });
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, targetRole } = req.body;
    
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const defaultSkills = [
      { name: 'React', level: 'Intermediate', verified: true },
      { name: 'JavaScript', level: 'Advanced', verified: true },
      { name: 'MongoDB', level: 'Intermediate', verified: false }
    ];

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      targetRole: targetRole || 'Full Stack Developer',
      skills: defaultSkills
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        targetRole: user.targetRole,
        skills: user.skills
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        headline: user.headline,
        bio: user.bio,
        targetRole: user.targetRole,
        skills: user.skills,
        resume: user.resume
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get current user profile
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const skillGap = analyzeSkillGap(user.skills, user.targetRole);
    res.json({ success: true, user, skillGap });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update profile & skills (CRUD: Update)
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, headline, bio, targetRole, skills, education, resume } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (headline) user.headline = headline;
    if (bio) user.bio = bio;
    if (targetRole) user.targetRole = targetRole;
    if (skills) user.skills = skills;
    if (education) user.education = education;
    if (resume) user.resume = { ...user.resume, ...resume };

    await user.save();
    const skillGap = analyzeSkillGap(user.skills, user.targetRole);
    res.json({ success: true, user, skillGap });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add / Remove a Skill
router.post('/skills', protect, async (req, res) => {
  try {
    const { name, level } = req.body;
    const user = await User.findById(req.user._id);
    const existingIndex = user.skills.findIndex(s => s.name.toLowerCase() === name.toLowerCase());

    if (existingIndex > -1) {
      user.skills[existingIndex].level = level || user.skills[existingIndex].level;
    } else {
      user.skills.push({ name, level: level || 'Intermediate', verified: false });
    }

    await user.save();
    const skillGap = analyzeSkillGap(user.skills, user.targetRole);
    res.json({ success: true, skills: user.skills, skillGap });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/skills/:name', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.skills = user.skills.filter(s => s.name.toLowerCase() !== decodeURIComponent(req.params.name).toLowerCase());
    await user.save();
    const skillGap = analyzeSkillGap(user.skills, user.targetRole);
    res.json({ success: true, skills: user.skills, skillGap });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
