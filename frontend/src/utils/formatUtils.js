import API_BASE_URL from '../config/apiConfig';

/**
 * Professional Currency Formatter Utility
 * Standardizes INR currency rendering across the entire platform
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

/**
 * Universal Image URL Resolver
 * Handles base64, absolute URLs, relative paths, and fallbacks
 */
export const resolveImageUrl = (imagePath, type = 'event') => {
    if (!imagePath || imagePath === 'no-photo.jpg' || imagePath === 'no-avatar.jpg') {
        return type === 'avatar' 
            ? 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
            : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000';
    }

    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
        return imagePath;
    }

    // Ensure we don't double up on /uploads
    const cleanPath = imagePath.startsWith('/uploads') ? imagePath.replace('/uploads', '') : imagePath;
    const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

    return `${API_BASE_URL}/uploads${finalPath}`;
};

export const sanitizeString = (str) => {
    if (!str || typeof str !== 'string') return str;
    return str;
};

export default formatCurrency;
