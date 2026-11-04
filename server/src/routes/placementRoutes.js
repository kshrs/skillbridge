import express from 'express';
import Placement from '../models/Placement.js';
import PlacementApplication from '../models/PlacementApplication.js';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Helper to calculate prerequisite skill match between user's skills and placement requirements
const calculatePlacementMatch = (userSkills = [], requiredSkills = [], preferredSkills = []) => {
  const normUserSkills = userSkills.map(s => (typeof s === 'string' ? s : s.name || '').toLowerCase().trim());
  const normReq = requiredSkills.map(s => s.toLowerCase().trim());
  const normPref = (preferredSkills || []).map(s => s.toLowerCase().trim());

  let matchedRequired = 0;
  const matched = [];
  const missing = [];

  normReq.forEach((req, idx) => {
    if (normUserSkills.some(us => us === req || us.includes(req) || req.includes(us))) {
      matchedRequired++;
      matched.push(requiredSkills[idx]);
    } else {
      missing.push(requiredSkills[idx]);
    }
  });

  let score = 0;
  if (normReq.length > 0) {
    score = Math.round((matchedRequired / normReq.length) * 85); // 85% weight for required
  } else {
    score = 80;
  }

  // Bonus for preferred skills
  let matchedPreferred = 0;
  normPref.forEach((pref, idx) => {
    if (normUserSkills.some(us => us === pref || us.includes(pref) || pref.includes(us))) {
      matchedPreferred++;
      matched.push(preferredSkills[idx]);
    }
  });

  if (normPref.length > 0) {
    score += Math.min(15, Math.round((matchedPreferred / normPref.length) * 15));
  }

  score = Math.min(100, Math.max(0, score));

  return {
    score,
    matchedSkills: [...new Set(matched)],
    missingSkills: missing
  };
};

// GET /api/placements - List all campus drives with match score for logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const drives = await Placement.find().sort({ driveDate: 1 });
    const user = await User.findById(req.user._id);

    // Fetch user's existing applications
    const userApps = await PlacementApplication.find({ student: req.user._id });
    const appMap = {};
    userApps.forEach(a => {
      appMap[a.placement.toString()] = {
        applied: true,
        ticketNumber: a.ticketNumber,
        currentStage: a.currentStage,
        appliedAt: a.appliedAt
      };
    });

    const enrichedDrives = drives.map(drive => {
      const match = calculatePlacementMatch(user?.skills || [], drive.requiredSkills, drive.preferredSkills);
      const appInfo = appMap[drive._id.toString()] || { applied: false };
      
      // Check academic eligibility
      const studentDept = user?.academicProfile?.department || '';
      const studentYear = user?.academicProfile?.year || 0;
      const isDeptEligible = !drive.eligibleDepartments || drive.eligibleDepartments.length === 0 || 
        drive.eligibleDepartments.includes(studentDept) || drive.eligibleDepartments.includes('All');
      const isYearEligible = !drive.eligibleGraduationYears || drive.eligibleGraduationYears.length === 0 || 
        drive.eligibleGraduationYears.includes(studentYear) || drive.eligibleGraduationYears.includes(0);

      return {
        ...drive.toObject(),
        matchScore: match.score,
        matchedSkills: match.matchedSkills,
        missingSkills: match.missingSkills,
        application: appInfo,
        isEligible: isDeptEligible && isYearEligible
      };
    });

    res.json(enrichedDrives);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/placements/:id - Single drive detail
router.get('/:id', protect, async (req, res) => {
  try {
    const drive = await Placement.findById(req.params.id);
    if (!drive) return res.status(404).json({ message: 'Drive not found' });
    
    const user = await User.findById(req.user._id);
    const match = calculatePlacementMatch(user?.skills || [], drive.requiredSkills, drive.preferredSkills);
    const existingApp = await PlacementApplication.findOne({
      placement: drive._id,
      student: req.user._id
    });

    res.json({
      ...drive.toObject(),
      matchScore: match.score,
      matchedSkills: match.matchedSkills,
      missingSkills: match.missingSkills,
      application: existingApp || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/placements/:id/apply - 1-Click application with Ticket Number Generation
router.post('/:id/apply', protect, async (req, res) => {
  try {
    const drive = await Placement.findById(req.params.id);
    if (!drive) return res.status(404).json({ message: 'Drive not found' });

    const existingApp = await PlacementApplication.findOne({
      placement: drive._id,
      student: req.user._id
    });

    if (existingApp) {
      return res.status(400).json({ message: 'Already applied for this campus drive', ticketNumber: existingApp.ticketNumber });
    }

    const user = await User.findById(req.user._id);
    const match = calculatePlacementMatch(user?.skills || [], drive.requiredSkills, drive.preferredSkills);

    // Generate ticket number: TKT-{YEAR}-{DEPT_ACRONYM}-{RANDOM4}
    const currentYear = new Date().getFullYear();
    const dept = user?.academicProfile?.department || 'ENG';
    const deptAcronym = dept
      .split(' ')
      .map(w => w[0].toUpperCase())
      .join('')
      .slice(0, 4) || 'IT';
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `TKT-${currentYear}-${deptAcronym}-${randomSeq}`;

    const newApp = await PlacementApplication.create({
      ticketNumber,
      placement: drive._id,
      student: req.user._id,
      academicSnapshot: {
        department: user?.academicProfile?.department || '',
        year: user?.academicProfile?.year || 0,
        rollNumber: user?.academicProfile?.rollNumber || '',
        cgpa: user?.academicProfile?.cgpa || 0
      },
      skillMatchSnapshot: {
        score: match.score,
        matchedSkills: match.matchedSkills,
        missingSkills: match.missingSkills
      },
      resumeUrl: user?.resume?.title || 'SkillBridge ATS Resume',
      portfolioUrl: `https://skillbridge.edu/portfolio/${user._id}`,
      currentStage: 'Registered',
      stageHistory: [{
        stage: 'Registered',
        updatedAt: new Date(),
        notes: `Application registered via SkillBridge 1-Click with ${match.score}% skill compatibility.`
      }]
    });

    res.status(201).json({
      message: 'Application submitted successfully!',
      ticketNumber: newApp.ticketNumber,
      application: newApp
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/placements/applications/my - Student's application roster
router.get('/applications/my', protect, async (req, res) => {
  try {
    const apps = await PlacementApplication.find({ student: req.user._id })
      .populate('placement')
      .sort({ appliedAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN ROUTES
// POST /api/placements - Create new placement drive (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const newDrive = await Placement.create({
      ...req.body,
      createdBy: req.user._id
    });
    res.status(201).json(newDrive);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/placements/admin/pipeline - All applicant tickets across drives (admin)
router.get('/admin/pipeline', protect, adminOnly, async (req, res) => {
  try {
    const apps = await PlacementApplication.find()
      .populate('placement')
      .populate('student', 'name email academicProfile skills')
      .sort({ appliedAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/placements/admin/pipeline/:id/stage - Update candidate's stage (admin)
router.patch('/admin/pipeline/:id/stage', protect, adminOnly, async (req, res) => {
  try {
    const { stage, notes } = req.body;
    const app = await PlacementApplication.findById(req.params.id);
    if (!app) return res.status(404).json({ message: 'Application not found' });

    app.currentStage = stage;
    app.stageHistory.push({
      stage,
      updatedAt: new Date(),
      notes: notes || `Moved to stage: ${stage}`,
      updatedBy: req.user._id
    });
    await app.save();

    res.json({ message: 'Stage updated', application: app });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
