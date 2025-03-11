const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { check, validationResult } = require('express-validator');
const { logger } = require('../utils/logger');

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * @route   POST api/contact
 * @desc    Send contact form email
 * @access  Public
 */
router.post(
  '/',
  [
    // Input validation
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('subject', 'Subject is required').not().isEmpty(),
    check('message', 'Message is required').not().isEmpty().isLength({ min: 10 }),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, subject, message } = req.body;

    try {
      // Prepare email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'm.zainraza.14@gmail.com', // Recipient email
        subject: `Duaon App Contact: ${subject}`,
        html: `
          <h3>New Contact Form Submission</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
          <hr>
          <p>This email was sent from the Duaon App contact form.</p>
        `,
        // Add reply-to so you can directly reply to the user
        replyTo: email
      };

      // Send email
      await transporter.sendMail(mailOptions);
      
      // Log success
      logger.info(`Contact email sent from ${email}`);
      
      return res.status(200).json({ 
        success: true, 
        message: 'Your message has been sent successfully' 
      });
    } catch (error) {
      logger.error(`Contact email error: ${error.message}`);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error while sending contact message'
      });
    }
  }
);

module.exports = router; 