const nodemailer = require('nodemailer');
const fs = require('fs');
const https = require('https');

// Helper function to send email via Resend's REST API using built-in https module
const sendViaResend = (apiKey, bodyData) => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(bodyData);
    
    const options = {
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`Resend returned status code ${res.statusCode}: ${JSON.stringify(parsed)}`));
          }
        } catch (e) {
          reject(new Error(`Resend returned status code ${res.statusCode} with unparsable body: ${responseBody}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
};

/**
 * Transporter Setup (Production Gmail SMTP)
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === 'true' || false,
  auth: {
    user: (process.env.EMAIL_USER || "").trim(),
    pass: (process.env.EMAIL_PASS || "").trim(),
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify SMTP connection on startup safely
if (!process.env.RESEND_API_KEY) {
  transporter.verify((error, success) => {
    if (error) {
      console.log("❌ SMTP Connection Test Failed. Local Gmail configuration might be blocked by Google Security or Outbound port blocking:", error.message);
    } else {
      console.log("✅ SMTP SERVER READY (Nodemailer)");
    }
  });
} else {
  console.log("🚀 RESEND EMAIL SERVICE ACTIVE (Using Resend API Key)");
}

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

    // Try Resend first if RESEND_API_KEY is configured
    if (process.env.RESEND_API_KEY) {
      try {
        console.log("[EMAIL] Attempting delivery via Resend API to:", to);
        
        // Parse attachments to Resend's base64 format
        const resendAttachments = [];
        for (const attachment of attachments) {
          let base64Content = "";
          
          if (attachment.content) {
            base64Content = Buffer.isBuffer(attachment.content) 
              ? attachment.content.toString('base64') 
              : Buffer.from(attachment.content).toString('base64');
          } else if (attachment.path) {
            try {
              const fileData = await fs.promises.readFile(attachment.path);
              base64Content = fileData.toString('base64');
            } catch (readErr) {
              console.error("[EMAIL] Failed to read attachment path:", attachment.path, readErr);
            }
          }
          
          if (base64Content) {
            resendAttachments.push({
              filename: attachment.filename || "attachment.pdf",
              content: base64Content
            });
          }
        }

        // Determine correct "from" address
        let fromEmail = process.env.FROM_EMAIL || process.env.EMAIL_USER || "onboarding@resend.dev";
        // Gmail address cannot be used directly with Resend if custom domain is not verified
        if (fromEmail.includes("gmail.com") && !process.env.RESEND_VERIFIED_DOMAIN) {
          console.log("[EMAIL] Gmail address detected. Falling back to onboarding@resend.dev for Resend delivery.");
          fromEmail = "onboarding@resend.dev";
        }

        const bodyData = {
          from: `Growth Utsav <${fromEmail}>`,
          to: Array.isArray(to) ? to : [to],
          subject,
          html
        };

        if (resendAttachments.length > 0) {
          bodyData.attachments = resendAttachments;
        }

        const responseData = await sendViaResend(process.env.RESEND_API_KEY, bodyData);
        console.log("✅ EMAIL SENT VIA RESEND:", responseData.id);
        return { messageId: responseData.id, success: true };

      } catch (resendError) {
        console.error("❌ RESEND EMAIL FAILED, trying Nodemailer SMTP fallback:", resendError.message);
        // Fallback to Nodemailer SMTP below
      }
    }

    // Fallback or default to Nodemailer SMTP
    console.log("[EMAIL] Sending via Nodemailer SMTP to:", to);

    // If attachments contain base64 string instead of path/buffer, ensure Nodemailer handles it nicely
    const nodemailerAttachments = attachments.map(att => {
      if (att.content && !Buffer.isBuffer(att.content) && typeof att.content === 'string') {
        return {
          filename: att.filename,
          content: Buffer.from(att.content, 'base64')
        };
      }
      return att;
    });

    const info = await transporter.sendMail({
      from: `"Growth Utsav" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments: nodemailerAttachments
    });

    console.log("✅ EMAIL SENT VIA SMTP:", info.messageId);
    return info;

  } catch (error) {
    console.error("❌ EMAIL SERVICE FAILED ENTIRELY:", error);
    throw error;
  }
};

module.exports = {
    transporter,
    sendTicketMail
};
