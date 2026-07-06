const express = require('express');
const router = express.Router();
const Document = require('../models/Document');

// GET: Fetch all documents for the current user
router.get('/', async (req, res) => {
  try {
    // Hardcoded for MVP until JWT auth is fully linked on the frontend
    const userId = '60d5ec49c952402b14421b88'; 
    
    // Fetch documents, sorted by newest first
    const documents = await Document.find({ userId }).sort({ createdAt: -1 });
    
    res.status(200).json(documents);
  } catch (error) {
    console.error('Fetch Documents Error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

module.exports = router;