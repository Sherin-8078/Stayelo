const nodemailer = require('nodemailer');
require('dotenv').config();

// Configure your SMTP or email service here
const transporter = nodemailer.createTransport({
  service: 'gmail', // Example using Gmail, update as needed
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send an email
 * @param {string} to recipient email address
 * @param {string} subject email subject
 * @param {string} text email text body
 */
const sendMail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
    console.log(`Email sent to ${to} with subject "${subject}"`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = { sendMail };
