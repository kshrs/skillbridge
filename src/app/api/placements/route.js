import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Placement from '@/models/Placement';
import PlacementApplication from '@/models/PlacementApplication';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

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

export async function GET(req) {
  try {
    await connectDB();
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

    return NextResponse.json(enriched);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const decoded = verifyToken(req);
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await User.findById(decoded.id);
    if (!currentUser || !['admin', 'faculty', 'mentor'].includes(currentUser.role)) {
      return NextResponse.json({ success: false, message: 'Forbidden. Staff/Faculty role required.' }, { status: 403 });
    }

    const body = await req.json();
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
    } = body;

    if (!companyName || !roleTitle || !ctcPackage || !driveDate || !registrationDeadline) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: companyName, roleTitle, ctcPackage, driveDate, registrationDeadline'
      }, { status: 400 });
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

    return NextResponse.json({
      success: true,
      message: `Placement drive for ${companyName} published successfully`,
      drive: newDrive
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

