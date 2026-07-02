const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Document = require('../models/Document');

// Configure Multer to store the uploaded file in memory (RAM) instead of disk
// This is faster and safer for serverless deployments like Render/Vercel
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// POST: Upload and Parse PDF
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // 1. Extract text from the PDF buffer
    const pdfData = await pdfParse(req.file.buffer);
    const extractedText = pdfData.text;

    // 2. Save document metadata to MongoDB
    // Note: Hardcoding userId for testing until frontend auth is connected
    const newDocument = new Document({
      userId: '60d5ec49c952402b14421b88', // Mock User ID
      fileName: req.file.originalname,
      status: 'processing'
    });
    
    await newDocument.save();

    // 3. (Future Step) Here we will pass `extractedText` to the AI Agents

    res.status(200).json({
      message: 'File parsed successfully',
      documentId: newDocument._id,
      pages: pdfData.numpages,
      textPreview: extractedText.substring(0, 200) + '...' // Send back a preview
    });

  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: 'Failed to process PDF', details: error.message });
  }
});

module.exports = router;