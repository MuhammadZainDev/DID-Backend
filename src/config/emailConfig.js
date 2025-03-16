const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('Email Config Loading...');
console.log('Email User:', process.env.EMAIL_USER);
console.log('Email Pass exists:', !!process.env.EMAIL_PASS);

// Create transporter with better configuration for spam prevention
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
            console.log('Email server connection verified');
            return true;
        } catch (error) {
            console.error('Email verification failed:', error.message);
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
        console.log('Sending welcome email to:', userEmail);
    }
    
    // Prepare email with better anti-spam measures
    const mailOptions = {
        from: {
            name: "DuaonAI App",
            address: process.env.EMAIL_USER
        },
        to: userEmail,
        subject: 'Welcome to DuaonAI! 🌙',
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
                    background: #4CAF50;
                    padding: 30px 0;
                    text-align: center;
                }
                .logo {
                    color: white;
                    font-size: 28px;
                    font-weight: bold;
                    letter-spacing: 1px;
                }
                .content {
                    padding: 35px;
                    background-color: #ffffff;
                }
                .welcome-message {
                    text-align: center;
                    margin-bottom: 25px;
                }
                .welcome-message h2 {
                    color: #4a4a4a;
                    font-weight: 600;
                    margin-top: 0;
                }
                .features {
                    background-color: #f8f9ff;
                    padding: 25px;
                    border-radius: 6px;
                    margin: 25px 0;
                }
                .features ul {
                    padding-left: 20px;
                }
                .features li {
                    margin-bottom: 12px;
                    position: relative;
                    list-style-type: none;
                    padding-left: 15px;
                }
                .features li:before {
                    content: "•";
                    color: #4CAF50;
                    font-weight: bold;
                    position: absolute;
                    left: -5px;
                }
                .button {
                    display: inline-block;
                    padding: 12px 30px;
                    background: #4CAF50;
                    color: #ffffff !important;
                    text-decoration: none;
                    border-radius: 30px;
                    font-weight: 600;
                    text-align: center;
                    letter-spacing: 0.5px;
                    transition: all 0.3s ease;
                    border: none;
                    margin: 20px 0;
                }
                .whitelist-info {
                    font-size: 12px;
                    color: #666;
                    margin-top: 20px;
                    text-align: center;
                    padding: 10px;
                    background-color: #f9f9f9;
                    border-radius: 5px;
                }
                .footer {
                    text-align: center;
                    padding: 20px;
                    color: #878787;
                    font-size: 12px;
                    background-color: #f8f9ff;
                    border-top: 1px solid #eaeaea;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">DuaonAI</div>
                </div>
                <div class="content">
                    <div class="welcome-message">
                        <h2>Assalamu Alaikum ${userName}</h2>
                        <p>Welcome to DuaonAI. We're thrilled to have you as part of our community.</p>
                    </div>
                    <p>With our app, you can:</p>
                    <div class="features">
                        <ul>
                            <li>Access a vast collection of authentic duas</li>
                            <li>Learn the proper way to recite them</li>
                            <li>Save your favorite duas for quick access</li>
                            <li>Get daily reminders for important duas</li>
                        </ul>
                    </div>
                    <p>Start exploring our collection of duas and enhance your spiritual journey.</p>
                    <center>
                        <a href="${process.env.APP_SCHEME || 'duaonai://'}" class="button">Open App</a>
                    </center>
                    
                    <div class="whitelist-info">
                        <p>To ensure you receive our emails, please add <strong>${process.env.EMAIL_USER}</strong> to your contacts or whitelist.</p>
                    </div>
                </div>
                <div class="footer">
                    <p>This email was sent to ${userEmail}</p>
                    <p>© ${new Date().getFullYear()} DuaonAI. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `,
        // Also include text version for better deliverability
        text: `Assalamu Alaikum ${userName},
        
Welcome to DuaonAI. We're thrilled to have you as part of our community.

With our app, you can:
- Access a vast collection of authentic duas
- Learn the proper way to recite them
- Save your favorite duas for quick access
- Get daily reminders for important duas

Start exploring our collection of duas and enhance your spiritual journey.

To ensure you receive our emails, please add ${process.env.EMAIL_USER} to your contacts.

© ${new Date().getFullYear()} DuaonAI. All rights reserved.`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        if (process.env.NODE_ENV !== 'production') {
            console.log('Welcome email sent successfully');
        }
        return info;
    } catch (error) {
        console.error('Welcome email send error:', error.message);
        throw error;
    }
};

const sendPasswordResetEmail = async (userEmail, resetToken) => {
    if (process.env.NODE_ENV !== 'production') {
        console.log('Sending password reset email to:', userEmail);
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
            console.log('Password reset email sent successfully');
        }
        return true;
    } catch (error) {
        console.error('Password reset email error:', error.message);
        return false;
    }
};

module.exports = {
    sendWelcomeEmail,
    sendPasswordResetEmail,
    testEmailConfig
}; 