const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  complianceScore: {
    type: Number,
    default: null // Will be populated by AI out of 100
  },
  flaggedIssues: [{
    clause: String,
    reason: String,
    severity: String // 'High', 'Medium', 'Low'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);