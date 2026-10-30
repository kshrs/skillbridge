import express from 'express';
import Mentor from '../models/Mentor.js';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Get mentors with matching relevance
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const mentors = await Mentor.find();

    const userSkills = (user.skills || []).map(s => s.name.toLowerCase());

    const mentorsWithMatch = mentors.map(m => {
      const mObj = m.toObject();
      const commonExpertise = m.expertise.filter(exp => 
        userSkills.some(us => us.includes(exp.toLowerCase()) || exp.toLowerCase().includes(us)) ||
        (user.targetRole && user.targetRole.toLowerCase().includes(exp.toLowerCase()))
      );
      mObj.matchedExpertise = commonExpertise;
      mObj.isCurrentMentor = user.matchedMentorId && user.matchedMentorId.toString() === m._id.toString();
      return mObj;
    });

    res.json({ success: true, mentors: mentorsWithMatch });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Book / Select Mentor
router.post('/match/:mentorId', protect, async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.mentorId);
    if (!mentor) return res.status(404).json({ success: false, message: 'Mentor not found' });

    const user = await User.findById(req.user._id);
    user.matchedMentorId = mentor._id;
    await user.save();

    res.json({ success: true, message: `Matched with mentor ${mentor.name}!`, mentor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
