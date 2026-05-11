/**
 * GLOBAL UTF-8 ENCODING SANITIZER
 * Resolves all corrupted Mojibake symbols across the platform.
 */

export const fixEncoding = (text) => {
    if (typeof text !== 'string') return text;
    
    // Automatically convert common corrupted symbols back to proper UTF-8
    return text
        .replace(/â€¢/g, '•')
        .replace(/â‚¹/g, '₹')
        .replace(/âœ…/g, '✅')
        .replace(/ðŸš€/g, '🚀')
        .replace(/[SEARCH]/g, '🔒')
        .replace(/ðŸŒ /g, '🌐')
        .replace(/ðŸš¨/g, '🚨')
        .replace(/ðŸ“§/g, '📧')
        .replace(/ðŸ’¬/g, '💬')
        .replace(/ðŸŽ‰/g, '🎉')
        .replace(/ðŸŽŸï¸ /g, '🎟️')
        .replace(/ðŸ’³/g, '💳')
        .replace(/ðŸ“ž/g, '📞')
        .replace(/ðŸ‘·/g, '👷')
        .replace(/Ã¢â€šÂ¹/g, '₹')
        .replace(/Ã/g, '')
        .replace(/Â/g, '')
        .replace(/â€š/g, '');
};

/**
 * Recursively sanitizes any API response object to ensure
 * NO page renders broken UTF symbols from database or external API.
 */
export const sanitizeObject = (obj) => {
    if (typeof obj === 'string') {
        return fixEncoding(obj);
    }
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }
    
    // Process only plain objects (ignore null, Blob, File, Date, ArrayBuffer, etc.)
    if (obj !== null && typeof obj === 'object') {
        // If it's not a plain object (like a Blob or Date), just return it as is
        if (obj.constructor !== Object) {
            return obj;
        }
        
        const newObj = {};
        for (const key in obj) {
            newObj[key] = sanitizeObject(obj[key]);
        }
        return newObj;
    }
    return obj;
};

export default fixEncoding;
