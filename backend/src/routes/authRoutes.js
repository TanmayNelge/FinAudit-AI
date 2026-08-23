const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireAuth } = require('../middleware/authMiddleware');

// POST: Register User
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already in use' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    // Generate JWT
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Send token in HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }).status(201).json({ message: 'Registration successful', user: { name: newUser.name, email: newUser.email } });

  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST: Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    }).status(200).json({ message: 'Login successful', user: { name: user.name, email: user.email } });

  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST: Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token').status(200).json({ message: 'Logged out successfully' });
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(401).json({ error: 'User not found' });

    res.status(200).json({ user: { name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch current user' });
  }
});

module.exports = router;