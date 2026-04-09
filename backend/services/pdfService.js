const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const Ticket = require('../models/Ticket');

/**
 * Generate a professional PDF ticket buffer
 * @param {string} ticketId - MongoDB ID of the ticket
 * @returns {Promise<Buffer>}
 */
exports.generateTicketPDF = async (ticketId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const ticket = await Ticket.findById(ticketId)
                .populate('event')
                .populate('booking')
                .populate('user', 'name email');

            if (!ticket) return reject(new Error('Ticket not found in database'));

            const doc = new PDFDocument({ 
                size: 'A4',
                margin: 0 
            });

            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));

            // --- DESIGN ---
            
            // Header Background
            doc.rect(0, 0, 595.28, 150).fill('#6366f1'); // Indigo color

            // Title
            doc.fillColor('#ffffff')
               .fontSize(30)
               .font('Helvetica-Bold')
               .text('GROWTH UTSAV', 0, 50, { align: 'center' });
            
            doc.fontSize(12)
               .font('Helvetica')
               .text('YOUR OFFICIAL EVENT PASS', 0, 90, { align: 'center' });

            // Main Content Area
            doc.fillColor('#1f2937').fontSize(22).font('Helvetica-Bold').text(ticket.event.title, 50, 200);
            
            doc.fontSize(14).font('Helvetica').text(`Date: ${new Date(ticket.event.date).toLocaleDateString()}`, 50, 240);
            doc.text(`Time: ${ticket.event.time || 'TBA'}`, 50, 260);
            doc.text(`Venue: ${ticket.event.venue}`, 50, 280);

            // Divider
            doc.moveTo(50, 310).lineTo(545, 310).stroke('#e5e7eb');

            // Attendee Info
            doc.fontSize(16).font('Helvetica-Bold').text('ATTENDEE DETAILS', 50, 340);
            doc.fontSize(12).font('Helvetica').text(`Name: ${ticket.name}`, 50, 370);
            doc.text(`Email: ${ticket.email}`, 50, 390);
            doc.text(`Ticket Type: ${ticket.ticketType}`, 50, 410);
            doc.text(`Ticket ID: ${ticket.uuid}`, 50, 430);

            // QR Code Section
            doc.rect(380, 340, 160, 200).stroke('#f3f4f6');
            
            // Generate QR Buffer with Verification URL
            // Production priority: Use PUBLIC_URL from env, fallback to frontend standard
            const baseUrl = process.env.PUBLIC_URL || 'https://growthutsav.com'; 
            const verificationUrl = `${baseUrl}/ticket/${ticket.uuid}`;
            
            console.log(`📡 [QR_GEN]: Protocol established at ${verificationUrl}`);
            
            const qrBuffer = await QRCode.toBuffer(verificationUrl, { 
                width: 150,
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            });
            
            doc.image(qrBuffer, 385, 345, { width: 150 });
            doc.fontSize(10).fillColor('#6b7280').text('Scan for Entry', 380, 500, { width: 160, align: 'center' });

            // Footer
            doc.rect(0, 792, 595.28, 50).fill('#f9fafb');
            doc.fillColor('#9ca3af').fontSize(10).text('This is a computer-generated ticket. Please carry a digital or printed copy.', 0, 810, { align: 'center' });

            doc.end();
        } catch (err) {
            console.error("PDF Service Error:", err);
            reject(err);
        }
    });
};
