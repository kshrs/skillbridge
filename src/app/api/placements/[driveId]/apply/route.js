import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Placement from '@/models/Placement';
import PlacementApplication from '@/models/PlacementApplication';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function POST(req, { params }) {
  try {
    await connectDB();
    const decoded = verifyToken(req);
    if (!decoded) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { driveId } = await params;
    const drive = await Placement.findById(driveId);
    if (!drive) return NextResponse.json({ message: 'Drive not found' }, { status: 404 });

    const existingApp = await PlacementApplication.findOne({ placement: driveId, student: decoded.id });
    if (existingApp) {
      return NextResponse.json({ message: 'Already applied', ticketNumber: existingApp.ticketNumber }, { status: 400 });
    }

    const user = await User.findById(decoded.id);
    const currentYear = new Date().getFullYear();
    const dept = user?.academicProfile?.department || 'ENG';
    const deptAcronym = dept.split(' ').map(w => w[0].toUpperCase()).join('').slice(0, 4) || 'IT';
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `TKT-${currentYear}-${deptAcronym}-${randomSeq}`;

    const newApp = await PlacementApplication.create({
      ticketNumber,
      placement: drive._id,
      student: decoded.id,
      academicSnapshot: {
        department: user?.academicProfile?.department || '',
        year: user?.academicProfile?.year || 0,
        rollNumber: user?.academicProfile?.rollNumber || '',
        cgpa: user?.academicProfile?.cgpa || 0
      },
      currentStage: 'Registered',
      stageHistory: [{
        stage: 'Registered',
        updatedAt: new Date(),
        notes: 'Applied via 1-Click Placement Portal'
      }]
    });

    return NextResponse.json({ message: 'Application submitted', ticketNumber, application: newApp }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
