/**
 * Professional Currency Formatter Utility
 * Standardizes INR currency rendering across the entire platform
 * Prevents encoding issues (Mojibake) and ensures correct numbering format
 */

export const formatCurrency = (value) => {
    try {
        const amount = Number(value || 0);
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    } catch (error) {
        console.error('Currency formatting error:', error);
        return `₹${value || 0}`;
    }
};

export const sanitizeString = (str) => {
    if (!str || typeof str !== 'string') return str;
    // We now use the global fixEncoding utility via apiClient, 
    // but we leave this here as a fallback without breaking syntax.
    return str;
};

export default formatCurrency;
