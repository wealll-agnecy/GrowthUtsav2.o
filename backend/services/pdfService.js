const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const Ticket = require('../models/Ticket');
const path = require('path');

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
                margin: 0,
                info: {
                    Title: `Ticket - ${ticket.event.title}`,
                    Author: 'Growth Utsav',
                }
            });

            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));

            // --- PREMIUM DESIGN (White + Gold + Pink) ---
            
            // 1. Luxury Background with subtle patterns
            doc.rect(0, 0, 595.28, 841.89).fill('#ffffff');
            
            // Subtle Pink Accent Gradient at the bottom
            let bgGrad = doc.linearGradient(0, 600, 0, 841.89);
            bgGrad.stop(0, '#ffffff')
                  .stop(1, '#fff5f8');
            doc.rect(0, 600, 595.28, 241.89).fill(bgGrad);

            // 2. Gold Top Strip (Luxury Header)
            let goldGrad = doc.linearGradient(0, 0, 595.28, 0);
            goldGrad.stop(0, '#d4af37')
                    .stop(0.5, '#ffd700')
                    .stop(1, '#f7c948');
            doc.rect(0, 0, 595.28, 15).fill(goldGrad);

            // 3. Event Header Section
            doc.fillColor('#AD1457') // Luxury Pink
               .font('Helvetica-Bold')
               .fontSize(32)
               .text(ticket.event.title.toUpperCase(), 50, 60, { characterSpacing: 1 });
            
            doc.fillColor('#6b7280')
               .font('Helvetica')
               .fontSize(10)
               .text('OFFICIAL DIGITAL ADMISSION PASS', 50, 100, { characterSpacing: 2 });

            // 4. Main Pass Details (Centered Card)
            doc.rect(50, 140, 495, 180).fill('#f9fafb').stroke('#e5e7eb');
            
            doc.fillColor('#111827').fontSize(14).font('Helvetica-Bold').text('EVENT LOGISTICS', 70, 160);
            
            // Venue
            doc.fillColor('#4b5563').font('Helvetica').fontSize(11).text('VENUE', 70, 190);
            doc.fillColor('#111827').font('Helvetica-Bold').fontSize(12).text(ticket.event.venue, 70, 205, { width: 400 });
            
            // Date & Time
            doc.fillColor('#4b5563').font('Helvetica').fontSize(11).text('DATE', 70, 240);
            const eventDate = new Date(ticket.selectedDate || ticket.event.date).toLocaleDateString('en-US', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            });
            doc.fillColor('#111827').font('Helvetica-Bold').fontSize(12).text(eventDate, 70, 255);

            doc.fillColor('#4b5563').font('Helvetica').fontSize(11).text('TIME', 300, 240);
            doc.fillColor('#111827').font('Helvetica-Bold').fontSize(12).text(ticket.event.time || 'Check Schedule', 300, 255);

            // 5. Gold Luxury Divider
            let divGrad = doc.linearGradient(50, 350, 545, 350);
            divGrad.stop(0, '#ffffff')
                   .stop(0.5, '#d4af37')
                   .stop(1, '#ffffff');
            doc.moveTo(50, 350).lineTo(545, 350).lineWidth(1).stroke(divGrad);

            // Calculate Validity Details
            const dayCount = (ticket.selectedDays && ticket.selectedDays.length > 0) ? ticket.selectedDays.length : 1;
            const validityText = `Valid for ${dayCount} Day${dayCount > 1 ? 's' : ''}`;
            
            let dateListText = "";
            if (ticket.selectedDays && ticket.selectedDays.length > 0) {
                dateListText = ticket.selectedDays.map(d => new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })).join(', ');
            } else {
                dateListText = new Date(ticket.selectedDate || ticket.event.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
            }

            // 6. Attendee & Tier Section
            doc.fillColor('#AD1457').fontSize(14).font('Helvetica-Bold').text('ATTENDEE VERIFICATION', 50, 380);
            
            doc.fillColor('#4b5563').font('Helvetica').fontSize(11).text('NAME', 50, 410);
            doc.fillColor('#111827').font('Helvetica-Bold').fontSize(14).text(ticket.name.toUpperCase(), 50, 425);
            
            doc.fillColor('#4b5563').font('Helvetica').fontSize(11).text('EMAIL', 50, 460);
            doc.fillColor('#111827').font('Helvetica-Bold').fontSize(12).text(ticket.email, 50, 475);
            
            // Validity Details (New Section)
            doc.fillColor('#4b5563').font('Helvetica').fontSize(11).text('BOOKED DATES', 50, 510);
            doc.fillColor('#111827').font('Helvetica-Bold').fontSize(10).text(dateListText, 50, 525, { width: 300 });

            // Badge Concept for Ticket Type
            const badgeWidth = 180;
            doc.roundedRect(50, 560, badgeWidth, 35, 17.5).fill('#AD1457');
            doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(11).text(`${ticket.ticketType.toUpperCase()} PASS`, 50, 572, { width: badgeWidth, align: 'center' });

            // Entry Rules & Duration
            const entryQty = (ticket.booking && ticket.booking.quantity) ? ticket.booking.quantity : 1;
            const entryLabel = `Allowed Entry: ${entryQty} Person${entryQty > 1 ? 's' : ''}`;
            doc.fillColor('#4b5563').font('Helvetica').fontSize(10).text(entryLabel, 50, 610);
            doc.fillColor('#AD1457').font('Helvetica-Bold').fontSize(11).text(validityText.toUpperCase(), 50, 625);


            // 7. QR Code Section (Right Side)
            doc.roundedRect(380, 380, 165, 165, 10).lineWidth(1.5).stroke('#d4af37');
            
            const baseUrl = process.env.PUBLIC_URL || 'https://growthutsav.com'; 
            const verificationUrl = `${baseUrl}/ticket/${ticket.uuid}`;
            
            const qrBuffer = await QRCode.toBuffer(verificationUrl, { 
                width: 155,
                margin: 1,
                color: {
                    dark: '#111827',
                    light: '#ffffff'
                }
            });
            
            doc.image(qrBuffer, 385, 385, { width: 155 });
            doc.fontSize(9).fillColor('#9ca3af').font('Helvetica').text('SCAN TO VERIFY AUTHENTICITY', 380, 555, { width: 165, align: 'center' });

            // 8. Footer Section
            doc.fillColor('#9ca3af').fontSize(8).font('Helvetica').text(`UNIQUE ASSET KEY: ${ticket.uuid.toUpperCase()}`, 50, 750);
            doc.text(`TICKET ID: ${ticket.ticketCode}`, 50, 762);
            
            // Bottom Branding
            doc.rect(0, 785, 595.28, 56.89).fill('#f9fafb');
            doc.fillColor('#AD1457').font('Helvetica-Bold').fontSize(10).text('GROWTH UTSAV • SECURE EVENT SERVICES', 0, 805, { align: 'center' });
            doc.fillColor('#9ca3af').font('Helvetica').fontSize(8).text('This is a computer-generated document. No signature required.', 0, 820, { align: 'center' });

            doc.end();
        } catch (err) {
            console.error("PDF Service Error:", err);
            reject(err);
        }
    });
};

