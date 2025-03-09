const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('Email Config Loading...');
console.log('Email User:', process.env.EMAIL_USER);
console.log('Email Pass exists:', !!process.env.EMAIL_PASS);

// Create transporter with OAuth2
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Test email configuration immediately
const testEmailConfig = async () => {
    console.log('Testing email configuration...');
    try {
        const testResult = await transporter.verify();
        console.log('Email server connection test result:', testResult);
        return true;
    } catch (error) {
        console.error('Email verification failed:');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        return false;
    }
};

// Run the test immediately
testEmailConfig();

const sendWelcomeEmail = async (userEmail, userName) => {
    console.log('\n=== Starting Welcome Email Send ===');
    console.log('Sending to:', userEmail);
    console.log('User name:', userName);
    
    const mailOptions = {
        from: `"Daily Islamic Dua" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'Welcome to Daily Islamic Dua! 🌙',
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333333;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #ffffff;
                }
                .header {
                    text-align: center;
                    padding: 20px 0;
                }
                .logo {
                    color: #0E8A3E;
                    font-size: 24px;
                    font-weight: bold;
                }
                .content {
                    background-color: #f9f9f9;
                    padding: 30px;
                    border-radius: 10px;
                    margin: 20px 0;
                }
                .button {
                    display: inline-block;
                    padding: 12px 24px;
                    background-color: #0E8A3E;
                    color: #ffffff !important;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 20px 0;
                }
                .footer {
                    text-align: center;
                    color: #666666;
                    font-size: 12px;
                    margin-top: 30px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">Daily Islamic Dua</div>
                </div>
                <div class="content">
                    <h2>Assalamu Alaikum ${userName}!</h2>
                    <p>Welcome to Daily Islamic Dua. We're thrilled to have you as part of our community.</p>
                    <p>With our app, you can:</p>
                    <ul>
                        <li>Access a vast collection of authentic duas</li>
                        <li>Learn the proper way to recite them</li>
                        <li>Save your favorite duas for quick access</li>
                        <li>Get daily reminders for important duas</li>
                    </ul>
                    <p>Start exploring our collection of duas and enhance your spiritual journey.</p>
                    <center>
                        <a href="http://localhost:3000" class="button">Open App</a>
                    </center>
                </div>
                <div class="footer">
                    <p>This email was sent to ${userEmail}</p>
                    <p>© ${new Date().getFullYear()} Daily Islamic Dua. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `
    };

    try {
        console.log('Attempting to send email...');
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!');
        console.log('Message ID:', info.messageId);
        return info;
    } catch (error) {
        console.error('\n=== Email Send Error ===');
        console.error('Type:', error.name);
        console.error('Error Message:', error.message);
        if (error.code) console.error('Code:', error.code);
        throw error;
    }
};

const sendPasswordResetEmail = async (userEmail, resetToken) => {
    console.log('\n=== Starting Password Reset Email Send ===');
    console.log('Sending to:', userEmail);
    console.log('Reset Token:', resetToken);
    
    const mailOptions = {
        from: `"Daily Islamic Dua" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'Reset Your Password - Daily Islamic Dua',
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333333;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    border: 1px solid #eeeeee;
                }
                .header {
                    background-color: #0E8A3E;
                    color: white;
                    padding: 20px;
                    text-align: center;
                }
                .content {
                    padding: 20px;
                }
                .verification-code {
                    font-size: 24px;
                    font-weight: bold;
                    text-align: center;
                    margin: 20px 0;
                    letter-spacing: 5px;
                    color: #0E8A3E;
                }
                .footer {
                    text-align: center;
                    margin-top: 20px;
                    font-size: 12px;
                    color: #999999;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Password Reset Request</h1>
                </div>
                <div class="content">
                    <p>You recently requested to reset your password for your Daily Islamic Dua account. Use the verification code below to complete the process:</p>
                    
                    <div class="verification-code">${resetToken}</div>
                    
                    <p>This code will expire in 15 minutes for security reasons.</p>
                    
                    <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
                    
                    <p>Thank you,<br>The Daily Islamic Dua Team</p>
                </div>
                <div class="footer">
                    <p>This is an automated message, please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        `
    };

    try {
        console.log('Attempting to send password reset email...');
        console.log('Email configuration:');
        console.log('- From:', process.env.EMAIL_USER);
        console.log('- To:', userEmail);
        console.log('- Subject:', mailOptions.subject);
        
        const info = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent successfully!');
        console.log('Message ID:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending password reset email:');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        console.error('Error response:', error.response);
        return false;
    }
};

module.exports = {
    sendWelcomeEmail,
    sendPasswordResetEmail,
    testEmailConfig
}; 