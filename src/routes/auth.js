const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const auth = require('../middleware/auth');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../config/emailConfig');
const crypto = require('crypto');
const { logger } = require('../utils/logger');

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
      logger.info(`Welcome email sent successfully to ${email}`);
    } catch (emailError) {
      // Log the error but don't fail the signup process
      logger.error('Failed to send welcome email:', emailError.message);
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
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
    logger.error('\n=== Signup Error ===');
    logger.error('Error Type:', error.name);
    logger.error('Error Message:', error.message);
    
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
      { expiresIn: '30d' }
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
    const { email } = req.body;
    
    if (process.env.NODE_ENV !== 'production') {
      logger.info('=== Forgot Password Request ===');
      logger.debug(`Request body: ${JSON.stringify(req.body)}`);
    }

    if (!email) {
      logger.warn('Forgot password attempt without email');
      return res.status(400).json({ message: 'Email is required' });
    }

    if (process.env.NODE_ENV !== 'production') {
      logger.debug(`Looking up user with email: ${email}`);
    }

    const user = await User.findByEmail(email);
    if (!user) {
      logger.warn(`Password reset attempted for non-existent email: ${email}`);
      return res.status(404).json({ message: 'User not found' });
    }

    if (process.env.NODE_ENV !== 'production') {
      logger.debug(`User found: ${user.id}`);
    }

    // Generate a secure token
    const resetToken = crypto.randomBytes(3).toString('hex');
    
    if (process.env.NODE_ENV !== 'production') {
      logger.debug(`Generated reset token for ${email}`);
    }

    // Set expiration (15 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);
    
    if (process.env.NODE_ENV !== 'production') {
      logger.debug(`Token expires at: ${expiresAt}`);
    }

    // Store the token in the database
    if (process.env.NODE_ENV !== 'production') {
      logger.debug('Storing reset token in database...');
    }
    
    await User.storeResetToken(email, resetToken, expiresAt);
    
    if (process.env.NODE_ENV !== 'production') {
      logger.debug('Reset token stored successfully');
    }

    // Send the email
    if (process.env.NODE_ENV !== 'production') {
      logger.debug('Sending reset email...');
    }
    
    const emailSent = await sendPasswordResetEmail(email, resetToken);
    
    if (process.env.NODE_ENV !== 'production') {
      logger.debug(`Email sent result: ${emailSent}`);
    }

    return res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    logger.error(`Password reset error: ${error.message}`);
    return res.status(500).json({ message: 'Server error during password reset' });
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
    logger.error('Verify reset code error:', error);
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
    logger.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 