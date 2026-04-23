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

            // --- PREMIUM DESIGN (White + Gold + Pink) ---
            
            // 1. Luxury Gradient Background
            let bgGrad = doc.linearGradient(0, 0, 595.28, 841.89);
            bgGrad.stop(0, '#ffffff')
                  .stop(1, '#fff5f8'); // Subtle pink tint
            doc.rect(0, 0, 595.28, 841.89).fill(bgGrad);

            // 2. Gold Top Strip (Luxury Header)
            let goldGrad = doc.linearGradient(0, 0, 595.28, 0);
            goldGrad.stop(0, '#d4af37')
                    .stop(0.5, '#ffd700')
                    .stop(1, '#f7c948');
            doc.rect(0, 0, 595.28, 12).fill(goldGrad);

            // 3. Event Header Section
            doc.fillColor('#AD1457') // Luxury Pink
               .font('Helvetica-Bold')
               .fontSize(28)
               .text(ticket.event.title.toUpperCase(), 50, 60, { characterSpacing: 1 });
            
            doc.fillColor('#4b5563')
               .font('Helvetica')
               .fontSize(10)
               .text('OFFICIAL DIGITAL ADMISSION PASS', 50, 95, { characterSpacing: 2 });

            // 4. Main Pass Details
            doc.fillColor('#111827').fontSize(14).font('Helvetica-Bold').text('EVENT LOGISTICS', 50, 150);
            
            // Event Details Box
            doc.rect(50, 170, 495, 100).fill('#ffffff').stroke('#f3f4f6');
            
            doc.fillColor('#374151').font('Helvetica').fontSize(12);
            doc.text(`Location:`, 70, 190);
            doc.fillColor('#111827').font('Helvetica-Bold').text(ticket.event.venue, 140, 190);
            
            doc.fillColor('#374151').font('Helvetica').text(`Date:`, 70, 215);
            doc.fillColor('#111827').font('Helvetica-Bold').text(new Date(ticket.event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), 140, 215);
            
            doc.fillColor('#374151').font('Helvetica').text(`Schedule:`, 70, 240);
            doc.fillColor('#111827').font('Helvetica-Bold').text(ticket.event.time || 'TBA', 140, 240);

            // 5. Gold Luxury Divider
            let divGrad = doc.linearGradient(50, 310, 545, 310);
            divGrad.stop(0, 'rgba(212, 175, 55, 0)')
                   .stop(0.5, '#d4af37')
                   .stop(1, 'rgba(212, 175, 55, 0)');
            doc.moveTo(50, 310).lineTo(545, 310).lineWidth(1).stroke(divGrad);

            // 6. Attendee Tier Section
            doc.fillColor('#AD1457').fontSize(14).font('Helvetica-Bold').text('CLEARANCE DATA', 50, 350);
            
            doc.fillColor('#374151').font('Helvetica').fontSize(11).text('ATTENDEE:', 50, 380);
            doc.fillColor('#111827').font('Helvetica-Bold').fontSize(13).text(ticket.name.toUpperCase(), 130, 380);
            
            doc.fillColor('#374151').font('Helvetica').fontSize(11).text('EMAIL:', 50, 405);
            doc.fillColor('#111827').font('Helvetica-Bold').fontSize(11).text(ticket.email, 130, 405);
            
            // Badge Concept for Ticket Type
            doc.roundedRect(50, 440, 180, 35, 17).fill('#AD1457');
            doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(11).text(ticket.ticketType + ' PASS', 50, 452, { width: 180, align: 'center' });

            // 7. QR Code Section (Right Side)
            // Gold border for QR
            doc.roundedRect(380, 350, 160, 160, 10).lineWidth(2).stroke('#f7c948');
            
            const baseUrl = process.env.PUBLIC_URL || 'https://growthutsav.com'; 
            const verificationUrl = `${baseUrl}/ticket/${ticket.uuid}`;
            
            const qrBuffer = await QRCode.toBuffer(verificationUrl, { 
                width: 150,
                margin: 1,
                color: {
                    dark: '#111827',
                    light: '#ffffff'
                }
            });
            
            doc.image(qrBuffer, 385, 355, { width: 150 });
            doc.fontSize(9).fillColor('#9ca3af').text('SCAN TO VERIFY INTEGRITY', 380, 520, { width: 160, align: 'center' });

            // 8. Security ID Footer
            doc.fillColor('#9ca3af').fontSize(8).font('Helvetica').text(`UNIQUE ASSET KEY: ${ticket.uuid.toUpperCase()}`, 50, 750);
            
            // Final Footer Line
            doc.rect(0, 780, 595.28, 61.89).fill('#f9fafb');
            doc.fillColor('#AD1457').font('Helvetica-Bold').fontSize(10).text('GROWTH UTSAV • SECURE EVENT SERVICES', 0, 805, { align: 'center' });
            doc.fillColor('#9ca3af').font('Helvetica').fontSize(8).text('Unauthorized duplication or resale of this asset is strictly prohibited.', 0, 820, { align: 'center' });

            doc.end();
        } catch (err) {
            console.error("PDF Service Error:", err);
            reject(err);
        }
    });
};
