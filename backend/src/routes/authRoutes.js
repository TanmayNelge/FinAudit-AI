const express = require('express');
const router = express.Router();
const User = require('../models/User');

// new user registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // TODO: Hash password with bcrypt before saving
    const newUser = new User({ name, email, password });
    await newUser.save();
    
    res.status(201).json({ message: 'User registered successfully', userId: newUser._id });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

// POST: Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // TODO: Generate JWT token here
    res.status(200).json({ message: 'Login successful', userId: user._id });
  } catch (error) {
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

module.exports = router;
