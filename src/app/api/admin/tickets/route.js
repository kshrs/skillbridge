import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Placement from '@/models/Placement';
import PlacementApplication from '@/models/PlacementApplication';
import { verifyToken } from '@/lib/auth';

export async function GET(req) {
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

    const { searchParams } = new URL(req.url);
    const placementId = searchParams.get('placementId');
    const stage = searchParams.get('stage');

    const filter = {};
    if (placementId && placementId !== 'All') {
      filter.placement = placementId;
    }
    if (stage && stage !== 'All') {
      filter.currentStage = stage;
    }

    const applications = await PlacementApplication.find(filter)
      .populate('placement', 'companyName roleTitle ctcPackage driveDate driveType status')
      .populate('student', 'name email academicProfile skills avatar headline')
      .sort({ appliedAt: -1 });

    return NextResponse.json(applications);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await connectDB();
    const decoded = verifyToken(req);
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await User.findById(decoded.id);
    if (!currentUser || !['admin', 'faculty', 'mentor'].includes(currentUser.role)) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { applicationId, nextStage, reviewNotes } = body;

    if (!applicationId || !nextStage) {
      return NextResponse.json({ success: false, message: 'applicationId and nextStage are required' }, { status: 400 });
    }

    const application = await PlacementApplication.findById(applicationId);
    if (!application) {
      return NextResponse.json({ success: false, message: 'Application not found' }, { status: 404 });
    }

    application.currentStage = nextStage;
    application.stageHistory.push({
      stage: nextStage,
      updatedAt: new Date(),
      notes: reviewNotes || `Stage updated to ${nextStage} by ${currentUser.name}`
    });

    await application.save();

    return NextResponse.json({
      success: true,
      message: `Application ticket ${application.ticketNumber} updated to ${nextStage}`,
      application
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
