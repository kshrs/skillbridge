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
