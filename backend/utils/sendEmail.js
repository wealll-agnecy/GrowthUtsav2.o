const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Load environment variables immediately
dotenv.config();

/**
 * Transporter Setup (Production Gmail SMTP)
 */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: (process.env.EMAIL_USER || "").trim(),
    pass: (process.env.EMAIL_PASS || "").trim(),
  },
});

// Verify SMTP connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ SMTP ERROR:", error);
  } else {
    console.log("✅ SMTP SERVER READY");
  }
});

/**
 * Real Ticket Email Sending Function
 * signature: async ({ to, subject, html, pdfPath })
 */
const sendTicketMail = async (args) => {
  try {
    // Handle both new {to, subject, html, pdfPath} and legacy {email, subject, message, attachments} formats
    const to = args.to || args.email;
    const subject = args.subject;
    const html = args.html || args.message;
    
    // Support either a single pdfPath or a full attachments array (legacy)
    let attachments = args.attachments || [];
    
    if (args.pdfPath) {
      attachments.push({
        filename: "ticket.pdf",
        path: args.pdfPath
      });
    } else if (args.pdfBuffer) {
      attachments.push({
        filename: "ticket.pdf",
        content: args.pdfBuffer
      });
    }

    console.log("📩 Sending email to:", to);

    const info = await transporter.sendMail({
      from: `"Growth Utsav" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments
    });

    console.log("✅ EMAIL SENT:", info.messageId);
    return info;

  } catch (error) {
    console.error("❌ EMAIL FAILED:", error);
    throw error;
  }
};

module.exports = {
    transporter,
    sendTicketMail
};
