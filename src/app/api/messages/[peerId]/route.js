import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Message from '@/models/Message';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const decoded = verifyToken(req);
    if (!decoded) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { peerId } = await params;
    const messages = await Message.find({
      $or: [
        { sender: decoded.id, recipient: peerId },
        { sender: peerId, recipient: decoded.id }
      ]
    }).sort({ createdAt: 1 });

    return NextResponse.json(messages);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    await connectDB();
    const decoded = verifyToken(req);
    if (!decoded) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { peerId } = await params;
    const { content } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ message: 'Content required' }, { status: 400 });
    }

    const message = await Message.create({
      sender: decoded.id,
      recipient: peerId,
      content: content.trim()
    });

    return NextResponse.json(message, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
