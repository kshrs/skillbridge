import express from 'express';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/messages/faculty - List faculty members with disciplines available for mentorship
router.get('/faculty', protect, async (req, res) => {
  try {
    const faculty = await User.find({
      role: { $in: ['faculty', 'admin', 'mentor'] }
    }).select('-password').sort({ name: 1 });

    res.json(faculty);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/messages/threads - List conversations / peer chats for current user
router.get('/threads', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all unique users exchanged messages with
    const sent = await Message.find({ sender: userId }).distinct('recipient');
    const received = await Message.find({ recipient: userId }).distinct('sender');

    const peerIds = [...new Set([...sent.map(String), ...received.map(String)])];
    const peers = await User.find({ _id: { $in: peerIds } }).select('-password');

    // Get last message for each peer
    const threads = await Promise.all(peers.map(async (peer) => {
      const lastMsg = await Message.findOne({
        $or: [
          { sender: userId, recipient: peer._id },
          { sender: peer._id, recipient: userId }
        ]
      }).sort({ createdAt: -1 });

      const unreadCount = await Message.countDocuments({
        sender: peer._id,
        recipient: userId,
        read: false
      });

      return {
        peer,
        lastMessage: lastMsg,
        unreadCount
      };
    }));

    threads.sort((a, b) => {
      const dateA = a.lastMessage ? new Date(a.lastMessage.createdAt) : 0;
      const dateB = b.lastMessage ? new Date(b.lastMessage.createdAt) : 0;
      return dateB - dateA;
    });

    res.json(threads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/messages/:peerId - Get message history between user and peer
router.get('/:peerId', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const peerId = req.params.peerId;

    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: peerId },
        { sender: peerId, recipient: userId }
      ]
    }).sort({ createdAt: 1 });

    // Mark incoming as read
    await Message.updateMany(
      { sender: peerId, recipient: userId, read: false },
      { $set: { read: true, readAt: new Date() } }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/messages/:peerId - Send message to peer
router.post('/:peerId', protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const recipient = await User.findById(req.params.peerId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    const message = await Message.create({
      sender: req.user._id,
      recipient: recipient._id,
      content: content.trim()
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
