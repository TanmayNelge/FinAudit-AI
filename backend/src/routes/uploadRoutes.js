const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Document = require('../models/Document');
const { analyzeFinancialText } = require('../services/aiService');
const {requireAuth} = require('../middleware/authMiddleware');

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
    const newDocument = new Document({
      userId: req.userId,
      fileName: req.file.originalname,
      status: 'processing'
    });
    
    await newDocument.save();

    // 3. Trigger Gemini Analysis Asynchronously or Await it
    // We await it here so the client gets immediate results
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

    // res.status(200).json({
    //   message: 'File parsed successfully',
    //   documentId: newDocument._id,
    //   pages: pdfData.numpages,
    //   textPreview: extractedText.substring(0, 200) + '...' // Send back a preview
    // });

  } catch (error) {
    console.error('Upload Endpoint Error:', error);
    res.status(500).json({ error: 'Failed to process pipeline', details: error.message });
  }
});

module.exports = router;