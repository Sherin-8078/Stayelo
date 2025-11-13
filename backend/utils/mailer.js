const nodemailer = require("nodemailer");
require("dotenv").config();

console.log("📦 Initializing Nodemailer transporter...");

// ✅ Create transporter (Gmail SMTP with TLS)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, // TLS (recommended for Gmail)
  secure: false, // use STARTTLS instead of SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password (16-char)
  },
  tls: {
    rejectUnauthorized: false, // prevent certificate issues on local dev
  },
});

// ✅ Verify connection at startup
(async () => {
  try {
    await transporter.verify();
    console.log("✅ SMTP Server is ready to send emails.");
  } catch (error) {
    console.error("❌ SMTP Connection Error:", error.message);
  }
})();

/**
 * ✅ Send an email (supports HTML & plain text)
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} content - Email body (HTML or text)
 */
const sendMail = async (to, subject, content) => {
  console.log("----------------------------------------------------");
  console.log("📧 Email Send Request Received:");
  console.log("To:", to);
  console.log("Subject:", subject);
  console.log("From:", process.env.EMAIL_USER);
  console.log("----------------------------------------------------");

  const mailOptions = {
    from: `"Stayelo 🏠" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: content,
    text: content.replace(/<[^>]*>?/gm, ""),
  };

  try {
    console.time("📨 EmailSendTime");
    console.log("🚀 Attempting to send mail via Gmail SMTP...");

    const info = await transporter.sendMail(mailOptions);

    console.timeEnd("📨 EmailSendTime");
    console.log("✅ Email sent successfully!");
    console.log("📨 Message ID:", info.messageId);
    console.log("📬 Response:", info.response);
    console.log("----------------------------------------------------");

    return info;
  } catch (error) {
    console.error("❌ Email sending failed on first attempt:", error.message);

    // 🔁 Retry once automatically with secure: true (SSL)
    try {
      console.log("🔁 Retrying with SSL (port 465)...");
      const sslTransporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const info = await sslTransporter.sendMail(mailOptions);
      console.log("✅ Email sent successfully on retry!");
      console.log("📨 Message ID:", info.messageId);
      return info;
    } catch (retryError) {
      console.error("❌ Retry also failed:", retryError.message);
      throw retryError;
    }
  }
};

module.exports = { sendMail };
