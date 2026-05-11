const Enquiry = require('../models/Enquiry');

// Use names suggested by user for consistency
exports.createEnquiry = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        if (!name || !email || !phone || !message) {
            return res.status(400).json({ message: 'All fields required' });
        }

        const enquiry = await Enquiry.create({
            name,
            email,
            phone,
            message
        });

        res.status(201).json(enquiry);
    } catch (error) {
        console.error('Enquiry Creation Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getEnquiries = async (req, res) => {
    console.log("ðŸ” [ADMIN]: Requesting full enquiry list...");
    try {
        const enquiries = await Enquiry.find().sort({ createdAt: -1 });
        res.status(200).json(enquiries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getEnquiryById = async (req, res) => {
    const { id } = req.params;
    console.log(`ðŸ” [ADMIN]: Searching for Enquiry with ID: ${id}`);
    
    try {
        const enquiry = await Enquiry.findByIdAndUpdate(
            id,
            { isRead: true, status: 'Read' },
            { new: true }
        );

        if (!enquiry) {
            console.log(`â“ [ADMIN]: Enquiry NOT FOUND for ID: ${id}`);
            return res.status(404).json({ message: 'Enquiry not found' });
        }
        console.log(`✅ [ADMIN]: Enquiry found and marked as read: ${enquiry.name}`);
        res.status(200).json(enquiry);
    } catch (error) {
        console.error(`🚨 [ADMIN]: Error in getEnquiryById for ID ${id}:`, error.message);
        res.status(500).json({ message: error.message });
    }
};

// Keep existing admin functions for production readiness
exports.updateStatus = async (req, res) => {
    try {
        const enquiry = await Enquiry.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        res.status(200).json(enquiry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteEnquiry = async (req, res) => {
    try {
        await Enquiry.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Enquiry deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
