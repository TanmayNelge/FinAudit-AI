const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const { requireAuth } = require('../middleware/authMiddleware');

// GET: Fetch dashboard analytics
router.get('/', requireAuth, async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.userId });

    const totalAudited = documents.length;
    
    const completedDocs = documents.filter(doc => doc.status === 'completed');
    
    // Calculate Average Score
    const avgScore = completedDocs.length > 0
      ? Math.round(completedDocs.reduce((acc, doc) => acc + (doc.complianceScore || 0), 0) / completedDocs.length)
      : 0;

    // Count how many documents have at least one "High" severity issue
    const criticalAlerts = completedDocs.filter(doc => 
      doc.flaggedIssues && doc.flaggedIssues.some(issue => issue.severity === 'High')
    ).length;

    res.status(200).json({
      totalAudited,
      avgScore,
      criticalAlerts
    });

  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

module.exports = router;