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
    
    const mailOptions = {
        from: `"DuaonAI" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'Welcome to DuaonAI! 🌙',
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
                    background: linear-gradient(135deg, #6e8efb, #a777e3);
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
                    color: #a777e3;
                    font-weight: bold;
                    position: absolute;
                    left: -5px;
                }
                .button {
                    display: inline-block;
                    padding: 12px 30px;
                    background: linear-gradient(to right, #6e8efb, #a777e3);
                    color: #ffffff !important;
                    text-decoration: none;
                    border-radius: 30px;
                    font-weight: 600;
                    text-align: center;
                    letter-spacing: 0.5px;
                    transition: all 0.3s ease;
                    border: none;
                    margin: 20px 0;
                    box-shadow: 0 4px 10px rgba(167, 119, 227, 0.3);
                }
                .button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 15px rgba(167, 119, 227, 0.4);
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
                        <h2>Assalamu Alaikum ${userName}!</h2>
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
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">Open App</a>
                    </center>
                </div>
                <div class="footer">
                    <p>This email was sent to ${userEmail}</p>
                    <p>© ${new Date().getFullYear()} DuaonAI. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `
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
    
    const mailOptions = {
        from: `"DuaonAI" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'Reset Your Password - DuaonAI',
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
                    background: linear-gradient(135deg, #6e8efb, #a777e3);
                    padding: 30px 0;
                    text-align: center;
                    color: white;
                }
                .header h1 {
                    margin: 0;
                    font-weight: 600;
                }
                .content {
                    padding: 35px;
                    background-color: #ffffff;
                }
                .verification-code {
                    font-size: 28px;
                    font-weight: bold;
                    text-align: center;
                    margin: 30px 0;
                    letter-spacing: 6px;
                    color: #a777e3;
                    background-color: #f8f9ff;
                    padding: 20px;
                    border-radius: 8px;
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
                    <h1>Password Reset Request</h1>
                </div>
                <div class="content">
                    <p>You recently requested to reset your password for your DuaonAI account. Use the verification code below to complete the process:</p>
                    
                    <div class="verification-code">${resetToken}</div>
                    
                    <p>This code will expire in 15 minutes for security reasons.</p>
                    
                    <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
                    
                    <p>Thank you,<br>The DuaonAI Team</p>
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