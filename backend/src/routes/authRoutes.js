const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireAuth } = require('../middleware/authMiddleware');

// ---- Inline input validation (no extra dependency) ----

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 80;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72; // bcrypt truncates beyond 72 bytes

function normalizeEmail(value) {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase();
}

function validEmail(email) {
  return EMAIL_RE.test(email);
}

// Loose JSON-safe validation: returns true only for a string within the
// allowed length range.
function validPassword(password) {
  return (
    typeof password === 'string' &&
    password.length >= MIN_PASSWORD_LENGTH &&
    password.length <= MAX_PASSWORD_LENGTH
  );
}

// POST: Register User
router.post('/register', async (req, res) => {
  try {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const email = normalizeEmail(req.body?.email);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!name || name.length > MAX_NAME_LENGTH) {
      return res.status(400).json({ error: `Name must be between 1 and ${MAX_NAME_LENGTH} characters` });
    }
    if (!validEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }
    if (!validPassword(password)) {
      return res.status(400).json({ error: `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters` });
    }

    // Check if user exists (email was normalized above, so case variants collide)
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
    // Don't echo internal errors to the client
    console.error('Register Error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST: Login User
router.post('/login', async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!validEmail(email) || !password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

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
    console.error('Login Error:', error);
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

    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch current user' });
  }
});

// PATCH: Update display name and/or notification preferences for the current user
router.patch('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(401).json({ error: 'User not found' });

    const { name, preferences } = req.body || {};

    if (name !== undefined) {
      const trimmed = typeof name === 'string' ? name.trim() : '';
      if (!trimmed) return res.status(400).json({ error: 'Name cannot be empty' });
      if (trimmed.length > MAX_NAME_LENGTH) {
        return res.status(400).json({ error: `Name must be at most ${MAX_NAME_LENGTH} characters` });
      }
      user.name = trimmed;
    }

    if (preferences !== undefined) {
      const { notifyOnComplete, notifyOnFailed } = preferences;
      if (typeof notifyOnComplete === 'boolean') user.preferences.notifyOnComplete = notifyOnComplete;
      if (typeof notifyOnFailed === 'boolean') user.preferences.notifyOnFailed = notifyOnFailed;
    }

    await user.save();

    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;