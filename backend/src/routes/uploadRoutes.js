const express = require('express');
const router = express.Router();
const multer = require('multer');
const { PDFParse } = require('pdf-parse'); // <--- CHANGED: Destructuring the new class
const Document = require('../models/Document');
const { analyzeFinancialText } = require('../services/aiService');
const { requireAuth } = require('../middleware/authMiddleware');

// 25 MB to match the limit communicated to the user in the upload UI.
const MAX_FILE_SIZE = 25 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');
    if (!isPdf) return cb(new Error('Only PDF files are allowed'));
    cb(null, true);
  }
});

router.post('/', requireAuth, (req, res, next) => {
  // Wrap multer so its errors (file too large, wrong type) return clean JSON
  // instead of falling through to the generic 500 handler.
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File exceeds the 25 MB size limit' });
      }
      return res.status(400).json({ error: err.message });
    }
    if (err) {
      return res.status(400).json({ error: err.message || 'Invalid file upload' });
    }
    next();
  });
}, async (req, res) => {
  let parser;
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // 1. Parse PDF using the NEW API syntax
    parser = new PDFParse({ data: req.file.buffer });
    const pdfData = await parser.getText();
    const extractedText = pdfData.text;

    // 2. Initialize entry in MongoDB
    const newDocument = new Document({
      userId: req.userId,
      fileName: req.file.originalname,
      status: 'processing'
    });
    await newDocument.save();

    // 3. Run Gemini Analysis. If it can't be extracted, still let the
    // document land in the registry marked as failed instead of vanishing.
    if (!extractedText || !extractedText.trim()) {
      newDocument.status = 'failed';
      await newDocument.save();
      return res.status(200).json({
        message: 'No extractable text found in this PDF',
        document: newDocument
      });
    }

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
  } finally {
    // Release the parser's internal resources regardless of outcome.
    if (parser) await parser.destroy().catch(() => {});
  }
});

module.exports = router;