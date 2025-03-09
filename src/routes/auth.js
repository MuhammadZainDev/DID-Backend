const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const auth = require('../middleware/auth');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../config/emailConfig');
const crypto = require('crypto');

const router = express.Router();

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Create user
    const user = await User.createUser({ name, email, password });
    
    // Send welcome email
    try {
      
      await sendWelcomeEmail(email, name);
    } catch (emailError) {
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('\n=== Signup Error ===');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    
    if (error.message === 'Email already exists') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user route
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Forgot password route - Step 1: Request reset
router.post('/forgot-password', async (req, res) => {
  try {
    console.log('\n=== Forgot Password Request ===');
    console.log('Request body:', req.body);
    
    const { email } = req.body;

    if (!email) {
      console.log('Error: Email is required');
      return res.status(400).json({ error: 'Email is required' });
    }

    console.log('Looking up user with email:', email);
    // Check if user exists
    const user = await User.findByEmail(email);
    if (!user) {
      console.log('Error: User not found');
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('User found:', user.id);

    // Generate a 6-digit verification code
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated reset token:', resetToken);
    
    // Set expiration time (15 minutes from now)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    console.log('Token expires at:', expiresAt);
    
    // Store the reset token in the database
    console.log('Storing reset token in database...');
    await User.storeResetToken(email, resetToken, expiresAt);
    console.log('Reset token stored successfully');
    
    // Send the reset email
    console.log('Sending reset email...');
    const emailSent = await sendPasswordResetEmail(email, resetToken);
    console.log('Email sent result:', emailSent);
    
    res.json({ 
      message: 'Password reset email sent',
      email
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify reset token - Step 2: Verify code
router.post('/verify-reset-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and verification code are required' });
    }
    
    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if reset token matches and is not expired
    if (user.reset_token !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }
    
    // Check if token is expired
    if (new Date(user.reset_token_expires) < new Date()) {
      return res.status(400).json({ error: 'Verification code has expired' });
    }
    
    res.json({ 
      message: 'Verification code is valid',
      email
    });
  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset password - Step 3: Set new password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;
    
    if (!email || !code || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    
    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if reset token matches and is not expired
    if (user.reset_token !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }
    
    // Check if token is expired
    if (new Date(user.reset_token_expires) < new Date()) {
      return res.status(400).json({ error: 'Verification code has expired' });
    }
    
    // Reset the password
    await User.resetPassword(user.id, newPassword);
    
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 