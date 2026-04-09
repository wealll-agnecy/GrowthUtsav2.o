const Counter = require('../models/Counter');

/**
 * Generates an atomic, sequential ID for tickets
 * Format: [PREFIX] + [6-digit padded number]
 * Example: GUTC000001
 * 
 * @param {string} counterName - Identity of the counter (e.g., 'ticket_id')
 * @param {string} prefix - Custom prefix (default: 'GUTC')
 * @returns {Promise<string>}
 */
exports.getNextSequenceValue = async (counterName, prefix = 'GUTC') => {
    try {
        // findOneAndUpdate is atomic - it prevents race conditions
        const sequenceDocument = await Counter.findOneAndUpdate(
            { id: counterName },
            { $inc: { seq: 1 } },
            { 
                new: true, // Return the updated document
                upsert: true, // Create if doesn't exist
                setDefaultsOnInsert: true 
            }
        );

        // Format: Prefix + 7 digit padding
        // 1 becomes "0000001", 100 becomes "0000100"
        const paddedNumber = sequenceDocument.seq.toString().padStart(7, '0');
        
        return `${prefix}${paddedNumber}`;
    } catch (err) {
        console.error("Sequence Generation Error:", err);
        throw err;
    }
};
