const express = require('express');
const router = express.Router();
const multer = require('multer');
const { PDFParse } = require('pdf-parse'); // <--- CHANGED: Destructuring the new class
const Document = require('../models/Document');
const { analyzeFinancialText } = require('../services/aiService');
const { requireAuth } = require('../middleware/authMiddleware');

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.post('/', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // 1. Parse PDF using the NEW API syntax
    const parser = new PDFParse({ data: req.file.buffer });
    const pdfData = await parser.getText();
    const extractedText = pdfData.text;

    // 2. Initialize entry in MongoDB
    const newDocument = new Document({
      userId: req.userId,
      fileName: req.file.originalname,
      status: 'processing'
    });
    await newDocument.save();

    // 3. Trigger Gemini Analysis Asynchronously
    const aiAnalysis = await analyzeFinancialText(extractedText);

    // 4. Update the document with AI findings
    newDocument.status = 'completed';
    newDocument.complianceScore = aiAnalysis.complianceScore;
    newDocument.flaggedIssues = aiAnalysis.flaggedIssues;
    await newDocument.save();

    res.status(200).json({
      message: 'Document audited successfully by Gemini AI',
      document: newDocument
    });

  } catch (error) {
    console.error('Upload Endpoint Error:', error);
    res.status(500).json({ error: 'Failed to process pipeline', details: error.message });
  }
});

module.exports = router;