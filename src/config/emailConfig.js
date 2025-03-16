const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { logger } = require('../utils/logger');

// Cleaner initialization without exposed details
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    // Add additional settings to improve deliverability
    tls: {
        rejectUnauthorized: false
    }
});

// Test email configuration only in development
const testEmailConfig = async () => {
    if (process.env.NODE_ENV !== 'production') {
        try {
            const testResult = await transporter.verify();
            logger.info('Email server connection verified');
            return true;
        } catch (error) {
            logger.error(`Email verification failed: ${error.message}`);
            return false;
        }
    }
    return true;
};

// Run the test in development
if (process.env.NODE_ENV !== 'production') {
    testEmailConfig();
}

const sendWelcomeEmail = async (userEmail, userName) => {
    if (process.env.NODE_ENV !== 'production') {
        logger.info(`Sending welcome email to: ${userEmail}`);
    }
    
    // Prepare email with better anti-spam measures
    const mailOptions = {
        from: {
            name: "DuaonAI App",
            address: process.env.EMAIL_USER
        },
        to: userEmail,
        subject: 'Welcome to DuaonAI',
        // Add reply-to header to improve deliverability
        replyTo: process.env.EMAIL_USER,
        // Add priority headers
        priority: 'high',
        // Add message ID for tracking
        messageId: `<welcome-${Date.now()}@duaonai.app>`,
        // Add headers to help avoid spam filters
        headers: {
            'X-Priority': '1',
            'X-MSMail-Priority': 'High',
            'Importance': 'High'
        },
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to DuaonAI</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333333;
                    background-color: #f4f7fb;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 0;
                    background-color: #ffffff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                }
                .header {
                    background-color: #FFFFFF;
                    padding: 30px 0 15px;
                    text-align: center;
                    border-bottom: 1px solid #eeeeee;
                }
                .title {
                    margin-top: 5px;
                    margin-bottom: 10px;
                    color: #121212;
                    font-size: 24px;
                    font-weight: 600;
                }
                .content {
                    padding: 35px;
                    background-color: #ffffff;
                }
                .welcome-message {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .welcome-message h2 {
                    color: #121212;
                    font-weight: 600;
                    margin-top: 0;
                    font-size: 22px;
                }
                .feature-container {
                    display: block;
                    margin: 30px 0;
                }
                .feature-item {
                    padding: 16px 20px;
                    margin-bottom: 12px;
                    background-color: #f8f9ff;
                    border-radius: 0;
                    position: relative;
                    border-left: 3px solid #4CAF50;
                }
                .feature-icon {
                    display: none; /* Hide the dots */
                }
                .feature-text {
                    display: inline-block;
                    vertical-align: middle;
                    color: #333333;
                    font-size: 15px;
                }
                .button-container {
                    text-align: center;
                    margin: 35px 0 25px;
                }
                .button {
                    display: inline-block;
                    padding: 14px 36px;
                    background-color: #1E1E1E;
                    color: #ffffff !important;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 15px;
                    text-align: center;
                    letter-spacing: 0.5px;
                    transition: all 0.3s ease;
                    border: none;
                }
                .whitelist-info {
                    font-size: 13px;
                    color: #666;
                    text-align: center;
                    padding: 16px;
                    background-color: #f9f9f9;
                    border-radius: 8px;
                    margin-top: 30px;
                }
                .footer {
                    text-align: center;
                    padding: 20px;
                    color: #878787;
                    font-size: 12px;
                    background-color: #FFFFFF;
                    border-top: 1px solid #eaeaea;
                }
                .note {
                    font-size: 14px;
                    color: #666666;
                    text-align: center;
                    margin-top: 20px;
                }
                .contact {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 12px;
                    color: #777777;
                }
                .contact a {
                    color: #4CAF50;
                    text-decoration: none;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="title">Welcome to DuaonAI</div>
                </div>
                <div class="content">
                    <div class="welcome-message">
                        <h2>Assalamu Alaikum, ${userName}</h2>
                        <p>We're pleased to welcome you to the DuaonAI community.</p>
                    </div>
                    
                    <p>With our application, you can benefit from:</p>
                    
                    <div class="feature-container">
                        <div class="feature-item">
                            <span class="feature-icon"></span>
                            <span class="feature-text">Access a vast collection of authentic duas</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-icon"></span>
                            <span class="feature-text">Learn the proper way to recite them</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-icon"></span>
                            <span class="feature-text">Save your favorite duas for quick access</span>
                        </div>
                        <div class="feature-item">
                            <span class="feature-icon"></span>
                            <span class="feature-text">Get daily reminders for important duas</span>
                        </div>
                    </div>
                    
                    <p style="text-align: center;">Start exploring our collection today and enhance your spiritual journey.</p>
                    
                    <div class="contact">
                        <p>Questions or need assistance? Contact us at <a href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a></p>
                    </div>
                </div>
                <div class="footer">
                    <p>This email was sent to ${userEmail}</p>
                    <p>&copy; ${new Date().getFullYear()} DuaonAI. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `,
        // Also include text version for better deliverability
        text: `Assalamu Alaikum ${userName},
        
Welcome to DuaonAI. We're pleased to welcome you to our community.

With our application, you can benefit from:
- Access a vast collection of authentic duas
- Learn the proper way to recite them
- Save your favorite duas for quick access
- Get daily reminders for important duas

Start exploring our collection today and enhance your spiritual journey.

Questions or need assistance? Contact us at ${process.env.EMAIL_USER}

© ${new Date().getFullYear()} DuaonAI. All rights reserved.`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        if (process.env.NODE_ENV !== 'production') {
            logger.info('Welcome email sent successfully');
        }
        return true;
    } catch (error) {
        logger.error(`Welcome email error: ${error.message}`);
        return false;
    }
};

const sendPasswordResetEmail = async (userEmail, resetToken) => {
    if (process.env.NODE_ENV !== 'production') {
        logger.info(`Sending password reset email to: ${userEmail}`);
    }
    
    // Format the reset token into individual digits for display in boxes
    const resetTokenDigits = resetToken.split('');
    
    // Remove logo attachment
    const attachments = [];
    
    const mailOptions = {
        from: {
            name: "DuaonAI App",
            address: process.env.EMAIL_USER
        },
        to: userEmail,
        subject: 'Reset Your Password - DuaonAI',
        // Add reply-to header to improve deliverability
        replyTo: process.env.EMAIL_USER,
        // Add priority headers
        priority: 'high',
        // Add message ID for tracking
        messageId: `<password-reset-${Date.now()}@duaonai.app>`,
        // Add headers to help avoid spam filters
        headers: {
            'X-Priority': '1',
            'X-MSMail-Priority': 'High',
            'Importance': 'High'
        },
        // No logo attachments
        attachments: attachments,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password - DuaonAI</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333333;
                    background-color: #f4f7fb;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 0;
                    background-color: #ffffff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                }
                .header {
                    background-color: #FFFFFF;
                    padding: 30px 0 15px;
                    text-align: center;
                }
                .title {
                    margin-top: 5px;
                    margin-bottom: 10px;
                    color: #121212;
                    font-size: 24px;
                    font-weight: 600;
                }
                .content {
                    padding: 30px;
                    background-color: #ffffff;
                    border-top: 1px solid #eeeeee;
                }
                .greeting {
                    font-size: 16px;
                    margin-bottom: 16px;
                    color: #333333;
                }
                .message {
                    font-size: 16px;
                    color: #333333;
                    margin-bottom: 24px;
                }
                .code-container {
                    text-align: center;
                    margin: 40px auto 20px;
                    padding: 0;
                    font-size: 0; /* Remove space between inline-block elements */
                }
                .code-box {
                    width: 42px;
                    height: 56px;
                    background-color: #1E1E1E;
                    border-radius: 8px;
                    margin: 10px 6px 0; /* Added top margin, reduced horizontal spacing */
                    color: #FFFFFF;
                    font-size: 22px;
                    font-weight: bold;
                    display: inline-block;
                    line-height: 56px;
                    text-align: center;
                    border: 1px solid #333333;
                    vertical-align: middle;
                }
                .note {
                    font-size: 14px;
                    color: #666666;
                    text-align: center;
                    margin-top: 20px;
                }
                .footer {
                    text-align: center;
                    padding: 20px;
                    color: #878787;
                    font-size: 12px;
                    background-color: #FFFFFF;
                    border-top: 1px solid #eaeaea;
                }
                .contact {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 12px;
                    color: #777777;
                }
                .contact a {
                    color: #4CAF50;
                    text-decoration: none;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="title">Reset your password</div>
                </div>
                <div class="content">
                    <div class="greeting">Assalamu Alaikum,</div>
                    <div class="message">
                        Need to reset your password? No problem! Enter the verification code below to reset your password. If you did not make this request, please ignore this email.
                    </div>
                    
                    <div class="code-container">
                        <div class="code-box">${resetTokenDigits[0] || ''}</div>
                        <div class="code-box">${resetTokenDigits[1] || ''}</div>
                        <div class="code-box">${resetTokenDigits[2] || ''}</div>
                        <div class="code-box">${resetTokenDigits[3] || ''}</div>
                        <div class="code-box">${resetTokenDigits[4] || ''}</div>
                        <div class="code-box">${resetTokenDigits[5] || ''}</div>
                    </div>
                    
                    <div class="note">This verification code will expire in 15 minutes for security reasons.</div>
                    
                    <div class="contact">
                        Problems or questions? Contact us at <a href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a>
                    </div>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} DuaonAI. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `,
        // Also include text version for better deliverability
        text: `Reset Your Password - DuaonAI

Assalamu Alaikum,

Need to reset your password? No problem! Enter the verification code below to reset your password.

Your verification code: ${resetToken}

This code will expire in 15 minutes for security reasons.

If you did not request a password reset, please ignore this email.

Problems or questions? Contact us at ${process.env.EMAIL_USER}

© ${new Date().getFullYear()} DuaonAI. All rights reserved.
`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        if (process.env.NODE_ENV !== 'production') {
            logger.info('Password reset email sent successfully');
        }
        return true;
    } catch (error) {
        logger.error(`Password reset email error: ${error.message}`);
        return false;
    }
};

module.exports = {
    sendWelcomeEmail,
    sendPasswordResetEmail,
    testEmailConfig
}; 