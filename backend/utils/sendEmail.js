const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    let transporter;
    
    // Check if env has dummy data or missing
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email_user' || process.env.EMAIL_USER === 'placeholder_user') {
        console.log('[NODE_MAILER] Generating test Ethereal account for Live Demo...');
        let testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    } else {
        // Use standard SMTP (Gmail/Mailtrap/etc)
        transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    const message = {
        from: `${process.env.FROM_NAME || 'Growth Utsav'} <${process.env.FROM_EMAIL || 'noreply@growthutsav.com'}>`,
        to: options.email,
        subject: options.subject,
        html: options.message,
        attachments: options.attachments || []
    };

    const info = await transporter.sendMail(message);

    console.log('Message sent: %s', info.messageId);
    
    // If using ethereal test account, log the URL so the developer can click and view the email visually
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email_user' || process.env.EMAIL_USER === 'placeholder_user') {
        console.log('===================================================');
        console.log('DEMO TICKET EMAIL PREVIEW URL:');
        console.log(nodemailer.getTestMessageUrl(info));
        console.log('===================================================');
    }
};

module.exports = sendEmail;
