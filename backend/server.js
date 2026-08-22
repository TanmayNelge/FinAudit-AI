const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./src/routes/authRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const documentRoutes = require('./src/routes/documentRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/finaudit')
  .then(() => console.log('✅ MongoDB Connected Safely'))
  .catch(err => console.error('Database connection error:', err));

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
