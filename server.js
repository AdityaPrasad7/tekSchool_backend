/* eslint-env node */
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Create reusable transporter object
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify transporter configuration
transporter.verify((error) => {
  if (error) {
    console.error('❌ SMTP configuration error:', error);
  } else {
    console.log('✅ Server is ready to send emails');
  }
});

// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, phone, program } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !program) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Email content
    const mailOptions = {
      from: `"Tek School" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Tek School - Registration Confirmed! 🎓',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 40px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .content {
                background: #f9f9f9;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .details {
                background: white;
                padding: 25px;
                border-left: 4px solid #667eea;
                margin: 20px 0;
                border-radius: 5px;
              }
              .detail-item {
                padding: 10px 0;
                border-bottom: 1px solid #eee;
              }
              .detail-item:last-child {
                border-bottom: none;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                color: #666;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">Welcome to Tek School! 🎓</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Your Tech Journey Starts Here</p>
            </div>
            
            <div class="content">
              <p>Hello <strong>${name}</strong>,</p>
              
              <p>Thank you for registering with Tek School! We're thrilled to have you on board and excited to be part of your tech journey.</p>
              
              <div class="details">
                <h2 style="color: #667eea; margin-top: 0;">Your Registration Details</h2>
                <div class="detail-item">
                  <strong>Name:</strong> ${name}
                </div>
                <div class="detail-item">
                  <strong>Email:</strong> ${email}
                </div>
                <div class="detail-item">
                  <strong>Phone:</strong> ${phone}
                </div>
                <div class="detail-item">
                  <strong>Selected Program:</strong> ${program}
                </div>
              </div>
              
              <p style="background: #fff8e1; padding: 20px; border-left: 4px solid #ffc107; border-radius: 5px;">
                <strong style="color: #f57c00;">What's Next?</strong><br>
                Our team will contact you within <strong>24-48 hours</strong> to discuss your tech journey, answer your questions, and guide you through the enrollment process.
              </p>
              
              <p style="text-align: center; margin-top: 30px;">
                <a href="#" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 50px; display: inline-block; font-weight: bold;">
                  Explore Our Programs
                </a>
              </p>
            </div>
            
            <div class="footer">
              <p><strong>Best regards,</strong><br>Tek School Team</p>
              <p>📧 <a href="mailto:contact@tekschool.com" style="color: #667eea;">contact@tekschool.com</a></p>
            </div>
          </body>
        </html>
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully:', info.messageId);
    
    res.status(200).json({ 
      success: true, 
      message: 'Registration successful and email sent!',
      messageId: info.messageId
    });
    
  } catch (error) {
    console.error('❌ Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send email',
      error: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📧 Send requests to http://localhost:${PORT}/api/register`);
});

export default app;

