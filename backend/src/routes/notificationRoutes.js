const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const { requireAuth } = require('../middleware/authMiddleware');

// GET: List notifications for the current user, newest first (latest 30)
router.get('/', requireAuth, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(30);

    const unread = await Notification.countDocuments({ userId: req.userId, read: false });

    res.status(200).json({ notifications, unread });
  } catch (error) {
    console.error('Fetch Notifications Error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PATCH: Mark a single notification as read, scoped to the current user
router.patch('/:id/read', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const unread = await Notification.countDocuments({ userId: req.userId, read: false });
    res.status(200).json({ notification, unread });
  } catch (error) {
    console.error('Mark Notification Read Error:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// PATCH: Mark all notifications as read for the current user
router.patch('/read-all', requireAuth, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.userId, read: false }, { read: true });
    res.status(200).json({ unread: 0 });
  } catch (error) {
    console.error('Mark All Notifications Read Error:', error);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

module.exports = router;
