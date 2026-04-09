const sendEmail = require('../utils/sendEmail');

/**
 * Send booking confirmation email with attached ticket
 * @param {Object} user - User object { name, email }
 * @param {Object} event - Event object { title, date, venue }
 * @param {Buffer} pdfBuffer - Generated PDF ticket buffer
 * @param {Object} bookingDetails - Booking info { ticketType, quantity, totalAmount }
 */
exports.sendBookingConfirmation = async (user, event, pdfBuffer, bookingDetails) => {
    try {
        const emailMessage = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; color: #1a202c;">
                <div style="background-color: #6366f1; padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Booking Confirmed!</h1>
                </div>
                
                <div style="padding: 30px;">
                    <p style="font-size: 16px;">Hi <strong>${user.name}</strong>,</p>
                    <p style="font-size: 15px; line-height: 1.6;">Your ticket for <strong>${event.title}</strong> has been successfully booked. Your digital pass is attached to this email.</p>
                    
                    <div style="background-color: #f7fafc; border-radius: 8px; padding: 20px; margin: 25px 0;">
                        <h3 style="margin-top: 0; color: #4a5568; font-size: 16px;">EVENT DETAILS:</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 5px 0; color: #718096;">Event:</td>
                                <td style="padding: 5px 0; font-weight: bold;">${event.title}</td>
                            </tr>
                            <tr>
                                <td style="padding: 5px 0; color: #718096;">Date:</td>
                                <td style="padding: 5px 0;">${new Date(event.date).toLocaleDateString()}</td>
                            </tr>
                            <tr>
                                <td style="padding: 5px 0; color: #718096;">Venue:</td>
                                <td style="padding: 5px 0;">${event.venue}</td>
                            </tr>
                            <tr>
                                <td style="padding: 5px 0; color: #718096;">Type:</td>
                                <td style="padding: 5px 0;">${bookingDetails.ticketType} x ${bookingDetails.quantity}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <p style="font-size: 14px; color: #718096; text-align: center;">Please present the attached QR code at the entrance for entry.</p>
                </div>
                
                <div style="background-color: #edf2f7; padding: 20px; text-align: center; font-size: 12px; color: #a0aec0;">
                    &copy; 2026 Growth Utsav. All rights reserved.
                </div>
            </div>
        `;

        await sendEmail({
            email: user.email,
            subject: `Confirmed: Your Ticket for ${event.title}`,
            message: emailMessage,
            attachments: [
                {
                    filename: `ticket-${event.title.replace(/\s+/g, '-').toLowerCase()}.pdf`,
                    content: pdfBuffer
                }
            ]
        });

        console.log(`✅ Confirmation email sent to ${user.email}`);
    } catch (err) {
        console.error("Email Service Error:", err.message);
        throw err;
    }
};
