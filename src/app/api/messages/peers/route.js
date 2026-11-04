import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Message from '@/models/Message';
import { verifyToken } from '@/lib/auth';

export async function GET(req) {
  try {
    await connectDB();
    const decoded = verifyToken(req);
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // If staff/faculty: retrieve students with their latest message exchanges or all students who sent messages
    if (['admin', 'faculty', 'mentor'].includes(currentUser.role)) {
      // Find all distinct message peers for this staff member
      const messages = await Message.find({
        $or: [{ sender: currentUser._id }, { recipient: currentUser._id }]
      }).sort({ createdAt: -1 });

      const peerIds = new Set();
      messages.forEach(m => {
        const otherId = m.sender.toString() === currentUser._id.toString() ? m.recipient.toString() : m.sender.toString();
        peerIds.add(otherId);
      });

      // Also include all enrolled students so faculty can initiate or reply
      const allStudents = await User.find({ role: 'student' }).select('-password').sort({ name: 1 });

      const studentList = allStudents.map(student => {
        const studentMessages = messages.filter(
          m => m.sender.toString() === student._id.toString() || m.recipient.toString() === student._id.toString()
        );
        const lastMsg = studentMessages[0] || null;
        const unreadCount = studentMessages.filter(m => m.sender.toString() === student._id.toString() && !m.read).length;

        return {
          ...student.toObject(),
          lastMessage: lastMsg ? {
            content: lastMsg.content,
            createdAt: lastMsg.createdAt,
            sender: lastMsg.sender
          } : null,
          unreadCount
        };
      });

      // Sort students with active conversations / unread messages to the top
      studentList.sort((a, b) => {
        if (a.unreadCount !== b.unreadCount) return b.unreadCount - a.unreadCount;
        if (a.lastMessage && b.lastMessage) {
          return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
        }
        if (a.lastMessage) return -1;
        if (b.lastMessage) return 1;
        return a.name.localeCompare(b.name);
      });

      return NextResponse.json(studentList);
    }

    // Default for students: list faculty mentors
    const faculty = await User.find({ role: { $in: ['faculty', 'admin', 'mentor'] } })
      .select('-password')
      .sort({ name: 1 });
    return NextResponse.json(faculty);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
