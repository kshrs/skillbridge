const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/messages/faculty (students list faculty mentors)
router.get('/faculty', async (req, res) => {
  try {
    const faculty = await User.find({ role: { $in: ['faculty', 'admin', 'mentor'] } })
      .select('-password')
      .sort({ name: 1 });
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/messages/peers (smart peer listing for staff & students)
router.get('/peers', protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) return res.status(404).json({ message: 'User not found' });

    if (['admin', 'faculty', 'mentor'].includes(currentUser.role)) {
      const messages = await Message.find({
        $or: [{ sender: currentUser._id }, { recipient: currentUser._id }]
      }).sort({ createdAt: -1 });

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

      studentList.sort((a, b) => {
        if (a.unreadCount !== b.unreadCount) return b.unreadCount - a.unreadCount;
        if (a.lastMessage && b.lastMessage) {
          return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
        }
        if (a.lastMessage) return -1;
        if (b.lastMessage) return 1;
        return a.name.localeCompare(b.name);
      });

      return res.json(studentList);
    }

    const faculty = await User.find({ role: { $in: ['faculty', 'admin', 'mentor'] } })
      .select('-password')
      .sort({ name: 1 });
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/messages/:peerId (retrieve thread)
router.get('/:peerId', protect, async (req, res) => {
  try {
    const { peerId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, recipient: peerId },
        { sender: peerId, recipient: req.user.id }
      ]
    }).sort({ createdAt: 1 });

    // Mark unread incoming messages as read
    await Message.updateMany(
      { sender: peerId, recipient: req.user.id, read: false },
      { $set: { read: true, readAt: new Date() } }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/messages/:peerId (send message)
router.post('/:peerId', protect, async (req, res) => {
  try {
    const { peerId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content required' });
    }

    const message = await Message.create({
      sender: req.user.id,
      recipient: peerId,
      content: content.trim()
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
