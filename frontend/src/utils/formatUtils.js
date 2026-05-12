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
    try {
        if (!imagePath || imagePath === 'no-photo.jpg' || imagePath === 'no-avatar.jpg' || typeof imagePath !== 'string') {
            return type === 'avatar' 
                ? 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
                : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000';
        }

        if (imagePath.startsWith('http') || imagePath.startsWith('data:') || imagePath.startsWith('blob:')) {
            return imagePath;
        }

        // Handle Windows backslashes and redundant prefixes
        let cleanPath = imagePath.replace(/\\/g, '/');
        
        // Remove /api/v1 prefix if accidentally included in path
        if (cleanPath.startsWith('/api/v1')) {
            cleanPath = cleanPath.replace('/api/v1', '');
        }

        // Normalize /uploads prefix
        if (cleanPath.startsWith('/uploads')) {
            cleanPath = cleanPath.replace('/uploads', '');
        } else if (cleanPath.startsWith('uploads')) {
            cleanPath = cleanPath.replace('uploads', '');
        }

        const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
        return `${API_BASE_URL}/uploads${finalPath}`;
    } catch (err) {
        console.error('Image resolution error:', err);
        return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1000';
    }
};

export const sanitizeString = (str) => {
    if (!str || typeof str !== 'string') return str;
    return str;
};

export default formatCurrency;
