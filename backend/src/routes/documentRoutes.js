const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const { requireAuth } = require('../middleware/authMiddleware');

// Inject requireAuth
router.get('/', requireAuth, async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.userId }).sort({ createdAt: -1 });

    res.status(200).json(documents);
  } catch (error) {
    console.error('Fetch Documents Error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// GET: Fetch all documents for the current user
module.exports = router;