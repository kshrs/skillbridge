const express = require('express');
const router = express.Router();
const Placement = require('../models/Placement');
const PlacementApplication = require('../models/PlacementApplication');
const User = require('../models/User');
const { verifyToken, protect, staffOnly } = require('../middleware/auth');

const calculatePlacementMatch = (userSkills = [], requiredSkills = [], preferredSkills = []) => {
  const normUserSkills = userSkills.map(s => (typeof s === 'string' ? s : s.name || '').toLowerCase().trim());
  const normReq = requiredSkills.map(s => s.toLowerCase().trim());

  let matched = [];
  let missing = [];

  normReq.forEach((req, idx) => {
    if (normUserSkills.some(us => us === req || us.includes(req) || req.includes(us))) {
      matched.push(requiredSkills[idx]);
    } else {
      missing.push(requiredSkills[idx]);
    }
  });

  const score = normReq.length > 0 ? Math.round((matched.length / normReq.length) * 100) : 80;
  return { score, matchedSkills: matched, missingSkills: missing };
};

// GET /api/placements (all placements with user matching status)
router.get('/', async (req, res) => {
  try {
    const decoded = verifyToken(req);
    const user = decoded ? await User.findById(decoded.id) : null;

    const drives = await Placement.find().sort({ driveDate: 1 });
    const userApps = decoded ? await PlacementApplication.find({ student: decoded.id }) : [];
    const appMap = {};
    userApps.forEach(a => {
      appMap[a.placement.toString()] = {
        applied: true,
        ticketNumber: a.ticketNumber,
        currentStage: a.currentStage
      };
    });

    const enriched = drives.map(drive => {
      const match = calculatePlacementMatch(user?.skills || [], drive.requiredSkills, drive.preferredSkills);
      return {
        ...drive.toObject(),
        matchScore: match.score,
        matchedSkills: match.matchedSkills,
        missingSkills: match.missingSkills,
        application: appMap[drive._id.toString()] || { applied: false }
      };
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/placements (Staff creates placement drive)
router.post('/', protect, staffOnly, async (req, res) => {
  try {
    const {
      companyName,
      roleTitle,
      driveType = 'On-Campus',
      status = 'Registration Open',
      ctcPackage,
      location = 'Bangalore / Hybrid',
      description = '',
      eligibleDepartments = ['Information Technology', 'Computer Science'],
      eligibleGraduationYears = [2026, 2027],
      minCgpa = 7.0,
      requiredSkills = [],
      preferredSkills = [],
      driveDate,
      registrationDeadline,
      selectionProcess = ['Resume Screening', 'Online Technical Assessment', 'System Design Interview', 'HR Round']
    } = req.body;

    if (!companyName || !roleTitle || !ctcPackage || !driveDate || !registrationDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: companyName, roleTitle, ctcPackage, driveDate, registrationDeadline'
      });
    }

    const newDrive = await Placement.create({
      companyName,
      roleTitle,
      driveType,
      status,
      ctcPackage,
      location,
      description,
      eligibleDepartments,
      eligibleGraduationYears,
      minCgpa: Number(minCgpa) || 7.0,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
      preferredSkills: Array.isArray(preferredSkills) ? preferredSkills : preferredSkills.split(',').map(s => s.trim()).filter(Boolean),
      driveDate: new Date(driveDate),
      registrationDeadline: new Date(registrationDeadline),
      selectionProcess: Array.isArray(selectionProcess) ? selectionProcess : selectionProcess.split(',').map(s => s.trim()).filter(Boolean)
    });

    res.status(201).json({
      success: true,
      message: `Placement drive for ${companyName} published successfully`,
      drive: newDrive
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/placements/:driveId/apply (Student generates application ticket)
router.post('/:driveId/apply', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const placement = await Placement.findById(req.params.driveId);

    if (!placement) {
      return res.status(404).json({ message: 'Drive not found' });
    }

    const existing = await PlacementApplication.findOne({
      placement: placement._id,
      student: user._id
    });

    if (existing) {
      return res.status(400).json({ message: 'Already applied', ticketNumber: existing.ticketNumber });
    }

    const deptCode = user.academicProfile?.department
      ? user.academicProfile.department.slice(0, 2).toUpperCase()
      : 'CS';
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `TKT-${new Date().getFullYear()}-${deptCode}-${randomHex}`;

    const match = calculatePlacementMatch(user.skills || [], placement.requiredSkills, placement.preferredSkills);

    const application = await PlacementApplication.create({
      ticketNumber,
      placement: placement._id,
      student: user._id,
      academicSnapshot: {
        department: user.academicProfile?.department,
        year: user.academicProfile?.year,
        rollNumber: user.academicProfile?.rollNumber,
        cgpa: user.academicProfile?.cgpa
      },
      skillMatchSnapshot: {
        score: match.score,
        matchedSkills: match.matchedSkills,
        missingSkills: match.missingSkills
      },
      currentStage: 'Registered',
      stageHistory: [{
        stage: 'Registered',
        updatedAt: new Date(),
        notes: 'Ticket issued upon student application'
      }]
    });

    // Update student activity
    const today = new Date().toISOString().split('T')[0];
    await User.findByIdAndUpdate(user._id, {
      $push: {
        activityLog: {
          date: today,
          count: 2,
          action: `Applied to ${placement.companyName} (${ticketNumber})`
        }
      }
    });

    res.status(201).json({
      success: true,
      message: `Application submitted successfully. Ticket: ${ticketNumber}`,
      ticketNumber,
      application
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
