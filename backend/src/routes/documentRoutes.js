const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Document = require('../models/Document');
const { requireAuth } = require('../middleware/authMiddleware');

// GET: List all documents for the current user, newest first
router.get('/', requireAuth, async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.userId }).sort({ createdAt: -1 });

    res.status(200).json(documents);
  } catch (error) {
    console.error('Fetch Documents Error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// GET: Fetch a single document, scoped to the current user
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Reject malformed ids as "not found" rather than hitting a CastError
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const document = await Document.findOne({ _id: id, userId: req.userId });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.status(200).json(document);
  } catch (error) {
    console.error('Fetch Document Error:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// DELETE: Remove a single document, scoped to the current user
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Reject malformed ids as "not found" rather than hitting a CastError
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const document = await Document.findOneAndDelete({ _id: id, userId: req.userId });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete Document Error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

module.exports = router;