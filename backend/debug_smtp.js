const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

// Load env from the root of backend
dotenv.config({ path: path.join(__dirname, '.env') });

async function debugSMTP() {
    console.log("🛠️ --- SMTP DEBUGGER ---");
    console.log("📍 Path:", __dirname);
    console.log("📧 EMAIL_USER:", process.env.EMAIL_USER || "MISSING");
    console.log("🔑 EMAIL_PASS:", process.env.EMAIL_PASS ? "PRESENT (Hidden)" : "MISSING");
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("❌ Error: Missing credentials in .env file.");
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    try {
        console.log("🔍 Attempting to verify SMTP connection...");
        await transporter.verify();
        console.log("✅ SUCCESS: SMTP is correctly configured and ready to send emails.");
        
        console.log("🧪 Sending a test email to yourself...");
        const info = await transporter.sendMail({
            from: `"SMTP Debugger" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: "SMTP Test Email",
            text: "If you received this, your email system is working perfectly!",
            html: "<b>If you received this, your email system is working perfectly!</b>"
        });
        
        console.log("✅ TEST EMAIL SENT!");
        console.log("🆔 Message ID:", info.messageId);
    } catch (error) {
        console.error("❌ FAILED: SMTP Connection Error.");
        console.error("Message:", error.message);
        
        if (error.message.includes('Invalid login')) {
            console.error("\n💡 TIP: 'Invalid login' usually means:");
            console.error("1. You haven't enabled 2-Step Verification on your Google Account.");
            console.error("2. You are using your regular password instead of an 'App Password'.");
            console.error("3. There is a typo in your EMAIL_USER.");
        }
    }
}

debugSMTP();
